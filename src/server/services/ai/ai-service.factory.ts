// src/server/services/ai/ai-service.factory.ts
import { OpenAIService } from './openai.service';
import { GeminiService } from './gemini.service';
import { AIService } from './types';
import { env } from '@/server/config/env';

export class AIServiceFactory {
	private static instance: AIService;

	static getService(): AIService {
		if (!this.instance) {
			// Try Gemini first as it's free
			if (env.GEMINI_API_KEY) {
				try {
					this.instance = new GeminiService(env.GEMINI_API_KEY);
				} catch (error) {
					console.warn(
						'Failed to initialize Gemini, falling back to OpenAI:',
						error
					);
				}
			}

			// Fallback to OpenAI if Gemini fails or isn't configured
			if (!this.instance && env.OPENAI_API_KEY) {
				this.instance = new OpenAIService(env.OPENAI_API_KEY);
			}

			if (!this.instance) {
				throw new Error('No AI service configuration found');
			}
		}

		return this.instance;
	}
}
