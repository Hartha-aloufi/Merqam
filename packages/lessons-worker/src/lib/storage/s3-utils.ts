import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
	DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { env } from '../env';
import fs from 'fs/promises';
import { JobLogger } from '../logging/file-logger';

// Initialize S3 client
const s3Client = new S3Client({
	region: env.AWS_REGION,
	credentials: {
		accessKeyId: env.AWS_ACCESS_KEY_ID,
		secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
	},
});

const BUCKET_NAME = 'merqam-lessons';

/**
 * Uploads a lesson content file to S3 storage
 * @param localFilePath - Path to the local file to upload
 * @param contentKey - The key/path where the file should be stored in S3
 */
export async function uploadLessonContent(
	localFilePath: string,
	contentKey: string
): Promise<void> {
	const logger = new JobLogger('upload-lesson-content', 'storage');

	try {
		logger.info('Starting file upload to S3', {
			localFilePath,
			contentKey,
		});

		// Read the file content
		const fileContent = await fs.readFile(localFilePath);

		// make sure the content key is for s3 by replacing \ with /
		const s3ContentKey = contentKey.replace(/\\/g, '/');

		// Upload to S3
		const command = new PutObjectCommand({
			Bucket: BUCKET_NAME,
			Key: s3ContentKey,
			Body: fileContent,
			ContentType: 'text/markdown',
		});

		await s3Client.send(command);

		logger.info('File uploaded successfully to S3', { contentKey });
	} catch (error) {
		logger.error('Failed to upload file to S3', {
			error: error instanceof Error ? error.message : String(error),
			localFilePath,
			contentKey,
		});
		throw error;
	}
}

/**
 * Downloads a file from S3 storage
 * @param contentKey - The key/path of the file in S3
 * @returns The content of the file as a string
 */
export async function downloadLessonContent(
	contentKey: string
): Promise<string> {
	const logger = new JobLogger('download-lesson-content', 'storage');

	try {
		logger.info('Starting file download from S3', { contentKey });

		const command = new GetObjectCommand({
			Bucket: BUCKET_NAME,
			Key: contentKey,
		});

		const response = await s3Client.send(command);
		const content = await response.Body?.transformToString();

		if (!content) {
			throw new Error('No content received from S3');
		}

		logger.info('File downloaded successfully from S3', { contentKey });
		return content;
	} catch (error) {
		logger.error('Failed to download file from S3', {
			error: error instanceof Error ? error.message : String(error),
			contentKey,
		});
		throw error;
	}
}

/**
 * Deletes a file from S3 storage
 * @param contentKey - The key/path of the file in S3
 */
export async function deleteLessonContent(contentKey: string): Promise<void> {
	const logger = new JobLogger('delete-lesson-content', 'storage');

	try {
		logger.info('Starting file deletion from S3', { contentKey });

		const command = new DeleteObjectCommand({
			Bucket: BUCKET_NAME,
			Key: contentKey,
		});

		await s3Client.send(command);

		logger.info('File deleted successfully from S3', { contentKey });
	} catch (error) {
		logger.error('Failed to delete file from S3', {
			error: error instanceof Error ? error.message : String(error),
			contentKey,
		});
		throw error;
	}
}
