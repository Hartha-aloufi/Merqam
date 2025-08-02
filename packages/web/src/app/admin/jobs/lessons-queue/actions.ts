// src/server/queue/job-server-actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/server/config/db';
import {
	getLessonGenerationQueue,
	LessonGenerationJobData,
} from './queue-config';
import { AIServiceType } from './temp';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { sql } from 'kysely';
import { readFile } from 'fs/promises';
import { access } from 'fs/promises';
import path from 'path';

const execFileAsync = promisify(execFile);

export async function extractYoutubeId(url: string): Promise<string> {
	const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
	const match = url.match(regex);
	return match?.[1] ?? '';
}

export async function extractYoutubePlaylistId(
	url: string
): Promise<string | null> {
	// Match YouTube playlist URLs like:
	// https://www.youtube.com/playlist?list=PLxxxxxx
	// https://www.youtube.com/watch?v=xxxxx&list=PLxxxxxx
	const regex =
		/(?:youtube\.com\/(?:playlist\?list=|watch\?.*?list=))(PL[a-zA-Z0-9_-]+)/;
	const match = url.match(regex);
	return match?.[1] || null;
}

interface PlaylistVideo {
	id: string;
	title: string;
	url: string;
}

export async function getPlaylistVideos(
	playlistId: string
): Promise<PlaylistVideo[]> {
	try {
		// Use yt-dlp to get video IDs from the playlist
		// Fix command injection by using execFile with an array of arguments
		const { stdout } = await execFileAsync('yt-dlp', [
			'--flat-playlist',
			'--print',
			'%(id)s|%(title)s|%(webpage_url)s',
			`https://www.youtube.com/playlist?list=${playlistId}`,
		]);

		console.log(
			'Raw yt-dlp output sample:',
			stdout.split('\n').slice(0, 2)
		);

		// Parse the output into video objects
		const videos = stdout
			.trim()
			.split('\n')
			.map((line) => {
				const [id, title, url] = line.split('|');

				// Ensure we have a valid YouTube video ID
				if (!id) {
					console.warn('Missing video ID in yt-dlp output:', line);
					return null;
				}

				// Normalize URL to ensure it's in the format expected by extractYoutubeId
				const normalizedUrl = `https://www.youtube.com/watch?v=${id}`;

				console.log(
					`Normalized video URL: ${normalizedUrl} (Original: ${url})`
				);

				return {
					id,
					title: title || `Video ${id}`,
					url: normalizedUrl,
				};
			})
			.filter(Boolean) as PlaylistVideo[];

		console.log(
			`Extracted ${videos.length} videos from playlist ${playlistId}`
		);
		return videos;
	} catch (error) {
		console.error('Error fetching playlist videos:', error);
		throw new Error(
			`Failed to fetch playlist videos: ${
				error instanceof Error ? error.message : String(error)
			}`
		);
	}
}

export const validateIsVideoNotInDatabase = async (url: string) => {
	const videoId = await extractYoutubeId(url);

	const existingVideo = await db
		.selectFrom('lessons')
		.where('youtube_video_id', '=', videoId)
		.executeTakeFirst();

	if (existingVideo) {
		throw new Error('هذا الفيديو موجود بالفعل');
	}
};

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

		// Wrap the entire job creation and queue submission in a transaction
		const result = await db.transaction().execute(async (trx) => {
			// Create job record in transaction
			const [jobRecord] = await trx
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

			console.log('Job record created in transaction:', jobRecord);

			// Prepare job data for the queue
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

			try {
				// Add job to queue
				const queue = getLessonGenerationQueue();
				const job = await queue.add('generate-lesson', jobData, {
					jobId: jobRecord.id,
					priority: input.priority || undefined,
					attempts: 1,
				});

				console.log('Job added to queue with ID:', job.id);

				// Return job information
				return {
					success: true,
					jobId: jobRecord.id,
				};
			} catch (queueError) {
				// If queue.add fails, update the job status to failed
				console.error('Failed to add job to queue:', queueError);

				// Update job status in the transaction
				await trx
					.updateTable('generation_jobs')
					.set({
						status: 'failed',
						error: `Failed to add job to queue: ${
							queueError instanceof Error
								? queueError.message
								: String(queueError)
						}`,
						updated_at: new Date(),
					})
					.where('id', '=', jobRecord.id)
					.execute();

				// Rethrow the error to be caught by the outer catch block
				throw queueError;
			}
		});

		// Revalidate related paths
		revalidatePath('/admin/jobs');

		return result;
	} catch (error) {
		console.error('Error creating generation job:', error);
		throw error;
	}
}

/**
 * Gets a list of generation jobs for a user (or all users if userId is null)
 */
