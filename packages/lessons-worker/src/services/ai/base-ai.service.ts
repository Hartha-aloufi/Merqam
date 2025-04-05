// src/server/services/ai/base-ai.service.ts
import { workerLogger as logger } from '../../lib/logging/file-logger';
import { TextChunkingService, ChunkingOptions } from './text-chunking.service';
import { AIService, AIProcessingOptions } from './types';

export abstract class BaseAIService implements AIService {
	protected chunkingService: TextChunkingService;

	constructor(chunkingOptions?: ChunkingOptions) {
		this.chunkingService = new TextChunkingService(chunkingOptions);
	}

	abstract initializeChat(options?: AIProcessingOptions): Promise<any>;
	abstract processChunk(
		chat: any,
		chunk: string,
		index: number,
		total: number
	): Promise<string>;

	protected async processChunkWithRetry(
		chat: any,
		chunk: string,
		chunkIndex: number,
		totalChunks: number
	): Promise<string> {
		for (
			let attempt = 1;
			attempt <= this.chunkingService.maxRetries;
			attempt++
		) {
			try {
				logger.info(
					`Processing chunk ${
						chunkIndex + 1
					}/${totalChunks} (Attempt ${attempt})`
				);

				const result = await this.processChunk(
					chat,
					chunk,
					chunkIndex,
					totalChunks
				);
				if (!this.validateChunkResult(result, chunk)) {
					throw new Error('Invalid chunk result');
				}

				logger.info(`Successfully processed chunk ${chunkIndex + 1}`);
				return result;
			} catch (error) {
				if (attempt === this.chunkingService.maxRetries) throw error;
				logger.warn(
					`Retry ${attempt} for chunk ${chunkIndex + 1}:`,
					error
				);
				await this.chunkingService.sleep(
					this.chunkingService.retryDelay * attempt
				);
			}
		}
		throw new Error('All retries failed');
	}

	protected validateChunkResult(
		result: string,
		originalChunk: string
	): boolean {
		if (!result || result.length < originalChunk.length * 0.5) {
			logger.warn('Suspiciously short response', {
				inputLength: originalChunk.length,
				outputLength: result?.length,
			});
			return false;
		}
		return true;
	}

	async processContent(
		content: string,
		title: string,
		options?: AIProcessingOptions
	): Promise<string> {
		try {
			logger.info('Starting content processing', {
				contentLength: content.length,
				title,
			});

			const chunks = this.chunkingService.splitIntoChunks(content);
			const chat = await this.initializeChat(options);
			let processedContent = '';

			for (let i = 0; i < chunks.length; i++) {
				const chunkResult = await this.processChunkWithRetry(
					chat,
					chunks[i],
					i,
					chunks.length
				);
				processedContent += (i > 0 ? '\n\n' : '') + chunkResult;

				if (i < chunks.length - 1) {
					await this.chunkingService.sleep(
						this.chunkingService.delayBetweenChunks
					);
				}
			}

			logger.info('Content processing completed', {
				inputLength: content.length,
				outputLength: processedContent.length,
			});

			return `# ${title}\n\n${processedContent}`;
		} catch (error) {
			logger.error('Content processing failed:', error);
			throw error;
		}
	}
}
