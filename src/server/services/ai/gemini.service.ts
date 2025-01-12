// src/server/services/ai/gemini.service.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProcessingOptions } from './types';
import { SYSTEM_PROMPT_GEMINI } from './prompts';
import { BaseAIService } from './base-ai.service';
import { logger } from '@/client/lib/txt-to-mdx/scrapers/logger';
import { GeminiKeyManager } from './gemini-key-manager';
import { env } from '@/server/config/env';

export class GeminiService extends BaseAIService {
	private keyManager: GeminiKeyManager;
	private genAI: GoogleGenerativeAI;
	private defaultModel = 'gemini-2.0-flash-exp';

	constructor() {
		super({ maxChunkLength: 20000 });
		this.keyManager = new GeminiKeyManager(env.GEMINI_API_KEYS);
		this.initializeClient();
	}

	private initializeClient() {
		this.genAI = new GoogleGenerativeAI(this.keyManager.getCurrentKey());
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
		const model = this.genAI.getGenerativeModel({
			model: options?.model || this.defaultModel,
			systemInstruction: SYSTEM_PROMPT_GEMINI,
		});

		const chat = model.startChat({
			history: [],
			generationConfig: {
				temperature: options?.temperature || 1,
				maxOutputTokens: options?.maxTokens || 16383,
				topP: 0.95,
				topK: 40,
			},
		});
		return chat;
	}

	private isQuotaError(error: any): boolean {
		return (
			error?.message?.includes('QUOTA_EXCEEDED') ||
			error?.message?.includes('RATE_LIMIT_EXCEEDED')
		);
	}

	async processChunk(
		chat: any,
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

				const result = await chat.sendMessage(
					`${contextMessage}\n\n${chunk}`
				);

				return result.response.text();
			} catch (error) {
				if (this.isQuotaError(error)) {
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
