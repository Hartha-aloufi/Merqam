// src/server/services/ai/ai-service.factory.ts
import { OpenAIService } from './openai.service';
import { GeminiService } from './gemini.service';
import { AIService, AIServiceType } from './types';
import { env } from '@/server/config/env';

export class AIServiceFactory {
	static getService(serviceType?: AIServiceType): AIService {
		// If no service type specified, try Gemini first as it's free
		if (!serviceType) {
			if (env.GEMINI_API_KEY) {
				return new GeminiService(env.GEMINI_API_KEY);
			}
			if (env.OPENAI_API_KEY) {
				return new OpenAIService(env.OPENAI_API_KEY);
			}
			throw new Error('No AI service configuration found');
		}

		// Return specifically requested service
		switch (serviceType) {
			case 'gemini':
				if (!env.GEMINI_API_KEY)
					throw new Error('Gemini API key not configured');
				return new GeminiService(env.GEMINI_API_KEY);

			case 'openai':
				if (!env.OPENAI_API_KEY)
					throw new Error('OpenAI API key not configured');
				return new OpenAIService(env.OPENAI_API_KEY);

			default:
				throw new Error(`Unsupported AI service: ${serviceType}`);
		}
	}
}
