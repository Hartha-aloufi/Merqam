// app/topics/[topicId]/[lessonId]/page.tsx
import {
	getTopics,
	getLesson,
} from '../../../../../../../public/data/PLZmiPrHYOIsT3AhREWUIjbtPEAGH4NR5x/mdx';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import AdminLessonEditPage from './AdminLessonEdit.dev';

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

	return (
		<AdminLessonEditPage
			lesson={lessonData}
			params={{ topicId, lessonId }}
		/>
	);
}
