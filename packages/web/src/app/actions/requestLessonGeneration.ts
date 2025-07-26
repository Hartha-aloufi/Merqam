'use server';

import { db } from '@/server/config/db';
import type { BahethMedium } from '@/server/services/baheth.service';
import {
	getLessonGenerationQueue,
	LessonGenerationJobData,
} from '@/app/admin/jobs/lessons-queue/queue-config';
import { requireAuth } from '@/server/lib/auth/server-action-auth';

interface RequestGenerationResult {
	success: boolean;
	error?: string;
	redirectUrl?: string;
	jobId?: string;
}

/**
 * Handle existing job based on its status
 */
async function handleExistingJob(job: any, youtubeId: string, userId: string): Promise<RequestGenerationResult | null> {
	switch (job.status) {
		case 'completed':
			return {
				success: false,
				error: 'هذا الدرس متوفر بالفعل في مِرْقَم',
			};
			
		case 'pending':
		case 'processing':
			return {
				success: false,
				error: 'يتم معالجة هذا الدرس حالياً',
				redirectUrl: `/request/status/${youtubeId}`,
			};
			
		case 'failed':
		case 'cancelled':
			// Check retry cooldown (1 hour)
			const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
			if (job.updated_at > oneHourAgo) {
				const waitMinutes = Math.ceil((60 * 60 * 1000 - (Date.now() - job.updated_at.getTime())) / (1000 * 60));
				return {
					success: false,
					error: `يجب الانتظار ${waitMinutes} دقيقة قبل إعادة المحاولة`,
				};
			}
			
			// Delete old failed job to allow retry
			await db.deleteFrom('generation_jobs')
				.where('id', '=', job.id)
				.execute();
				
			// Return null to indicate can proceed with new job
			return null;
			
		default:
			return {
				success: false,
				error: 'حالة المهمة غير معروفة',
			};
	}
}

/**
 * Check rate limiting for user (max 3 jobs per hour)
 */
async function checkRateLimit(userId: string): Promise<boolean> {
	const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
	
	const recentJobs = await db
		.selectFrom('generation_jobs')
		.where('user_id', '=', userId)
		.where('created_at', '>', oneHourAgo)
		.select(['id'])
		.execute();
		
	return recentJobs.length < 3; // Max 3 jobs per hour
}

export async function requestLessonGeneration(
	youtubeId: string,
	bahethMedium?: BahethMedium
): Promise<RequestGenerationResult> {
	try {
		// Require authentication
		const user = await requireAuth();

		// Check if the video already exists in lessons
		const existingLesson = await db
			.selectFrom('lessons')
			.where('youtube_video_id', '=', youtubeId)
			.selectAll()
			.executeTakeFirst();

		if (existingLesson) {
			return {
				success: false,
				error: 'هذا الدرس متوفر بالفعل في مِرْقَم',
			};
		}

		// Check for existing job with user ownership
		const existingJob = await db
			.selectFrom('generation_jobs')
			.where('url', '=', `https://www.youtube.com/watch?v=${youtubeId}`)
			.where('user_id', '=', user.id) // User ownership check
			.selectAll()
			.executeTakeFirst();

		if (existingJob) {
			const handleResult = await handleExistingJob(existingJob, youtubeId, user.id);
			if (handleResult !== null) {
				return handleResult;
			}
			// If handleResult is null, proceed with creating new job (retry allowed)
		}

		// Check rate limiting
		const rateLimitPassed = await checkRateLimit(user.id);
		if (!rateLimitPassed) {
			return {
				success: false,
				error: 'لقد تجاوزت الحد المسموح من الطلبات (3 طلبات في الساعة). حاول مرة أخرى لاحقاً',
			};
		}

		// Prepare metadata with Baheth information if available
		const metadata = bahethMedium
			? JSON.stringify({
					source: 'user_request',
					baheth_title: bahethMedium.title,
					baheth_id: bahethMedium.id,
					baheth_link: bahethMedium.link,
					speakers: bahethMedium.speakers?.map((s) => ({
						id: s.id,
						name: s.name,
					})),
					playlist: bahethMedium.playlist
						? {
								id: bahethMedium.playlist.id,
								title: bahethMedium.playlist.title,
						  }
						: null,
			  })
			: JSON.stringify({ source: 'user_request' });

		// Wrap the entire job creation and queue submission in a transaction
		const result = await db.transaction().execute(async (trx) => {
			// Create job record in transaction
			const [jobRecord] = await trx
				.insertInto('generation_jobs')
				.values({
					url: `https://www.youtube.com/watch?v=${youtubeId}`,
					status: 'pending',
					progress: 0,
					ai_service: 'gemini',
					priority: 0,
					user_id: user.id, // Use authenticated user
					result: metadata as any, // Type cast to match Kysely requirements
				})
				.returning(['id'])
				.execute();

			// Prepare job data for the queue
			const jobData: LessonGenerationJobData = {
				url: `https://www.youtube.com/watch?v=${youtubeId}`,
				userId: user.id, // Use authenticated user
				aiService: 'gemini',
				// Add speaker information if available from Baheth, otherwise use defaults
				...(bahethMedium?.speakers?.[0] 
					? { speakerId: String(bahethMedium.speakers[0].id) }
					: { newSpeakerName: "متحدث غير معروف" }
				),
				// Add playlist information if available from Baheth, otherwise use defaults
				...(bahethMedium?.playlist 
					? { playlistId: String(bahethMedium.playlist.id) }
					: { 
						newPlaylistId: "general", 
						newPlaylistTitle: "دروس عامة" 
					}
				),
				// Pass Baheth medium data to worker for direct transcript download
				bahethMedium: bahethMedium ? {
					id: bahethMedium.id,
					title: bahethMedium.title,
					link: bahethMedium.link,
					transcription_txt_link: bahethMedium.transcription_txt_link,
					transcription_srt_link: bahethMedium.transcription_srt_link,
				} : undefined,
			};

			try {
				// Add job to queue
				const queue = getLessonGenerationQueue();
				const job = await queue.add('generate-lesson', jobData, {
					jobId: jobRecord.id,
					attempts: 1,
				});

				console.log('User request job added to queue with ID:', job.id);

				return {
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

				throw queueError;
			}
		});

		return {
			success: true,
			jobId: result.jobId,
			redirectUrl: `/request/status/${youtubeId}`,
		};
	} catch (error) {
		// Handle authentication errors specifically
		if (error instanceof Error && error.message === 'Authentication required') {
			return {
				success: false,
				error: 'يجب تسجيل الدخول أولاً لطلب إضافة الدرس',
			};
		}
		
		console.error('Error requesting lesson generation:', error);
		return {
			success: false,
			error: 'حدث خطأ أثناء طلب إضافة الدرس',
		};
	}
}
