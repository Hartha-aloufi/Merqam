'use client';

import { useEffect } from 'react';
import { LessonContent } from './content/lesson-content';
import { YouTubeMusicPlayer } from './YouTubeMusicPlayer';
import { ShortcutsToast } from '@/components/reading/ShortcutsToast';
import { VideoProvider } from '@/contexts/video-context';
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation';
import { useParagraphTracking } from '@/hooks/use-paragraph-tracking';
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

  const pTracker = useParagraphTracking(topicId, lessonId); 

    useEffect(() => {
        pTracker.scrollToLastRead();
    }, []);
    
  useKeyboardNavigation({
    scrollTargets: '.prose h1, .prose h2, .prose h3, .prose p',
    scrollStep: 100,
    smooth: true
  });

  return (
    <VideoProvider>
        <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
          <LessonHeader 
            title={lesson.title}
            readingTime={readingTime}
            youtubeUrl={lesson.youtubeUrl}
            topicId={topicId}
            lessonId={lessonId}
          />

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <LessonContent content={lesson.content} lessonId={lessonId} topicId={topicId} />
          </div>
        </div>

        {lesson.youtubeUrl && (
          <YouTubeMusicPlayer youtubeUrl={lesson.youtubeUrl} />
        )}
        <ShortcutsToast />
    </VideoProvider>
  );
}