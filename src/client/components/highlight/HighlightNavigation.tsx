// hooks/highlights/use-highlight-navigation.ts
import React from 'react';
import { HighlightItem } from '@/types/highlight';
import { groupBy } from 'lodash';

interface GroupedHighlight {
	groupId?: string;
	highlights: HighlightItem[];
	firstPosition: number; // Used for sorting
}

export const useHighlightNavigation = () => {
	// Get paragraph index as number for sorting
	const getParagraphIndex = (elementId: string): number => {
		return parseInt(elementId.replace('paragraph-', ''), 10) || 0;
	};

	// Get the earliest position in a group of highlights
	const getFirstPosition = (highlights: HighlightItem[]): number => {
		return Math.min(
			...highlights.map((h) => getParagraphIndex(h.elementId))
		);
	};

	// Sort highlights within a group by paragraph position
	const sortHighlightsInGroup = (
		highlights: HighlightItem[]
	): HighlightItem[] => {
		return [...highlights].sort((a, b) => {
			const aIndex = getParagraphIndex(a.elementId);
			const bIndex = getParagraphIndex(b.elementId);
			if (aIndex === bIndex) {
				// If in same paragraph, sort by start offset
				return a.startOffset - b.startOffset;
			}
			return aIndex - bIndex;
		});
	};

	// Get unique groups and standalone highlights, sorted by position
	const getNavigableHighlights = React.useCallback(
		(highlights: HighlightItem[]): GroupedHighlight[] => {
			// Group highlights by groupId (null groupId means standalone highlight)
			const grouped = groupBy(
				highlights,
				(h) => h.groupId || `single-${h.id}`
			);

			// Convert to GroupedHighlight array with position info
			const navigableHighlights: GroupedHighlight[] = Object.entries(
				grouped
			).map(([key, groupHighlights]) => {
				const sortedHighlights = sortHighlightsInGroup(groupHighlights);
				return {
					groupId: key.startsWith('single-') ? undefined : key,
					highlights: sortedHighlights,
					firstPosition: getFirstPosition(groupHighlights),
				};
			});

			// Sort groups and standalone highlights by their first position
			return navigableHighlights.sort((a, b) => {
				// First sort by paragraph position
				const positionDiff = a.firstPosition - b.firstPosition;
				if (positionDiff !== 0) return positionDiff;

				// If same paragraph, sort by start offset of first highlight
				return (
					a.highlights[0].startOffset - b.highlights[0].startOffset
				);
			});
		},
		[]
	);

	// Scroll to highlight(s) with visual feedback
	const scrollToHighlight = React.useCallback(
		(groupedHighlight: GroupedHighlight) => {
			const { highlights } = groupedHighlight;

			// Find first highlight and its element
			const firstHighlight = highlights[0];
			const firstElement = document.querySelector(
				`[data-paragraph-index="${firstHighlight.elementId}"]`
			);
			if (!firstElement) return;

			// Scroll to first highlight
			const firstMark = firstElement.querySelector(
				`mark[data-highlight="${firstHighlight.id}"]`
			) as HTMLElement;
			if (!firstMark) return;

			// Get the top offset for the scroll target
			const scrollOffset = Math.max(
				0,
				firstMark.getBoundingClientRect().top +
					window.pageYOffset -
					window.innerHeight / 3
			);

			// Smooth scroll to position
			window.scrollTo({
				top: scrollOffset,
				behavior: 'smooth',
			});

			// Apply visual effect to all highlights in the group
			highlights.forEach((highlight) => {
				const element = document.querySelector(
					`[data-paragraph-index="${highlight.elementId}"]`
				);
				if (!element) return;

				const mark = element.querySelector(
					`mark[data-highlight="${highlight.id}"]`
				) as HTMLElement;
				if (!mark) return;

				// Enhanced visual feedback
				mark.style.transition = 'all 0.3s ease';
				mark.style.filter = 'brightness(0.8)';
				mark.style.boxShadow =
					'0 0 0 2px var(--background), 0 0 0 4px var(--primary)';

				setTimeout(() => {
					mark.style.filter = '';
					mark.style.boxShadow = '';
				}, 1000);
			});
		},
		[]
	);

	return { scrollToHighlight, getNavigableHighlights };
};
