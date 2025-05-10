import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fileExists, createDir } from './fs';
import fs from 'fs/promises';

// Mock fs module
vi.mock('fs/promises', () => ({
  default: {
    access: vi.fn(),
    mkdir: vi.fn(),
  },
}));

describe('Filesystem Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fileExists', () => {
    it('should return true when file exists', async () => {
      // Mock fs.access to resolve successfully
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);

      const exists = await fileExists('/path/to/file');
      expect(exists).toBe(true);
      expect(fs.access).toHaveBeenCalledTimes(1);
      expect(fs.access).toHaveBeenCalledWith('/path/to/file', expect.any(Number));
    });

    it('should return false when file does not exist', async () => {
      // Mock fs.access to reject
      vi.mocked(fs.access).mockRejectedValueOnce(new Error('ENOENT'));

      const exists = await fileExists('/path/to/nonexistent');
      expect(exists).toBe(false);
      expect(fs.access).toHaveBeenCalledTimes(1);
      expect(fs.access).toHaveBeenCalledWith('/path/to/nonexistent', expect.any(Number));
    });
  });

  describe('createDir', () => {
    it('should create directory successfully', async () => {
      // Mock fs.mkdir to resolve successfully
      vi.mocked(fs.mkdir).mockResolvedValueOnce(undefined);

      await expect(createDir('/path/to/dir')).resolves.toBeUndefined();
      expect(fs.mkdir).toHaveBeenCalledTimes(1);
      expect(fs.mkdir).toHaveBeenCalledWith('/path/to/dir', { recursive: true });
    });

    it('should throw error when directory creation fails', async () => {
      const error = new Error('Permission denied');
      // Mock fs.mkdir to reject
      vi.mocked(fs.mkdir).mockRejectedValueOnce(error);

      await expect(createDir('/path/to/dir')).rejects.toThrow('Failed to create directory: Permission denied');
      expect(fs.mkdir).toHaveBeenCalledTimes(1);
      expect(fs.mkdir).toHaveBeenCalledWith('/path/to/dir', { recursive: true });
    });
  });
}); 