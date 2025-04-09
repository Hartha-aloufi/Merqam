import { TranscriptScraper } from './base-scraper';
import { logger } from './logger';
import { TranscriptResult } from '../types';
import { Page } from 'puppeteer';
import { YtDlpWrapper } from '../../../utils/download-subtitle';
import { threadId } from 'worker_threads';

/**
 * Service for downloading YouTube video transcripts using yt-dlp
 */
export class YoutubeTranscriptService implements TranscriptScraper {
	constructor(private readonly ytDlpWrapper: YtDlpWrapper) {}

	/**
	 * Main scraping method that downloads video transcripts
	 * @param url YouTube video URL
	 * @param outputBasePath Base directory for saving files
	 * @param _page Optional puppeteer page (not used in this implementation)
	 * @returns Transcript result with file paths
	 */
	async scrape(
		url: string,
		outputBasePath: string,
	): Promise<TranscriptResult> {
		logger.info('Starting YouTube transcript download', { url });

		try {
			// Check if yt-dlp is available
			await this.ytDlpWrapper.checkYtDlp();

			// Get video metadata
			const metadata = await this.ytDlpWrapper.getVideoMetadata(url);

			// Download subtitles directly to the output directory
			const { srt, txt } = await this.ytDlpWrapper.downloadSubtitles(
				url,
				outputBasePath
			);

			logger.info('Successfully downloaded YouTube transcripts', {
				videoId: metadata.id,
				title: metadata.title,
			});

			return {
				videoId: metadata.id,
				title: metadata.title,
				files: {
					srt,
					txt,
				},
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			logger.error('Failed to download YouTube transcripts', {
				error: error instanceof Error ? error.message : String(error),
				url,
			});
			throw error;
		}
	}

	/**
	 * Extracts video information from metadata
	 * @param _page Puppeteer page (not used in this implementation)
	 * @returns Video ID and title
	 */
	async extractVideoInfo(
		_page: Page
	): Promise<{ videoId: string | null; title: string }> {
		// This method is not used in the YouTube implementation
		// as we get metadata directly from yt-dlp
		throw new Error('Method not implemented for YouTube service');
	}

	/**
	 * Downloads transcripts for a video
	 * @param _page Puppeteer page (not used in this implementation)
	 * @param _outputDir Directory to save the files
	 * @param _videoId Video ID
	 * @returns Paths to downloaded files
	 */
	async downloadTranscripts(
		_page: Page,
		_outputDir: string,
		_videoId: string
	): Promise<{ txt: string; srt: string }> {
		// This method is not used in the YouTube implementation
		// as we handle downloads in the scrape method
		throw new Error('Method not implemented for YouTube service');
	}
}
