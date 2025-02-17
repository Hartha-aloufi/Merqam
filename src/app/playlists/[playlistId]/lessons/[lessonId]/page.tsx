import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentService } from '@/server/services/content.service';
import { LessonView } from '@/client/components/lessons/lesson-view';
import { LessonContent } from '@/client/components/lessons/content/lesson-content';
import { ErrorBoundary } from '@/client/components/error-boundary';
import { calculateReadingTime } from '@/client/lib/utils';

interface LessonPageProps {
	params: {
		playlistId: string;
		lessonId: string;
	};
}

export async function generateMetadata({
	params,
}: LessonPageProps): Promise<Metadata> {
  await params

	const contentService = new ContentService();
	const lesson = await contentService.getLesson(params.lessonId);

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
  await params;

	const contentService = new ContentService();
	const lesson = await contentService.getLesson(params.lessonId);

	if (!lesson) {
		notFound();
	}

	const readingTime = calculateReadingTime(lesson.content);

	// Increment view count asynchronously
	contentService.incrementLessonViews(params.lessonId).catch(console.error);

	return (
		<ErrorBoundary>
			<LessonView
				playlistId={params.playlistId}
				lessonId={params.lessonId}
				readingTime={readingTime}
				lesson={lesson}
			>
				<LessonContent
					content={lesson.content}
					lessonId={params.lessonId}
					playlistId={params.playlistId}
				/>
			</LessonView>
		</ErrorBoundary>
	);
}
