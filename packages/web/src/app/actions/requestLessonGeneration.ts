'use server';

import { db } from '@/server/config/db';
import type { BahethMedium } from '@/server/services/baheth.service';
import {
	getLessonGenerationQueue,
	LessonGenerationJobData,
} from '@/app/admin/jobs/lessons-queue/queue-config';

interface RequestGenerationResult {
	success: boolean;
	error?: string;
	redirectUrl?: string;
	jobId?: string;
}

export async function requestLessonGeneration(
	youtubeId: string,
	bahethMedium?: BahethMedium
): Promise<RequestGenerationResult> {
	try {
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

		// Check if there's already a pending job for this video
		const existingJob = await db
			.selectFrom('generation_jobs')
			.where('url', '=', `https://www.youtube.com/watch?v=${youtubeId}`)
			.selectAll()
			.executeTakeFirst();

		if (existingJob) {
			return {
				success: false,
				error: 'هناك طلب قائم بالفعل لهذا الدرس',
			};
		}

		// Find an admin user from the database
		const adminUser = await db
			.selectFrom('users')
			.where('email', '=', 'admin@example.com')
			.select(['id'])
			.executeTakeFirst();

		if (!adminUser) {
			throw new Error('Could not find admin user for job creation');
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
					user_id: adminUser.id,
					result: metadata as any, // Type cast to match Kysely requirements
				})
				.returning(['id'])
				.execute();

			// Prepare job data for the queue
			const jobData: LessonGenerationJobData = {
				url: `https://www.youtube.com/watch?v=${youtubeId}`,
				userId: adminUser.id,
				aiService: 'gemini',
				// Add speaker information if available from Baheth
				...(bahethMedium?.speakers?.[0] && {
					speakerId: String(bahethMedium.speakers[0].id),
				}),
				// Add playlist information if available from Baheth
				...(bahethMedium?.playlist && {
					playlistId: String(bahethMedium.playlist.id),
				}),
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
		console.error('Error requesting lesson generation:', error);
		return {
			success: false,
			error: 'حدث خطأ أثناء طلب إضافة الدرس',
		};
	}
}
