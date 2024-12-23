"use client";
import { useEffect } from "react";
import { YouTubeMusicPlayer } from "@/components/video/youtube-music-player";
import { ShortcutsToast } from "@/components/reading/ShortcutsToast";
import { VideoProvider } from "@/contexts/video-context";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";
import { useParagraphTracking } from "@/hooks/use-paragraph-tracking";
import { usePrintLesson } from "@/hooks/use-print-lesson";
import type { Lesson } from "@/types";
import { LessonHeader } from "./lesson-header";
import { ReadingProgressBar } from "../reading/ReadingProgressBar";
import PrintButton from "./print/print-button";
import PrintableLesson from "./print/printable-lesson";
import { cn } from "@/lib/utils";

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

  const handlePrint = usePrintLesson({
    title: lesson.title,
  });

  useEffect(() => {
    pTracker.scrollToLastRead();
  }, []);

  useEffect(() => {
    // delay tracking to ensure that the content is rendered
    setTimeout(() => {
      console.log("track");
      pTracker.track();
    }, 2000);
    return () => pTracker.untrack();
  }, [lesson.content, pTracker]);

  useKeyboardNavigation({
    scrollTargets: ".prose h1, .prose h2, .prose h3, .prose p",
    scrollStep: 100,
    smooth: true,
  });

  return (
    <VideoProvider>
      {/* Regular View */}
      <div
        className={cn(
          "max-w-3xl mx-auto py-8 pb-24",
          "print:hidden" // Hide in print view
        )}
      >
        <ReadingProgressBar />

        <div className="flex items-center justify-between mb-8">
          <LessonHeader
            title={lesson.title}
            readingTime={readingTime}
            youtubeUrl={lesson.youtubeUrl}
            topicId={topicId}
            lessonId={lessonId}
          />
          <PrintButton onClick={handlePrint} className="ml-4" />
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          {children}
        </div>
      </div>

      {/* Print View */}
      <PrintableLesson
        title={lesson.title}
        content={children}
        topicId={topicId}
        lessonId={lessonId}
      />

      {/* Components to hide in print */}
      <div className="print:hidden">
        {lesson.youtubeUrl && (
          <YouTubeMusicPlayer youtubeUrl={lesson.youtubeUrl} />
        )}
        <ShortcutsToast />
      </div>
    </VideoProvider>
  );
}
