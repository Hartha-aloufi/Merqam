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
	const handleNext = () => {
		if (currentIndex < notes.length - 1) {
			setCurrentNoteId(notes[currentIndex + 1].id);
			if (notes[currentIndex + 1].highlightId) {
				scrollToHighlight(notes[currentIndex + 1].highlightId!);
			}
		}
	};

	const handlePrev = () => {
		if (currentIndex > 0) {
			setCurrentNoteId(notes[currentIndex - 1].id);

			if (notes[currentIndex - 1].highlightId) {
				scrollToHighlight(notes[currentIndex - 1].highlightId!);
			}
		}
	};

	const openAllNotes = () => {
		close();
		useNotesSheet.getState().open();
	};

	return (
		<Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
			<SheetContent
				side="bottom"
				className="p-0 border-t"
				// Prevent dragging on mobile
				onTouchMove={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<SheetHeader className="px-4 pt-2">
					<div className="flex items-center justify-between">
						{/* close sheet button */}
						<X onClick={close} className="h-4 w-4" />

						{/* Navigation Controls */}
						{notes.length > 0 && (
							<div className="flex items-center gap-1">
								<Button
									variant="ghost"
									size="icon"
									disabled={currentIndex <= 0}
									onClick={handlePrev}
									className="h-8 w-8"
								>
									<ChevronRight className="h-8 w-8" />
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
									className="h-8 w-8"
								>
									<ChevronLeft className="h-8 w-8" />
								</Button>
							</div>
						)}
						<Button variant="ghost" onClick={openAllNotes}>
							عرض الكل
						</Button>
					</div>
				</SheetHeader>

				{/* Content */}
				<div className="h-full overflow-y-auto">
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
