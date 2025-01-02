// hooks/use-paragraph-tracking.ts
"use client";

import { useCallback, useMemo, useRef } from "react";
import {
  getLatestReadParagraph,
  useReadingProgressSync,
} from "./use-reading-progress-sync";

export function useParagraphTracking(topicId: string, lessonId: string) {
  const progress = useReadingProgressSync(topicId, lessonId);

  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const paragraph = entry.target as HTMLElement;
          const index = parseInt(paragraph.dataset.paragraphIndex || "0", 10);
          progress.update(index);
        }
      });
    },
    [progress.update]
  );

  const track = useCallback(() => {
    // Initialize intersection observer
    const options = {
      root: null,
      rootMargin: `-35% 0px -35% 0px`, // Shrink the viewport by 50% from the top and bottom
      threshold: 0.5, // 50% visibility threshold
    };

    observerRef.current = new IntersectionObserver(handleIntersection, options);

    // Start observing all paragraphs
    const paragraphs = document.querySelectorAll(".prose p");
    paragraphs.forEach((paragraph, index) => {
      // Add data attribute for tracking
      paragraph.setAttribute("data-paragraph-index", index.toString());
      observerRef.current?.observe(paragraph);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const untrack = useCallback(() => {
    observerRef.current?.disconnect();
  }, []);

  const scrollToLastRead = useCallback(() => {
    // get the latest read paragraph index asynchronously
    getLatestReadParagraph(topicId, lessonId).then((lastIndex) => {
      const element = document.querySelector(
        `[data-paragraph-index="${lastIndex}"]`
      );
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        console.error(`Could not find paragraph with index ${lastIndex}`);
      }
    });
  }, [lessonId, topicId]);

  return useMemo(
    () => ({
      scrollToLastRead,
      track,
      untrack,
    }),
    [scrollToLastRead, track, untrack]
  );
}
