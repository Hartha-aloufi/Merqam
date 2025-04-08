import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SrtConverter } from './srt-converter';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../lib/txt-to-mdx/scrapers/logger';

// Mock the logger to prevent actual logging during tests
vi.mock('../lib/txt-to-mdx/scrapers/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('SrtConverter', () => {
  let converter: SrtConverter;
  let testDir: string;
  let srtPath: string;
  let txtPath: string;

  beforeEach(async () => {
    converter = new SrtConverter();
    // Create unique test directory for each test
    testDir = path.join(__dirname, `test-files-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    srtPath = path.join(testDir, 'test.srt');
    txtPath = path.join(testDir, 'test.txt');
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test files and directory
    try {
      if (await fs.stat(srtPath).catch(() => null)) {
        await fs.unlink(srtPath);
      }
      if (await fs.stat(txtPath).catch(() => null)) {
        await fs.unlink(txtPath);
      }
      if (await fs.stat(testDir).catch(() => null)) {
        await fs.rmdir(testDir);
      }
    } catch (error) {
      console.error('Error cleaning up test files:', error);
    }
  });

  describe('convertSrtToText', () => {
    it('should convert basic Arabic SRT to clean text', () => {
      const srtContent = `
1
00:00:01,000 --> 00:00:04,000
مرحباً بكم في هذا الدرس

2
00:00:05,000 --> 00:00:08,000
سنتحدث اليوم عن البرمجة
`;

      const expected = 'مرحباً بكم في هذا الدرس\nسنتحدث اليوم عن البرمجة';
      expect(converter['convertSrtToText'](srtContent)).toBe(expected);
    });

    it('should handle multi-line Arabic subtitles', () => {
      const srtContent = `
1
00:00:01,000 --> 00:00:04,000
مرحباً بكم في هذا الدرس
هذا هو السطر الثاني

2
00:00:05,000 --> 00:00:08,000
سنتحدث اليوم عن البرمجة
والتطوير
`;

      const expected = 'مرحباً بكم في هذا الدرس هذا هو السطر الثاني\nسنتحدث اليوم عن البرمجة والتطوير';
      expect(converter['convertSrtToText'](srtContent)).toBe(expected);
    });

    it('should handle empty lines and extra spaces', () => {
      const srtContent = `
1
00:00:01,000 --> 00:00:04,000
مرحباً   بكم    في هذا الدرس

2
00:00:05,000 --> 00:00:08,000
سنتحدث اليوم عن البرمجة

3
00:00:09,000 --> 00:00:12,000

`;

      const expected = 'مرحباً بكم في هذا الدرس\nسنتحدث اليوم عن البرمجة';
      expect(converter['convertSrtToText'](srtContent)).toBe(expected);
    });

    it('should handle complex Arabic text with punctuation', () => {
      const srtContent = `
1
00:00:01,000 --> 00:00:04,000
مرحباً! كيف حالكم اليوم؟

2
00:00:05,000 --> 00:00:08,000
أتمنى أن تكونوا بخير، وشكراً لكم.
`;

      const expected = 'مرحباً! كيف حالكم اليوم؟\nأتمنى أن تكونوا بخير، وشكراً لكم.';
      expect(converter['convertSrtToText'](srtContent)).toBe(expected);
    });
  });

  describe('convertFile', () => {
    it('should convert SRT file to TXT file', async () => {
      // Create test SRT file
      const srtContent = `
1
00:00:01,000 --> 00:00:04,000
مرحباً بكم في هذا الدرس

2
00:00:05,000 --> 00:00:08,000
سنتحدث اليوم عن البرمجة
`;
      await fs.writeFile(srtPath, srtContent, 'utf-8');

      // Convert the file
      await converter.convertFile(srtPath, txtPath);

      // Read the converted file
      const txtContent = await fs.readFile(txtPath, 'utf-8');
      expect(txtContent).toBe('مرحباً بكم في هذا الدرس\nسنتحدث اليوم عن البرمجة');
    });

    it('should handle file read errors', async () => {
      const nonExistentPath = path.join(testDir, 'nonexistent.srt');
      
      await expect(converter.convertFile(nonExistentPath, txtPath))
        .rejects
        .toThrow();
      
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle file write errors', async () => {
      // Create test SRT file
      const srtContent = '1\n00:00:01,000 --> 00:00:04,000\nمرحباً';
      await fs.writeFile(srtPath, srtContent, 'utf-8');

      // Create a directory with the same name as the target file
      await fs.mkdir(txtPath, { recursive: true });

      await expect(converter.convertFile(srtPath, txtPath))
        .rejects
        .toThrow();
      
      expect(logger.error).toHaveBeenCalled();
    });

    it('should convert real-world Arabic SRT to exact expected text', async () => {
      // Real-world SRT sample with various formatting and timing
      const srtContent = `
1
00:00:00,000 --> 00:00:03,000
مرحباً بكم في درس البرمجة

2
00:00:03,000 --> 00:00:06,000
سنتحدث اليوم عن JavaScript
والتطوير الويب

3
00:00:06,000 --> 00:00:09,000
في البداية، سنتعرف على:
- المتغيرات
- الدوال
- الكائنات

4
00:00:09,000 --> 00:00:12,000
هذا مثال على كود JavaScript:
console.log("مرحباً بالعالم!");

5
00:00:12,000 --> 00:00:15,000
شكراً لكم على المتابعة!
نراكم في الدرس القادم.
`;

      // Expected exact output
      const expectedOutput = `مرحباً بكم في درس البرمجة
سنتحدث اليوم عن JavaScript والتطوير الويب
في البداية، سنتعرف على: - المتغيرات - الدوال - الكائنات
هذا مثال على كود JavaScript: console.log("مرحباً بالعالم!");
شكراً لكم على المتابعة! نراكم في الدرس القادم.`;

      // Write the SRT file
      await fs.writeFile(srtPath, srtContent, 'utf-8');

      // Convert the file
      await converter.convertFile(srtPath, txtPath);

      // Read and verify the converted file
      const txtContent = await fs.readFile(txtPath, 'utf-8');
      
      // Exact match test
      expect(txtContent).toBe(expectedOutput);
      
      // Verify line count
      const lineCount = txtContent.split('\n').length;
      expect(lineCount).toBe(5); // Should be exactly 5 lines
      
      // Verify no empty lines
      expect(txtContent).not.toMatch(/\n\s*\n/);
      
      // Verify no extra spaces
      expect(txtContent).not.toMatch(/\s{2,}/);
    });
  });

  describe('cleanupSrtContent', () => {
    it('should remove duplicate blocks with same text', () => {
      const srtContent = `
1
00:00:01,000 --> 00:00:04,000
مرحباً بكم

2
00:00:04,000 --> 00:00:05,000
مرحباً بكم

3
00:00:05,000 --> 00:00:08,000
سنتحدث اليوم عن البرمجة
`;

      const expected = `
1
00:00:01,000 --> 00:00:04,000
مرحباً بكم

3
00:00:05,000 --> 00:00:08,000
سنتحدث اليوم عن البرمجة
`.trim();

      expect(converter['cleanupSrtContent'](srtContent)).toBe(expected);
    });

    it('should remove blocks with text that is a subset of previous block', () => {
      const srtContent = `
1
00:00:01,000 --> 00:00:04,000
مرحباً بكم في هذا الدرس

2
00:00:04,000 --> 00:00:05,000
مرحباً بكم

3
00:00:05,000 --> 00:00:08,000
سنتحدث اليوم عن البرمجة
`;

      const expected = `
1
00:00:01,000 --> 00:00:04,000
مرحباً بكم في هذا الدرس

3
00:00:05,000 --> 00:00:08,000
سنتحدث اليوم عن البرمجة
`.trim();

      expect(converter['cleanupSrtContent'](srtContent)).toBe(expected);
    });

    it('should replace blocks with text that is a superset of previous block', () => {
      const srtContent = `
1
00:00:01,000 --> 00:00:04,000
مرحباً بكم

2
00:00:04,000 --> 00:00:05,000
مرحباً بكم في هذا الدرس

3
00:00:05,000 --> 00:00:08,000
سنتحدث اليوم عن البرمجة
`;

      const expected = `
2
00:00:04,000 --> 00:00:05,000
مرحباً بكم في هذا الدرس

3
00:00:05,000 --> 00:00:08,000
سنتحدث اليوم عن البرمجة
`.trim();

      expect(converter['cleanupSrtContent'](srtContent)).toBe(expected);
    });

    it('should handle real-world example with overlapping timestamps', () => {
      const srtContent = `
1
00:00:09,200 --> 00:00:11,870
بسم الله والحمد لله والصلاه والسلام على

2
00:00:11,870 --> 00:00:11,880
بسم الله والحمد لله والصلاه والسلام على

3
00:00:11,880 --> 00:00:14,749
بسم الله والحمد لله والصلاه والسلام على
رسول الله وعلى اله وصحبه ومن والاه اللهم

4
00:00:14,749 --> 00:00:14,759
رسول الله وعلى اله وصحبه ومن والاه اللهم

5
00:00:14,759 --> 00:00:18,070
رسول الله وعلى اله وصحبه ومن والاه اللهم
لا سهل الا ما جعلته سهلا وانت تجعل الحزن
`;

      const expected = `
3
00:00:11,880 --> 00:00:14,749
بسم الله والحمد لله والصلاه والسلام على
رسول الله وعلى اله وصحبه ومن والاه اللهم

5
00:00:14,759 --> 00:00:18,070
رسول الله وعلى اله وصحبه ومن والاه اللهم
لا سهل الا ما جعلته سهلا وانت تجعل الحزن
`.trim();

      expect(converter['cleanupSrtContent'](srtContent)).toBe(expected);
    });
  });
}); 