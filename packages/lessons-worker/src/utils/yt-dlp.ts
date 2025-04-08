import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { logger } from '../lib/txt-to-mdx/scrapers/logger';
import { SrtConverter } from './srt-converter';
import fs from 'fs';

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
  private readonly srtConverter: SrtConverter;

  constructor() {
    this.srtConverter = new SrtConverter();
  }

  /**
   * Checks if yt-dlp is installed and accessible
   * @throws Error if yt-dlp is not found or not accessible
   */
  async checkYtDlp(): Promise<void> {
    try {
      await execAsync('yt-dlp --version');
    } catch {
      throw new Error('yt-dlp is not installed or not accessible. Please install yt-dlp first.');
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
    outputDir: string,
    language: string = 'ar'
  ): Promise<{ srt: string; txt: string }> {
    const videoId = await this.extractVideoId(videoUrl);
    const outputTemplate = path.join(outputDir, videoId);

    // Download SRT file
    const srtCommand = [
      'yt-dlp',
      '--write-auto-sub',
      `--sub-lang ${language}`,
      '--skip-download',
      '--convert-subs srt',
      `--output "${outputTemplate}"`,
      videoUrl
    ].join(' ');

    await this.executeCommand(srtCommand);

    // rename the subtitle to remove language code
    const srtPathFrom = path.join(outputDir, `${videoId}.${language}.srt`);
    const srtPathTo = path.join(outputDir, `${videoId}.srt`);
    fs.renameSync(srtPathFrom, srtPathTo);

    // Define paths for SRT and TXT files directly in the output directory
    const txtPath = path.join(outputDir, `${videoId}.txt`);
    
    // fix the srt file
    await this.fixSrtFile(srtPathTo, srtPathTo);
    if(1) throw new Error('test');
    // Convert SRT to TXT
    await this.srtConverter.convertFile(srtPathTo, txtPath);

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
      throw new Error(`Command execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Fixes the srt file
   * @param srtPath Path to the srt file
   * @param txtPath Path to the txt file
   */
  private async fixSrtFile(srtPath: string, txtPath: string): Promise<void> {
    const command = `python ${path.join(__dirname, '..', 'lib', 'srt-fixer', 'srt_fixer_cli.py')} ${srtPath} -o ${txtPath}`;
    await this.executeCommand(command);
  }
} 