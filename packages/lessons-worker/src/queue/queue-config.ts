// src/server/queue/queue-config.ts
import { ConnectionOptions } from 'bullmq';
import { env } from '../lib/env';
import { AIServiceType } from '../services/ai/types';

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
}