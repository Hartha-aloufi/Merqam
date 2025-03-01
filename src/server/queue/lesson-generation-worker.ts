// src/server/queue/lesson-generation-worker.ts
import { Worker, Job } from 'bullmq';
import { db } from '../config/db';
import {
	redisConnection,
	QUEUE_NAMES,
	LessonGenerationJobData,
} from './queue-config';
import { EnhancedTxtToMdxConverter } from '@/client/lib/txt-to-mdx/enhanced-converter';
import { JobProgressReporter } from './job-progress-utils';
import { processError } from './job-error-utils';
import path from 'path';
import { AIServiceType } from '../services/ai/types';

// Constants for file paths
const DATA_PATH = path.join(process.cwd(), 'src', 'data');
const TEMP_PATH = path.join(process.cwd(), 'temp');

/**
 * Process a lesson generation job
 */
async function processJob(job: Job<LessonGenerationJobData>) {
	console.log(`Processing job ${job.id}`, job.data);

	// Create a progress reporter for this job
	const progressReporter = new JobProgressReporter(job.id as string, job);

	try {
		// Mark job as processing in database and initialize progress
		await progressReporter.reportStage('INITIALIZED');

		// Extract job data
		const {
			url,
			userId,
			aiService,
			playlistId,
			newPlaylistId,
		} = job.data;

		// Initialize enhanced converter with progress reporting
		const converter = new EnhancedTxtToMdxConverter({
			aiServiceType: aiService as AIServiceType,
			dataPath: DATA_PATH,
			tempDir: TEMP_PATH,
			progressReporter,
		});

		// Process content - this is where most of the work happens
		// Progress will be reported by the converter
		const processingResult = await converter.processContent(
			url,
			playlistId || newPlaylistId || 'new'
		);

		// Extract needed information
		const { videoId, title, mdxPath } = processingResult;

		// Start database transaction to save results
		const result = await db.transaction().execute(async (trx) => {
			// Handle Speaker
			let speakerId: string;
			if (job.data.speakerId && job.data.speakerId !== 'new') {
				speakerId = job.data.speakerId;
			} else if (job.data.newSpeakerName) {
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
			} else {
				throw new Error(
					'Either speakerId or newSpeakerName must be provided'
				);
			}

			// Handle Playlist
			let playlistId: string;
			if (job.data.playlistId) {
				playlistId = job.data.playlistId;
			} else if (job.data.newPlaylistId && job.data.newPlaylistTitle) {
				const [playlist] = await trx
					.insertInto('playlists')
					.values({
						youtube_playlist_id: job.data.newPlaylistId,
						title: job.data.newPlaylistTitle,
						speaker_id: speakerId,
					})
					.returning(['youtube_playlist_id'])
					.execute();
				playlistId = playlist.youtube_playlist_id;
			} else {
				throw new Error(
					'Either playlistId or newPlaylist details must be provided'
				);
			}

			// Create YouTube video entry
			if (videoId) {
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
			const contentKey = mdxPath.split(path.resolve('src'))[1].slice(1);

			// Create lesson
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

			return {
				lessonId: lesson.id,
				playlistId,
				title,
				videoId,
			};
		});

		// Mark job as completed with result
		await progressReporter.reportCompletion(result);

		console.log(`Job ${job.id} completed successfully`, result);
		return result;
	} catch (error) {
		console.error(`Error processing job ${job.id}:`, error);

		// Process the error and report failure
		const processedError = processError(error);
		await progressReporter.reportFailure(processedError);

		// Re-throw error to let BullMQ handle retries if appropriate
		throw processedError;
	}
}

/**
 * Initialize the worker
 */
export function initializeWorker() {
	console.log('Initializing lesson generation worker');

	const worker = new Worker<LessonGenerationJobData>(
		QUEUE_NAMES.LESSON_GENERATION,
		processJob,
		{
			connection: redisConnection,
			concurrency: 1, // Process one job at a time
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

	// Add more detailed event handlers
	worker.on('completed', (job, result) => {
		console.log(
			`Job ${job.id} completed successfully with result:`,
			result
		);
	});

	worker.on('failed', (job, error) => {
		console.error(`Job ${job?.id} failed with error:`, error);
		const attempts = job?.attemptsMade ?? 0;
		console.log(
			`Attempt ${attempts}${
				job?.opts.attempts ? '/' + job.opts.attempts : ''
			}`
		);
	});

	worker.on('error', (error) => {
		console.error('Worker error:', error);
	});

	worker.on('active', (job) => {
		console.log(`Job ${job.id} has started processing`);
	});

	worker.on('stalled', (jobId) => {
		console.warn(`Job ${jobId} has stalled`);
	});

	console.log('Lesson generation worker initialized');
	return worker;
}