export async function getGenerationJobs(
	userId: string | null,
	limit = 10,
	offset = 0
) {
	console.log(
		`Getting generation jobs for ${userId ? `user: ${userId}` : 'all users'}, limit: ${limit}, offset: ${offset}`
	);

	try {
		// Build the base query
		let jobsQuery = db.selectFrom('generation_jobs');
		let countQuery = db.selectFrom('generation_jobs');

		// Apply user filter only if userId is provided
		if (userId) {
			jobsQuery = jobsQuery.where('user_id', '=', userId);
			countQuery = countQuery.where('user_id', '=', userId);
		}

		const jobs = await jobsQuery
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
				'user_id', // Add user_id to show who created each job
				'created_at',
				'started_at',
				'completed_at',
			])
			.orderBy('created_at', 'desc')
			.limit(limit)
			.offset(offset)
			.execute();

		// Get total count for pagination
		const [{ count }] = await countQuery
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

/**
 * Creates jobs for all videos in a YouTube playlist
 */
export async function createPlaylistJobs(input: CreateJobInput): Promise<{
	success: boolean;
	jobIds: string[];
	skippedVideos: Array<{ id: string; title: string; reason: string }>;
	message?: string;
}> {
	const jobIds: string[] = [];
	const skippedVideos: Array<{ id: string; title: string; reason: string }> =
		[];

	try {
		// Validate input
		validateInput(input);

		// Extract playlist ID
		const playlistId = await extractYoutubePlaylistId(input.url);

		if (!playlistId) {
			throw new Error('Invalid YouTube playlist URL');
		}

		// Get playlist videos
		const videos = await getPlaylistVideos(playlistId);

		if (videos.length === 0) {
			throw new Error('No videos found in playlist');
		}

		console.log(
			`Creating jobs for ${videos.length} videos from playlist ${playlistId}`
		);

		// Create jobs for each video
		for (const video of videos) {
			// Check if video already exists
			try {
				console.log(
					`Processing video: ID=${video.id}, URL=${video.url}, Title=${video.title}`
				);

				// Verify we can extract a video ID
				const videoId = await extractYoutubeId(video.url);
				if (!videoId) {
					console.error(
						`Failed to extract YouTube ID from URL: ${video.url}`
					);
					skippedVideos.push({
						id: video.id,
						title: video.title,
						reason: 'Invalid YouTube URL format',
					});
					continue;
				}

				await validateIsVideoNotInDatabase(video.url);

				// Create job for this video
				const result = await createGenerationJob({
					...input,
					url: video.url,
				});

				jobIds.push(result.jobId);
				console.log(
					`Created job ${result.jobId} for video ${video.id}: ${video.title}`
				);
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : String(error);
				console.warn(
					`Skipping video ${video.title} (${video.id}): ${errorMessage}`
				);
				skippedVideos.push({
					id: video.id,
					title: video.title,
					reason: errorMessage,
				});
				// Continue with other videos if one fails
				continue;
			}
		}

		// Revalidate related paths
		revalidatePath('/admin/jobs');

		console.log(
			`Created ${jobIds.length} jobs, skipped ${skippedVideos.length} videos`
		);

		if (jobIds.length === 0 && skippedVideos.length > 0) {
			return {
				success: false,
				jobIds,
				skippedVideos,
				message: `No jobs created. All videos were skipped: ${skippedVideos
					.map((v) => `"${v.title}" (${v.reason})`)
					.join(', ')}`,
			};
		}

		return {
			success: true,
			jobIds,
			skippedVideos,
		};
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : String(error);
		console.error('Error creating playlist jobs:', error);

		// Return both the error and any information we've gathered
		return {
			success: false,
			jobIds,
			skippedVideos,
			message: errorMessage,
		};
	}
}

/**
 * Server action to check if a URL is a playlist and return its videos
 */
export async function checkPlaylistVideos(formData: { url: string }) {
	try {
		const { url } = formData;

		if (!url) {
			return { isPlaylist: false, error: 'URL is required' };
		}

		// Check if this is a playlist URL
		const playlistId = await extractYoutubePlaylistId(url);

		if (!playlistId) {
			return { isPlaylist: false };
		}

		// Get playlist videos
		const videos = await getPlaylistVideos(playlistId);

		return {
			isPlaylist: true,
			playlistId,
			videos,
		};
	} catch (error) {
		console.error('Error checking playlist:', error);
		return {
			isPlaylist: false,
			error:
				error instanceof Error
					? error.message
					: 'Failed to check playlist',
		};
	}
}

/**
 * Server action to create jobs for videos in a playlist
 */
