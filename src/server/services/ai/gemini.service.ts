// src/server/services/ai/gemini.service.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProcessingOptions } from './types';
import { SYSTEM_PROMPT_GEMINI } from './prompts';
import { BaseAIService } from './base-ai.service';
import { logger } from '@/client/lib/txt-to-mdx/scrapers/logger';

export class GeminiService extends BaseAIService {
	private genAI: GoogleGenerativeAI;
	private defaultModel = 'gemini-2.0-flash-exp';

	constructor(apiKey: string) {
		super({ maxChunkLength: 15000 });
		this.genAI = new GoogleGenerativeAI(apiKey);
	}

	async initializeChat(options?: AIProcessingOptions) {
		logger.info(`Initialized Gemini chat with model ${options?.model || this.defaultModel}`);

		const model = this.genAI.getGenerativeModel({
			model: options?.model || this.defaultModel,
			systemInstruction: SYSTEM_PROMPT_GEMINI,
		});

		return model.startChat({
			history: [],
			generationConfig: {
				temperature: options?.temperature || 1,
				maxOutputTokens: options?.maxTokens || 16383,
				topP: 0.95,
				topK: 40,
			},
		});

	}

	async processChunk(
		chat: any,
		chunk: string,
		index: number
	): Promise<string> {
		const contextMessage =
			index === 0
				? 'Process this text according to the provided rules:'
				: 'Continue processing the following part, maintaining consistency:';

		const result = await chat.sendMessage(`${contextMessage}\n\n${chunk}`);

		return result.response.text();
	}
}
