// hooks/use-paragraph-tracking.ts
'use client';

import { useCallback, useRef } from 'react';
import { getLatestReadParagraph, useReadingProgressSync } from './use-reading-progress-sync';

export function useParagraphTracking(topicId: string, lessonId: string) {
    const progress = useReadingProgressSync(topicId, lessonId);

    const observerRef = useRef<IntersectionObserver | null>(null);

    const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const paragraph = entry.target as HTMLElement;
                const index = parseInt(paragraph.dataset.paragraphIndex || '0', 10);

                progress.update(index);
            }
        });
    }, [progress]);

    const track = useCallback(() => {
        // Initialize intersection observer
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.7 // 50% visibility threshold
        };

        observerRef.current = new IntersectionObserver(handleIntersection, options);

        // Start observing all paragraphs
        const paragraphs = document.querySelectorAll('.prose p, .prose h1, .prose h2, .prose h3');
        paragraphs.forEach((paragraph, index) => {
            // Add data attribute for tracking
            paragraph.setAttribute('data-paragraph-index', index.toString());
            observerRef.current?.observe(paragraph);
        });


    }, [handleIntersection]);

    const untrack = useCallback(() => {
        observerRef.current?.disconnect();
    }, [])


    const scrollToLastRead = useCallback(() => {
        // get the latest read paragraph index asynchronously
        getLatestReadParagraph(topicId, lessonId).then(lastIndex => {
            const element = document.querySelector(`[data-paragraph-index="${lastIndex}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'end' });
            } else {
                console.error(`Could not find paragraph with index ${lastIndex}`);
            }
        });
    }, []);

    return {
        scrollToLastRead,
        track,
        untrack
    };
}