// src/lib/txt-to-mdx/scrapers/downsub-scraper.ts
import puppeteer, { Page } from 'puppeteer';
import { logger } from './logger';
import path from 'path';
import fs from 'fs/promises';
import { TranscriptResult } from '../types';
import { BaseScraper } from './base-scraper';
import { getSearchParamFromURL } from '@/client/lib/utils';

export class DownsubScraper extends BaseScraper {
	async extractVideoInfo(
		page: Page
	): Promise<{ videoId: string | null; title: string }> {
		logger.info('Attempting to extract video info from Downsub');

		try {
			// Get details from the page
			const pageInfo = await page.evaluate(() => {
				const titleElement = document.querySelector(
					'.v-card__title.title a'
				);
				const currentUrl = window.location.href;

				return {
					title: titleElement?.textContent?.trim() || '',
					url: currentUrl,
				};
			});

			logger.info('Extracted video info from Downsub', pageInfo);

			// Extract video ID from URL
			const youtubeUrl = getSearchParamFromURL(pageInfo.url, 'url');
			const videoId = getSearchParamFromURL(youtubeUrl as string, 'v');

			if (!videoId) {
				throw new Error(
					'Could not extract YouTube video ID from Downsub URL'
				);
			}

			if (!pageInfo.title) {
				throw new Error(
					'Could not extract video title from Downsub page'
				);
			}

			logger.info('Successfully extracted video info', {
				videoId,
				title: pageInfo.title,
			});

			return {
				videoId,
				title: pageInfo.title,
			};
		} catch (error) {
			logger.error('Failed to extract video info:', error);
			throw error;
		}
	}

	async downloadTranscripts(
		page: Page,
		outputDir: string,
		videoId: string
	): Promise<{ txt: string; srt: string }> {
		logger.info('Starting transcript downloads from Downsub');

		// Wait for the Arabic auto-generated subtitles section
		await page.waitForSelector('.download-button[data-title*="Arabic"]');

		// Setup download path
		await this.setupDownloadListener(page, outputDir);

		// Download SRT file
		logger.info('Downloading SRT file');
		await page.evaluate(() => {
			const srtButton = document.querySelector(
				'.download-button[data-title*="[SRT]"]'
			) as HTMLElement;
			if (srtButton) {
				srtButton.click();
			} else {
				throw new Error('SRT download button not found');
			}
		});
		await this.waitForDownload(outputDir, 'srt');

		// Download TXT file
		logger.info('Downloading TXT file');
		await page.evaluate(() => {
			const txtButton = document.querySelector(
				'.download-button[data-title*="[TXT]"]'
			) as HTMLElement;
			if (txtButton) {
				txtButton.click();
			} else {
				throw new Error('TXT download button not found');
			}
		});
		await this.waitForDownload(outputDir, 'txt');

		// Rename downloaded files
		const srtPath = await this.checkAndRenameFile(
			outputDir,
			videoId,
			'srt'
		);
		const txtPath = await this.checkAndRenameFile(
			outputDir,
			videoId,
			'txt'
		);

		return {
			srt: srtPath,
			txt: txtPath,
		};
	}

	async scrape(
		url: string,
		outputBasePath: string
	): Promise<TranscriptResult> {
		if (!url.includes('downsub') && url.includes('youtube')) {
			url = new URL(`https://downsub.com/?url=${encodeURIComponent(url)}`)
				.href;
		}

		logger.info(`Starting Downsub scrape for URL: ${url}`);

		const browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});

		try {
			const page = await browser.newPage();

			// Configure longer timeouts for slow connections
			page.setDefaultTimeout(60000); // 60 seconds
			page.setDefaultNavigationTimeout(60000);

			logger.info('Navigating to page');
			// Navigate to Downsub
			await page.goto(url, {
				waitUntil: 'load',
			});

			// wait for 3 seconds
			page.waitForSelector('.v-card__title.title a', { timeout: 60000 });
			// wait for more one second
			await new Promise((r) => setTimeout(r, 10000));

			// Extract video information
			const { videoId, title } = await this.extractVideoInfo(page);
			if (!videoId) {
				throw new Error('Could not extract YouTube video ID');
			}

			// Create output directory
			const outputDir = path.join(outputBasePath, videoId);
			await fs.mkdir(outputDir, { recursive: true });

			// Download transcript files
			const { txt: txtPath, srt: srtPath } =
				await this.downloadTranscripts(page, outputDir, videoId);

			await browser.close();
			logger.info('Downsub scraping completed successfully');

			return {
				videoId,
				title,
				files: {
					txt: txtPath,
					srt: srtPath,
				},
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			logger.error('Downsub scraping failed', {
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});
			await browser.close();
			throw error;
		}
	}

	protected async checkAndRenameFile(
		outputDir: string,
		videoId: string,
		format: 'txt' | 'srt'
	): Promise<string> {
		const files = await fs.readdir(outputDir);

		// Find the downloaded file with the matching extension
		const downloadedFile = files.find((f) =>
			f.toLowerCase().endsWith(`.${format.toLowerCase()}`)
		);

		if (!downloadedFile) {
			throw new Error(
				`Downloaded ${format} file not found in ${outputDir}`
			);
		}

		const oldPath = path.join(outputDir, downloadedFile);
		const newPath = path.join(outputDir, `${videoId}.${format}`);

		// Rename file to our desired format
		await fs.rename(oldPath, newPath);
		logger.info(`Renamed ${format} file to ${path.basename(newPath)}`);

		return newPath;
	}
}
