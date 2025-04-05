// src/server/queue/job-progress-utils.ts
import { db } from '../lib/db';
import { JobStatus } from '../db';
import { Job } from 'bullmq';
import { LessonGenerationJobData } from './queue-config';

/**
 * Standard progress stages for lesson generation process
 */
export const PROGRESS_STAGES = {
	INITIALIZED: { progress: 0, message: 'Job initialized' },
	DOWNLOADING: { progress: 10, message: 'Downloading transcript' },
	TRANSCRIPT_EXTRACTED: { progress: 25, message: 'Transcript extracted' },
	AI_PROCESSING_STARTED: { progress: 30, message: 'AI processing started' },
	AI_PROCESSING_HALFWAY: { progress: 50, message: 'AI processing halfway' },
	AI_PROCESSING_COMPLETED: {
		progress: 70,
		message: 'AI processing completed',
	},
	SYNCHRONIZING: { progress: 80, message: 'Synchronizing with video' },
	SAVING_TO_DATABASE: { progress: 90, message: 'Saving to database' },
	COMPLETED: { progress: 100, message: 'Job completed' },
};

/**
 * Job progress reporter that handles updating both the database and BullMQ job
 */
export class JobProgressReporter {
	private jobId: string;
	private bullMQJob?: Job<LessonGenerationJobData>;
	private lastReportedProgress: number = -1;
	private startTime: number;

	constructor(jobId: string, bullMQJob?: Job<LessonGenerationJobData>) {
		this.jobId = jobId;
		this.bullMQJob = bullMQJob;
		this.startTime = Date.now();

		console.log(`JobProgressReporter initialized for job ${jobId}`);
	}

	/**
	 * Report progress to both database and BullMQ
	 */
	async reportProgress(
		progress: number,
		status: JobStatus = 'processing',
		details?: { message?: string; error?: string; result?: any }
	): Promise<void> {
		// Skip if progress hasn't changed significantly (at least 5%)
		if (
			progress < 100 &&
			Math.abs(progress - this.lastReportedProgress) < 5
		) {
			return;
		}

		this.lastReportedProgress = progress;

		const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
		console.log(
			`Job ${this.jobId} progress: ${progress}% (${elapsed}s elapsed) - ${
				details?.message || status
			}`
		);

		// Update BullMQ job progress if available
		if (this.bullMQJob) {
			try {
				await this.bullMQJob.updateProgress({
					progress,
					message: details?.message,
					timestamp: new Date().toISOString(),
				});
			} catch (error) {
				console.warn(
					`Failed to update BullMQ job progress for job ${this.jobId}:`,
					error
				);
			}
		}

		// Update database
		try {
			const updates: any = {
				progress,
				status,
				updated_at: new Date(),
			};

			if (details?.error) {
				updates.error = details.error;
			}

			if (details?.result) {
				updates.result = details.result;
			}

			if (status === 'completed') {
				updates.completed_at = new Date();
			} else if (
				status === 'processing' &&
				progress === PROGRESS_STAGES.INITIALIZED.progress
			) {
				updates.started_at = new Date();
			}

			await db
				.updateTable('generation_jobs')
				.set(updates)
				.where('id', '=', this.jobId)
				.execute();
		} catch (error) {
			console.error(
				`Failed to update database progress for job ${this.jobId}:`,
				error
			);
		}
	}

	/**
	 * Report a stage of progress
	 */
	async reportStage(
		stage: keyof typeof PROGRESS_STAGES,
		status: JobStatus = 'processing',
		additionalDetails?: { error?: string; result?: any }
	): Promise<void> {
		const { progress, message } = PROGRESS_STAGES[stage];
		await this.reportProgress(progress, status, {
			message,
			...additionalDetails,
		});
	}

	/**
	 * Report job completion with result
	 */
	async reportCompletion(result: any): Promise<void> {
		await this.reportStage('COMPLETED', 'completed', { result });
	}

	/**
	 * Report job failure with error
	 */
	async reportFailure(error: Error | string): Promise<void> {
		const errorMessage = error instanceof Error ? error.message : error;
		await this.reportProgress(
			this.lastReportedProgress, // Keep the last progress
			'failed',
			{ error: errorMessage }
		);
	}
}
