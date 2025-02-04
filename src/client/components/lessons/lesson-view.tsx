'use client';
import { useEffect } from 'react';
import { YouTubeMusicPlayer } from '@/client/components/video/youtube-music-player';
import { ShortcutsToast } from '@/client/components/reading/ShortcutsToast';
import { VideoProvider } from '@/client/contexts/video-context';
import { useParagraphTracking } from '@/client/hooks/use-paragraph-tracking';
import { usePrintLesson } from '@/client/hooks/use-print-lesson';
import type { Lesson } from '@/types';
import { LessonHeader } from './lesson-header';
import PrintButton from './print/print-button';
import PrintableLesson from './print/printable-lesson';
import { useVideoSettings } from '@/client/stores/use-video-settings';
import { NotesSheet } from '../notes/NotesSheet';
import { NoteSheetMobile } from '../notes/NoteSheetMobile';
import CustomLessonLayout from './CustomLayout';

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
			<CustomLessonLayout topicId={topicId} lessonId={lessonId}>
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
			</CustomLessonLayout>

			<PrintableLesson
				title={lesson.title}
				content={children}
				topicId={topicId}
				lessonId={lessonId}
			/>

			<div className="print:hidden">
				<ShortcutsToast />
			</div>

			{/* Notes Sheet */}
			<NotesSheet topicId={topicId} lessonId={lessonId} />

			<NoteSheetMobile lessonId={lessonId} topicId={topicId} />
		</VideoProvider>
	);
}
