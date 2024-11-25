import { useCallback } from 'react';
import { TextHighlight } from "@/types/highlight";
import { useSession } from '@/hooks/use-auth-query';
import {
    useLessonHighlights,
    useCreateHighlight,
    useDeleteHighlight,
    useUpdateHighlight
} from './use-highlight-sync';
import { HighlightColorKey } from '@/constants/highlights';

/**
 * Hook to manage highlights for authenticated users with update support
 */
export const useHighlightStorage = (
    topicId: string,
    lessonId: string,
    activeColor: HighlightColorKey
) => {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.data.session;

    // Supabase queries and mutations
    const { data: highlights = [], isLoading: isLoadingHighlights } = useLessonHighlights(topicId, lessonId);
    const { mutate: createHighlight, isPending: isCreating } = useCreateHighlight();
    const { mutate: deleteHighlight, isPending: isDeleting } = useDeleteHighlight();
    const { mutate: updateHighlight, isPending: isUpdating } = useUpdateHighlight();

    // Add new highlight
    const addHighlight = useCallback(async (info: {
        text: string,
        startOffset: number;
        endOffset: number;
        elementId: string;
    }) => {
        if (!isAuthenticated) {
            throw new Error('User must be authenticated to create highlights');
        }

        createHighlight({
            topic_id: topicId,
            lesson_id: lessonId,
            start_offset: info.startOffset,
            end_offset: info.endOffset,
            element_id: info.elementId,
            color: activeColor
        });
    }, [isAuthenticated, createHighlight, topicId, lessonId, activeColor]);

    // Remove highlight
    const removeHighlight = useCallback(async (id: string) => {
        if (!isAuthenticated) {
            throw new Error('User must be authenticated to delete highlights');
        }

        deleteHighlight(id);
    }, [isAuthenticated, deleteHighlight]);

    // Update highlight
    const updateHighlightOptions = useCallback(async (id: string, options: { color: HighlightColorKey }) => {
        if (!isAuthenticated) {
            throw new Error('User must be authenticated to update highlights');
        }

        updateHighlight({ id, ...options });
    }, [isAuthenticated, updateHighlight]);

    // Format highlights for rendering
    const formattedHighlights: TextHighlight[] = highlights.map(h => ({
        id: h.id,
        text: '', // Will be populated from DOM
        startOffset: h.start_offset,
        endOffset: h.end_offset,
        elementId: h.element_id,
        color: h.color as HighlightColorKey,
        createdAt: h.created_at
    }));

    return {
        highlights: formattedHighlights,
        isLoading: isLoadingHighlights || isCreating || isDeleting || isUpdating,
        addHighlight,
        removeHighlight,
        updateHighlight: updateHighlightOptions,
    };
};