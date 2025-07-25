// src/server/queue/queue-config.ts
import { Queue, ConnectionOptions } from 'bullmq';
import { env } from '@/server/config/env';
import { AIServiceType } from './temp';

// Baheth medium interface for job data
export interface BahethMedium {
	id: number;
	title: string;
	link: string;
	transcription_txt_link?: string;
	transcription_srt_link?: string;
}


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
	bahethMedium?: BahethMedium;
}

// Singleton instances to ensure we use the same connection throughout the app
let lessonGenerationQueue: Queue<LessonGenerationJobData> | null = null;

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