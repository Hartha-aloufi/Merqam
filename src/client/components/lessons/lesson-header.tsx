'use client';

import Link from 'next/link';
import { Button } from '@/client/components/ui/button';
import { Video, BookOpen, Clock } from 'lucide-react';

interface LessonHeaderProps {
	title: string;
	readingTime: number;
	youtubeUrl: string | null;
	lessonId: string;
}

export function LessonHeader({
	readingTime,
	youtubeUrl,
	lessonId,
}: LessonHeaderProps) {
	return (
		<div className="mb-8">
			<div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
				<div className="flex items-center gap-1">
					<Clock className="h-4 w-4" />
					<span>{readingTime} دقائق للقراءة</span>
				</div>

				{youtubeUrl && (
					<div className="flex items-center gap-1">
						<Video className="h-4 w-4" />
						<span>تفريغ مقطع مرئي</span>
					</div>
				)}
			</div>

			<div className="flex flex-wrap gap-3">
				{youtubeUrl && (
					<Link
						href={youtubeUrl}
						target="_blank"
						rel="noopener noreferrer"
					>
						<Button variant="outline" className="gap-2">
							<Video className="h-4 w-4" />
							شاهد المقطع المرئي
						</Button>
					</Link>
				)}
				<Link href={`/topics/${lessonId}/exercise`}>
					<Button variant="secondary" className="gap-2">
						<BookOpen className="h-4 w-4" />
						حل التمارين
					</Button>
				</Link>
			</div>
		</div>
	);
}
