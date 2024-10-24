// src/app/topics/[topicId]/[lessonId]/exercise/page.tsx
import { getExercise } from '@/utils/exercise';
import { getTopics, getLesson } from '@/utils/mdx';
import ExerciseForm from '@/components/exercise/ExerciseForm';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ExercisePageProps {
  params: { topicId: string; lessonId: string }
}

export default async function ExercisePage({ params }: ExercisePageProps) {
  const exercise = await getExercise(params.topicId, params.lessonId);
  const lesson = await getLesson(params.topicId, params.lessonId);
  
  if (!exercise || !lesson) return null;
  
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