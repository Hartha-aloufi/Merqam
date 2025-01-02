// src/hooks/use-reading-progress-sync.ts
import { useSession } from '@/client/hooks/use-auth-query';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/client/lib/supabase';
import { ReadingProgressUpdate } from '@/types/reading-progress';
import { getLessonProgress, setLessonProgress } from '@/client/lib/utils';
import { authService } from '@/client/services/auth.service';
import { debounce } from 'lodash';
import { useCallback, useMemo } from 'react';

const READING_PROGRESS_KEYS = {
	all: ['reading-progress'] as const,
	lesson: (topicId: string, lessonId: string) =>
		[...READING_PROGRESS_KEYS.all, topicId, lessonId] as const,
};

export const getLatestReadParagraph = (topicId: string, lessonId: string) => {
	return authService.getUser().then((res) => {
		const user = res.data.user;
		if (!user) {
			return getLessonProgress(topicId, lessonId);
		}

		return supabase
			.from('reading_progress')
			.select('latest_read_paragraph')
			.eq('topic_id', topicId)
			.eq('lesson_id', lessonId)
			.eq('user_id', user.id)
			.single()
			.then(({ data, error }) => {
				if (error) throw error;
				return data.latest_read_paragraph;
			});
	});
};

export function useReadingProgressSync(topicId: string, lessonId: string) {
	const { data: session } = useSession();
	const isAuthenticated = !!session?.data.session?.user;

	// Fetch reading progress from Supabase
	const progressQuery = useQuery({
		queryKey: READING_PROGRESS_KEYS.lesson(topicId, lessonId),
		queryFn: () => getLatestReadParagraph(topicId, lessonId),
	});

	// Update reading progress mutation
	const progressMutation = useMutation({
		mutationFn: (update: ReadingProgressUpdate) => {
			if (!isAuthenticated) {
				// Handle non-authenticated users with localStorage
				return new Promise((resolve) => {
					setLessonProgress(topicId, lessonId, {
						paragraphIndex: update.latest_read_paragraph,
						date: 'asdasd',
					});
					resolve(undefined);
				});
			}

			// Handle authenticated users with Supabase
			return supabase
				.from('reading_progress')
				.upsert(
					{
						user_id: session?.data.session?.user.id as string,
						topic_id: update.topic_id,
						lesson_id: update.lesson_id,
						last_read_paragraph: update.last_read_paragraph,
						latest_read_paragraph: update.latest_read_paragraph,
						updated_at: new Date().toISOString(),
					},
					{ onConflict: 'user_id,topic_id,lesson_id' }
				)
				.then(({ error }) => {
					if (error) throw error;
				});
		},
		onError: (error) => {
			console.error('Failed to update reading progress:', error);
			// Optionally show an error toast to the user
		},
	});

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
