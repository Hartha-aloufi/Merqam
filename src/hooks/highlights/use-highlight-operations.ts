// src/hooks/highlights/use-highlight-operations.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { highlightService } from '@/services/highlight.service';
import { useSession } from '@/hooks/use-auth-query';
import { toast } from 'sonner';
import type { BatchUpdateHighlightsDto, HighlightItem, TextHighlight } from '@/types/highlight';
import { HighlightColorKey } from '@/constants/highlights';
import React, { useMemo } from 'react';
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
// hooks/highlights/use-highlight-operations.ts
export const useHighlightOperations = (topicId: string, lessonId: string) => {
  const { data: highlights = [], isLoading } = useLessonHighlights(topicId, lessonId);
  const { mutate: batchUpdate, isPending: isUpdating } = useBatchUpdateHighlights();

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

  // Batch add multiple highlights as a group
  const batchAddHighlights = React.useCallback(
    (newHighlights: Omit<HighlightItem, 'id' | 'createdAt' | 'updatedAt' | 'groupId'>[]) => {
      const now = new Date().toISOString();
      const groupId = crypto.randomUUID();
      
      const highlightsToAdd = newHighlights.map(highlight => ({
        ...highlight,
        id: crypto.randomUUID(),
        groupId, // Same groupId for all highlights in batch
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

  // Remove highlight(s) - now handles groups
  const removeHighlight = React.useCallback(
    (highlightId: string) => {
      const highlightToRemove = highlights.find(h => h.id === highlightId);
      if (!highlightToRemove) return;

      // If highlight is part of a group, remove all highlights in the group
      const highlightsToRemove = highlightToRemove.groupId
        ? highlights.filter(h => h.groupId === highlightToRemove.groupId)
        : [highlightToRemove];

      const remainingHighlights = highlights.filter(
        h => !highlightsToRemove.some(hr => hr.id === h.id)
      );

      batchUpdate({
        topicId,
        lessonId,
        highlights: remainingHighlights,
      });
    },
    [highlights, batchUpdate, topicId, lessonId]
  );

  // Update highlight color - now handles groups
  const updateHighlightColor = React.useCallback(
    (highlightId: string, color: HighlightColorKey) => {
      const highlightToUpdate = highlights.find(h => h.id === highlightId);
      if (!highlightToUpdate) return;

      const updatedHighlights = highlights.map(h => {
        // Update all highlights in the same group
        if (highlightToUpdate.groupId && h.groupId === highlightToUpdate.groupId) {
          return { ...h, color, updatedAt: new Date().toISOString() };
        }
        // Or just update the single highlight
        if (h.id === highlightId) {
          return { ...h, color, updatedAt: new Date().toISOString() };
        }
        return h;
      });

      batchUpdate({
        topicId,
        lessonId,
        highlights: updatedHighlights,
      });
    },
    [highlights, batchUpdate, topicId, lessonId]
  );

  // Process highlights to add group metadata
  const processedHighlights = useMemo(() => {
    const groupedHighlights = new Map<string, TextHighlight[]>();
    
    // First pass: organize highlights by group
    highlights.forEach(h => {
      if (h.groupId) {
        const group = groupedHighlights.get(h.groupId) || [];
        group.push({
          ...h,
          isGrouped: true,
        });
        groupedHighlights.set(h.groupId, group);
      }
    });

    // Second pass: mark first/last in groups and return all highlights
    return highlights.map(h => {
      if (!h.groupId) return h;

      const group = groupedHighlights.get(h.groupId);
      if (!group) return h;

      const index = group.findIndex(gh => gh.id === h.id);
      return {
        ...h,
        isGrouped: true,
        isFirstInGroup: index === 0,
        isLastInGroup: index === group.length - 1,
      };
    });
  }, [highlights]);

  return {
    highlights: processedHighlights,
    isLoading: isLoading || isUpdating,
    addHighlight,
    batchAddHighlights,
    removeHighlight,
    updateHighlightColor,
  };
};