import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { TextHighlight, LessonHighlights } from "@/types/highlight";

const STORAGE_KEY = "lesson_highlights";

/**
 * Custom hook to manage text highlights for a specific lesson
 */
export const useHighlights = (topicId: string, lessonId: string) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [highlights, setHighlights] = useState<TextHighlight[]>([]);
  const [activeColor, setActiveColor] = useState<string>("#FFF9C4"); // Default yellow

  // Generate unique key for this lesson
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
  const saveHighlights = useCallback(
    (newHighlights: TextHighlight[]) => {
      const stored = localStorage.getItem(STORAGE_KEY);
      const allHighlights: LessonHighlights = stored ? JSON.parse(stored) : {};

      allHighlights[lessonKey] = newHighlights;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allHighlights));
      setHighlights(newHighlights);
    },
    [lessonKey]
  );

  // Add new highlight
  const addHighlight = useCallback(
    (range: Range) => {
      if (!isEnabled) return;

      const highlight: TextHighlight = {
        id: uuidv4(),
        text: range.toString(),
        startOffset: range.startOffset,
        endOffset: range.endOffset,
        color: activeColor,
        createdAt: new Date().toISOString(),
      };

      saveHighlights([...highlights, highlight]);
    },
    [isEnabled, activeColor, highlights, saveHighlights]
  );

  // Remove highlight
  const removeHighlight = useCallback(
    (id: string) => {
      const newHighlights = highlights.filter((h) => h.id !== id);
      saveHighlights(newHighlights);
    },
    [highlights, saveHighlights]
  );

  // Clear all highlights
  const clearHighlights = useCallback(() => {
    saveHighlights([]);
  }, [saveHighlights]);

  return {
    isEnabled,
    setIsEnabled,
    highlights,
    activeColor,
    setActiveColor,
    addHighlight,
    removeHighlight,
    clearHighlights,
  };
};
