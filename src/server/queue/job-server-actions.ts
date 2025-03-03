// src/server/queue/job-server-actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/server/config/db';
import {
	getLessonGenerationQueue,
	LessonGenerationJobData,
} from '@/server/queue/queue-config';
import { AIServiceType } from '@/server/services/ai/types';
import { validateIsVideoNotInDatabase } from '@/app/admin/jobs/utils';

interface CreateJobInput {
	url: string;
	userId: string;
	aiService: AIServiceType;
	// For existing playlist
	playlistId?: string;
	speakerId?: string;
	// For new playlist
	newPlaylistId?: string;
	newPlaylistTitle?: string;
	newSpeakerName?: string;
	// For job management
	priority?: number;
}

/**
 * Validates job creation input data
 */
function validateInput(input: CreateJobInput) {
	if (!input.url) {
		throw new Error('URL is required');
	}

	if (!input.userId) {
		throw new Error('User ID is required');
	}

	// Check for either existing playlist or new playlist data
	const hasExistingPlaylist = input.playlistId && input.speakerId;
	const hasNewPlaylist =
		input.newPlaylistId &&
		input.newPlaylistTitle &&
		(input.speakerId || input.newSpeakerName);

	if (!hasExistingPlaylist && !hasNewPlaylist) {
		throw new Error(
			'Either existing playlist or new playlist data is required'
		);
	}
}

/**
 * Creates a new generation job and adds it to the queue
 */
export async function createGenerationJob(input: CreateJobInput) {
	console.log('Creating generation job with input:', input);

	try {
		// Validate input
		validateInput(input);

		// Validate video is not already in the database
		await validateIsVideoNotInDatabase(input.url);

		// Start database transaction to create the job record
		const [jobRecord] = await db
			.insertInto('generation_jobs')
			.values({
				user_id: input.userId,
				url: input.url,
				playlist_id: input.playlistId || null,
				new_playlist_id: input.newPlaylistId || null,
				new_playlist_title: input.newPlaylistTitle || null,
				speaker_id: input.speakerId || null,
				new_speaker_name: input.newSpeakerName || null,
				ai_service: input.aiService || 'gemini',
				priority: input.priority || 0,
				status: 'pending',
				progress: 0,
			})
			.returning([
				'id',
				'user_id',
				'url',
				'playlist_id',
				'new_playlist_id',
				'new_playlist_title',
				'speaker_id',
				'new_speaker_name',
				'ai_service',
				'priority',
				'status',
				'created_at',
			])
			.execute();

		console.log('Job record created:', jobRecord);

		// Add job to queue
		const queue = getLessonGenerationQueue();

		const jobData: LessonGenerationJobData = {
			url: input.url,
			userId: input.userId,
			aiService: input.aiService,
			playlistId: input.playlistId,
			speakerId: input.speakerId,
			newPlaylistId: input.newPlaylistId,
			newPlaylistTitle: input.newPlaylistTitle,
			newSpeakerName: input.newSpeakerName,
			priority: input.priority,
		};

		// Use database ID as job ID for easy correlation
		const job = await queue.add('generate-lesson', jobData, {
			jobId: jobRecord.id,
			priority: input.priority || undefined,
		});

		console.log('Job added to queue with ID:', job.id);

		// Revalidate related paths
		revalidatePath('/admin/jobs');

		return {
			success: true,
			jobId: jobRecord.id,
		};
	} catch (error) {
		console.error('Error creating generation job:', error);
		throw error;
	}
}

/**
 * Gets a list of generation jobs for a user
 */
export async function getGenerationJobs(
	userId: string,
	limit = 10,
	offset = 0
) {
	console.log(
		`Getting generation jobs for user: ${userId}, limit: ${limit}, offset: ${offset}`
	);

	try {
		const jobs = await db
			.selectFrom('generation_jobs')
			.where('user_id', '=', userId)
			.select([
				'id',
				'url',
				'playlist_id',
				'new_playlist_title',
				'status',
				'progress',
				'error',
				'result',
				'ai_service',
				'created_at',
				'started_at',
				'completed_at',
			])
			.orderBy('created_at', 'desc')
			.limit(limit)
			.offset(offset)
			.execute();

		// Get total count for pagination
		const [{ count }] = await db
			.selectFrom('generation_jobs')
			.where('user_id', '=', userId)
			.select(db.fn.count<number>('id').as('count'))
			.execute();

		console.log(`Found ${jobs.length} jobs out of ${count} total`);

		return {
			jobs,
			total: Number(count),
		};
	} catch (error) {
		console.error('Error getting generation jobs:', error);
		throw error;
	}
}

/**
 * Gets a specific generation job by ID
 */
export async function getGenerationJobById(jobId: string, userId: string) {
	console.log(`Getting generation job with ID: ${jobId} for user: ${userId}`);

	try {
		const job = await db
			.selectFrom('generation_jobs')
			.where('id', '=', jobId)
			.where('user_id', '=', userId) // Security: only allow access to own jobs
			.select([
				'id',
				'url',
				'playlist_id',
				'new_playlist_id',
				'new_playlist_title',
				'speaker_id',
				'new_speaker_name',
				'status',
				'progress',
				'error',
				'result',
				'ai_service',
				'created_at',
				'started_at',
				'completed_at',
			])
			.executeTakeFirst();

		if (!job) {
			throw new Error('Job not found');
		}

		// console.log('Found job:', job);
		return job;
	} catch (error) {
		console.error(`Error getting generation job with ID: ${jobId}:`, error);
		throw error;
	}
}

/**
 * Cancels a generation job
 */
export async function cancelGenerationJob(jobId: string, userId: string) {
	console.log(
		`Cancelling generation job with ID: ${jobId} for user: ${userId}`
	);

	try {
		// First, check if the job exists and belongs to the user
		const job = await db
			.selectFrom('generation_jobs')
			.where('id', '=', jobId)
			.where('user_id', '=', userId)
			.where('status', 'in', ['pending', 'processing'])
			.select(['id'])
			.executeTakeFirst();

		if (!job) {
			throw new Error('Job not found or cannot be cancelled');
		}

		// Update the job status in the database
		await db
			.updateTable('generation_jobs')
			.set({
				status: 'cancelled',
				updated_at: new Date(),
			})
			.where('id', '=', jobId)
			.execute();

		// Remove the job from the queue if it's still there
		const queue = getLessonGenerationQueue();
		await queue.remove(jobId);

		console.log(`Job ${jobId} cancelled successfully`);

		// Revalidate related paths
		revalidatePath('/admin/jobs');

		return { success: true };
	} catch (error) {
		console.error(
			`Error cancelling generation job with ID: ${jobId}:`,
			error
		);
		throw error;
	}
}