export async function createPlaylistJobsAction(formData: CreateJobInput) {
	try {
		if (!formData.url || !formData.userId) {
			return {
				success: false,
				jobIds: [],
				skippedVideos: [],
				message: 'URL and userId are required',
			};
		}

		const result = await createPlaylistJobs(formData);

		// Return the result directly
		return result;
	} catch (error) {
		console.error('Error creating playlist jobs:', error);
		return {
			success: false,
			jobIds: [],
			skippedVideos: [],
			message: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}

/**
 * Test if yt-dlp is installed and working
 */
export async function testYtDlp() {
	try {
		const { stdout } = await execFileAsync('yt-dlp', ['--version']);

		return {
			status: 'success',
			message: 'yt-dlp is installed',
			version: stdout.trim(),
		};
	} catch (error) {
		console.error('Error checking for yt-dlp:', error);
		return {
			status: 'error',
			message:
				'yt-dlp is not installed or not accessible. Please install yt-dlp first.',
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

/**
 * Retries a failed generation job
 */
export async function retryFailedJob(jobId: string, userId: string) {
	console.log(`Retrying failed job with ID: ${jobId} for user: ${userId}`);

	try {
		// Check if the job exists, belongs to the user, and is in failed status
		const job = await db
			.selectFrom('generation_jobs')
			.where('id', '=', jobId)
			.where('user_id', '=', userId)
			.where('status', '=', 'failed')
			.select([
				'id',
				'url',
				'playlist_id',
				'new_playlist_id',
				'new_playlist_title',
				'speaker_id',
				'new_speaker_name',
				'ai_service',
				'priority',
			])
			.executeTakeFirst();

		if (!job) {
			throw new Error('Job not found or cannot be retried');
		}

		// Get the queue instance
		const queue = getLessonGenerationQueue();

		// Try to remove the job from the queue if it's still there
		try {
			console.log(`Removing job ${jobId} from queue before retrying`);
			await queue.remove(jobId);
		} catch (error) {
			// It's okay if this fails - the job might not be in the queue anymore
			console.log(
				`Note: Could not remove job ${jobId} from queue: ${error}`
			);
		}

		// Update the job status in the database to pending
		await db
			.updateTable('generation_jobs')
			.set({
				status: 'pending',
				progress: 0,
				error: null, // Clear previous error
				started_at: null, // Reset timestamp
				completed_at: null, // Reset timestamp
				updated_at: new Date(),
			})
			.where('id', '=', jobId)
			.execute();

		// Prepare job data
		const jobData: LessonGenerationJobData = {
			url: job.url,
			userId: userId,
			aiService: job.ai_service as AIServiceType,
			playlistId: job.playlist_id || undefined,
			speakerId: job.speaker_id || undefined,
			newPlaylistId: job.new_playlist_id || undefined,
			newPlaylistTitle: job.new_playlist_title || undefined,
			newSpeakerName: job.new_speaker_name || undefined,
			priority: job.priority,
		};

		// Use database ID as job ID for easy correlation
		// Make sure to set removeOnFail to false so we can retry again if needed
		const queuedJob = await queue.add('generate-lesson', jobData, {
			jobId: job.id,
			priority: job.priority || undefined,
			attempts: 1,
			removeOnFail: false,
		});

		console.log(
			`Job ${jobId} requeued successfully with ID: ${queuedJob.id}`
		);

		// Revalidate related paths
		revalidatePath('/admin/jobs');

		return { success: true };
	} catch (error) {
		console.error(`Error retrying job with ID: ${jobId}:`, error);
		throw error;
	}
}

/**
 * Gets a list of generation jobs grouped by playlist for a user (or all users if userId is null)
 */
export async function getGroupedGenerationJobs(userId: string | null) {
	console.log(`Getting grouped generation jobs for ${userId ? `user: ${userId}` : 'all users'}`);

	try {
		// Calculate the date 3 days ago
		const threeDaysAgo = new Date();
		threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

		// First get all jobs that have playlist IDs
		const jobsWithPlaylist = await db
			.selectFrom('generation_jobs as gj')
			.leftJoin('playlists as p', (join) =>
				join.on((eb) =>
					eb.or([
						// Join on either the new_playlist_id or playlist_id field
						eb.and([
							eb('gj.new_playlist_id', 'is not', null),
							eb(
								'p.youtube_playlist_id',
								'=',
								eb.ref('gj.new_playlist_id')
							),
						]),
						eb.and([
							eb('gj.playlist_id', 'is not', null),
							eb(
								'p.youtube_playlist_id',
								'=',
								eb.ref('gj.playlist_id')
							),
						]),
					])
				)
			)
			.$if(userId !== null, (qb) => qb.where('gj.user_id', '=', userId!))
			.where('gj.created_at', '>=', threeDaysAgo) // Only show jobs from the last 3 days
			.select([
				// Group key information
				sql<string>`COALESCE(gj.new_playlist_id, gj.playlist_id)`.as(
					'playlist_id'
				),
				'p.title as playlist_title',
				// Aggregate job counts
				sql<number>`COUNT(gj.id)`.as('total_count'),
				sql<number>`SUM(CASE WHEN gj.status = 'completed' THEN 1 ELSE 0 END)`.as(
					'completed_count'
				),
				sql<number>`SUM(CASE WHEN gj.status = 'failed' THEN 1 ELSE 0 END)`.as(
					'failed_count'
				),
				sql<number>`SUM(CASE WHEN gj.status = 'processing' THEN 1 ELSE 0 END)`.as(
					'processing_count'
				),
				sql<number>`SUM(CASE WHEN gj.status = 'pending' THEN 1 ELSE 0 END)`.as(
					'pending_count'
				),
				sql<number>`SUM(CASE WHEN gj.status = 'cancelled' THEN 1 ELSE 0 END)`.as(
					'cancelled_count'
				),
				// Get the latest job creation date for sorting
				sql<string>`MAX(gj.created_at)`.as('latest_job_date'),
				// Aggregate job details as JSON
				sql<string>`json_agg(
					json_build_object(
						'id', gj.id,
						'url', gj.url,
						'status', gj.status,
						'progress', gj.progress,
						'error', gj.error,
						'created_at', gj.created_at,
						'started_at', gj.started_at,
						'completed_at', gj.completed_at,
						'new_playlist_title', gj.new_playlist_title
					) ORDER BY gj.created_at DESC
				)`.as('jobs'),
			])
			.groupBy(['gj.new_playlist_id', 'gj.playlist_id', 'p.title'])
			.having((eb) =>
				eb.or([
					eb(
						sql`COALESCE(gj.new_playlist_id, gj.playlist_id)`,
						'is not',
						null
					),
					eb(sql`COUNT(*)`, '>', 1),
				])
			)
			.orderBy('latest_job_date', 'desc')
			.execute();

		// Now get all jobs that don't have playlist IDs (individual jobs)
		const individualJobs = await db
			.selectFrom('generation_jobs')
			.$if(userId !== null, (qb) => qb.where('user_id', '=', userId!))
			.where('new_playlist_id', 'is', null)
			.where('playlist_id', 'is', null)
			.where('created_at', '>=', threeDaysAgo) // Only show jobs from the last 3 days
			.select([
				'id',
				'url',
				'new_playlist_title',
				'status',
				'progress',
				'error',
				'user_id', // Add user_id for admin view
				'created_at',
				'started_at',
				'completed_at',
			])
			.orderBy('created_at', 'desc')
			.execute();

		// Combine the results
		const result = {
			jobsWithPlaylist,
			individualJobs,
			total:
				jobsWithPlaylist.reduce(
					(sum, group) => sum + Number(group.total_count),
					0
				) + individualJobs.length,
		};

		console.log(
			`Found ${result.jobsWithPlaylist.length} playlist groups and ${result.individualJobs.length} individual jobs`
		);

		return result;
	} catch (error) {
		console.error('Error getting grouped generation jobs:', error);
		throw error;
	}
}

/**
 * Gets detailed logs for a specific job
 */
export async function getJobLogs(jobId: string, userId: string) {
	console.log(`Getting detailed logs for job: ${jobId} for user: ${userId}`);

	try {
		// First verify the user has access to this job
		const job = await db
			.selectFrom('generation_jobs')
			.where('id', '=', jobId)
			.where('user_id', '=', userId) // Security: only allow access to own jobs
			.select(['id'])
			.executeTakeFirst();

		if (!job) {
			throw new Error('Job not found or access denied');
		}

		// Define the log file path
		const logsDir = path.join(
			process.cwd(),
			'..',
			'lessons-worker',
			'logs'
		);
		const logFilePath = path.join(logsDir, `job-${jobId}.log`);

		// Check if the log file exists using access instead of existsAsync
		const fileExists = await access(logFilePath)
			.then(() => true)
			.catch(() => false);
		if (!fileExists) {
			console.log(
				`Log file not found for job ${jobId} at path ${logFilePath}`
			);
			return { logs: [], fileExists: false };
		}

		// Read the file
		const fileContents = await readFile(logFilePath, 'utf8');

		// Parse the logs (each line is a JSON object)
		const logs = fileContents
			.split('\n')
			.filter(Boolean) // Remove empty lines
			.map((line) => {
				try {
					return JSON.parse(line);
				} catch {
					return {
						level: 'error',
						message: `Failed to parse log line: ${line}`,
						timestamp: new Date().toISOString(),
					};
				}
			})
			.filter(
				(log) =>
					log.level === 'error' ||
					(log.metadata && log.metadata.error) ||
					log.message.includes('failed')
			);

		console.log(`Found ${logs.length} error logs for job ${jobId}`);

		return { logs, fileExists: true };
	} catch (error) {
		console.error(`Error getting logs for job with ID: ${jobId}:`, error);
		throw error;
	}
}
