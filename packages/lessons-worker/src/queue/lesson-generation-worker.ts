// src/server/queue/enhanced-worker.ts
import { Worker, Job } from 'bullmq';
import { db } from '../lib/db';
import {
	redisConnection,
	QUEUE_NAMES,
	LessonGenerationJobData,
} from './queue-config';
import { EnhancedTxtToMdxConverter } from '../lib/txt-to-mdx';
import { JobProgressReporter } from './job-progress-utils';
import { processError } from './job-error-utils';
import { JobLogger, workerLogger } from '../lib/logging/file-logger';
import { AIServiceType } from '../services/ai/types';
import { formatErrorForLogging } from '../lib/logging/error-utils';
import path from 'path';
import { uploadLessonContent } from '../lib/storage/s3-utils';

/**
 * Process a lesson generation job with enhanced logging
 */
async function processJob(job: Job<LessonGenerationJobData>) {
	// Create a job-specific logger
	const logger = new JobLogger(job.id as string, 'lesson-generation');
	logger.logJobStart({ data: job.data });

	// Create a progress reporter for this job
	const progressReporter = new JobProgressReporter(job.id as string, job);

	// Log execution start time
	const startTime = Date.now();

	try {
		// Mark job as processing in database and initialize progress
		await progressReporter.reportStage('INITIALIZED');
		logger.logProgress(0, 'Initialized');

		// Extract job data
		const {
			url,
			userId,
			aiService,
			playlistId,
			speakerId,
			newPlaylistId,
			newPlaylistTitle,
			newSpeakerName,
		} = job.data;

		logger.info('Job data extracted', {
			url,
			userId,
			aiService,
			playlistId,
			speakerId,
			newPlaylistId,
			newPlaylistTitle,
			newSpeakerName,
		});

		// Initialize enhanced converter with progress reporting
		const converter = new EnhancedTxtToMdxConverter({
			aiServiceType: aiService as AIServiceType,
			progressReporter,
		});

		// Process content - this is where most of the work happens
		// Progress will be reported by the converter
		logger.info('Starting content processing', { url });
		const processingResult = await converter.processContent(
			url,
			playlistId || newPlaylistId || 'new'
		);

		// Extract needed information
		const { videoId, title, mdxPath } = processingResult;
		logger.info('Content processing completed', { videoId, title });
		// upload mdx file to storage
		const contentKey = path.join(
			playlistId || newPlaylistId || 'new',
			`${videoId}.mdx`
		);

		await uploadLessonContent(mdxPath, contentKey);

		// Start database transaction to save results
		logger.info('Starting database transaction to save results');
		const result = await db.transaction().execute(async (trx) => {
			// Handle Speaker
			let speakerId: string;
			if (job.data.speakerId && job.data.speakerId !== 'new') {
				speakerId = job.data.speakerId;
				logger.debug('Using existing speaker', { speakerId });
			} else if (job.data.newSpeakerName) {
				logger.debug('Creating new speaker', {
					newSpeakerName: job.data.newSpeakerName,
				});
				const [speaker] = await trx
					.insertInto('speakers')
					.values({
						name: job.data.newSpeakerName,
						en_name:
							job.data.newSpeakerName
								.replace(/[\u0600-\u06FF]/g, '')
								.trim() || job.data.newSpeakerName,
					})
					.returning(['id'])
					.execute();
				speakerId = speaker.id;
				logger.debug('New speaker created', { speakerId });
			} else {
				const error =
					'Either speakerId or newSpeakerName must be provided';
				logger.error(error);
				throw new Error(error);
			}

			// Handle Playlist
			let playlistId: string;
			if (job.data.playlistId) {
				playlistId = job.data.playlistId;
				logger.debug('Using existing playlist', { playlistId });
			} else if (job.data.newPlaylistId && job.data.newPlaylistTitle) {
				logger.debug('Creating or updating playlist', {
					newPlaylistId: job.data.newPlaylistId,
					newPlaylistTitle: job.data.newPlaylistTitle,
				});
				const [playlist] = await trx
					.insertInto('playlists')
					.values({
						youtube_playlist_id: job.data.newPlaylistId,
						title: job.data.newPlaylistTitle,
						speaker_id: speakerId,
					})
					.onConflict((oc) =>
						oc.column('youtube_playlist_id').doUpdateSet({
							title: job.data.newPlaylistTitle,
							speaker_id: speakerId,
						})
					)
					.returning(['youtube_playlist_id'])
					.execute();
				playlistId = playlist.youtube_playlist_id;
				logger.debug('Playlist created or updated', { playlistId });
			} else {
				const error =
					'Either playlistId or newPlaylist details must be provided';
				logger.error(error);
				throw new Error(error);
			}

			// Create YouTube video entry
			if (videoId) {
				logger.debug('Creating YouTube video entry', {
					videoId,
					playlistId,
					speakerId,
				});
				await trx
					.insertInto('youtube_videos')
					.values({
						youtube_video_id: videoId,
						playlist_id: playlistId,
						speaker_id: speakerId,
					})
					.onConflict((oc) =>
						oc.column('youtube_video_id').doNothing()
					)
					.execute();
			}

			// Key example: '/data/playlistId/lessonId.mdx'
			logger.info('Generating content key from MDX path', { mdxPath });
			logger.debug('Content key generated', { contentKey });

			// Create lesson
			logger.debug('Creating lesson', {
				title,
				contentKey,
				speakerId,
				playlistId,
				videoId,
				userId,
			});
			const [lesson] = await trx
				.insertInto('lessons')
				.values({
					title,
					content_key: contentKey,
					speaker_id: speakerId,
					playlist_id: playlistId,
					youtube_video_id: videoId,
					user_id: userId,
					tags: [],
					views_count: 0,
				})
				.returning(['id'])
				.execute();

			logger.debug('Lesson created', { lessonId: lesson.id });

			return {
				lessonId: lesson.id,
				playlistId,
				title,
				videoId,
			};
		});

		// Mark job as completed with result
		await progressReporter.reportCompletion(result);

		// Log execution time
		const executionTime = (Date.now() - startTime) / 1000;
		logger.metric('executionTime', executionTime, 'ms', { result });
		logger.logJobCompletion(result);

		return result;
	} catch (error) {
		// Preserve the original stack trace by capturing it before any processing
		const originalError = error;
		const originalStack = error instanceof Error ? error.stack : undefined;

		// Process the error
		const processedError = processError(error);

		// Preserve original stack trace on the processed error if available
		if (
			originalStack &&
			processedError instanceof Error &&
			!processedError.stack
		) {
			processedError.stack = originalStack;
		}

		// Report failure to database
		await progressReporter.reportFailure(processedError);

		// Log the error with full details including original error info
		logger.logJobFailure(processedError, {
			originalError:
				originalError instanceof Error
					? {
							message: originalError.message,
							name: originalError.name,
							stack: originalError.stack,
					  }
					: String(originalError),
			failureLocation: new Error().stack
				?.split('\n')
				.slice(1, 5)
				.map((line) => line.trim()),
		});

		// Log execution time even for failures
		const executionTime = (Date.now() - startTime) / 1000;
		logger.metric('executionTime', executionTime, 'ms', {
			status: 'failed',
		});

		// Re-throw error to let BullMQ handle retries if appropriate
		throw processedError;
	}
}

