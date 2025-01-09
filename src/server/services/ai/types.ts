// src/server/services/ai/types.ts
export interface AIProcessingOptions {
	maxTokens?: number;
	temperature?: number;
	model?: string;
}

export interface AIService {
	processContent(
		content: string,
		title: string,
		options?: AIProcessingOptions
	): Promise<string>;
}
