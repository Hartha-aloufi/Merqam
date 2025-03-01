// src/server/queue/lesson-generation-worker.ts
import { Worker, Job } from 'bullmq';
import { db } from '../config/db';
import {
	redisConnection,
	QUEUE_NAMES,
	LessonGenerationJobData,
} from './queue-config';
import { TxtToMdxConverter } from '@/client/lib/txt-to-mdx';
import path from 'path';
import { AIServiceType } from '../services/ai/types';

// Constants for file paths
const DATA_PATH = path.join(process.cwd(), 'src', 'data');
const TEMP_PATH = path.join(process.cwd(), 'temp');

/**
 * Updates job status and progress in the database
 */
async function updateJobStatus(
	jobId: string,
	status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled',
	updates: {
		progress?: number;
		error?: string;
		result?: any;
		started_at?: Date;
		completed_at?: Date;
	}
) {
	console.log(
		`Updating job ${jobId} status to ${status} with progress ${updates.progress}`
	);

	try {
		await db
			.updateTable('generation_jobs')
			.set({
				status,
				...updates,
				updated_at: new Date(),
			})
			.where('id', '=', jobId)
			.execute();
	} catch (error) {
		console.error(`Error updating job ${jobId} status:`, error);
	}
}

/**
 * Process a lesson generation job
 */
async function processJob(job: Job<LessonGenerationJobData>) {
	console.log(`Processing job ${job.id}`, job.data);

	try {
		// Mark job as processing in database
		await updateJobStatus(job.id as string, 'processing', {
			progress: 0,
			started_at: new Date(),
		});

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

		// Initialize converter with appropriate AI service
		const converter = new TxtToMdxConverter(
			DATA_PATH,
			TEMP_PATH,
			aiService as AIServiceType
		);

		// Set up progress tracking
		let currentProgress = 0;
		const progressSteps = {
			DOWNLOADING: 20,
			PROCESSING: 50,
			SAVING: 90,
			COMPLETED: 100,
		};

		// Update progress - downloading
		await job.updateProgress(progressSteps.DOWNLOADING);
		await updateJobStatus(job.id as string, 'processing', {
			progress: progressSteps.DOWNLOADING,
		});

		// Process content - this is where most of the work happens
		const processingResult = await converter.processContent(
			url,
			playlistId || newPlaylistId || 'new'
		);

		// Update progress - processing
		await job.updateProgress(progressSteps.PROCESSING);
		await updateJobStatus(job.id as string, 'processing', {
			progress: progressSteps.PROCESSING,
		});

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

			// Update progress - saving
			await job.updateProgress(progressSteps.SAVING);
			await updateJobStatus(job.id as string, 'processing', {
				progress: progressSteps.SAVING,
			});

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
			};
		});

		// Mark job as completed
		await job.updateProgress(progressSteps.COMPLETED);
		await updateJobStatus(job.id as string, 'completed', {
			progress: 100,
			completed_at: new Date(),
			result: result,
		});

		console.log(`Job ${job.id} completed successfully`, result);
		return result;
	} catch (error) {
		console.error(`Error processing job ${job.id}:`, error);

		// Update job status to failed
		await updateJobStatus(job.id as string, 'failed', {
			error: error instanceof Error ? error.message : String(error),
			completed_at: new Date(),
		});

		// Re-throw error to let BullMQ handle retries
		throw error;
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
		}
	);

	// Log worker events
	worker.on('completed', (job) => {
		console.log(`Job ${job.id} completed successfully`);
	});

	worker.on('failed', (job, error) => {
		console.error(`Job ${job?.id} failed:`, error);
	});

	worker.on('error', (error) => {
		console.error('Worker error:', error);
	});

	console.log('Lesson generation worker initialized');
	return worker;
}
