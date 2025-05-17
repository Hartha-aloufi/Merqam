'use client';

import { Clock } from 'lucide-react';

interface LessonHeaderProps {
	title: string;
	readingTime: number;
	speakerName?: string;
}

export function LessonHeader({
	title,
	readingTime,
	speakerName,
}: LessonHeaderProps) {
	return (
		<div className="border-b pb-4">
			<h1 className="text-2xl sm:text-3xl font-bold mb-2">{title}</h1>

			<div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
				{speakerName && (
					<div>
						المتحدث:{' '}
						<span className="text-foreground">{speakerName}</span>
					</div>
				)}

				<div className="flex items-center">
					<Clock className="h-4 w-4 mr-1" />
					<span>{readingTime} دقيقة قراءة</span>
				</div>
			</div>
		</div>
	);
}
