// src/app/topics/[topicId]/[lessonId]/page.tsx
import { getTopics, getLesson } from '@/utils/mdx';
import { calculateReadingTime } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { LessonContainer } from '@/components/lessons/LessonContainer';

// Mark as static
export const dynamic = 'force-static';

// Generate static paths
export async function generateStaticParams() {
  try {
    const topics = await getTopics();
    return topics.flatMap((topic) => 
      topic.lessons.map((lesson) => ({
        topicId: topic.id,
        lessonId: lesson.id,
      }))
    );
  } catch (error) {
    console.error('Error generating static paths:', error);
    return [];
  }
}

// Generate metadata
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ topicId: string; lessonId: string }> 
}): Promise<Metadata> {
  const { topicId, lessonId } = await params;
  const lesson = await getLesson(topicId, lessonId);
  
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
  params: Promise<{ topicId: string; lessonId: string }>
}) {
  const { topicId, lessonId } = await params;
  const lesson = await getLesson(topicId, lessonId);
  if (!lesson) return notFound();

  const readingTime = calculateReadingTime(lesson.content);

  return (
    <LessonContainer
      lesson={lesson}
      topicId={topicId}
      lessonId={lessonId}
      readingTime={readingTime}
    />
  );
}