'use client';
import { useEffect } from 'react';
import { YouTubeMusicPlayer } from '@/components/video/youtube-music-player';
import { ShortcutsToast } from '@/components/reading/ShortcutsToast';
import { VideoProvider } from '@/contexts/video-context';
import { useParagraphTracking } from '@/hooks/use-paragraph-tracking';
import { usePrintLesson } from '@/hooks/use-print-lesson';
import type { Lesson } from '@/types';
import { LessonHeader } from './lesson-header';
import { ReadingProgressBar } from '../reading/ReadingProgressBar';
import PrintButton from './print/print-button';
import PrintableLesson from './print/printable-lesson';
import { cn } from '@/lib/utils';
import { useVideoSettings } from '@/stores/use-video-settings';

interface LessonViewProps {
	lesson: Lesson;
	topicId: string;
	lessonId: string;
	readingTime: number;
	children: React.ReactNode;
}
export function LessonView({
	lesson,
	topicId,
	lessonId,
	readingTime,
	children,
}: LessonViewProps) {
	const pTracker = useParagraphTracking(topicId, lessonId);
	const { position } = useVideoSettings();
	const handlePrint = usePrintLesson({ title: lesson.title });

	useEffect(() => {
		pTracker.scrollToLastRead();
	}, []);

	useEffect(() => {
		setTimeout(() => {
			pTracker.track();
		}, 2000);
		return () => pTracker.untrack();
	}, [lesson.content, pTracker]);


	return (
		<VideoProvider>
			<div className={cn('max-w-3xl mx-auto pt-14 pb-20', 'print:hidden')}>
				<ReadingProgressBar />

				<div className="flex items-center justify-between mb-8">
					<LessonHeader
						title={lesson.title}
						readingTime={readingTime}
						youtubeUrl={lesson.youtubeUrl}
						topicId={topicId}
						lessonId={lessonId}
					/>
					<PrintButton onClick={handlePrint} className="ml-4" />
				</div>

				{/* YouTube Player for top position */}
				{lesson.youtubeUrl && (
					<div
						className={
							position === 'bottom' ? 'order-1' : 'order-0'
						}
					>
						<YouTubeMusicPlayer youtubeUrl={lesson.youtubeUrl} />
					</div>
				)}

				<div className="prose prose-lg dark:prose-invert max-w-none">
					{children}
				</div>
			</div>

			<PrintableLesson
				title={lesson.title}
				content={children}
				topicId={topicId}
				lessonId={lessonId}
			/>

			<div className="print:hidden">
				<ShortcutsToast />
			</div>
		</VideoProvider>
	);
}
