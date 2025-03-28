// src/client/hooks/use-reading-progress-sync.ts
import { hasSession, useSession } from '@/client/hooks/use-auth-query';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/client/lib/http-client';
import { ReadingProgressUpdate } from '@/types/reading-progress';
import { getLessonProgress, setLessonProgress } from '@/client/lib/utils';
import { debounce } from 'lodash';
import { useCallback, useMemo } from 'react';

const READING_PROGRESS_KEYS = {
	all: ['reading-progress'] as const,
	lesson: (lessonId: string) =>
		[...READING_PROGRESS_KEYS.all, lessonId] as const,
};

/**
 * Fetches the latest read paragraph from either local storage or API
 */
export const getLatestReadParagraph = async (
	lessonId: string
) => {
	if (hasSession()) {
		const response = await httpClient.get('/reading-progress', {
			params: {
				lesson_id: lessonId,
			},
		});

		return response.data.latest_read_paragraph ?? 0;
	} else {
		// Fallback to local storage if API fails
		return getLessonProgress(lessonId);
	}
};

/**
 * Hook to sync reading progress between local storage and server
 */
export function useReadingProgressSync(lessonId: string) {
	const { data: session } = useSession();
	const queryClient = useQueryClient();
	const isAuthenticated = !!session?.user;

	// Fetch reading progress
	const progressQuery = useQuery({
		queryKey: READING_PROGRESS_KEYS.lesson(lessonId),
		queryFn: () => getLatestReadParagraph(lessonId),
		enabled: isAuthenticated,
	});

	// Update progress mutation
	const progressMutation = useMutation({
		mutationFn: (update: ReadingProgressUpdate) => {
			if (!isAuthenticated) {
				// Handle non-authenticated users with localStorage
				setLessonProgress(lessonId, {
					paragraphIndex: update.latest_read_paragraph,
					date: new Date().toISOString(),
				});
				return Promise.resolve();
			}

			// Handle authenticated users with API
			return httpClient.post('/reading-progress', {
				lesson_id: update.lesson_id,
				latest_read_paragraph: update.latest_read_paragraph,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: READING_PROGRESS_KEYS.lesson(lessonId),
			});
		},
	});

	// Debounced update function
	const updateProgress = useCallback(
		debounce((latestIdx: number) => {
			progressMutation.mutate({
				lesson_id: lessonId,
				latest_read_paragraph: latestIdx,
			});
		}, 3000),
		[progressMutation.mutate, lessonId]
	);

	return useMemo(
		() => ({
			lastParagraphIdx: progressQuery.data,
			update: updateProgress,
		}),
		[progressQuery.data, updateProgress]
	);
}
