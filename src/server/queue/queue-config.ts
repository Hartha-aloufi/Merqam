// src/server/queue/queue-config.ts
import { Queue, Worker, QueueScheduler, ConnectionOptions } from 'bullmq';
import { env } from '../config/env';

/**
 * Redis connection configuration for BullMQ
 */
export const redisConnection: ConnectionOptions = {
	host: env.REDIS_HOST,
	port: env.REDIS_PORT,
	// Use password if configured in environment
	...(env.REDIS_PASSWORD ? { password: env.REDIS_PASSWORD } : {}),
};

// Queue names
export const QUEUE_NAMES = {
	LESSON_GENERATION: 'lesson-generation',
} as const;

// Define job types
export interface LessonGenerationJobData {
	url: string;
	userId: string;
	aiService: string;
	playlistId?: string;
	speakerId?: string;
	newPlaylistId?: string;
	newPlaylistTitle?: string;
	newSpeakerName?: string;
	priority?: number;
}

// Singleton instances to ensure we use the same connection throughout the app
let lessonGenerationQueue: Queue<LessonGenerationJobData> | null = null;
let queueScheduler: QueueScheduler | null = null;

/**
 * Get the lesson generation queue instance (creates it if it doesn't exist)
 */
export function getLessonGenerationQueue(): Queue<LessonGenerationJobData> {
	if (!lessonGenerationQueue) {
		lessonGenerationQueue = new Queue<LessonGenerationJobData>(
			QUEUE_NAMES.LESSON_GENERATION,
			{
				connection: redisConnection,
				defaultJobOptions: {
					attempts: 3,
					backoff: {
						type: 'exponential',
						delay: 5000,
					},
					removeOnComplete: false, // Keep job history
					removeOnFail: false, // Keep failed jobs for analysis
				},
			}
		);
		console.log('Lesson generation queue initialized');
	}
	return lessonGenerationQueue;
}

/**
 * Initialize the queue scheduler (needed for delayed jobs and retries)
 */
export function initializeQueueScheduler(): QueueScheduler {
	if (!queueScheduler) {
		queueScheduler = new QueueScheduler(QUEUE_NAMES.LESSON_GENERATION, {
			connection: redisConnection,
		});
		console.log('Queue scheduler initialized');
	}
	return queueScheduler;
}

/**
 * Clean up queue connections - important to call this when shutting down
 */
export async function closeQueues(): Promise<void> {
	console.log('Closing queue connections...');

	if (queueScheduler) {
		await queueScheduler.close();
		queueScheduler = null;
	}

	if (lessonGenerationQueue) {
		await lessonGenerationQueue.close();
		lessonGenerationQueue = null;
	}

	console.log('Queue connections closed');
}
