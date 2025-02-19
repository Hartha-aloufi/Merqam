// app/topics/[topicId]/[lessonId]/page.tsx
import { LessonView } from '@/client/components/lessons/lesson-view';
import { getTopics, getLesson } from '@/client/utils/mdx';
import { calculateReadingTime } from '@/client/lib/utils';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ErrorBoundary } from '@/client/components/error-boundary';
import { LessonContent } from '@/client/components/lessons/content/lesson-content';

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
	params,
}: {
	params: Promise<{ topicId: string; lessonId: string }>;
}): Promise<Metadata> {
	const { topicId, lessonId } = await params;
	const lesson = await getLesson(topicId, lessonId);

	if (!lesson)
		return {
			title: 'الدرس غير موجود | مِرْقَم',
		};

	return {
		title: `${lesson.title} | مِرْقَم`,
		description: `درس تفاعلي: ${lesson.title}`,
	};
}

// Mark as static
export const dynamic = 'force-static';
// Optional: Add revalidation period
// export const revalidate = 3600; // Revalidate every hour

interface PageProps {
	params: Promise<{
		topicId: string;
		lessonId: string;
	}>;
}

export default async function LessonPage({ params }: PageProps) {
	const { topicId, lessonId } = await params;
	const lessonData = await getLesson(topicId, lessonId);

	if (!lessonData) return notFound();

	const readingTime = calculateReadingTime(lessonData.content);

	return (
		<ErrorBoundary>
			<LessonView
				playListId={topicId}
				lessonId={lessonId}
				readingTime={readingTime}
				lesson={lessonData}
			>
				<LessonContent
					content={lessonData.content}
					lessonId={lessonId}
					topicId={topicId}
				/>
			</LessonView>
		</ErrorBoundary>
	);
}
