import fs from 'fs/promises';
import { logger } from '../lib/txt-to-mdx/scrapers/logger';

/**
 * Converts SRT subtitle file to plain text format
 * Removes timestamps and formatting
 */
export class SrtConverter {
  /**
   * Cleans up SRT content by removing redundant lines and overlaps
   * @param content Raw SRT file content
   * @returns Cleaned SRT content
   */
  private cleanupSrtContent(content: string): string {
    const blocks = content.trim().split('\n\n');
    const cleanedBlocks: string[] = [];
    let lastText = '';

    for (const block of blocks) {
      const lines = block.split('\n');
      if (lines.length < 3) continue; // Skip invalid blocks

      const text = lines.slice(2).join(' ').trim();
      if (!text) continue; // Skip empty blocks

      // Skip if text is same as last block
      if (text === lastText) continue;

      // Skip if text is a subset of last block
      if (lastText && lastText.includes(text)) continue;

      // If text is a superset of last block, replace it
      if (lastText && text.includes(lastText)) {
        cleanedBlocks.pop();
      }

      cleanedBlocks.push(block);
      lastText = text;
    }

    return cleanedBlocks.join('\n\n');
  }

  /**
   * Converts SRT content to plain text
   * @param srtContent Raw SRT file content
   * @returns Plain text content
   */
  private convertSrtToText(srtContent: string): string {
    // First clean up the SRT content
    const cleanedContent = this.cleanupSrtContent(srtContent);

    // Split into subtitle blocks
    const blocks = cleanedContent.split('\n\n').filter(block => block.trim());

    return blocks
      .map(block => {
        // Split block into lines and remove empty lines
        const lines = block.split('\n').filter(line => line.trim());
        
        // Skip the first two lines (number and timestamp)
        const textLines = lines.slice(2);
        
        // Join text lines with space and normalize spaces
        return textLines
          .join(' ')
          .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
          .trim();
      })
      .filter(text => text) // Remove empty blocks
      .join('\n');
  }

  /**
   * Converts an SRT file to TXT format
   * @param srtPath Path to the SRT file
   * @param txtPath Path where the TXT file should be saved
   */
  async convertFile(srtPath: string, txtPath: string): Promise<void> {
    try {
      logger.info('Converting SRT to TXT', { srtPath, txtPath });
      
      // Read SRT file
      const srtContent = await fs.readFile(srtPath, 'utf-8');
      
      // Convert content
      const textContent = this.convertSrtToText(srtContent);

      if(srtContent.length < textContent.length) {
        throw new Error(`Suspiciously short text file comparing to srt file: ${JSON.stringify({srtLength: srtContent.length, textLength: textContent.length})}`)
      }

      // Write TXT file
      await fs.writeFile(txtPath, textContent, 'utf-8');
      
      logger.info('Successfully converted SRT to TXT', { txtPath });
    } catch (error) {
      logger.error('Failed to convert SRT to TXT', {
        error: error instanceof Error ? error.message : String(error),
        srtPath,
        txtPath,
      });
      throw error;
    }
  }
} 