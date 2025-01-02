// src/client/hooks/highlights/use-highlight-operations.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HighlightService } from '@/client/services/highlight.service';
import { useSession } from '@/client/hooks/use-auth-query';
import { toast } from 'sonner';
import type { HighlightItem } from '@/types/highlight';
import { HighlightColorKey } from '@/constants/highlights';
import { useHighlightHistory } from './use-highlight-history';

const highlightService = new HighlightService();

const HIGHLIGHT_KEYS = {
	all: ['highlights'] as const,
	lesson: (topicId: string, lessonId: string) =>
		[...HIGHLIGHT_KEYS.all, topicId, lessonId] as const,
};

export const useHighlightOperations = (topicId: string, lessonId: string) => {
	const { data: session } = useSession();
	const queryClient = useQueryClient();

	// Get highlights query
	const { data: highlights = [], isLoading } = useQuery({
		queryKey: HIGHLIGHT_KEYS.lesson(topicId, lessonId),
		queryFn: () => highlightService.getHighlights(topicId, lessonId),
		select: (data) => data?.highlights ?? [],
		enabled: !!session?.user,
	});

	// Batch update mutation
	const { mutate: batchUpdate, isPending: isUpdating } = useMutation({
		mutationFn: (highlights: HighlightItem[]) =>
			highlightService.batchUpdateHighlights({
				topicId,
				lessonId,
				highlights,
			}),
		onMutate: async (newHighlights) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({
				queryKey: HIGHLIGHT_KEYS.lesson(topicId, lessonId),
			});

			// Snapshot the previous value
			const previousHighlights = queryClient.getQueryData<
				HighlightItem[]
			>(HIGHLIGHT_KEYS.lesson(topicId, lessonId));

			// Optimistically update to the new value
			queryClient.setQueryData<HighlightItem[]>(
				HIGHLIGHT_KEYS.lesson(topicId, lessonId),
				newHighlights
			);

			return { previousHighlights };
		},
		onError: (err, newHighlights, context) => {
			// Rollback on error
			if (context?.previousHighlights) {
				queryClient.setQueryData(
					HIGHLIGHT_KEYS.lesson(topicId, lessonId),
					context.previousHighlights
				);
			}
			toast.error('فشل حفظ التظليلات');
		},
		onSuccess: () => {
			toast.success('تم حفظ التظليلات');
		},
	});

	const {
		addHighlight: addHighlightWithHistory,
		batchAddHighlights: batchAddHighlightWithHistory,
		removeHighlight: removeHighlightWithHistory,
		updateHighlightColor: updateHighlightColorWithHistory,
		undo,
		redo,
		canUndo,
		canRedo,
	} = useHighlightHistory(highlights, batchUpdate);

	const handleUpdateHighlightColor = async (
		id: string,
		newColor: HighlightColorKey
	) => {
		const highlight = highlights.find((h) => h.id === id);
		if (highlight) {
			updateHighlightColorWithHistory(id, highlight.color, newColor);
		}
	};

	return {
		highlights,
		isLoading: isLoading || isUpdating,
		addHighlight: addHighlightWithHistory,
		batchAddHighlights: batchAddHighlightWithHistory,
		removeHighlight: removeHighlightWithHistory,
		updateHighlightColor: handleUpdateHighlightColor,
		undo,
		redo,
		canUndo,
		canRedo,
	};
};
