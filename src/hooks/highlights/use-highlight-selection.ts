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
}

/**
 * Hook to handle text selection for highlighting
 */
export const useHighlightSelection = ({
	isEnabled,
	containerRef,
	highlights,
	onAddHighlight,
}: UseHighlightSelectionProps) => {
	return useCallback(() => {
		if (!isEnabled) return;

		const selection = window.getSelection();
		if (!selection || selection.isCollapsed) return;

		const range = selection.getRangeAt(0);
		if (
			!range ||
			!containerRef.current?.contains(range.commonAncestorContainer)
		)
			return;

		// Get the selected text content
		const selectedText = range.toString().trim();
		if (!selectedText) return;

		// Find paragraph element containing the selection
		const paragraph =
			range.commonAncestorContainer.nodeType === Node.TEXT_NODE
				? range.commonAncestorContainer.parentElement?.closest(
						'[data-paragraph-index]'
				  )
				: range.commonAncestorContainer.closest(
						'[data-paragraph-index]'
				  );

		if (!paragraph) return;

		const elementId = paragraph.getAttribute('data-paragraph-index') || '0';

		// Check if selection is backwards (right to left)
		const isBackwards = detectBackwardsSelection(range);

		// Calculate real start and end offsets
		let startOffset, endOffset;

		if (isBackwards) {
			endOffset = getRealOffset(
				range.startContainer,
				range.startOffset,
				false,
				highlights
			);
			startOffset = getRealOffset(
				range.endContainer,
				range.endOffset,
				true,
				highlights
			);
		} else {
			startOffset = getRealOffset(
				range.startContainer,
				range.startOffset,
				true,
				highlights
			);
			endOffset = getRealOffset(
				range.endContainer,
				range.endOffset,
				false,
				highlights
			);
		}

		// No overlaps, add new highlight normally
		onAddHighlight({
			text: selectedText,
			startOffset,
			endOffset,
			elementId,
		});

		// Clear the selection
		selection.removeAllRanges();
	}, [isEnabled, containerRef, highlights, onAddHighlight]);
};
