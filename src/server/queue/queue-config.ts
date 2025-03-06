// src/server/queue/queue-config.ts
import { Queue, QueueEvents, ConnectionOptions } from 'bullmq';
import { env } from '../config/env';
import { AIServiceType } from '../services/ai/types';

/**
 * Redis connection configuration for BullMQ
 */
export const redisConnection: ConnectionOptions = {
	host: env.REDIS_HOST || 'localhost', // This is likely using localhost as fallback
	port: env.REDIS_PORT || 6379,
	// Use password if configured in environment
	...(env.REDIS_PASSWORD ? { password: env.REDIS_PASSWORD } : {}),
};

// Queue names
export const QUEUE_NAMES = {
	LESSON_GENERATION: 'lesson-generation',
} as const;

// Define job data interface matching our DB schema
export interface LessonGenerationJobData {
	url: string;
	userId: string;
	aiService: AIServiceType;
	playlistId?: string;
	speakerId?: string;
	newPlaylistId?: string;
	newPlaylistTitle?: string;
	newSpeakerName?: string;
	priority?: number;
}

// Singleton instances to ensure we use the same connection throughout the app
let lessonGenerationQueue: Queue<LessonGenerationJobData> | null = null;
let queueEvents: QueueEvents | null = null;

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
 * Initialize queue events for listening to job events
 */
export function getQueueEvents(): QueueEvents {
	if (!queueEvents) {
		queueEvents = new QueueEvents(QUEUE_NAMES.LESSON_GENERATION, {
			connection: redisConnection,
		});
		console.log('Queue events initialized');
	}
	return queueEvents;
}

/**
 * Clean up queue connections - important to call this when shutting down
 */
export async function closeQueues(): Promise<void> {
	console.log('Closing queue connections...');

	if (queueEvents) {
		await queueEvents.close();
		queueEvents = null;
	}

	if (lessonGenerationQueue) {
		await lessonGenerationQueue.close();
		lessonGenerationQueue = null;
	}

	console.log('Queue connections closed');
}
