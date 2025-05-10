// src/server/services/ai/ai-service.factory.ts
import { OpenAIService } from './openai.service';
import { GeminiService } from './gemini.service';
import { AIService, AIServiceType } from './types';
import { env } from '../../lib/env';

export class AIServiceFactory {
	private static instances: Map<AIServiceType, AIService> = new Map();

	static getService(serviceType?: AIServiceType): AIService {
		// If no service type specified, try Gemini first as it's free
		if (!serviceType) {
			if (env.GEMINI_API_KEYS.length > 0) {
				return this.getOrCreateService('gemini');
			}
			if (env.OPENAI_API_KEY) {
				return this.getOrCreateService('openai');
			}
			throw new Error('No AI service configuration found');
		}

		return this.getOrCreateService(serviceType);
	}

	private static getOrCreateService(type: AIServiceType): AIService {
		if (!this.instances.has(type)) {
			switch (type) {
				case 'gemini':
					if (env.GEMINI_API_KEYS.length === 0) {
						throw new Error('No Gemini API keys configured');
					}
					this.instances.set(type, new GeminiService());
					break;

				case 'openai':
					if (!env.OPENAI_API_KEY) {
						throw new Error('OpenAI API key not configured');
					}
					this.instances.set(
						type,
						new OpenAIService(env.OPENAI_API_KEY)
					);
					break;

				default:
					throw new Error(`Unsupported AI service: ${type}`);
			}
		}

		return this.instances.get(type)!;
	}
}
