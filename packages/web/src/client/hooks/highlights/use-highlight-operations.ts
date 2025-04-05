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
	lesson: (lessonId: string) =>
		[...HIGHLIGHT_KEYS.all, lessonId] as const,
};

export const useHighlightOperations = (lessonId: string) => {
	const { data: session } = useSession();
	const queryClient = useQueryClient();

	// Get highlights query
	const { data, isLoading } = useQuery({
		queryKey: HIGHLIGHT_KEYS.lesson(lessonId),
		queryFn: () => highlightService.getHighlights(lessonId),
		enabled: !!session?.user,
	});

	// Extract highlights with default empty array
	const highlights = data?.highlights ?? [];

	// Batch update mutation
	const { mutate: batchUpdate, isPending: isUpdating } = useMutation({
		mutationFn: (newHighlights: HighlightItem[]) =>
			highlightService.batchUpdateHighlights({
				lessonId,
				highlights: newHighlights,
			}),
		onMutate: async (newHighlights) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({
				queryKey: HIGHLIGHT_KEYS.lesson(lessonId),
			});

			// Snapshot the previous value
			const previousData = queryClient.getQueryData<{
				highlights: HighlightItem[];
			}>(HIGHLIGHT_KEYS.lesson(lessonId));

			// Optimistically update the cache
			queryClient.setQueryData(HIGHLIGHT_KEYS.lesson(lessonId), {
				highlights: newHighlights,
			});

			return { previousData };
		},
		onError: (err, _, context) => {
			// Rollback on error
			if (context?.previousData) {
				queryClient.setQueryData(
					HIGHLIGHT_KEYS.lesson(lessonId),
					context.previousData
				);
			}
			toast.error('فشل حفظ التظليلات');
		},
		onSuccess: () => {
			// Invalidate to ensure cache is up to date
			queryClient.invalidateQueries({
				queryKey: HIGHLIGHT_KEYS.lesson(lessonId),
			});
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
	} = useHighlightHistory(highlights, (updatedHighlights) => {
		// Send all highlights in the batch update
		batchUpdate(updatedHighlights);
	});

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
