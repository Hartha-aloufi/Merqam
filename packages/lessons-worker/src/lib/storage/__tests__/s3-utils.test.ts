import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import {
	uploadLessonContent,
	downloadLessonContent,
	deleteLessonContent,
} from '../s3-utils';

const TEST_KEY = 'test/upload-test.mdx';

describe('S3 Storage Operations', () => {
	let tempFilePath: string;
	const testContent =
		'# Test Content\n\nThis is a test file for S3 operations.';

	beforeAll(async () => {
		// Create a temporary file for testing
		const tempDir = os.tmpdir();
		tempFilePath = path.join(tempDir, 'test-upload.mdx');
		await fs.writeFile(tempFilePath, testContent);
	});

	afterAll(async () => {
		// Clean up temporary file
		try {
			await fs.unlink(tempFilePath);
		} catch (error) {
			console.error('Failed to clean up temporary file:', error);
		}
	});

	it('should upload, download, and delete a file from S3', async () => {
		// 1. Upload the file
		await uploadLessonContent(tempFilePath, TEST_KEY);

		// 2. Download and verify the file
		const downloadedContent = await downloadLessonContent(TEST_KEY);
		expect(downloadedContent).toBe(testContent);

		// 3. Delete the file
		await deleteLessonContent(TEST_KEY);

		// 4. Verify the file is deleted by attempting to download it (should throw)
		await expect(downloadLessonContent(TEST_KEY)).rejects.toThrow();
	});
});
