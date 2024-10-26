import { getTopics, getLesson, getLessons } from '@/utils/mdx';
import LessonContent from '@/components/lessons/LessonContent';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, Video, Clock } from 'lucide-react';
import { calculateReadingTime } from '@/lib/utils';
import { YouTubeMusicPlayer } from '@/components/lessons/YouTubeMusicPlayer';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Mark as static
export const dynamic = 'force-static';

// Generate static paths at build time
export async function generateStaticParams() {
  try {
    const topics = await getTopics();
    const paths: { topicId: string; lessonId: string }[] = [];

    for (const topic of topics) {
      const lessons = getLessons(topic.id);
      lessons.forEach((lesson) => {
        paths.push({
          topicId: topic.id,
          lessonId: lesson.id,
        });
      });
    }

    return paths;
  } catch (error) {
    console.error('Error generating static paths:', error);
    return [];
  }
}

// Generate metadata
export async function generateMetadata({ 
  params 
}: { 
  params: { topicId: string; lessonId: string } 
}): Promise<Metadata> {
  const lesson = await getLesson(params.topicId, params.lessonId);
  
  if (!lesson) return {
    title: 'الدرس غير موجود | مِرْقَم',
  };

  return {
    title: `${lesson.title} | مِرْقَم`,
    description: `درس تفاعلي: ${lesson.title}`
  };
}

export default async function LessonPage({
  params
}: {
  params: { topicId: string; lessonId: string }
}) {
    const lesson = await getLesson(params.topicId, params.lessonId);
  if (!lesson) return notFound();

  const readingTime = calculateReadingTime(lesson.content);

  return (
    <>
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
            <Link href={`/topics/${params.topicId}/${params.lessonId}/exercise`}>
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
    </>
  );
}