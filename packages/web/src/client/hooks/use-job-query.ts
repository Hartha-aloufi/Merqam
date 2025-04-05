// src/client/hooks/use-job-query.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
	createGenerationJob,
	getGenerationJobs,
	getGenerationJobById,
	cancelGenerationJob,
} from '@/app/admin/jobs/lessons-queue/actions';
import { JobStatus } from '@/types/db';

// Query keys factory
export const JOB_KEYS = {
	all: ['jobs'] as const,
	lists: () => [...JOB_KEYS.all, 'list'] as const,
	list: (userId: string) => [...JOB_KEYS.lists(), userId] as const,
	details: () => [...JOB_KEYS.all, 'detail'] as const,
	detail: (jobId: string) => [...JOB_KEYS.details(), jobId] as const,
};

/**
 * Hook for submitting a new generation job
 */
export function useSubmitGenerationJob() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createGenerationJob,
		onSuccess: (data, variables) => {
			// Invalidate job lists
			queryClient.invalidateQueries({ queryKey: JOB_KEYS.lists() });

			// Show success notification
			toast.success('تم إنشاء مهمة التوليد بنجاح');

			// Add the new job to the query cache optimistically
			queryClient.setQueryData(JOB_KEYS.detail(data.jobId), {
				id: data.jobId,
				url: variables.url,
				playlistId: variables.playlistId,
				newPlaylistId: variables.newPlaylistId,
				newPlaylistTitle: variables.newPlaylistTitle,
				speakerId: variables.speakerId,
				newSpeakerName: variables.newSpeakerName,
				status: 'pending' as JobStatus,
				progress: 0,
				aiService: variables.aiService,
				createdAt: new Date().toISOString(),
			});
		},
		onError: (error) => {
			// Show error notification
			toast.error(
				`خطأ: ${
					error instanceof Error
						? error.message
						: 'حدث خطأ أثناء إنشاء المهمة'
				}`
			);
		},
	});
}

/**
 * Hook for fetching a list of jobs
 */
export function useGenerationJobs(userId: string, limit = 10, offset = 0) {
	return useQuery({
		queryKey: [...JOB_KEYS.list(userId), { limit, offset }],
		queryFn: () => getGenerationJobs(userId, limit, offset),
		staleTime: 15000, // 15 seconds
		refetchInterval: (query) => {
			// Refetch more frequently if there are active jobs
			const hasActiveJobs = query.state.data?.jobs.some(
				(job) => job.status === 'pending' || job.status === 'processing'
			);
			return hasActiveJobs ? 5000 : 30000; // 5 seconds if active, 30 seconds otherwise
		},
	});
}

/**
 * Hook for fetching a specific job by ID
 */
export function useGenerationJobById(jobId: string, userId: string) {
	return useQuery({
		queryKey: JOB_KEYS.detail(jobId),
		queryFn: () => getGenerationJobById(jobId, userId),
		staleTime: 5000, // 5 seconds
		refetchInterval: (query) => {
			// Refetch more frequently if job is active
			const isActiveJob =
				query.state.data?.status === 'pending' ||
				query.state.data?.status === 'processing';
			return isActiveJob ? 3000 : false; // 3 seconds if active, don't refetch otherwise
		},
	});
}

/**
 * Hook for cancelling a job
 */
export function useCancelGenerationJob() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ jobId, userId }: { jobId: string; userId: string }) =>
			cancelGenerationJob(jobId, userId),
		onSuccess: (_, variables) => {
			// Invalidate affected queries
			queryClient.invalidateQueries({ queryKey: JOB_KEYS.lists() });
			queryClient.invalidateQueries({
				queryKey: JOB_KEYS.detail(variables.jobId),
			});

			// Show success notification
			toast.success('تم إلغاء المهمة بنجاح');

			// Update job status optimistically
			queryClient.setQueryData(
				JOB_KEYS.detail(variables.jobId),
				(oldData: any) => ({
					...oldData,
					status: 'cancelled' as JobStatus,
				})
			);
		},
		onError: (error) => {
			toast.error(
				`خطأ: ${
					error instanceof Error
						? error.message
						: 'حدث خطأ أثناء إلغاء المهمة'
				}`
			);
		},
	});
}
