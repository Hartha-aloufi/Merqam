// src/client/lib/txt-to-mdx/index.ts
import path from 'path';
import fs from 'fs/promises';
import { syncWithVideo } from './sync-with-video';
import { createDir } from '@/client/lib/utils/fs';
import { ScraperFactory } from './scrapers';
import { logger } from './scrapers/logger';
import { AIServiceFactory } from '@/server/services/ai/ai-service.factory';

/**
 * Result interface for the conversion process
 */
export interface ConversionResult {
	mdxPath: string; // Path to the generated MDX file
	videoId: string; // YouTube video ID
	title: string; // Video title
}

/**
 * Main converter class for transforming YouTube transcripts to MDX format
 */
export class TxtToMdxConverter {
	private aiService;
	private dataPath: string;
	private tempDir: string;

	constructor(
		dataPath: string = path.join(process.cwd(), 'src/data'),
		tempDir: string = path.join(process.cwd(), 'temp')
	) {
		this.aiService = AIServiceFactory.getService();
		this.dataPath = dataPath;
		this.tempDir = tempDir;
	}

	/**
	 * Processes a YouTube URL and converts its transcript to MDX format
	 * @param url - YouTube video URL
	 * @param topicId - Topic identifier for organizing content
	 * @returns Promise<ConversionResult>
	 */
	async processContent(
		url: string,
		topicId: string
	): Promise<ConversionResult> {
		let tempMdxPath: string | undefined;
		let txtPath: string | undefined;
		let srtPath: string | undefined;

		try {
			await this.validateInputs(url, topicId);

			// Set up directories
			const { topicPath } = await this.setupDirectories(topicId);

			// Download and extract content
			const { videoId, title, files } = await this.downloadContent(url);
			txtPath = files.txt;
			srtPath = files.srt;

			// Process the content
			const processedContent = await this.processWithAI(txtPath, title);

			// Create and process MDX
			const { finalPath } = await this.createMDX(
				processedContent,
				videoId,
				topicPath,
				srtPath
			);

			logger.info('Conversion completed successfully', {
				videoId,
				title,
				finalPath,
			});

			return {
				mdxPath: finalPath,
				videoId,
				title,
			};
		} catch (error) {
			logger.error('Error in conversion process:', error);
			throw this.handleError(error);
		} finally {
			// Cleanup temporary files
			await this.cleanup(
				[tempMdxPath, txtPath, srtPath].filter(Boolean) as string[]
			);
		}
	}

	/**
	 * Validates input parameters
	 */
	private async validateInputs(url: string, topicId: string): Promise<void> {
		if (!url || !topicId) {
			throw new Error('URL and topicId are required');
		}

		try {
			new URL(url);
		} catch {
			throw new Error('Invalid URL provided');
		}
	}

	/**
	 * Sets up necessary directories
	 */
	private async setupDirectories(topicId: string) {
		const topicPath = path.join(this.dataPath, topicId);
		await createDir(topicPath);
		await createDir(this.tempDir);

		return { topicPath };
	}

	/**
	 * Downloads and extracts content using appropriate scraper
	 */
	private async downloadContent(url: string) {
		const scraper = ScraperFactory.getScraper(url);

		logger.info('Starting transcript download...');
		const result = await scraper.scrape(url, this.tempDir);

		logger.info('Transcript download complete', {
			videoId: result.videoId,
			title: result.title,
		});

		await this.verifyDownloadedFiles(result.files);

		return result;
	}

	/**
	 * Verifies that downloaded files exist
	 */
	private async verifyDownloadedFiles(files: { txt: string; srt: string }) {
		try {
			await fs.access(files.txt);
			await fs.access(files.srt);
			logger.info('Verified files exist', files);
		} catch (error) {
			throw new Error(
				`Downloaded files not found: ${(error as Error).message}`
			);
		}
	}

	/**
	 * Processes content with AI service with fallback handling
	 */
	private async processWithAI(
		txtPath: string,
		title: string
	): Promise<string> {
		const txtContent = await fs.readFile(txtPath, 'utf-8');

		try {
			let processedContent = await this.aiService.processContent(
				txtContent,
				title
			);
			// replace {} with ()
			processedContent = processedContent
				.replace(/{/g, '(')
				.replace(/}/g, ')');
			return processedContent;
		} catch (error) {
			logger.error('AI service error:', error);
			if (error instanceof Error && error.message === 'QUOTA_EXCEEDED') {
				logger.warn(
					'Primary AI service quota exceeded, attempting fallback...'
				);
				this.aiService = AIServiceFactory.getService(); // Get fallback service
				return await this.aiService.processContent(txtContent, title);
			}
			throw error;
		}
	}

	/**
	 * Creates and processes MDX file
	 */
	private async createMDX(
		content: string,
		videoId: string,
		topicPath: string,
		srtPath: string
	) {
		// Create temporary MDX
		const tempMdxPath = path.join(this.tempDir, `${videoId}_temp.mdx`);
		await fs.writeFile(tempMdxPath, content);
		logger.info('Created temp MDX file', { tempMdxPath });

		// Create final MDX with timestamps
		const finalPath = path.join(topicPath, `${videoId}.mdx`);
		await syncWithVideo(tempMdxPath, srtPath, finalPath);
		logger.info('Created final MDX with timestamps', { finalPath });

		return { tempMdxPath, finalPath };
	}

	/**
	 * Cleans up temporary files
	 */
	private async cleanup(filePaths: string[]) {
		for (const filePath of filePaths) {
			try {
				await fs.unlink(filePath);
			} catch (error) {
				logger.warn(
					`Failed to delete temporary file: ${filePath}`,
					error
				);
			}
		}
	}

	/**
	 * Handles and transforms errors
	 */
	private handleError(error: unknown): Error {
		if (error instanceof Error) {
			return new Error(`Conversion failed: ${error.message}`);
		}
		return new Error('An unknown error occurred during conversion');
	}
}
