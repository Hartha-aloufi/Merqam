// src/app/topics/[topicId]/[lessonId]/page.tsx
import { getTopics, getLesson } from '@/utils/mdx';
import LessonContent from '@/components/lessons/LessonContent';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ExternalLink, ChevronRight, BookOpen } from 'lucide-react';

interface LessonPageProps {
    params: { topicId: string; lessonId: string }
}

export const generateStaticParams = async () => {
    const topics = await getTopics();
    const paths = topics.flatMap(topic =>
        topic.lessons.map(lesson => ({
            topicId: topic.id,
            lessonId: lesson.id,
        }))
    );
    return paths;
};

export default async function LessonPage({ params }: LessonPageProps) {
    const lesson = getLesson(params.topicId, params.lessonId);
    const topics = await getTopics();
    const currentTopic = topics.find(t => t.id === params.topicId);

    if (!lesson || !currentTopic) return null;

    return (
        <div className="min-h-screen pb-16">
            <div className="max-w-[800px] mx-auto px-4 sm:px-6">
                {/* Breadcrumb */}
                <div className="mb-8 flex items-center text-sm text-muted-foreground">
                    <Link href="/topics" className="hover:text-foreground">
                        المواضيع
                    </Link>
                    <ChevronRight className="mx-2 h-4 w-4" />
                    <Link href={`/topics/${params.topicId}`} className="hover:text-foreground">
                        {currentTopic.title}
                    </Link>
                </div>

                {/* Title Section */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight mb-4">
                        {lesson.title}
                    </h1>
                    {lesson.youtubeUrl && (
                        <Link
                            href={lesson.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex"
                        >
                            <Button variant="outline" className="gap-2">
                                شاهد الفيديو التعليمي
                                <ExternalLink className="h-4 w-4" />
                            </Button>

                        </Link>
                    )}

                    <Link
                        href={`/topics/${params.topicId}/${params.lessonId}/exercise`}
                        className="inline-flex mr-4"
                    >
                        <Button variant="secondary" className="gap-2">
                            حل التمارين
                            <BookOpen className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                {/* Content Section */}
                <div className="mx-auto prose-lg">
                    <LessonContent content={lesson.content} />
                </div>
            </div>
        </div>
    );
}