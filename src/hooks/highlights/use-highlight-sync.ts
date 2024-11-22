// hooks/highlights/use-highlight-sync.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { highlightService, type HighlightRow, type CreateHighlightDto } from '@/services/highlight.service';
import { useSession } from '@/hooks/use-auth-query';
import { toast } from 'sonner';

// Query key factory for type-safe query keys
export const HIGHLIGHT_KEYS = {
    all: ['highlights'] as const,
    lesson: (topicId: string, lessonId: string) =>
        [...HIGHLIGHT_KEYS.all, topicId, lessonId] as const,
    detail: (id: string) =>
        [...HIGHLIGHT_KEYS.all, id] as const
};

/**
 * Hook to fetch highlights for a specific lesson
 */
export const useLessonHighlights = (topicId: string, lessonId: string) => {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.data.session;

    return useQuery({
        queryKey: HIGHLIGHT_KEYS.lesson(topicId, lessonId),
        queryFn: () => highlightService.getHighlights(topicId, lessonId),
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    });
};

/**
 * Hook to create a new highlight with optimistic updates
 */
export const useCreateHighlight = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: highlightService.createHighlight,
        onMutate: async (newHighlight: CreateHighlightDto) => {
            await queryClient.cancelQueries({
                queryKey: HIGHLIGHT_KEYS.lesson(newHighlight.topic_id, newHighlight.lesson_id)
            });

            const previousHighlights = queryClient.getQueryData<HighlightRow[]>(
                HIGHLIGHT_KEYS.lesson(newHighlight.topic_id, newHighlight.lesson_id)
            );

            queryClient.setQueryData<HighlightRow[]>(
                HIGHLIGHT_KEYS.lesson(newHighlight.topic_id, newHighlight.lesson_id),
                old => {
                    const optimisticHighlight: HighlightRow = {
                        ...newHighlight,
                        id: 'temp-' + new Date().getTime(),
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        user_id: 'temp',
                    };

                    return [...(old || []), optimisticHighlight];
                }
            );

            return { previousHighlights };
        },
        onSuccess: () => {
            toast.success('تم حفظ التظليل');
        },
        onError: (err, newHighlight, context) => {
            if (context?.previousHighlights) {
                queryClient.setQueryData(
                    HIGHLIGHT_KEYS.lesson(newHighlight.topic_id, newHighlight.lesson_id),
                    context.previousHighlights
                );
            }
            toast.error('فشل حفظ التظليل');
        },
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({
                queryKey: HIGHLIGHT_KEYS.lesson(variables.topic_id, variables.lesson_id)
            });
        },
    });
};

interface DeleteHighlightContext {
    previousHighlights: HighlightRow[] | undefined;
    highlight: HighlightRow;
}

/**
 * Hook to delete a highlight with optimistic updates
 */
export const useDeleteHighlight = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: highlightService.deleteHighlight,
        onMutate: async (highlightId: string) => {
            // Find the highlight in the cache
            const highlight = queryClient
                .getQueriesData<HighlightRow[]>({ queryKey: HIGHLIGHT_KEYS.all })
                .flatMap(([, data]) => data || [])
                .find(h => h?.id === highlightId);

            if (!highlight) {
                throw new Error('Highlight not found');
            }

            await queryClient.cancelQueries({
                queryKey: HIGHLIGHT_KEYS.lesson(highlight.topic_id, highlight.lesson_id)
            });

            const previousHighlights = queryClient.getQueryData<HighlightRow[]>(
                HIGHLIGHT_KEYS.lesson(highlight.topic_id, highlight.lesson_id)
            );

            queryClient.setQueryData<HighlightRow[]>(
                HIGHLIGHT_KEYS.lesson(highlight.topic_id, highlight.lesson_id),
                old => old?.filter(h => h.id !== highlightId) || []
            );

            return { previousHighlights, highlight };
        },
        onSuccess: () => {
            toast.success('تم حذف التظليل');
        },
        onError: (err, _, context) => {
            if (context?.previousHighlights && context?.highlight) {
                queryClient.setQueryData(
                    HIGHLIGHT_KEYS.lesson(context.highlight.topic_id, context.highlight.lesson_id),
                    context.previousHighlights
                );
            }
            toast.error('فشل حذف التظليل');
        },
    });
};

/**
 * Hook to delete multiple highlights
 */
export const useDeleteHighlights = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: highlightService.deleteHighlights,
        onSuccess: () => {
            // Invalidate all highlight queries
            queryClient.invalidateQueries({
                queryKey: HIGHLIGHT_KEYS.all,
            });
            toast.success('تم حذف التظليلات');
        },
        onError: () => {
            toast.error('فشل حذف التظليلات');
        },
    });
};