// components/highlight/HighlightNavigation.tsx
import React from 'react';
import { TextHighlight } from '@/types/highlight';

// Hook for smooth scrolling to highlights
export const useHighlightNavigation = () => {
	const scrollToHighlight = React.useCallback((highlight: TextHighlight) => {
		const element = document.querySelector(
			`[data-paragraph-index="${highlight.elementId}"]`
		);
		if (!element) return;

		const mark = element.querySelector(
			`mark[data-highlight="${highlight.id}"]`
		) as HTMLElement;
		if (!mark) return;

		mark.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
		});

		// Visual feedback
		mark.style.transition = 'filter 0.3s ease';
		mark.style.filter = 'brightness(0.8)';
		setTimeout(() => {
			mark.style.filter = '';
		}, 500);
	}, []);

	return { scrollToHighlight };
};
