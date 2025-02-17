'use client';
import { useCallback, useEffect } from 'react';
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
import { useIsDesktop } from '@/client/hooks/use-screen-sizes';

interface LessonViewProps {
	lesson: Lesson;
	playListId: string | null;
	lessonId: string;
	readingTime: number;
	children: React.ReactNode;
}
export function LessonView({
	lesson,
	playListId,
	lessonId,
	readingTime,
	children,
}: LessonViewProps) {
	const pTracker = useParagraphTracking(playListId, lessonId);

	const { position } = useVideoSettings();

	const { print, printing, togglePrinting } = usePrintLesson({
		title: lesson.title,
	});

	const isDesktopScreen = useIsDesktop();

	const handlePrint = useCallback(() => {
		togglePrinting();

		setTimeout(() => {
			print();
		}, 300);
	}, [print, togglePrinting]);

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
			<CustomLessonLayout topicId={playListId} lessonId={lessonId}>
				<div className="flex items-center justify-between mb-8">
					<LessonHeader
						title={lesson.title}
						readingTime={readingTime}
						youtubeUrl={lesson.youtubeUrl}
						topicId={playListId}
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

			{printing && (
				<PrintableLesson
					title={lesson.title}
					content={children}
					topicId={playListId}
					lessonId={lessonId}
				/>
			)}

			<div className="print:hidden">
				<ShortcutsToast />
			</div>

			{/* Notes Sheet */}
			<NotesSheet topicId={playListId} lessonId={lessonId} />

			{!isDesktopScreen && (
				<NoteSheetMobile lessonId={lessonId} topicId={playListId} />
			)}
		</VideoProvider>
	);
}
