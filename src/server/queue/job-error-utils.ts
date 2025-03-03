// src/server/queue/job-error-utils.ts

/**
 * Standard error types for job processing
 */
export enum JobErrorType {
	// Infrastructure errors
	DATABASE = 'database_error',
	REDIS = 'redis_error',
	FILESYSTEM = 'filesystem_error',
	NETWORK = 'network_error',

	// Processing errors
	TRANSCRIPT_DOWNLOAD = 'transcript_download_error',
	TRANSCRIPT_PARSING = 'transcript_parsing_error',
	AI_SERVICE = 'ai_service_error',
	AI_QUOTA_EXCEEDED = 'ai_quota_exceeded',
	VIDEO_SYNC = 'video_sync_error',

	// Validation errors
	INVALID_URL = 'invalid_url',
	VIDEO_NOT_FOUND = 'video_not_found',
	VIDEO_ALREADY_EXISTS = 'video_already_exists',
	MISSING_PERMISSIONS = 'missing_permissions',

	// Unexpected errors
	UNKNOWN = 'unknown_error',
}

/**
 * Standardized error for job processing with additional metadata
 */
export class JobError extends Error {
	type: JobErrorType;
	details?: any;
	retry?: boolean;

	constructor(
		message: string,
		type: JobErrorType = JobErrorType.UNKNOWN,
		options?: { details?: any; retry?: boolean; cause?: Error }
	) {
		super(message, options);
		this.name = 'JobError';
		this.type = type;
		this.details = options?.details;
		this.retry = options?.retry ?? shouldRetryError(type);
	}

	/**
	 * Create a JSON representation of the error for storage
	 */
	toJSON() {
		return {
			message: this.message,
			type: this.type,
			details: this.details,
			stack: this.stack,
			retry: this.retry,
		};
	}

	/**
	 * User-friendly error message in Arabic
	 */
	getArabicMessage(): string {
		switch (this.type) {
			case JobErrorType.VIDEO_ALREADY_EXISTS:
				return 'هذا الفيديو موجود بالفعل';
			case JobErrorType.VIDEO_NOT_FOUND:
				return 'لم يتم العثور على الفيديو';
			case JobErrorType.INVALID_URL:
				return 'رابط الفيديو غير صالح';
			case JobErrorType.TRANSCRIPT_DOWNLOAD:
				return 'حدث خطأ أثناء تنزيل النص المفرغ';
			case JobErrorType.AI_SERVICE:
				return 'حدث خطأ في خدمة الذكاء الاصطناعي';
			case JobErrorType.AI_QUOTA_EXCEEDED:
				return 'تم تجاوز الحد المسموح به لخدمة الذكاء الاصطناعي';
			default:
				return 'حدث خطأ أثناء المعالجة';
		}
	}
}

/**
 * Determine if an error should be retried based on its type
 */
function shouldRetryError(type: JobErrorType): boolean {
	// These error types are potentially transient and can be retried
	const retryableErrors = [
		JobErrorType.DATABASE,
		JobErrorType.REDIS,
		JobErrorType.NETWORK,
		JobErrorType.TRANSCRIPT_DOWNLOAD,
		JobErrorType.AI_SERVICE,
	];

	return retryableErrors.includes(type);
}

/**
 * Process an unknown error and convert it to a JobError
 */
export function processError(error: unknown): JobError {
	if (error instanceof JobError) {
		return error;
	}

	const message = error instanceof Error ? error.message : String(error);

	// Try to identify common error patterns
	if (
		message.includes('quota') ||
		message.includes('QUOTA_EXCEEDED') ||
		message.includes('rate limit')
	) {
		return new JobError(
			'AI service quota exceeded',
			JobErrorType.AI_QUOTA_EXCEEDED,
			{ cause: error instanceof Error ? error : undefined, retry: false }
		);
	}

	if (
		message.includes('network') ||
		message.includes('timeout') ||
		message.includes('ECONNREFUSED')
	) {
		return new JobError('Network operation failed', JobErrorType.NETWORK, {
			cause: error instanceof Error ? error : undefined,
			retry: true,
		});
	}

	if (
		message.includes('database') ||
		message.includes('sql') ||
		message.includes('query')
	) {
		return new JobError(
			'Database operation failed',
			JobErrorType.DATABASE,
			{ cause: error instanceof Error ? error : undefined, retry: true }
		);
	}

	if (
		message.includes('file') ||
		message.includes('ENOENT') ||
		message.includes('directory')
	) {
		return new JobError(
			'File system operation failed',
			JobErrorType.FILESYSTEM,
			{ cause: error instanceof Error ? error : undefined, retry: false }
		);
	}

	// Default to unknown error
	return new JobError(message, JobErrorType.UNKNOWN, {
		cause: error instanceof Error ? error : undefined,
	});
}
