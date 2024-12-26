import { useCallback } from 'react';
import { TextHighlight } from '@/types/highlight';
import { getRealOffset, detectBackwardsSelection } from '@/lib/highlight-utils';

interface UseHighlightSelectionProps {
  isEnabled: boolean;
  containerRef: React.RefObject<HTMLElement>;
  highlights: TextHighlight[];
  onAddHighlight: (info: HighlightRange | HighlightRange[]) => void;
}

export interface HighlightRange {
	elementId: string;
	startOffset: number;
	endOffset: number;
	text: string;
}

/**
 * Gets all paragraphs between and including the start and end paragraphs
 * Uses a DOM tree walker to find all paragraphs in document order
 */
const getAllParagraphsInRange = (
  startParagraph: Element,
  endParagraph: Element
): Element[] => {
  const range = document.createRange();
  range.setStartBefore(startParagraph);
  range.setEndAfter(endParagraph);
  const commonAncestor = range.commonAncestorContainer as Element;

  const treeWalker = document.createTreeWalker(
    commonAncestor,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node: Node) => {
        if ((node as Element).hasAttribute('data-paragraph-index')) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_SKIP;
      }
    }
  );

  const paragraphs: Element[] = [];
  let inRange = false;
  let current = treeWalker.currentNode;

  while (current) {
    if (current === startParagraph) {
      inRange = true;
    }

    if (inRange && (current as Element).hasAttribute('data-paragraph-index')) {
      paragraphs.push(current as Element);
    }

    if (current === endParagraph) {
      break;
    }

    current = treeWalker.nextNode() as Element;
  }

  return paragraphs;
};

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
		if (!containerRef.current?.contains(range.commonAncestorContainer))
			return;

		// Find start and end paragraphs
		const startParagraph =
			range.startContainer.nodeType === Node.TEXT_NODE
				? range.startContainer.parentElement?.closest(
						'[data-paragraph-index]'
				  )
				: (range.startContainer as Element).closest(
						'[data-paragraph-index]'
				  );

		const endParagraph =
			range.endContainer.nodeType === Node.TEXT_NODE
				? range.endContainer.parentElement?.closest(
						'[data-paragraph-index]'
				  )
				: (range.endContainer as Element).closest(
						'[data-paragraph-index]'
				  );

		if (!startParagraph || !endParagraph) return;

		// Handle single paragraph case
		if (startParagraph === endParagraph) {
			const elementId =
				startParagraph.getAttribute('data-paragraph-index') || '0';
			const selectedText = range.toString().trim();
			if (!selectedText) return;

			onAddHighlight({
				text: selectedText,
				startOffset: getRealOffset(
					range.startContainer,
					range.startOffset,
					true,
					highlights
				),
				endOffset: getRealOffset(
					range.endContainer,
					range.endOffset,
					false,
					highlights
				),
				elementId,
			});

			selection.removeAllRanges();
			return;
		}

		// Get all paragraphs in the selection order
		const isBackwards = detectBackwardsSelection(range);
		const [firstPara, lastPara] = isBackwards
			? [endParagraph, startParagraph]
			: [startParagraph, endParagraph];

		const orderedParagraphs = getAllParagraphsInRange(firstPara, lastPara);

		// Create highlight ranges for each paragraph
		const highlightRanges = orderedParagraphs
			.map((paragraph, index) => {
				const elementId =
					paragraph.getAttribute('data-paragraph-index') || '0';
				const isFirst = index === 0;
				const isLast = index === orderedParagraphs.length - 1;

				const paragraphRange = document.createRange();

				if (isFirst) {
					const startNode = isBackwards
						? range.endContainer
						: range.startContainer;
					const startOffset = isBackwards
						? range.endOffset
						: range.startOffset;
					paragraphRange.setStart(startNode, startOffset);
					paragraphRange.setEnd(
						paragraph,
						paragraph.childNodes.length
					);
				} else if (isLast) {
					const endNode = isBackwards
						? range.startContainer
						: range.endContainer;
					const endOffset = isBackwards
						? range.startOffset
						: range.endOffset;
					paragraphRange.setStart(paragraph, 0);
					paragraphRange.setEnd(endNode, endOffset);
				} else {
					paragraphRange.selectNodeContents(paragraph);
				}

				const text = paragraphRange.toString().trim();
				if (!text) return null;

				const startOffset = isFirst
					? getRealOffset(
							isBackwards
								? range.endContainer
								: range.startContainer,
							isBackwards ? range.endOffset : range.startOffset,
							true,
							highlights
					  )
					: 0;

				const endOffset = isLast
					? getRealOffset(
							isBackwards
								? range.startContainer
								: range.endContainer,
							isBackwards ? range.startOffset : range.endOffset,
							false,
							highlights
					  )
					: paragraph.textContent?.length || 0;

				return {
					elementId,
					startOffset,
					endOffset,
					text,
				} as HighlightRange;
			})
			.filter((range): range is HighlightRange => range !== null);

		if (highlightRanges.length > 0) {
			onAddHighlight(highlightRanges);
		}

		// Clear selection
		selection.removeAllRanges();
	}, [isEnabled, containerRef, highlights, onAddHighlight]);
};