import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentService } from '@/server/services/content.service';
import { LessonView } from '@/client/components/lessons/lesson-view';
import { LessonContent } from '@/client/components/lessons/content/lesson-content';
import { ErrorBoundary } from '@/client/components/error-boundary';
import { calculateReadingTime } from '@/client/lib/utils';

export const dynamic = 'force-dynamic';

interface LessonPageProps {
	params: Promise<{
		playlistId: string;
		lessonId: string;
	}>;
}

export async function generateMetadata({
	params,
}: LessonPageProps): Promise<Metadata> {
  const { lessonId } = await params;

	const contentService = new ContentService();
	const lesson = await contentService.getLesson(lessonId);

	if (!lesson) {
		return {
			title: 'الدرس غير موجود | مِرْقَم',
		};
	}

	return {
		title: `${lesson.title} | مِرْقَم`,
		description: `درس تفاعلي: ${lesson.title}`,
	};
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId, playlistId } = await params;

	const contentService = new ContentService();
	const lesson = await contentService.getLesson(lessonId);

	if (!lesson) {
		notFound();
	}

	const readingTime = calculateReadingTime(lesson.content);

	// Increment view count asynchronously
	contentService.incrementLessonViews(lessonId).catch(console.error);

	return (
		<ErrorBoundary>
			<LessonView
				lesson={lesson}
				playlistId={playlistId}
				lessonId={lessonId}
				readingTime={readingTime}
			>
				<LessonContent
					content={lesson.content}
					lessonId={lessonId}
					playlistId={playlistId}
				/>
			</LessonView>
		</ErrorBoundary>
	);
}
