import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TextChunkingService, ChunkingOptions } from './text-chunking.service';

// Mock the logger
vi.mock('../../lib/logging/file-logger', () => ({
  workerLogger: {
    info: vi.fn(),
  },
}));

describe('TextChunkingService', () => {
  let service: TextChunkingService;
  const defaultOptions: ChunkingOptions = {
    maxChunkLength: 20,
    delayBetweenChunks: 500,
    maxRetries: 3,
    retryDelay: 1000,
  };

  beforeEach(() => {
    service = new TextChunkingService(defaultOptions);
  });

  describe('Configuration', () => {
    it('should use default options when none provided', () => {
      const defaultService = new TextChunkingService();
      expect(defaultService.maxRetries).toBe(3);
      expect(defaultService.retryDelay).toBe(1000);
      expect(defaultService.delayBetweenChunks).toBe(500);
    });

    it('should use provided options', () => {
      const customOptions: ChunkingOptions = {
        maxChunkLength: 30,
        delayBetweenChunks: 1000,
        maxRetries: 5,
        retryDelay: 2000,
      };
      const customService = new TextChunkingService(customOptions);
      expect(customService.maxRetries).toBe(5);
      expect(customService.retryDelay).toBe(2000);
      expect(customService.delayBetweenChunks).toBe(1000);
    });
  });

  describe('Text Splitting', () => {
    it('should split text by sentences', () => {
      const text = 'This is a test. Another sentence! And one more?';
      const chunks = service.splitIntoChunks(text);
      expect(chunks).toHaveLength(3);
      expect(chunks).toEqual([
        'This is a test.',
        'Another sentence!',
        'And one more?'
      ]);
    });

    it('should handle long sentences by splitting into words', () => {
      const text = 'This is a very long sentence that should be split into multiple chunks based on word boundaries.';
      const chunks = service.splitIntoChunks(text);
      expect(chunks.length).toBeGreaterThan(1);
      chunks.forEach(chunk => {
        expect(chunk.length).toBeLessThanOrEqual(defaultOptions.maxChunkLength!);
      });
    });

    it('should handle empty text', () => {
      const chunks = service.splitIntoChunks('');
      // The service returns an empty array for empty input
      expect(chunks).toHaveLength(0);
    });

    it('should handle text with no sentence boundaries', () => {
      const text = 'This text has no sentence boundaries';
      const chunks = service.splitIntoChunks(text);
      expect(chunks.length).toBeGreaterThan(0);
      chunks.forEach(chunk => {
        expect(chunk.length).toBeLessThanOrEqual(defaultOptions.maxChunkLength!);
      });
    });

    it('should preserve words when splitting', () => {
      const text = 'Short words. Medium length words here. Some more text to process.';
      const chunks = service.splitIntoChunks(text);
      // Split the original text into words, removing punctuation
      const allWords = text.replace(/[.!?]/g, '').split(/\s+/);
      
      chunks.forEach(chunk => {
        // Split each chunk into words and remove punctuation
        const chunkWords = chunk.replace(/[.!?]/g, '').split(/\s+/);
        chunkWords.forEach(word => {
          if (word) { // Skip empty strings
            expect(allWords).toContain(word);
          }
        });
      });
    });
  });

  describe('Utility Functions', () => {
    it('should sleep for specified duration', async () => {
      const start = Date.now();
      await service.sleep(100);
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(95); // Allow for small timing variations
    });
  });
}); 