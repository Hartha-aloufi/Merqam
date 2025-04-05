// src/server/services/ai/types.ts
export type AIServiceType = 'gemini' | 'openai';

export interface AIProcessingOptions {
	maxTokens?: number;
	temperature?: number;
	model?: string;
	serviceType?: AIServiceType; // Added this
}

export interface AIService {
	processContent(
		content: string,
		title: string,
		options?: AIProcessingOptions
	): Promise<string>;
}
