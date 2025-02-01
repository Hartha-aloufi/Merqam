import { useCallback } from 'react';

const MARGIN = 20;

/**
 * Hook to manage inline note positions relative to their highlights
 */
export function useInlineNotePositions() {
	const getNotePosition = useCallback(
		(highlightId: string, prevNoteCard?: {top: number, height: number}): number | null => {
			const highlightEl = document.querySelector(
				`mark[data-highlight="${highlightId}"]`
			) as HTMLElement;

			if (!highlightEl) return null;

			// Get highlight position
			const { top } = highlightEl.getBoundingClientRect();

			// Add scroll offset and some margin
			const initialPos = Math.max(0, top + window.scrollY - MARGIN);
      let minTop = initialPos;
      
      if(prevNoteCard) { 
        minTop = prevNoteCard.top + prevNoteCard.height + MARGIN;
      }

      return Math.max(minTop, initialPos);
		},
		[]
	);

	return { getNotePosition };
}
