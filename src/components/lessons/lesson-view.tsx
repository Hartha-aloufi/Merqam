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
import { useVideoSettings } from "@/stores/use-video-settings";

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
  const { position } = useVideoSettings();
  const handlePrint = usePrintLesson({ title: lesson.title });

  useEffect(() => {
    pTracker.scrollToLastRead();
  }, []);

  useEffect(() => {
    setTimeout(() => {
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
      <div className={cn("max-w-3xl mx-auto py-8 pb-24", "print:hidden")}>
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

        {/* YouTube Player for top position */}
        {position === "top" && lesson.youtubeUrl && (
          <div className="fixed-top top-16 left-0 right-0 -mx-11 z-50">
            <YouTubeMusicPlayer youtubeUrl={lesson.youtubeUrl} />
          </div>
        )}

        <div className="prose prose-lg dark:prose-invert max-w-none">
          {children}
        </div>
      </div>

      {/* YouTube Player for bottom position */}
      {position === "bottom" && lesson.youtubeUrl && (
        <YouTubeMusicPlayer youtubeUrl={lesson.youtubeUrl} />
      )}

      <PrintableLesson
        title={lesson.title}
        content={children}
        topicId={topicId}
        lessonId={lessonId}
      />

      <div className="print:hidden">
        <ShortcutsToast />
      </div>
    </VideoProvider>
  );
}