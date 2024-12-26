// hooks/use-keyboard-navigation.ts
import { useEffect, useCallback } from 'react';

interface NavigationOptions {
	scrollStep?: number;
	smooth?: boolean;
	scrollTargets?: string;
	onNavigate?: (direction: 'up' | 'down') => void;
	onHighlightNavigate?: (direction: 'prev' | 'next') => void;
}

export const useKeyboardNavigation = ({
	smooth = true,
	scrollTargets = 'h1, h2, h3, h4, p',
	onNavigate,
	onHighlightNavigate,
}: NavigationOptions = {}) => {
	const findTargetElement = useCallback(
		(direction: 'up' | 'down') => {
			const elements = Array.from(
				document.querySelectorAll(scrollTargets)
			);
			const buffer = 50;

			if (direction === 'down') {
				return elements.find((element) => {
					const rect = element.getBoundingClientRect();
					return rect.top > buffer;
				});
			} else {
				return elements.reverse().find((element) => {
					const rect = element.getBoundingClientRect();
					return rect.bottom < 0;
				});
			}
		},
		[scrollTargets]
	);

	const scrollToTarget = useCallback(
		(element: Element | null) => {
			if (!element) return;

			const offset = 20;
			const rect = element.getBoundingClientRect();
			const targetPosition = window.scrollY + rect.top - offset;

			window.scrollTo({
				top: targetPosition,
				behavior: smooth ? 'smooth' : 'auto',
			});
		},
		[smooth]
	);

	const handleKeyPress = useCallback(
		(event: KeyboardEvent) => {
			if (
				['INPUT', 'TEXTAREA'].includes(
					(event.target as HTMLElement)?.tagName
				)
			) {
				return;
			}

			let direction: 'up' | 'down' | null = null;

			switch (event.key.toLowerCase()) {
				// Content navigation
				case 'j':
				case 'arrowdown':
					if (!event.altKey) {
						direction = 'down';
						event.preventDefault();
						scrollToTarget(findTargetElement('down') ?? null);
					}
					break;

				case 'k':
				case 'arrowup':
					if (!event.altKey) {
						direction = 'up';
						event.preventDefault();
						scrollToTarget(findTargetElement('up') ?? null);
					}
					break;

				// Highlight navigation
				case 'n':
					if (event.altKey) {
						event.preventDefault();
						onHighlightNavigate?.('next');
					}
					break;

				case 'p':
					if (event.altKey) {
						event.preventDefault();
						onHighlightNavigate?.('prev');
					}
					break;

				case ' ':
					event.preventDefault();
					if (!event.shiftKey) {
						direction = 'down';
						window.scrollBy({
							top: window.innerHeight * 0.8,
							behavior: smooth ? 'smooth' : 'auto',
						});
					} else {
						direction = 'up';
						window.scrollBy({
							top: -window.innerHeight * 0.8,
							behavior: smooth ? 'smooth' : 'auto',
						});
					}
					break;

				case 'home':
					direction = 'up';
					event.preventDefault();
					window.scrollTo({
						top: 0,
						behavior: smooth ? 'smooth' : 'auto',
					});
					break;

				case 'end':
					direction = 'down';
					event.preventDefault();
					window.scrollTo({
						top: document.documentElement.scrollHeight,
						behavior: smooth ? 'smooth' : 'auto',
					});
					break;
			}

			if (direction && onNavigate) {
				onNavigate(direction);
			}
		},
		[
			findTargetElement,
			scrollToTarget,
			smooth,
			onNavigate,
			onHighlightNavigate,
		]
	);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, [handleKeyPress]);
};
