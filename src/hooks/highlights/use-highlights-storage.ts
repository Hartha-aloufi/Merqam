//hooks/highlights/use-highlight-storage.ts
import { useCallback } from 'react';
import { TextHighlight } from '@/types/highlight';
import { useSession } from '@/hooks/use-auth-query';
import {
    useLessonHighlights,
    useCreateHighlight,
    useDeleteHighlight
} from './use-highlight-sync';
import { HighlightColorKey } from '@/constants/highlights';

/**
 * Hook to manage highlights for authenticated users
 */
export const useHighlightStorage = (
    topicId: string,
    lessonId: string,
    activeColor: HighlightColorKey
) => {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.data.session;

    // Supabase queries and mutations with optimistic updates
    const { data: highlights = [], isLoading: isLoadingHighlights } = useLessonHighlights(topicId, lessonId);
    const { mutate: createHighlight, isPending: isCreating } = useCreateHighlight();
    const { mutate: deleteHighlight, isPending: isDeleting } = useDeleteHighlight();

    // Add new highlight
    const addHighlight = useCallback(async (info: {
        text: string, // We receive the text but don't store it
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

    // Format highlights for rendering
    const formattedHighlights: TextHighlight[] = highlights.map(h => {
        // Get the text content from the DOM based on offsets
        const element = document.querySelector(`[data-paragraph-index="${h.element_id}"]`);
        const text = element?.textContent?.slice(h.start_offset, h.end_offset) || '';

        return {
            id: h.id,
            text,
            startOffset: h.start_offset,
            endOffset: h.end_offset,
            elementId: h.element_id,
            color: h.color as HighlightColorKey,
            createdAt: h.created_at
        };
    });

    // Combine all loading states
    const isLoading = isLoadingHighlights || isCreating || isDeleting;

    return {
        highlights: formattedHighlights,
        isLoading,
        addHighlight,
        removeHighlight,
        clearHighlights: useCallback(async () => {
            if (!isAuthenticated) {
                throw new Error('User must be authenticated to clear highlights');
            }
            // Delete all highlights for this lesson
            await Promise.all(formattedHighlights.map(h => deleteHighlight(h.id)));
        }, [isAuthenticated, deleteHighlight, formattedHighlights])
    };
};