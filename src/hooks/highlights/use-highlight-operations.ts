// src/hooks/highlights/use-highlight-operations.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { highlightService } from '@/services/highlight.service';
import { useSession } from '@/hooks/use-auth-query';
import { toast } from 'sonner';
import type { BatchUpdateHighlightsDto, HighlightItem, TextHighlight } from '@/types/highlight';
import { HighlightColorKey } from '@/constants/highlights';
import { useHighlightHistory } from './use-highlight-history';
import { useCallback } from 'react';

const HIGHLIGHT_KEYS = {
	all: ['highlights'] as const,
	lesson: (topicId: string, lessonId: string) =>
		[...HIGHLIGHT_KEYS.all, topicId, lessonId] as const,
};

/**
 * Hook for managing batch updates to highlights
 */
const useBatchUpdateHighlights = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: BatchUpdateHighlightsDto) =>
			highlightService.batchUpdateHighlights(data),
		onMutate: async ({ topicId, lessonId, highlights }) => {
			// Cancel outgoing refetches
			const queryKey = HIGHLIGHT_KEYS.lesson(topicId, lessonId);
			await queryClient.cancelQueries({ queryKey });

			// Snapshot current state
			const previousHighlights = queryClient.getQueryData(queryKey);

			// Optimistically update
			queryClient.setQueryData(queryKey, { highlights });

			return { previousHighlights };
		},
		onError: (err, variables, context) => {
			if (context?.previousHighlights) {
				// Revert on error
				queryClient.setQueryData(
					HIGHLIGHT_KEYS.lesson(
						variables.topicId,
						variables.lessonId
					),
					context.previousHighlights
				);
			}
			toast.error('فشل حفظ التظليلات');
		},
		onSuccess: () => {
			toast.success('تم حفظ التظليلات');
		},
	});
};

/**
 * Hook for retrieving highlights for a lesson
 */
const useLessonHighlights = (topicId: string, lessonId: string) => {
	const { data: session } = useSession();
	const isAuthenticated = !!session?.data.session;

	return useQuery({
		queryKey: HIGHLIGHT_KEYS.lesson(topicId, lessonId),
		queryFn: () => highlightService.getHighlights(topicId, lessonId),
		enabled: isAuthenticated,
		select: (data) => data?.highlights ?? [],
	});
};

/**
 * Hook to manage highlights with batch operations
 */
export const useHighlightOperations = (topicId: string, lessonId: string) => {
	const { data: highlights = [], isLoading } = useLessonHighlights(
		topicId,
		lessonId
	);
	const { mutate: batchUpdate, isPending: isUpdating } =
		useBatchUpdateHighlights();

	const batchAddHighlights = useCallback(
		(
			newHighlights: Omit<
				HighlightItem,
				'id' | 'createdAt' | 'updatedAt' | 'groupId'
			>[]
		) => {
			const now = new Date().toISOString();
			const groupId = crypto.randomUUID();

			const highlightsToAdd = newHighlights.map((highlight) => ({
				...highlight,
				id: crypto.randomUUID(),
				groupId,
				createdAt: now,
				updatedAt: now,
			}));

			batchUpdate({
				topicId,
				lessonId,
				highlights: [...highlights, ...highlightsToAdd],
			});
		},
		[highlights, batchUpdate, topicId, lessonId]
	);

	const {
		addHighlight: addHighlightWithHistory,
		removeHighlight: removeHighlightWithHistory,
		updateHighlightColor: updateHighlightColorWithHistory,
		undo,
		redo,
		canUndo,
		canRedo,
	} = useHighlightHistory(highlights, (newHighlights) => {
		batchUpdate({
			topicId,
			lessonId,
			highlights: newHighlights,
		});
	});

	const handleUpdateHighlightColor = useCallback(
		(id: string, newColor: HighlightColorKey) => {
			const highlight = highlights.find((h) => h.id === id);
			if (highlight) {
				updateHighlightColorWithHistory(id, highlight.color, newColor);
			}
		},
		[highlights, updateHighlightColorWithHistory]
	);

	return {
		highlights,
		isLoading: isLoading || isUpdating,
		addHighlight: addHighlightWithHistory,
		removeHighlight: removeHighlightWithHistory,
		updateHighlightColor: handleUpdateHighlightColor,
		batchAddHighlights,
		undo,
		redo,
		canUndo,
		canRedo,
	};
};