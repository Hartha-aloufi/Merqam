import { useCallback } from 'react';

export function useScrollToHighlight() {
	return useCallback((highlightId: string) => {
		// Find the highlight element
		const highlightElement = document.querySelector(
			`mark[data-highlight="${highlightId}"]`
		);
		if (!highlightElement) return;

		// Scroll into view with offset for header
		const top =
			highlightElement.getBoundingClientRect().top +
			window.pageYOffset -
			200;
		window.scrollTo({
			top,
			behavior: 'instant',
		});

		// Add visual feedback
		const originalBackground = (highlightElement as HTMLElement).style.backgroundColor;
		const originalTransition = (highlightElement as HTMLElement).style.transition;

		// Add flash effect
		(highlightElement as HTMLElement).style.transition = 'background-color 0.5s ease';
		(highlightElement as HTMLElement).style.backgroundColor = 'var(--background)';

		// Reset after animation
		setTimeout(() => {
			(highlightElement as HTMLElement).style.backgroundColor = originalBackground;
			setTimeout(() => {
				(highlightElement as HTMLElement).style.transition = originalTransition;
			}, 500);
		}, 100);
	}, []);
}
