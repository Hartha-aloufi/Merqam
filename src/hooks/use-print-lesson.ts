import { useCallback } from 'react';

interface PrintLessonOptions {
    title: string;
}

export const usePrintLesson = ({ title }: PrintLessonOptions) => {
    return useCallback(() => {
        // Store current title
        const originalTitle = document.title;

        // Set print-specific title
        const beforePrintHandler = () => {
            document.title = title;
        };

        // Restore original title
        const afterPrintHandler = () => {
            document.title = originalTitle;
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
};