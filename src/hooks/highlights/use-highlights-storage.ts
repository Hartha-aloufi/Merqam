import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TextHighlight, LessonHighlights } from '@/types/highlight';

const STORAGE_KEY = 'lesson_highlights';

interface NewHighlightInfo {
    text: string;
    startOffset: number;
    endOffset: number;
    elementId: string;
}

/**
 * Hook to manage highlight storage and operations
 */
export const useHighlightStorage = (
    topicId: string,
    lessonId: string,
    activeColor: string
) => {
    const [highlights, setHighlights] = useState<TextHighlight[]>([]);
    const lessonKey = `${topicId}:${lessonId}`;

    // Load highlights from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const allHighlights = JSON.parse(stored) as LessonHighlights;
            setHighlights(allHighlights[lessonKey] || []);
        }
    }, [lessonKey]);

    // Save highlights to localStorage
    const saveHighlights = useCallback((newHighlights: TextHighlight[]) => {
        const stored = localStorage.getItem(STORAGE_KEY);
        const allHighlights: LessonHighlights = stored ? JSON.parse(stored) : {};

        allHighlights[lessonKey] = newHighlights;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allHighlights));
        setHighlights(newHighlights);
    }, [lessonKey]);

    // Add new highlight
    const addHighlight = useCallback((info: NewHighlightInfo) => {
        const highlight: TextHighlight = {
            id: uuidv4(),
            text: info.text,
            startOffset: info.startOffset,
            endOffset: info.endOffset,
            elementId: info.elementId,
            color: activeColor,
            createdAt: new Date().toISOString()
        };

        saveHighlights([...highlights, highlight]);
    }, [activeColor, highlights, saveHighlights]);

    // Remove highlight
    const removeHighlight = useCallback((id: string) => {
        const newHighlights = highlights.filter(h => h.id !== id);
        saveHighlights(newHighlights);
    }, [highlights, saveHighlights]);

    // Remove multiple highlights
    const removeHighlights = useCallback((ids: string[]) => {
        const newHighlights = highlights.filter(h => !ids.includes(h.id));
        saveHighlights(newHighlights);
    }, [highlights, saveHighlights]);

    // Clear all highlights
    const clearHighlights = useCallback(() => {
        saveHighlights([]);
    }, [saveHighlights]);

    return {
        highlights,
        addHighlight,
        removeHighlight,
        removeHighlights,
        clearHighlights
    };
};