import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import { workerLogger as logger } from '../lib/logging/file-logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

/**
 * Interface for yt-dlp command execution results
 */
interface YtDlpResult {
	stdout: string;
	stderr: string;
}

/**
 * Interface for video metadata
 */
export interface VideoMetadata {
	id: string;
	title: string;
	duration: number;
	upload_date: string;
}

/**
 * Wrapper class for yt-dlp command line tool
 * Handles video metadata extraction and subtitle downloads
 */
export class YtDlpWrapper {
	constructor() {}

	/**
	 * Checks if yt-dlp is installed and accessible
	 * @throws Error if yt-dlp is not found or not accessible
	 */
	async checkYtDlp(): Promise<void> {
		try {
			await execAsync('yt-dlp --version');
		} catch {
			throw new Error(
				'yt-dlp is not installed or not accessible. Please install yt-dlp first.'
			);
		}
	}

	/**
	 * Extracts video metadata using yt-dlp
	 * @param videoUrl YouTube video URL
	 * @returns Video metadata
	 */
	async getVideoMetadata(videoUrl: string): Promise<VideoMetadata> {
		const command = `yt-dlp --dump-json "${videoUrl}"`;
		const { stdout } = await this.executeCommand(command);

		try {
			return JSON.parse(stdout);
		} catch {
			throw new Error('Failed to parse video metadata');
		}
	}

	/**
	 * Downloads subtitles for a video
	 * @param videoUrl YouTube video URL
	 * @param outputDir Directory to save the subtitles
	 * @param language Language code for subtitles (default: 'ar')
	 * @returns Paths to downloaded subtitle files
	 */
	async downloadSubtitles(
		videoUrl: string,
		outputDir: string
	): Promise<{ srt: string; txt: string }> {
		const videoId = await this.extractVideoId(videoUrl);
		console.log('Downloading subtitles for video ID:', videoId);

		// Use the compiled binary instead of python command
		const binaryPath = path.join(
			__dirname,
			'..',
			'lib',
			'generate-youtube-srt',
			'dist',
			process.platform === 'win32' ? 'main.exe' : 'main'
		);

		await this.executeCommand(`"${binaryPath}" ${videoId} ${outputDir}`);

		const srtPathTo = path.join(outputDir, `${videoId}.srt`);
		const txtPath = path.join(outputDir, `${videoId}.txt`);

		return { srt: srtPathTo, txt: txtPath };
	}

	/**
	 * Extracts video ID from YouTube URL
	 * @param url YouTube video URL
	 * @returns Video ID
	 */
	private async extractVideoId(url: string): Promise<string> {
		const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
		const match = url.match(regex);

		if (!match?.[1]) {
			throw new Error('Invalid YouTube URL format');
		}

		return match[1];
	}

	/**
	 * Executes a command and handles errors
	 * @param command Command to execute
	 * @returns Command execution result
	 */
	private async executeCommand(command: string): Promise<YtDlpResult> {
		try {
			logger.info(`Executing command: ${command}`);
			return await execAsync(command);
		} catch (error) {
			logger.error('Command execution failed', { error });
			throw new Error(
				`Command execution failed: ${
					error instanceof Error ? error.message : String(error)
				}`
			);
		}
	}
}
