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

interface ProgressDetails {
	message?: string;
	error?: string;
	result?: unknown;
}

/**
 * Job progress reporter that handles updating both the database and BullMQ job
 */
export class JobProgressReporter {
	private jobId: string;
	private bullMQJob?: Job<LessonGenerationJobData>;
	private lastReportedProgress: number = 0;
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
		details?: ProgressDetails
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
			const updates: Record<string, unknown> = {
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
		additionalDetails?: { error?: string; result?: unknown }
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
	async reportCompletion(result: unknown): Promise<void> {
		await this.reportStage('COMPLETED', 'completed', { result });
	}

	/**
	 * Report job failure with error
	 */
	async reportFailure(error: Error | string): Promise<void> {
		const errorMessage = error instanceof Error ? error.message : error;
		const errorString =
			typeof errorMessage === 'string'
				? errorMessage
				: JSON.stringify(errorMessage);

		// For failure updates, we need to make sure they succeed
		const maxRetries = 3;
		let retryCount = 0;
		let updateSuccessful = false;

		while (!updateSuccessful && retryCount < maxRetries) {
			try {
				console.log(
					`Updating job ${this.jobId} status to 'failed' (attempt ${
						retryCount + 1
					}/${maxRetries})`
				);

				// Update BullMQ job progress if available (outside of reportProgress to ensure it happens)
				if (this.bullMQJob) {
					try {
						// Fix: Only add ellipsis when message is actually truncated
						const truncatedMessage =
							errorString.length > 100
								? `${errorString.substring(0, 100)}...`
								: errorString;

						await this.bullMQJob.updateProgress({
							progress: Math.max(this.lastReportedProgress, 0), // Ensure progress is never negative
							message: `Failed: ${truncatedMessage}`,
							status: 'failed',
							timestamp: new Date().toISOString(),
						});
					} catch (bullMqError) {
						console.warn(
							`Failed to update BullMQ job progress for failed job ${this.jobId}:`,
							bullMqError
						);
					}
				}

				// Direct database update for failures to ensure it happens
				const updates = {
					status: 'failed' as JobStatus,
					error: errorString,
					updated_at: new Date(),
				};

				await db
					.updateTable('generation_jobs')
					.set(updates)
					.where('id', '=', this.jobId)
					.execute();

				// Check if the update was successful
				updateSuccessful = true;
				console.log(
					`Successfully updated job ${this.jobId} status to 'failed'`
				);

				// Also call the regular progress method as a backup
				await this.reportProgress(
					Math.max(this.lastReportedProgress, 0), // Ensure progress is never negative
					'failed',
					{ error: errorString }
				);

				return;
			} catch (dbError) {
				retryCount++;
				console.error(
					`Failed to update status for failed job ${this.jobId} (attempt ${retryCount}/${maxRetries}):`,
					dbError
				);

				// Wait before retrying
				if (retryCount < maxRetries) {
					const delay = 1000 * Math.pow(2, retryCount); // Exponential backoff
					await new Promise((resolve) => setTimeout(resolve, delay));
				}
			}
		}

		if (!updateSuccessful) {
			// Last resort - log a critical error that the job status couldn't be updated
			console.error(
				`CRITICAL: Failed to update job ${this.jobId} status to 'failed' after ${maxRetries} attempts`
			);
		}
	}
}
