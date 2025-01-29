import React from 'react';
import { NoteEditorMobile } from './NoteEditorMobile';
import { Button } from '@/client/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useNotes } from '@/client/hooks/use-notes';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from '@/client/components/ui/sheet';
import { useNoteDrawer } from '@/client/stores/use-note-sheet-mobile';
import { useNotesSheet } from '@/client/stores/use-notes-sheet';
import { useScrollToHighlight } from '@/client/hooks/highlights/use-scroll-to-highlight';
import { cn } from '@/client/lib/utils';

interface NoteSheetMobileProps {
	lessonId: string;
	topicId: string;
}

export function NoteSheetMobile({ lessonId, topicId }: NoteSheetMobileProps) {
	const { isOpen, noteId, highlightId, close } = useNoteDrawer();
	const { data: notes = [] } = useNotes(lessonId);
	const [currentNoteId, setCurrentNoteId] = React.useState<
		string | undefined
	>(noteId);
	const scrollToHighlight = useScrollToHighlight();

	// Reset current note when sheet opens/closes
	React.useEffect(() => {
		if (isOpen) {
			setCurrentNoteId(noteId);
		}
	}, [isOpen, noteId]);

	// Get current note index and total notes
	const currentIndex = React.useMemo(() => {
		if (!currentNoteId) return -1;
		return notes.findIndex((note) => note.id === currentNoteId);
	}, [notes, currentNoteId]);

	// Handle navigation
	const handleNext = React.useCallback(() => {
		if (currentIndex < notes.length - 1) {
			setCurrentNoteId(notes[currentIndex + 1].id);
			if (notes[currentIndex + 1].highlightId) {
				scrollToHighlight(notes[currentIndex + 1].highlightId!);
			}
		}
	}, [currentIndex, notes, scrollToHighlight]);

	const handlePrev = React.useCallback(() => {
		if (currentIndex > 0) {
			setCurrentNoteId(notes[currentIndex - 1].id);
			if (notes[currentIndex - 1].highlightId) {
				scrollToHighlight(notes[currentIndex - 1].highlightId!);
			}
		}
	}, [currentIndex, notes, scrollToHighlight]);

	const openAllNotes = React.useCallback(() => {
		close();
		useNotesSheet.getState().open();
	}, [close]);

	return (
		<Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
			<SheetContent
				side="bottom"
				className="p-0 border-t bg-background/95 backdrop-blur-md"
				onTouchMove={(e) => e.stopPropagation()}
				hideCloseButton={true}
			>
				{/* Header */}
				<SheetHeader className="border-b border-border/40 px-4 py-2">
					{/* This title is only for accessability */}
					<SheetTitle className="hidden">الملاحظات</SheetTitle>

					<div className="flex items-center justify-between">
						{/* Close button */}
						<Button
							variant="ghost"
							size="icon"
							onClick={close}
							className="h-8 w-8 rounded-full hover:bg-accent/80"
						>
							<X className="h-4 w-4 text-muted-foreground" />
							<span className="sr-only">إغلاق</span>
						</Button>

						{/* Navigation Controls */}
						{notes.length > 0 && (
							<div className="flex items-center gap-1">
								<Button
									variant="ghost"
									size="icon"
									disabled={currentIndex <= 0}
									onClick={handlePrev}
									className={cn(
										'h-8 w-8 rounded-full',
										currentIndex <= 0 && 'opacity-50'
									)}
								>
									<ChevronRight className="h-4 w-4" />
									<span className="sr-only">السابق</span>
								</Button>
								<span className="min-w-[4rem] text-center text-sm text-muted-foreground">
									{currentIndex + 1} من {notes.length}
								</span>
								<Button
									variant="ghost"
									size="icon"
									disabled={
										currentIndex === -1 ||
										currentIndex >= notes.length - 1
									}
									onClick={handleNext}
									className={cn(
										'h-8 w-8 rounded-full',
										(currentIndex === -1 ||
											currentIndex >= notes.length - 1) &&
											'opacity-50'
									)}
								>
									<ChevronLeft className="h-4 w-4" />
									<span className="sr-only">التالي</span>
								</Button>
							</div>
						)}

						{/* View all notes button */}
						<Button
							variant="ghost"
							onClick={openAllNotes}
							className="text-sm font-medium text-primary hover:text-primary/80"
						>
							عرض الكل
						</Button>
					</div>
				</SheetHeader>

				{/* Content Area */}
				<div className="max-h-[70vh] overflow-y-auto">
					<NoteEditorMobile
						topicId={topicId}
						lessonId={lessonId}
						noteId={currentNoteId}
						highlightId={highlightId}
						onSave={close}
					/>
				</div>
			</SheetContent>
		</Sheet>
	);
}
