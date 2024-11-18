import { useCallback } from 'react';
import { TextHighlight } from '@/types/highlight';
import { getRealOffset, detectBackwardsSelection } from '@/lib/highlight-utils';

interface UseHighlightSelectionProps {
    isEnabled: boolean;
    containerRef: React.RefObject<HTMLElement>;
    highlights: TextHighlight[];
    onAddHighlight: (info: {
        text: string;
        startOffset: number;
        endOffset: number;
        elementId: string;
    }) => void;
    onRemoveHighlights: (ids: string[]) => void;
}

/**
 * Hook to handle text selection for highlighting
 */
export const useHighlightSelection = ({
    isEnabled,
    containerRef,
    highlights,
    onAddHighlight,
    onRemoveHighlights,
}: UseHighlightSelectionProps) => {
    return useCallback(() => {
        if (!isEnabled) return;

        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) return;

        const range = selection.getRangeAt(0);
        if (!range || !containerRef.current?.contains(range.commonAncestorContainer)) return;

        // Get the selected text content
        const selectedText = range.toString().trim();
        if (!selectedText) return;

        // Find paragraph element containing the selection
        const paragraph = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
            ? range.commonAncestorContainer.parentElement?.closest('[data-paragraph-index]')
            : range.commonAncestorContainer.closest('[data-paragraph-index]');

        if (!paragraph) return;

        const elementId = paragraph.getAttribute('data-paragraph-index') || '0';

        // Check if selection is backwards (right to left)
        const isBackwards = detectBackwardsSelection(range);

        // Calculate real start and end offsets
        let startOffset, endOffset;

        if (isBackwards) {
            endOffset = getRealOffset(range.startContainer, range.startOffset, false, highlights);
            startOffset = getRealOffset(range.endContainer, range.endOffset, true, highlights);
        } else {
            startOffset = getRealOffset(range.startContainer, range.startOffset, true, highlights);
            endOffset = getRealOffset(range.endContainer, range.endOffset, false, highlights);
        }

        // Find all highlights in this paragraph that interact with the new selection
        const existingHighlights = highlights.filter(h =>
            h.elementId === elementId && !(h.endOffset <= startOffset || h.startOffset >= endOffset)
        ).sort((a, b) => a.startOffset - b.startOffset);

        if (existingHighlights.length > 0) {
            // Handle expansion of existing highlight(s)
            const firstHighlight = existingHighlights[0];
            const lastHighlight = existingHighlights[existingHighlights.length - 1];

            // Create a new highlight that spans from the earliest start to the latest end
            const newStartOffset = Math.min(startOffset, firstHighlight.startOffset);
            const newEndOffset = Math.max(endOffset, lastHighlight.endOffset);

            // Remove all overlapping highlights
            onRemoveHighlights(existingHighlights.map(h => h.id));

            // Add the expanded highlight
            onAddHighlight({
                text: selectedText,
                startOffset: newStartOffset,
                endOffset: newEndOffset,
                elementId
            });
        } else {
            // No overlaps, add new highlight normally
            onAddHighlight({
                text: selectedText,
                startOffset,
                endOffset,
                elementId
            });
        }

        // Clear the selection
        selection.removeAllRanges();
    }, [isEnabled, containerRef, highlights, onAddHighlight, onRemoveHighlights]);
};