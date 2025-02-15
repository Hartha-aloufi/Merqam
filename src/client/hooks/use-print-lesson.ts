import { useCallback, useState } from 'react';

interface PrintLessonOptions {
	title: string;
}

export const usePrintLesson = ({ title }: PrintLessonOptions) => {
	const [printing, setPrinting] = useState(false);
	const togglePrinting = useCallback(() => setPrinting((prev) => !prev), []);

	const print = useCallback(() => {
		// Store current title
		const originalTitle = document.title;

		// Set print-specific title
		const beforePrintHandler = () => {
			document.title = title;
		};

		// Restore original title
		const afterPrintHandler = () => {
			document.title = originalTitle;
			// Reset printing state
			togglePrinting();
		};

		// Add event listeners
		window.addEventListener('beforeprint', beforePrintHandler);
		window.addEventListener('afterprint', afterPrintHandler);

		// Trigger print
		window.print();

		// Cleanup
		window.removeEventListener('beforeprint', beforePrintHandler);
		window.removeEventListener('afterprint', afterPrintHandler);
	}, [title]);

	return { print, printing, togglePrinting };
};
