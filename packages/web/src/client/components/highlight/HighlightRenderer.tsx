// components/highlight/HighlightRenderer.tsx
import React, { useEffect } from 'react';
import { TextHighlight } from '@/types/highlight';
import { processHighlights } from '@/client/lib/highlight-utils';
import { getHighlightColor } from '@/constants/highlights';
import { useHighlightPopover } from './HighlightPopover';

interface HighlightRendererProps {
	containerRef: React.RefObject<HTMLElement>;
	highlights: TextHighlight[];
	onRemoveHighlight: (id: string) => void;
}

export const HighlightRenderer = React.memo(function HighlightRenderer({
	containerRef,
	highlights,
}: HighlightRendererProps) {
	const { showPopover } = useHighlightPopover();

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		// Add CSS for group hover effects
		const style = document.createElement('style');
		style.textContent = `
      mark[data-highlight] {
        transition: all 0.2s ease;
      }
      
      /* Individual highlight hover */
      mark[data-highlight]:hover {
        filter: brightness(0.9);
      }
      
      /* Group hover effect */
      [data-highlight-group-hover] mark[data-group] {
        filter: brightness(0.9);
      }
    `;
		document.head.appendChild(style);

		// Group highlights by element ID
		const highlightsByElement = highlights.reduce((acc, highlight) => {
			acc[highlight.elementId] = [
				...(acc[highlight.elementId] || []),
				highlight,
			];
			return acc;
		}, {} as Record<string, TextHighlight[]>);

		// Process each element's highlights
		Object.entries(highlightsByElement).forEach(
			([elementId, elementHighlights]) => {
				const element = container.querySelector(
					`[data-paragraph-index="${elementId}"]`
				);
				if (!element) return;

				// Clear existing highlights
				const existingMarks = element.querySelectorAll(
					'mark[data-highlight]'
				);
				existingMarks.forEach((mark) => {
					mark.replaceWith(
						document.createTextNode(mark.textContent || '')
					);
				});

				// Normalize text nodes
				element.normalize();

				// Process and sort highlights to handle overlaps
				const processedHighlights =
					processHighlights(elementHighlights);

				// Apply highlights
				processedHighlights.forEach((highlight) => {
					try {
						// Get all text nodes
						const textNodes: Node[] = [];
						const walker = document.createTreeWalker(
							element,
							NodeFilter.SHOW_TEXT,
							null
						);

						let node: Node | null = walker.nextNode();
						while (node) {
							textNodes.push(node);
							node = walker.nextNode();
						}

						let currentOffset = 0;
						for (const textNode of textNodes) {
							const nodeLength =
								textNode.textContent?.length || 0;
							const nodeEndOffset = currentOffset + nodeLength;

							if (
								currentOffset <= highlight.startOffset &&
								highlight.startOffset < nodeEndOffset
							) {
								const range = document.createRange();
								const relativeStart =
									highlight.startOffset - currentOffset;
								const relativeEnd = Math.min(
									nodeLength,
									highlight.endOffset - currentOffset
								);

								range.setStart(textNode, relativeStart);
								range.setEnd(textNode, relativeEnd);

								const mark = document.createElement('mark');
								mark.setAttribute(
									'data-highlight',
									highlight.id
								);

								if (highlight.groupId) {
									mark.setAttribute(
										'data-group',
										highlight.groupId
									);
								}

								// Apply styles
								mark.style.backgroundColor = getHighlightColor(
									highlight.color
								);
								mark.style.borderRadius =
									getBorderRadius(highlight);
								mark.style.cursor = 'pointer';

								// Add group hover handlers
								if (highlight.groupId) {
									mark.addEventListener('mouseenter', () => {
										// Add hover state to all paragraphs containing this group
										const paragraphs =
											container.querySelectorAll(
												'[data-paragraph-index]'
											);
										paragraphs.forEach((para) => {
											if (
												para.querySelector(
													`mark[data-group="${highlight.groupId}"]`
												)
											) {
												para.setAttribute(
													'data-highlight-group-hover',
													highlight.groupId
												);
											}
										});
									});

									mark.addEventListener('mouseleave', () => {
										// Remove hover state from all paragraphs
										const paragraphs =
											container.querySelectorAll(
												`[data-highlight-group-hover="${highlight.groupId}"]`
											);
										paragraphs.forEach((para) => {
											para.removeAttribute(
												'data-highlight-group-hover'
											);
										});
									});
								}

								// Handle click events
								mark.addEventListener('click', (e) => {
									e.preventDefault();
									e.stopPropagation();

									const currentHighlight = highlights.find(
										(h) => h.id === highlight.id
									);
									if (currentHighlight) {
										showPopover(currentHighlight, {
											getBoundingClientRect: () =>
												mark.getBoundingClientRect(),
											contextElement: mark,
										});
									}
								});

								range.surroundContents(mark);
								break;
							}

							currentOffset = nodeEndOffset;
						}
					} catch (error) {
						console.error(
							'Error applying highlight:',
							error,
							highlight
						);
					}
				});
			}
		);

		// Cleanup on unmount
		return () => {
			document.head.removeChild(style);
			const allMarks = container.querySelectorAll('mark[data-highlight]');
			allMarks.forEach((mark) => {
				mark.removeEventListener('mouseenter', () => {});
				mark.removeEventListener('mouseleave', () => {});
				mark.removeEventListener('click', () => {});
				mark.replaceWith(
					document.createTextNode(mark.textContent || '')
				);
			});
		};
	}, [containerRef, highlights, showPopover]);

	return null;
});

// Helper function to get border radius based on highlight position in group
function getBorderRadius(highlight: TextHighlight): string {
	if (!highlight.isGrouped) return '2px';

	if (highlight.isFirstInGroup && highlight.isLastInGroup) return '2px';
	if (highlight.isFirstInGroup) return '2px 2px 0 0';
	if (highlight.isLastInGroup) return '0 0 2px 2px';
	return '0';
}
