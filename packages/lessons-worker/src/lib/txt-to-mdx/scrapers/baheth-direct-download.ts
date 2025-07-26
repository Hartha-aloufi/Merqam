import { promises as fs } from 'fs';
import path from 'path';
import { workerLogger as logger } from '../../../lib/logging/file-logger';
import { BahethAPIClient } from '../../../lib/baheth-api-client';
import { TranscriptResult } from '../types';

export class BahethDirectDownloader {
	private apiClient: BahethAPIClient;

	constructor() {
		try {
			logger.info('🏗️ Initializing BahethDirectDownloader');
			this.apiClient = new BahethAPIClient();
			logger.info('✅ BahethDirectDownloader initialized successfully');
		} catch (error) {
			logger.error('💥 Failed to initialize BahethDirectDownloader', {
				error: error instanceof Error ? {
					name: error.name,
					message: error.message,
					stack: error.stack?.split('\n').slice(0, 3)
				} : String(error)
			});
			throw error;
		}
	}

	/**
	 * Downloads transcript files directly from Baheth using the API
	 * @param youtubeUrl - The YouTube video URL
	 * @param outputDir - Directory to save the downloaded files
	 * @returns Promise<TranscriptResult> or null if not available in Baheth
	 */
	async downloadTranscripts(
		youtubeUrl: string,
		outputDir: string
	): Promise<TranscriptResult | null> {
		const processStart = Date.now();
		
		try {
			logger.info('🚀 Starting Baheth direct download process', { 
				youtubeUrl,
				outputDir 
			});

			// Step 1: Extract video ID from YouTube URL
			logger.debug('📋 Step 1: Extracting video ID from URL');
			const videoId = BahethAPIClient.extractYouTubeVideoId(youtubeUrl);
			if (!videoId) {
				logger.warn('❌ Could not extract video ID from YouTube URL', { 
					youtubeUrl,
					reason: 'Invalid YouTube URL format'
				});
				return null;
			}
			logger.debug('✅ Video ID extracted successfully', { videoId });

			// Step 2: Search for medium in Baheth API
			logger.debug('📋 Step 2: Searching for medium in Baheth API');
			const bahethMedium = await this.apiClient.findMediumByYouTubeUrl(youtubeUrl);
			if (!bahethMedium) {
				logger.info('❌ Medium not found in Baheth, will use fallback scraper', { 
					youtubeUrl,
					videoId,
					searchDuration: `${Date.now() - processStart}ms`
				});
				return null;
			}

			// Step 3: Validate transcription links
			logger.debug('📋 Step 3: Validating transcription links');
			const missingLinks = [];
			if (!bahethMedium.transcription_txt_link) missingLinks.push('TXT');
			if (!bahethMedium.transcription_srt_link) missingLinks.push('SRT');

			if (missingLinks.length > 0) {
				logger.warn('❌ Transcription links not available in Baheth medium', {
					bahethId: bahethMedium.id,
					title: bahethMedium.title,
					missingLinks,
					availableLinks: {
						txt: !!bahethMedium.transcription_txt_link,
						srt: !!bahethMedium.transcription_srt_link
					}
				});
				return null;
			}
			logger.debug('✅ All transcription links available');

			logger.info('🎯 Starting direct download from Baheth CDN', {
				bahethId: bahethMedium.id,
				videoId,
				title: bahethMedium.title,
				txtLink: bahethMedium.transcription_txt_link?.substring(0, 60) + '...',
				srtLink: bahethMedium.transcription_srt_link?.substring(0, 60) + '...'
			});

			// Step 4: Ensure output directory exists
			logger.debug('📋 Step 4: Creating output directory');
			await fs.mkdir(outputDir, { recursive: true });
			logger.debug('✅ Output directory ready', { outputDir });

			const files = {
				txt: '',
				srt: '',
			};

			// Step 5: Download TXT file
			logger.debug('📋 Step 5: Downloading TXT file');
			const txtPath = path.join(outputDir, `${videoId}.txt`);
			const txtStartTime = Date.now();
			await this.downloadFile(bahethMedium.transcription_txt_link!, txtPath);
			files.txt = txtPath;
			logger.info('✅ TXT file downloaded successfully', { 
				txtPath,
				downloadDuration: `${Date.now() - txtStartTime}ms`
			});

			// Step 6: Download SRT file
			logger.debug('📋 Step 6: Downloading SRT file');
			const srtPath = path.join(outputDir, `${videoId}.srt`);
			const srtStartTime = Date.now();
			await this.downloadFile(bahethMedium.transcription_srt_link!, srtPath);
			files.srt = srtPath;
			logger.info('✅ SRT file downloaded successfully', { 
				srtPath,
				downloadDuration: `${Date.now() - srtStartTime}ms`
			});

			const totalDuration = Date.now() - processStart;
			logger.info('🎉 Baheth direct download completed successfully', {
				videoId,
				title: bahethMedium.title,
				bahethId: bahethMedium.id,
				totalDuration: `${totalDuration}ms`,
				filesCreated: [files.txt, files.srt]
			});

			return {
				videoId,
				title: bahethMedium.title,
				files,
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			const totalDuration = Date.now() - processStart;
			
			logger.error('💥 Failed to download transcripts from Baheth', {
				youtubeUrl,
				outputDir,
				totalDuration: `${totalDuration}ms`,
				error: error instanceof Error ? {
					name: error.name,
					message: error.message,
					stack: error.stack?.split('\n').slice(0, 5)
				} : String(error)
			});
			
			// Return null to allow fallback to other scrapers
			return null;
		}
	}

	/**
	 * Downloads a file from URL to local path
	 */
	private async downloadFile(url: string, filePath: string): Promise<void> {
		const downloadStart = Date.now();
		
		try {
			logger.debug('📥 Starting file download', { 
				url: url.substring(0, 80) + '...',
				filePath,
				fileName: path.basename(filePath)
			});
			
			const response = await fetch(url);
			const fetchDuration = Date.now() - downloadStart;
			
			if (!response.ok) {
				const errorBody = await response.text().catch(() => 'Unable to read error response');
				logger.error('❌ File download HTTP error', {
					url: url.substring(0, 80) + '...',
					filePath,
					status: response.status,
					statusText: response.statusText,
					errorBody: errorBody.substring(0, 200),
					fetchDuration: `${fetchDuration}ms`
				});
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			logger.debug('📄 Reading response content', {
				contentType: response.headers.get('content-type'),
				contentLength: response.headers.get('content-length')
			});

			const content = await response.text();
			const readDuration = Date.now() - downloadStart - fetchDuration;

			logger.debug('💾 Writing content to file', {
				contentSize: content.length,
				contentPreview: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
				filePath
			});

			await fs.writeFile(filePath, content, 'utf-8');
			const totalDuration = Date.now() - downloadStart;
			
			logger.debug('✅ File downloaded and saved successfully', { 
				filePath, 
				fileName: path.basename(filePath),
				contentSize: content.length,
				fetchDuration: `${fetchDuration}ms`,
				readDuration: `${readDuration}ms`,
				totalDuration: `${totalDuration}ms`
			});
		} catch (error) {
			const totalDuration = Date.now() - downloadStart;
			
			logger.error('💥 File download failed', { 
				url: url.substring(0, 80) + '...',
				filePath,
				fileName: path.basename(filePath),
				totalDuration: `${totalDuration}ms`,
				error: error instanceof Error ? {
					name: error.name,
					message: error.message
				} : String(error)
			});
			throw error;
		}
	}
}