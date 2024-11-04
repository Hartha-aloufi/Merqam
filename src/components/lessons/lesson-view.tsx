'use client';

import { ReadingProgressBar } from '@/components/reading/ReadingProgressBar';
import { LessonContent } from './content/lesson-content';
import { YouTubeMusicPlayer } from './YouTubeMusicPlayer';
import { ShortcutsToast } from '@/components/reading/ShortcutsToast';
import { VideoProvider } from '@/contexts/video-context';
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation';
import type { Lesson } from '@/types';
import { LessonHeader } from './lesson-header';

interface LessonViewProps {
  lesson: Lesson;
  topicId: string;
  lessonId: string;
  readingTime: number;
}

export function LessonView({
  lesson,
  topicId,
  lessonId,
  readingTime
}: LessonViewProps) {
  // Enable keyboard navigation
  useKeyboardNavigation({
    scrollTargets: '.prose h1, .prose h2, .prose h3, .prose p',
    scrollStep: 100,
    smooth: true
  });

  return (
    <VideoProvider>
      <ReadingProgressBar />
      <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
        <LessonHeader 
          title={lesson.title}
          readingTime={readingTime}
          youtubeUrl={lesson.youtubeUrl}
          topicId={topicId}
          lessonId={lessonId}
        />

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <LessonContent content={lesson.content} />
        </div>
      </div>

      {lesson.youtubeUrl && (
        <YouTubeMusicPlayer youtubeUrl={lesson.youtubeUrl} />
      )}

      <ShortcutsToast />
    </VideoProvider>
  );
}
