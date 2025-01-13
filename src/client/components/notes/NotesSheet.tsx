import React from 'react';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from '@/client/components/ui/sheet';
import { useNotes } from '@/client/contexts/notes-context';
import { NoteEditor } from './NoteEditor';
import { NoteCard } from './NoteCard';
import { ScrollArea } from '@/client/components/ui/scroll-area';
import { Button } from '@/client/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/client/lib/utils';

export function NotesSheet() {
	const { state, actions } = useNotes();
	const isRTL = document.dir === 'rtl';
	const isAllView = state.view === 'all';

	// Get notes based on view
	const displayedNotes = isAllView
		? state.notes
		: state.notes.filter(
				(note) => note.highlightId === state.activeHighlightId
		  );

	const activeNote = state.activeHighlightId
		? state.notes.find(
				(note) => note.highlightId === state.activeHighlightId
		  )
		: null;

	const showEditor = !isAllView && !activeNote;

	return (
		<Sheet
			open={state.isOpen}
			onOpenChange={(open) => !open && actions.closeEditor()}
			modal={false}
      
		>
			<SheetContent
				className="w-full sm:max-w-md border-l dark:border-l-slate-700"
				side={isRTL ? 'right' : 'left'}
			>
				<SheetHeader className="space-y-0">
					{!isAllView && (
						<Button
							variant="ghost"
							size="sm"
							className="w-fit mb-2"
							onClick={() => actions.setView('all')}
						>
							{isRTL ? (
								<ArrowLeft  className="h-4 w-4 ml-2" />
							) : (
								<ArrowRight className="h-4 w-4 mr-2" />
							)}
							جميع الملاحظات
						</Button>
					)}
					<SheetTitle>
						{isAllView ? 'جميع الملاحظات' : 'الملاحظة'}
					</SheetTitle>
				</SheetHeader>

				<div className="mt-8 space-y-6">
					{/* Note Editor */}
					{showEditor && <NoteEditor />}

					{/* Notes List or Single Note */}
					{displayedNotes.length > 0 && (
						<ScrollArea className="h-[calc(100vh-300px)]">
							<div className="space-y-4 pr-4">
								{displayedNotes.map((note) => (
									<NoteCard
										key={note.id}
										note={note}
										variant={isAllView ? 'preview' : 'full'}
										onClick={
											isAllView
												? () => {
														actions.setActiveHighlight(
															note.highlightId
														);
														actions.setView(
															'single'
														);
												  }
												: undefined
										}
										highlightedText={note.highlightText} // Add this to Note type
									/>
								))}
							</div>
						</ScrollArea>
					)}

					{/* Empty State */}
					{displayedNotes.length === 0 && !showEditor && (
						<div
							className={cn(
								'text-center py-12',
								'text-sm text-muted-foreground'
							)}
						>
							{isAllView
								? 'لا توجد ملاحظات'
								: 'لا توجد ملاحظة متعلقة بهذا التظليل'}
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
