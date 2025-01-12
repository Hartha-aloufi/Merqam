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
	lesson: (topicId: string, lessonId: string) =>
		[...READING_PROGRESS_KEYS.all, topicId, lessonId] as const,
};

/**
 * Fetches the latest read paragraph from either local storage or API
 */
export const getLatestReadParagraph = async (
	topicId: string,
	lessonId: string
) => {
	if (hasSession()) {
		const response = await httpClient.get('/reading-progress', {
			params: {
				topic_id: topicId,
				lesson_id: lessonId,
			},
		});

		return response.data.latest_read_paragraph ?? 0;
	} else {
		// Fallback to local storage if API fails
		return getLessonProgress(topicId, lessonId);
	}
};

/**
 * Hook to sync reading progress between local storage and server
 */
export function useReadingProgressSync(topicId: string, lessonId: string) {
	const { data: session } = useSession();
	const queryClient = useQueryClient();
	const isAuthenticated = !!session?.user;

	// Fetch reading progress
	const progressQuery = useQuery({
		queryKey: READING_PROGRESS_KEYS.lesson(topicId, lessonId),
		queryFn: () => getLatestReadParagraph(topicId, lessonId),
		enabled: isAuthenticated,
	});

	// Update progress mutation
	const progressMutation = useMutation({
		mutationFn: (update: ReadingProgressUpdate) => {
			if (!isAuthenticated) {
				// Handle non-authenticated users with localStorage
				setLessonProgress(topicId, lessonId, {
					paragraphIndex: update.latest_read_paragraph,
					date: new Date().toISOString(),
				});
				return Promise.resolve();
			}

			// Handle authenticated users with API
			return httpClient.post('/reading-progress', {
				topic_id: update.topic_id,
				lesson_id: update.lesson_id,
				latest_read_paragraph: update.latest_read_paragraph,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: READING_PROGRESS_KEYS.lesson(topicId, lessonId),
			});
		},
	});

	// Debounced update function
	const updateProgress = useCallback(
		debounce((latestIdx: number) => {
			progressMutation.mutate({
				topic_id: topicId,
				lesson_id: lessonId,
				latest_read_paragraph: latestIdx,
			});
		}, 3000),
		[progressMutation.mutate, topicId, lessonId]
	);

	return useMemo(
		() => ({
			lastParagraphIdx: progressQuery.data,
			update: updateProgress,
		}),
		[progressQuery.data, updateProgress]
	);
}
