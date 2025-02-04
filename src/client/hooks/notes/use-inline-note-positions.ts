import { useCallback } from 'react';

const MARGIN = 20;

/**
 * In case we have notes to view, we can maximize the space in the viewport by translating the whole content to the left.
 * This function calculates the translation value based on the viewport width.
 * in case there is no need to translate, it returns -1.
 * How we calculate min and max viewPortWidth:
 * content = 768px
 * inlineNote = 300px
 * paddings = 24px * 2px
 * playerPadding = 56px
 * total (minViewPort)= 1172px
 * @param viewPortWidth 
 * @returns 
 */
export function calcTranslationValue(viewPortWidth) {
	const minViewPortWidth = 1172,
		maxViewPortWidth = 1512;
	const minTrans = 0,
		maxTrans = 172;

	if (viewPortWidth >= maxViewPortWidth || viewPortWidth < 1172) return -1;
	
  // map the range 1172 - 1512 to 172 - 0
	const translateX = (
		maxTrans -
		((viewPortWidth - minViewPortWidth) * (maxTrans - minTrans)) /
			(maxViewPortWidth - minViewPortWidth)
	);

	// convert to integer
	return Math.round(translateX);
}

/**
 * Hook to manage inline note positions relative to their highlights
 */
export function useInlineNotePositions() {
	const getNotePosition = useCallback(
		(
			highlightId: string,
			prevNoteCard?: { top: number; height: number }
		): number | null => {
			const highlightEl = document.querySelector(
				`mark[data-highlight="${highlightId}"]`
			) as HTMLElement;

			if (!highlightEl) return null;

			// Get highlight position
			const { top } = highlightEl.getBoundingClientRect();

			// Add scroll offset and some margin
			const initialPos = Math.max(0, top + window.scrollY - MARGIN);
			let minTop = initialPos;

			if (prevNoteCard) {
				minTop = prevNoteCard.top + prevNoteCard.height + MARGIN;
			}

			return Math.max(minTop, initialPos);
		},
		[]
	);

	return { getNotePosition };
}
