// hooks/use-paragraph-tracking.ts
'use client';

import { useCallback, useRef } from 'react';
import { getLessonProgress, setLessonProgress } from '@/lib/utils';



export function useParagraphTracking(topicId: string, lessonId: string) {
    const observerRef = useRef<IntersectionObserver | null>(null);

    const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const paragraph = entry.target as HTMLElement;
                const index = parseInt(paragraph.dataset.paragraphIndex || '0', 10);

                setLessonProgress(topicId, lessonId, { paragraphIndex: index, date: new Date().toISOString() });
            }
        });
    }, [topicId, lessonId]);

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

    const getLastReadParagraph = useCallback(() => {
        const progress = getLessonProgress(topicId, lessonId);

        return progress?.paragraphIndex ?? 0;
    }, [topicId, lessonId]);

    const scrollToLastRead = useCallback(() => {
        const lastIndex = getLastReadParagraph();
        const element = document.querySelector(`[data-paragraph-index="${lastIndex}"]`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'end' });
        } else {
            log.error(`Could not find paragraph with index ${lastIndex}`);
        }
    }, [getLastReadParagraph]);

    return {
        getLastReadParagraph,
        scrollToLastRead,
        track,
        untrack
    };
}