// src/client/hooks/highlights/use-selection-color.ts
import { useEffect, useRef, useMemo, useCallback } from 'react';
import { HighlightColorKey, getHighlightColor } from '@/constants/highlights';

interface UseSelectionColorProps {
	isEnabled: boolean;
	activeColor: HighlightColorKey;
	containerRef: React.RefObject<HTMLElement>;
	excludeSelectors?: string;
}

interface UseSelectionColorResult {
	cleanup: () => void;
}

export function useSelectionColor({
	isEnabled,
	activeColor,
	containerRef,
	excludeSelectors = 'h1, h2, h3, h4, .header, .title, .exclude-highlight-selection',
}: UseSelectionColorProps): UseSelectionColorResult {
	const styleRef = useRef<HTMLStyleElement | null>(null);
	const containerIdRef = useRef<string | null>(null);

	const excludeSelectorsArray = useMemo(
		() => excludeSelectors.split(',').map((s) => s.trim()),
		[excludeSelectors]
	);

	const generateExcludeCSS = useCallback(
		(containerId: string) => {
			const standardSelectors = excludeSelectorsArray
				.map((selector) => `#${containerId} ${selector} ::selection`)
				.join(',\n');

			const mozSelectors = excludeSelectorsArray
				.map(
					(selector) => `#${containerId} ${selector} ::-moz-selection`
				)
				.join(',\n');

			return `
      ${standardSelectors} {
        background-color: var(--selection-background, #2563eb) !important;
        color: var(--selection-text, white) !important;
      }
      
      ${mozSelectors} {
        background-color: var(--selection-background, #2563eb) !important;
        color: var(--selection-text, white) !important;
      }
    `;
		},
		[excludeSelectorsArray]
	);

	const cleanup = useCallback(() => {
		if (styleRef.current && document.head.contains(styleRef.current)) {
			document.head.removeChild(styleRef.current);
			styleRef.current = null;
		}
	}, []);

	/**
	 * Effect to handle style injection and cleanup
	 * - Injects custom selection styles when highlighting is enabled
	 * - Ensures styles are properly scoped to the container
	 * - Cleans up styles when component unmounts or dependencies change
	 */
	useEffect(() => {
		cleanup();

		if (isEnabled && containerRef.current) {
			const container = containerRef.current;

			let containerId = container.id;
			if (!containerId) {
				containerId = `highlight-container-${Math.random()
					.toString(36)
					.substring(2, 9)}`;
				container.id = containerId;
			}
			containerIdRef.current = containerId;

			const backgroundColor = getHighlightColor(activeColor);

			const styleEl = document.createElement('style');
			styleEl.id = 'highlight-selection-style';
			styleRef.current = styleEl;

			styleEl.textContent = `
        /* Main selection styles */
        #${containerId} ::selection {
          background-color: ${backgroundColor} !important;
          opacity: 0.7 !important;
        }
        
        #${containerId} ::-moz-selection {
          background-color: ${backgroundColor} !important;
          opacity: 0.7 !important;
        }
        
        ${generateExcludeCSS(containerId)}
      `;

			document.head.appendChild(styleEl);
		}

		return cleanup;
	}, [isEnabled, activeColor, containerRef, cleanup, generateExcludeCSS]);

	return { cleanup };
}
