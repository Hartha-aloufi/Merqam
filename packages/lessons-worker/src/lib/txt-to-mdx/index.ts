// src/client/lib/txt-to-mdx/enhanced-converter.ts
import path from 'path';
import fs from 'fs/promises';
import { syncWithVideo } from './sync-with-video';
import { createDir } from '../../utils/fs';
import { ScraperFactory } from './scrapers';
import { workerLogger as logger } from '../../lib/logging/file-logger';
import { AIServiceType } from '../../services/ai/types';
import { JobProgressReporter } from '../../queue/job-progress-utils';
import {
	JobError,
	JobErrorType,
	processError,
} from '../../queue/job-error-utils';
import { AIServiceFactory } from '../../services/ai/ai-service.factory';
import { env } from '../env';

/**
 * Result interface for the conversion process
 */
export interface ConversionResult {
	mdxPath: string; // Path to the generated MDX file
	videoId: string; // YouTube video ID
	title: string; // Video title
}

/**
 * Configuration options for the converter
 */
export interface ConverterOptions {
	aiServiceType?: AIServiceType;
	dataPath?: string;
	tempDir?: string;
	progressReporter?: JobProgressReporter;
}

/**
 * Enhanced converter class for transforming YouTube transcripts to MDX format
 * with progress reporting and improved error handling
 */
export class EnhancedTxtToMdxConverter {
	private aiService;
	private dataPath: string;
	private tempDir: string;
	private progressReporter?: JobProgressReporter;

	constructor(options: ConverterOptions = {}) {
		this.aiService = AIServiceFactory.getService(options.aiServiceType);
		this.dataPath =
			options.dataPath || env.STORAGE_ROOT_URL;
		this.tempDir = options.tempDir || env.STORAGE_TEMP_URL || path.join(process.cwd(), 'temp');
		this.progressReporter = options.progressReporter;

		logger.info('Enhanced TxtToMdxConverter initialized', {
			aiService: options.aiServiceType || 'default',
			dataPath: this.dataPath,
			tempDir: this.tempDir,
		});
	}

	/**
	 * Processes a YouTube URL and converts its transcript to MDX format
	 * @param url - YouTube video URL
	 * @param playlistId - Topic identifier for organizing content
	 * @returns Promise<ConversionResult>
	 */
	async processContent(
		url: string,
		playlistId: string
	): Promise<ConversionResult> {
		let txtPath: string | undefined;
		let srtPath: string | undefined;

		try {
			// Report initialization
			console.log('Initializing conversion...');
			await this.progress('INITIALIZED');

			await this.validateInputs(url, playlistId);
			logger.info('Input validation successful', { url, playlistId });

			// Set up directories
			const { topicPath: playlistPath } = await this.setupDirectories(
				playlistId
			);
			logger.info('Directories set up', { playlistPath });

			// Report downloading stage
			await this.progress('DOWNLOADING');

			// Download and extract content
			const { videoId, title, files } = await this.downloadContent(url);
			txtPath = files.txt;
			srtPath = files.srt;

			await this.progress('TRANSCRIPT_EXTRACTED');
			logger.info(`Transcript extraction complete for video "${title}" (${videoId})`);

			const txtContent = await fs.readFile(txtPath, 'utf-8');
			logger.info(`Text content read: ${txtContent.length} characters`);

			// Process the content with AI
			await this.progress('AI_PROCESSING_STARTED');
			
			const processedContent = await this.processWithAI(
				txtContent,
				title
			);

			await this.progress('AI_PROCESSING_COMPLETED');
			logger.info('AI processing complete', {
				processedSize: processedContent.length,
			});

			// Synchronize with video timestamps
			await this.progress('SYNCHRONIZING');
			const { finalPath } = await this.createMDX(
				processedContent,
				videoId,
				playlistPath,
				srtPath
			);

			await this.progress('SAVING_TO_DATABASE');
			logger.info('Conversion completed successfully', {
				videoId,
				title,
				finalPath,
			});

			// Report completion
			await this.progress('COMPLETED');
			return {
				mdxPath: finalPath,
				videoId,
				title,
			};
		} catch (error) {
			const jobError = processError(error);
			logger.error('Error in conversion process:', jobError);

			// Report failure
			await this.progressReporter?.reportFailure(jobError);

			throw jobError;
		} finally {
			// Cleanup temporary files
			// await this.cleanup(
			// 	[tempMdxPath, txtPath, srtPath].filter(Boolean) as string[]
			// );
		}
	}

