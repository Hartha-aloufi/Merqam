// src/server/services/ai/gemini.service.ts
import { GoogleGenAI } from '@google/genai';
import { AIProcessingOptions } from './types';
import { SYSTEM_PROMPT_GEMINI } from './prompts';
import { BaseAIService } from './base-ai.service';
import { workerLogger as logger } from '../../lib/logging/file-logger';
import { GeminiKeyManager } from './gemini-key-manager';
import { env } from '../../lib/env';

interface ChatMessage {
	contents: {
		role: string;
		parts: {
			text: string;
		}[];
	}[];
}

interface ChatInterface {
	sendMessage: (message: string | ChatMessage) => Promise<{
		response: {
			text: () => string;
		};
	}>;
}

export class GeminiService extends BaseAIService {
	private keyManager: GeminiKeyManager;
	private genAI!: GoogleGenAI;
	private defaultModel = 'gemini-2.0-flash-exp-image-generation';

	constructor() {
		super({ maxChunkLength: 20000 });
		this.keyManager = new GeminiKeyManager(env.GEMINI_API_KEYS);
		this.initializeClient();
	}

	private initializeClient() {
		this.genAI = new GoogleGenAI({
			apiKey: this.keyManager.getCurrentKey(),
		});
	}

	private async handleQuotaError(): Promise<boolean> {
		const hasMoreKeys = this.keyManager.markCurrentKeyFailed();
		if (hasMoreKeys) {
			logger.info(
				`Switching to next Gemini API key. ${this.keyManager.remainingKeys} keys remaining`
			);
			this.initializeClient();
			return true;
		}
		throw new Error('QUOTA_EXCEEDED');
	}

	async initializeChat(options?: AIProcessingOptions) {
		const modelName = options?.model || this.defaultModel;
		const model = this.genAI.models;

		const chat: ChatInterface = {
			sendMessage: async (message: string | ChatMessage) => {
				const content =
					typeof message === 'string'
						? message
						: message.contents[0].parts[0].text;

				const contents = [
					{
						role: 'user',
						parts: [{ text: SYSTEM_PROMPT_GEMINI }],
					},
					{
						role: 'user',
						parts: [{ text: content }],
					},
				];

				const response = await model.generateContentStream({
					model: modelName,
					contents,
					config: {
						temperature: options?.temperature || 1,
						maxOutputTokens: options?.maxTokens || 16383,
						topP: 0.95,
						topK: 40,
					},
				});

				let fullResponse = '';
				for await (const chunk of response) {
					if (chunk.text) {
						fullResponse += chunk.text;
					}
				}

				return {
					response: {
						text: () => fullResponse,
					},
				};
			},
		};

		return chat;
	}

	private isQuotaError(error: Error): boolean {
		return (
			error?.message?.includes('QUOTA_EXCEEDED') ||
			error?.message?.includes('RATE_LIMIT_EXCEEDED')
		);
	}

	async processChunk(
		chat: ChatInterface,
		chunk: string,
		index: number
	): Promise<string> {
		let retryCount = 0;
		const maxRetries = this.keyManager.totalKeys;

		while (retryCount < maxRetries) {
			try {
				const contextMessage =
					index === 0
						? 'Process this text according to the provided rules, make sure to sustain a small paragraph sizes:'
						: 'Continue processing the following part, maintaining consistency:';

				const response = await chat.sendMessage({
					contents: [
						{
							role: 'user',
							parts: [{ text: `${contextMessage}\n\n${chunk}` }],
						},
					],
				});

				const responseText = response.response.text();
				return responseText;
			} catch (error) {
				if (this.isQuotaError(error as Error)) {
					retryCount++;
					const canRetry = await this.handleQuotaError();
					if (!canRetry) break;
					continue;
				}
				throw error;
			}
		}
		throw new Error('All Gemini API keys have exceeded their quota');
	}
}
