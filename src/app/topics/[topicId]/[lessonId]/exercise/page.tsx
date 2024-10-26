// src/app/topics/[topicId]/[lessonId]/exercise/page.tsx
import { getExercise } from '@/utils/exercise';
import { getTopics, getLessons, getLesson } from '@/utils/mdx';
import ExerciseForm from '@/components/exercise/ExerciseForm';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Generate static paths
export async function generateStaticParams() {
  const topics = await getTopics();
  
  return topics.flatMap((topic) => {
    const lessons = getLessons(topic.id);
    return lessons.map((lesson) => ({
      topicId: topic.id,
      lessonId: lesson.id
    }));
  });
}

// Dynamic metadata
export async function generateMetadata({ 
  params 
}: { 
  params: { topicId: string; lessonId: string } 
}): Promise<Metadata> {
  const lesson = await getLesson(params.topicId, params.lessonId);
  
if (!lesson) return {
    title: 'التمارين غير موجودة | مِرْقَم',
  };

  return {
    title: `تمارين ${lesson.title} | مِرْقَم`,
    description: `تمارين تفاعلية للدرس: ${lesson.title}`
  };
}

// Mark as static
export const dynamic = 'force-static';

interface ExercisePageProps {
  params: { 
    topicId: string; 
    lessonId: string;
  }
}

export default async function ExercisePage({ params }: ExercisePageProps) {
  const exercise = await getExercise(params.topicId, params.lessonId);
  const lesson = await getLesson(params.topicId, params.lessonId);
  
  // Show 404 if either lesson or exercise is missing
  if (!exercise || !lesson) return notFound();
  
  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back to lesson link */}
        <Link 
          href={`/topics/${params.topicId}/${params.lessonId}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة للدرس</span>
        </Link>

        {/* Title */}
        <div className="mb-12 space-y-1">
          <h1 className="text-3xl font-bold">تمارين الدرس</h1>
          <p className="text-muted-foreground text-lg">{lesson.title}</p>
        </div>

        {/* Exercise Form */}
        <ExerciseForm exercise={exercise} />
      </div>
    </div>
  );
}

// Add ISR revalidation if needed
// export const revalidate = 3600; // Revalidate every hour