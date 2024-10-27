// src/components/lessons/LessonContainer.tsx
'use client';

import { ReadingProgressBar } from '@/components/reading/ReadingProgressBar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Video, BookOpen, Clock } from 'lucide-react';
import { YouTubeMusicPlayer } from '@/components/lessons/YouTubeMusicPlayer';
import LessonContent from '@/components/lessons/LessonContent';
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation';
import { ShortcutsToast } from '@/components/reading/ShortcutsToast';
import { type Lesson } from '@/types';

interface LessonContainerProps {
  lesson: Lesson;
  topicId: string;
  lessonId: string;
  readingTime: number;
}

/**
 * Client-side container component for lesson content and interactive features
 */
export function LessonContainer({ 
  lesson, 
  topicId, 
  lessonId, 
  readingTime 
}: LessonContainerProps) {
   // Enable keyboard navigation
  useKeyboardNavigation({
    scrollTargets: '.prose h1, .prose h2, .prose h3, .prose p',
    scrollStep: 100,
    smooth: true
  });

  return (
    <>
      <ReadingProgressBar />
      <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
        {/* Lesson Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>

          {/* Lesson Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{readingTime} دقائق للقراءة</span>
            </div>

            {lesson.youtubeUrl && (
              <div className="flex items-center gap-1">
                <Video className="h-4 w-4" />
                <span>تفريغ مقطع مرئي</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {lesson.youtubeUrl && (
              <Link
                href={lesson.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="gap-2">
                  <Video className="h-4 w-4" />
                  شاهد المقطع المرئي
                </Button>
              </Link>
            )}
            <Link href={`/topics/${topicId}/${lessonId}/exercise`}>
              <Button variant="secondary" className="gap-2">
                <BookOpen className="h-4 w-4" />
                حل التمارين
              </Button>
            </Link>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <LessonContent content={lesson.content} />
        </div>
      </div>

      {lesson.youtubeUrl && (
        <YouTubeMusicPlayer youtubeUrl={lesson.youtubeUrl} />
      )}

      <ShortcutsToast />
    </>
  );
}