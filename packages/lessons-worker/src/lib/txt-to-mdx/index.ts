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
import { BahethDirectDownloader } from './scrapers/baheth-direct-download';

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
		this.dataPath = options.dataPath || env.STORAGE_ROOT_URL;
		this.tempDir =
			options.tempDir ||
			env.STORAGE_TEMP_URL ||
			path.join(process.cwd(), 'temp');
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
			// Add breadcrumb for process start
			logger.info('🎬 BREADCRUMB: processContent started', { url, playlistId });
			
			// Report initialization
			console.log('Initializing conversion...');
			await this.progress('INITIALIZED');

			logger.debug('🍞 BREADCRUMB: About to validate inputs');
			await this.validateInputs(url, playlistId);
			logger.info('Input validation successful', { url, playlistId });

			// Set up directories
			logger.debug('🍞 BREADCRUMB: About to setup directories');
			const { topicPath: playlistPath } = await this.setupDirectories(
				playlistId
			);
			logger.info('Directories set up', { playlistPath });

			// Report downloading stage
			await this.progress('DOWNLOADING');

			// Download and extract content
			logger.debug('🍞 BREADCRUMB: About to call downloadContent method');
			const { videoId, title, files } = await this.downloadContent(url);
			logger.debug('🍞 BREADCRUMB: downloadContent method completed', { 
				videoId, 
				title,
				hasTxtFile: !!files.txt,
				hasSrtFile: !!files.srt
			});
			txtPath = files.txt;
			srtPath = files.srt;

			await this.progress('TRANSCRIPT_EXTRACTED');
			logger.info(
				`Transcript extraction complete for video "${title}" (${videoId})`
			);

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
	 * Downloads and extracts content using Baheth API first, then fallback scrapers
	 */
	private async downloadContent(url: string) {
		const downloadStart = Date.now();
		
		try {
			logger.info('🎬 Starting transcript download process', { 
				url,
				tempDir: this.tempDir,
				strategy: 'Baheth API first, then fallback'
			});

			// Try Baheth API first for any YouTube URL
			logger.info('🔄 Step 1: Attempting Baheth API download', { url });
			
			let bahethDownloader: BahethDirectDownloader;
			try {
				logger.debug('🏗️ Creating BahethDirectDownloader instance');
				bahethDownloader = new BahethDirectDownloader();
				logger.debug('✅ BahethDirectDownloader instance created successfully');
			} catch (error) {
				logger.error('💥 Critical: Failed to create BahethDirectDownloader instance', {
					url,
					error: error instanceof Error ? {
						name: error.name,
						message: error.message,
						stack: error.stack?.split('\n').slice(0, 3)
					} : String(error)
				});
				
				// This is a critical configuration/environment error that should not be silently ignored
				const errorMessage = `BahethDirectDownloader instantiation failed: ${error instanceof Error ? error.message : String(error)}`;
				logger.error('🚨 Process terminating due to critical initialization failure');
				throw new Error(errorMessage);
			}
			
			let bahethResult: any = null;
			try {
				logger.debug('📞 Calling bahethDownloader.downloadTranscripts');
				bahethResult = await bahethDownloader.downloadTranscripts(url, this.tempDir);
				logger.debug('📞 bahethDownloader.downloadTranscripts call completed', {
					hasResult: !!bahethResult
				});
			} catch (error) {
				logger.error('💥 Exception during Baheth download process', {
					url,
					error: error instanceof Error ? {
						name: error.name,
						message: error.message,
						stack: error.stack?.split('\n').slice(0, 5)
					} : String(error)
				});
				bahethResult = null;
			}

			if (bahethResult) {
				const bahethDuration = Date.now() - downloadStart;
				logger.info('🎉 Baheth API download successful - transcript source confirmed', {
					source: 'Baheth API',
					videoId: bahethResult.videoId,
					title: bahethResult.title,
					duration: `${bahethDuration}ms`,
					files: {
						txt: path.basename(bahethResult.files.txt),
						srt: path.basename(bahethResult.files.srt)
					}
				});

				logger.debug('🔍 Verifying downloaded files from Baheth');
				await this.verifyDownloadedFiles(bahethResult.files);
				logger.debug('✅ File verification passed');

				return bahethResult;
			}

			// Fallback to traditional scraper method
			const bahethDuration = Date.now() - downloadStart;
			logger.info('🔄 Step 2: Baheth API unsuccessful, using fallback scraper', {
				bahethAttemptDuration: `${bahethDuration}ms`,
				fallbackReason: 'Medium not found in Baheth or transcripts unavailable'
			});

			const fallbackStart = Date.now();
			const scraper = ScraperFactory.getScraper(url);

			logger.info('🛠️ Initializing fallback scraper', {
				scraperType: scraper.constructor.name,
				url
			});

			logger.info('⬇️ Starting fallback transcript download...');
			const result = await scraper.scrape(url, this.tempDir);

			const fallbackDuration = Date.now() - fallbackStart;
			const totalDuration = Date.now() - downloadStart;

			logger.info('🎉 Fallback transcript download complete', {
				source: 'Fallback scraper',
				scraperType: scraper.constructor.name,
				videoId: result.videoId,
				title: result.title,
				fallbackDuration: `${fallbackDuration}ms`,
				totalDuration: `${totalDuration}ms`,
				files: {
					txt: path.basename(result.files.txt),
					srt: path.basename(result.files.srt)
				}
			});

			logger.debug('🔍 Verifying downloaded files from fallback scraper');
			await this.verifyDownloadedFiles(result.files);
			logger.debug('✅ File verification passed');

			return result;
		} catch (error) {
			const totalDuration = Date.now() - downloadStart;
			
			logger.error('💥 All transcript download methods failed', {
				url,
				totalDuration: `${totalDuration}ms`,
				tempDir: this.tempDir,
				error: error instanceof Error ? {
					name: error.name,
					message: error.message,
					stack: error.stack?.split('\n').slice(0, 5)
				} : String(error),
				attemptedSources: ['Baheth API', 'Fallback scraper']
			});

			throw new JobError(
				'Failed to download transcript from all available sources',
				JobErrorType.TRANSCRIPT_DOWNLOAD,
				{ 
					details: error,
					context: {
						url,
						totalDuration: `${totalDuration}ms`,
						attemptedSources: ['Baheth API', 'Fallback scraper']
					}
				}
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