/**
 * Initialize the worker with enhanced logging
 */
export function initializeEnhancedWorker() {
	workerLogger.info('Initializing enhanced lesson generation worker');

	const worker = new Worker<LessonGenerationJobData>(
		QUEUE_NAMES.LESSON_GENERATION,
		processJob,
		{
			connection: redisConnection,
			concurrency: 1, // Process 10 jobs at a time
			removeOnComplete: {
				age: 60 * 60 * 24 * 7, // Keep completed jobs for 7 days
				count: 100, // Keep last 100 completed jobs
			},
			removeOnFail: {
				age: 60 * 60 * 24 * 14, // Keep failed jobs for 14 days
			},
			// Add back-off strategy
			settings: {
				backoffStrategy: (attemptsMade) => {
					return Math.min(
						1000 * Math.pow(2, attemptsMade),
						30 * 60 * 1000
					); // Exponential back-off up to 30 minutes
				},
			},
		}
	);

	// Add more detailed event handlers with logging
	worker.on('completed', (job, result) => {
		workerLogger.info(`Job ${job.id} completed successfully with result:`, {
			jobId: job.id,
			result,
		});
	});
	worker.on('failed', (job, error) => {
		// Using formaErrorFrLogging imported at the top
		workerLogger.error(`Job ${job?.id} failed with error:`, {
			jobId: job?.id,
			error: formatErrorForLogging(error),
			jobInfo: {
				attempts: job?.attemptsMade,
				maxAttempts: job?.opts.attempts,
				data: job?.data,
				timestamp: new Date().toISOString(),
			},
		});
	});

	worker.on('error', (error) => {
		workerLogger.error('Worker error:', {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
	});

	worker.on('active', (job) => {
		workerLogger.info(`Job ${job.id} has started processing`, {
			jobId: job.id,
		});
	});

	worker.on('stalled', (jobId) => {
		workerLogger.warn(`Job ${jobId} has stalled`, { jobId });
	});

	workerLogger.info('Enhanced lesson generation worker initialized');
	return worker;
}
