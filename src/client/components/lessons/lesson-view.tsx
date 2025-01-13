"use client"

// src/client/components/lessons/lesson-view.tsx
import { NotesProvider } from '@/client/contexts/notes-context';
import { NotesSheet } from '@/client/components/notes/NotesSheet';
import { ShortcutsToast } from '../reading/ShortcutsToast';
import PrintableLesson from './print/printable-lesson';
import { VideoProvider } from '@/client/contexts/video-context';
import { useEffect } from 'react';
import { useParagraphTracking } from '@/client/hooks/use-paragraph-tracking';
import { useVideoSettings } from '@/client/stores/use-video-settings';
import { usePrintLesson } from '@/client/hooks/use-print-lesson';
import { cn } from '@/client/lib/utils';
import { ReadingProgressBar } from '../reading/ReadingProgressBar';
import { YouTubeMusicPlayer } from '../video/youtube-music-player';
import { LessonHeader } from './lesson-header';
import PrintButton from './print/print-button';
import { Lesson } from '@/types';

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
		<NotesProvider>
			<VideoProvider>
				<div
					className={cn(
						'max-w-3xl mx-auto pt-14 pb-20',
						'print:hidden'
					)}
				>
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
					{lesson.youtubeUrl && position === 'top' && (
						<div className="mb-8">
							<YouTubeMusicPlayer
								youtubeUrl={lesson.youtubeUrl}
							/>
						</div>
					)}

					<div className="prose prose-lg dark:prose-invert max-w-none">
						{children}
					</div>

					{/* YouTube Player for bottom position */}
					{lesson.youtubeUrl && position === 'bottom' && (
						<div className="mt-8">
							<YouTubeMusicPlayer
								youtubeUrl={lesson.youtubeUrl}
							/>
						</div>
					)}
				</div>

				<PrintableLesson
					title={lesson.title}
					content={children}
					topicId={topicId}
					lessonId={lessonId}
				/>

				<div className="print:hidden">
					<ShortcutsToast />
					<NotesSheet />
				</div>
			</VideoProvider>
		</NotesProvider>
	);
}