	/**
	 * Validates input parameters
	 */
	private async validateInputs(url: string, topicId: string): Promise<void> {
		if (!url || !topicId) {
			throw new JobError(
				'URL and topicId are required',
				JobErrorType.INVALID_URL
			);
		}

		try {
			new URL(url);
		} catch {
			throw new JobError(
				'Invalid URL provided',
				JobErrorType.INVALID_URL
			);
		}
	}

	/**
	 * Sets up necessary directories
	 */
	private async setupDirectories(topicId: string) {
		try {
			const topicPath = path.join(this.dataPath, topicId);
			await createDir(topicPath);
			await createDir(this.tempDir);

			return { topicPath };
		} catch (error) {
			throw new JobError(
				'Failed to create directories',
				JobErrorType.FILESYSTEM,
				{ cause: error, details: { topicId } }
			);
		}
	}

	/**
	 * Downloads and extracts content using appropriate scraper
	 */
	private async downloadContent(url: string) {
		try {
			const scraper = ScraperFactory.getScraper(url);

			logger.info('Starting transcript download...');
			const result = await scraper.scrape(url, this.tempDir);

			logger.info('Transcript download complete', {
				videoId: result.videoId,
				title: result.title,
			});

			await this.verifyDownloadedFiles(result.files);

			return result;
		} catch (error) {
			throw new JobError(
				'Failed to download transcript',
				JobErrorType.TRANSCRIPT_DOWNLOAD,
				{ details: error }
			);
		}
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
			throw new JobError(
				'Downloaded files not found',
				JobErrorType.FILESYSTEM,
				{ cause: error, details: files }
			);
		}
	}

	/**
	 * Processes content with AI service with fallback handling
	 */
	private async processWithAI(
		txtContent: string,
		title: string
	): Promise<string> {
		try {
			let processedContent = await this.aiService.processContent(
				txtContent,
				title
			);
			// replace {} with ()
			processedContent = processedContent
				.replace(/{/g, '(')
				.replace(/}/g, ')');

			// Report halfway progress during AI processing
			await this.progress('AI_PROCESSING_HALFWAY');

			return processedContent;
		} catch (error) {
			logger.error('AI service error:', error);
			if (error instanceof Error && error.message === 'QUOTA_EXCEEDED') {
				logger.warn(
					'Primary AI service quota exceeded, attempting fallback...'
				);

				// Try fallback service
				this.aiService = AIServiceFactory.getService(); // Get fallback service
				return await this.aiService.processContent(txtContent, title);
			}

			throw new JobError(
				'AI processing failed',
				error instanceof Error && error.message === 'QUOTA_EXCEEDED'
					? JobErrorType.AI_QUOTA_EXCEEDED
					: JobErrorType.AI_SERVICE,
				{ cause: error, retry: false }
			);
		}
	}

	/**
	 * Creates and processes MDX file
	 */
	private async createMDX(
		content: string,
		videoId: string,
		playlistPath: string,
		srtPath: string
	) {
		try {
			// Create temporary MDX
			const tempMdxPath = path.join(this.tempDir, `${videoId}_temp.mdx`);
			await fs.writeFile(tempMdxPath, content);
			logger.info('Created temp MDX file', { tempMdxPath });

			// Create final MDX with timestamps
			const finalPath = path.join(playlistPath, `${videoId}.mdx`);
			await syncWithVideo(tempMdxPath, srtPath, finalPath);
			logger.info('Created final MDX with timestamps', { finalPath });

			return { tempMdxPath, finalPath };
		} catch (error) {
			throw new JobError(
				'Failed to create MDX file',
				JobErrorType.VIDEO_SYNC,
				{ cause: error, details: { videoId } }
			);
		}
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
	 * Update progress using the progress reporter
	 */
	private async progress(
		stage: keyof typeof import('../../queue/job-progress-utils').PROGRESS_STAGES
	): Promise<void> {
		if (this.progressReporter) {
			await this.progressReporter.reportStage(stage);
		}
	}
}
