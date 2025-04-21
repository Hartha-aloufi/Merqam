// src/server/services/ai/text-chunking.service.ts
import { workerLogger as logger } from '../../lib/logging/file-logger';

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
			maxChunkLength: options?.maxChunkLength || 20000,
			delayBetweenChunks: options?.delayBetweenChunks || 500,
			maxRetries: options?.maxRetries || 7,
			retryDelay: options?.retryDelay || 1000,
		};
	}

	private splitBySentence(text: string): string[] {
		const sentences = text.split(/(?<=[.!?])\s+/);
		const chunks: string[] = [];
		let currentChunk = '';
		let currentLength = 0;

		for (const sentence of sentences) {
			if (
				currentLength &&
				currentLength + sentence.length > this.options.maxChunkLength
			) {
				chunks.push(currentChunk.trim());
				currentChunk = '';
				currentLength = 0;
			}
			currentChunk += sentence + ' ';
			currentLength += sentence.length + 1;
		}

		if (currentChunk.trim()) chunks.push(currentChunk.trim());

		return chunks;
	}

	private splitByWord(text: string): string[] {
		const words = text.split(/\s+/);
		const chunks: string[] = [];
		let currentChunk = '';
		let currentLength = 0;

		for (const word of words) {
			if (currentLength + word.length > this.options.maxChunkLength) {
				chunks.push(currentChunk.trim());
				currentChunk = '';
				currentLength = 0;
			}
			currentChunk += word + ' ';
			currentLength += word.length + 1;
		}

		if (currentChunk) chunks.push(currentChunk.trim());

		return chunks;
	}

	/**
	 * Split text into chunks based on sentence length and word length
	 * @param text
	 * @returns
	 */
	public splitIntoChunks(text: string): string[] {
		logger.info(`Splitting text of length ${text.length} into chunks...`);

		const chunks = this.splitBySentence(text);
		this.logChunks(chunks);

		const smallerChunks = this.splitBySentence(text).reduce(
			(acc, sentence, idx) => {
				if (sentence.length > this.options.maxChunkLength) {
					logger.info(
						`Splitting sentence ${idx + 1} of length ${
							sentence.length
						} into more chunks (word based)...`
					);
					const wordsChunks = this.splitByWord(sentence);
					acc.push(...wordsChunks);
				} else {
					acc.push(sentence);
				}
				return acc;
			},
			[] as string[]
		);

		this.logChunks(smallerChunks);
		return smallerChunks;
	}

	public async sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	private logChunks(chunks: string[]): void {
		logger.info(`Created ${chunks.length} chunks`);
		chunks.forEach((chunk, i) => {
			logger.info(`Chunk ${i + 1} length: ${chunk.length}`);
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
