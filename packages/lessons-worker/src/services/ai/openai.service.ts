// src/server/services/ai/openai.service.ts
import OpenAI from 'openai';
import { AIProcessingOptions } from './types';
import { SYSTEM_PROMPT_OPEN_AI } from './prompts';
import { BaseAIService } from './base-ai.service';
import { workerLogger as logger } from '../../lib/logging/file-logger';

export class OpenAIService extends BaseAIService {
	private openai: OpenAI;
	private defaultModel = 'gpt-4o-mini';

	constructor(apiKey: string) {
		super({ maxChunkLength: 30000 });
		this.openai = new OpenAI({ apiKey });
	}

	async initializeChat(options?: AIProcessingOptions) {
		logger.info(`Initialized OpenAI chat with model ${options?.model || this.defaultModel}`);
		
		return {
			model: options?.model || this.defaultModel,
			messages: [
				{
					role: 'system',
					content: SYSTEM_PROMPT_OPEN_AI,
				},
			],
			temperature: options?.temperature || 0.84,
			max_tokens: options?.maxTokens || 16383,
		};
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

		const completion = await this.openai.chat.completions.create({
			...chat,
			messages: [
				...chat.messages,
				{
					role: 'user',
					content: `${contextMessage}\n\n${chunk}`,
				},
			],
		});

		return completion.choices[0].message.content || '';
	}
}
