// src/hooks/highlights/use-highlight-sync.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { highlightService } from '@/services/highlight.service';
import { useSession } from '@/hooks/use-auth-query';
import { toast } from 'sonner';
import type { HighlightItem } from '@/types/highlight';
import { HighlightColorKey } from '@/constants/highlights';
import React from 'react';

// Query key factory
export const HIGHLIGHT_KEYS = {
	all: ['highlights'] as const,
	lesson: (topicId: string, lessonId: string) =>
		[...HIGHLIGHT_KEYS.all, topicId, lessonId] as const,
};

/**
 * Hook to fetch highlights for a lesson
 */
export const useLessonHighlights = (topicId: string, lessonId: string) => {
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
 * Hook to handle batch updates of highlights
 */
export const useBatchUpdateHighlights = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: highlightService.batchUpdateHighlights,
		onMutate: async ({ topicId, lessonId, highlights }) => {
			const queryKey = HIGHLIGHT_KEYS.lesson(topicId, lessonId);

			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey });

			// Snapshot the previous value
			const previousHighlights = queryClient.getQueryData(queryKey);

			// Optimistically update to the new value
			queryClient.setQueryData(queryKey, { highlights });

			return { previousHighlights };
		},
		onError: (err, variables, context) => {
			if (context?.previousHighlights) {
				// Revert optimistic update on error
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
 * Hook to manage highlights with batch operations
 */
export const useHighlightOperations = (topicId: string, lessonId: string) => {
	const { data: highlights = [], isLoading } = useLessonHighlights(
		topicId,
		lessonId
	);
	const { mutate: batchUpdate, isPending: isUpdating } =
		useBatchUpdateHighlights();

	// Add new highlight
	const addHighlight = React.useCallback(
		(highlight: Omit<HighlightItem, 'id' | 'createdAt' | 'updatedAt'>) => {
			const now = new Date().toISOString();
			const newHighlight: HighlightItem = {
				...highlight,
				id: crypto.randomUUID(),
				createdAt: now,
				updatedAt: now,
			};

			batchUpdate({
				topicId,
				lessonId,
				highlights: [...highlights, newHighlight],
			});
		},
		[highlights, batchUpdate, topicId, lessonId]
	);

	// Remove highlight
	const removeHighlight = React.useCallback(
		(...highlightIds: string[]) => {
			batchUpdate({
				topicId,
				lessonId,
				highlights: highlights.filter(
					(h) => !highlightIds.includes(h.id)
				),
			});
		},
		[highlights, batchUpdate, topicId, lessonId]
	);

	// Update highlight color
	const updateHighlightColor = React.useCallback(
		(highlightId: string, color: HighlightColorKey) => {
			batchUpdate({
				topicId,
				lessonId,
				highlights: highlights.map((h) =>
					h.id === highlightId
						? { ...h, color, updatedAt: new Date().toISOString() }
						: h
				),
			});
		},
		[highlights, batchUpdate, topicId, lessonId]
	);

	return {
		highlights,
		isLoading: isLoading || isUpdating,
		addHighlight,
		removeHighlight,
		updateHighlightColor,
	};
};
