// src/components/lessons/LessonCard.tsx
import { Button } from '@/client/components/ui/button';
import { Clock, Video } from 'lucide-react';
import Link from 'next/link';
import { calculateReadingTime } from '@/client/lib/utils';

interface LessonCardProps {
	lesson: {
		id: string;
		title: string;
		content: string;
		youtubeUrl?: string;
	};
	topicId: string;
}

export function LessonCard({ lesson, topicId }: LessonCardProps) {
	const readingTime = calculateReadingTime(lesson.content);

	return (
		<div className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:shadow-md transition-all duration-200">
			<div className="flex flex-col h-full">
				<h3 className="text-xl font-semibold mb-2">{lesson.title}</h3>

				<div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
					<div className="flex items-center gap-1">
						<Clock className="h-4 w-4" />
						<span>{readingTime} دقائق</span>
					</div>
					{lesson.youtubeUrl && (
						<div className="flex items-center gap-1">
							<Video className="h-4 w-4" />
							<span>تفريغ مقطع مرئي</span>
						</div>
					)}
				</div>

				<div className="mt-auto">
					<Link href={`/topics/${topicId}/${lesson.id}`}>
						<Button className="w-full">ابدأ الدرس</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
