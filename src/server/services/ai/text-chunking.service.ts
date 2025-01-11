// src/server/services/ai/text-chunking.service.ts
import { logger } from '@/client/lib/txt-to-mdx/scrapers/logger';

export interface ChunkingOptions {
	maxChunkLength?: number;
	delayBetweenChunks?: number;
	maxRetries?: number;
	retryDelay?: number;
}

export class TextChunkingService {
	private options: Required<ChunkingOptions>;

	constructor(options?: ChunkingOptions) {
		this.options = {
			maxChunkLength: options?.maxChunkLength || 15000,
			delayBetweenChunks: options?.delayBetweenChunks || 500,
			maxRetries: options?.maxRetries || 3,
			retryDelay: options?.retryDelay || 1000,
		};
	}

	public splitIntoChunks(text: string): string[] {
		const sentences = text.split(/(?<=[.!?])\s+/);
		const chunks: string[] = [];
		let currentChunk = '';
		let currentLength = 0;

		logger.info(`Splitting text of length ${text.length} into chunks...`);

		for (const sentence of sentences) {
			if (currentLength + sentence.length > this.options.maxChunkLength) {
				chunks.push(currentChunk.trim());
				currentChunk = '';
				currentLength = 0;
			}
			currentChunk += sentence + ' ';
			currentLength += sentence.length + 1;
		}

		if (currentChunk) chunks.push(currentChunk.trim());

		this.logChunks(chunks);
		return chunks;
	}

	public async sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	private logChunks(chunks: string[]): void {
		logger.info(`Created ${chunks.length} chunks`);
		chunks.forEach((chunk, i) => {
			logger.debug(`Chunk ${i + 1} length: ${chunk.length}`);
		});
	}

	public get maxRetries(): number {
		return this.options.maxRetries;
	}

	public get retryDelay(): number {
		return this.options.retryDelay;
	}

	public get delayBetweenChunks(): number {
		return this.options.delayBetweenChunks;
	}
}
