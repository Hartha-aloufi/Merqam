"use client";

import { useEffect } from "react";
import { YouTubeMusicPlayer } from "./YouTubeMusicPlayer";
import { ShortcutsToast } from "@/components/reading/ShortcutsToast";
import { VideoProvider } from "@/contexts/video-context";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";
import { useParagraphTracking } from "@/hooks/use-paragraph-tracking";
import type { Lesson } from "@/types";
import { LessonHeader } from "./lesson-header";
import { ReadingProgressBar } from "../reading/ReadingProgressBar";

interface LessonViewProps {
  lesson: Lesson;
  topicId: string;
  lessonId: string;
  readingTime: number;
  children: React.ReactNode;
}

export function LessonView({
  lesson,
  topicId,
  lessonId,
  readingTime,
  children,
}: LessonViewProps) {
  const pTracker = useParagraphTracking(topicId, lessonId);

  /**
   * scroll to the last read paragraph when the component mounts
   */
  useEffect(() => {
    pTracker.scrollToLastRead();
  }, []);

  /**
   * Start tracking paragraphs when the lesson content changes
   */
  useEffect(() => {
    pTracker.track();

    return () => {
      // Stop tracking when the component unmounts
      pTracker.untrack();
    };
  }, [lesson.content]);

  useKeyboardNavigation({
    scrollTargets: ".prose h1, .prose h2, .prose h3, .prose p",
    scrollStep: 100,
    smooth: true,
  });

  return (
    <VideoProvider>
      <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
        <ReadingProgressBar />
        
        <LessonHeader
          title={lesson.title}
          readingTime={readingTime}
          youtubeUrl={lesson.youtubeUrl}
          topicId={topicId}
          lessonId={lessonId}
        />

        <div className="prose prose-lg dark:prose-invert max-w-none">
          {/* lesson content will be rendered here, importing it directly into this client component
           will cause many issues since it use mdx and mdx has async await */}
          {children}
        </div>
      </div>

      {lesson.youtubeUrl && (
        <YouTubeMusicPlayer youtubeUrl={lesson.youtubeUrl} />
      )}
      <ShortcutsToast />
    </VideoProvider>
  );
}
