import React from 'react';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from '@/client/components/ui/sheet';
import { useNotesSheet } from '@/client/stores/use-notes-sheet';
import { Button } from '@/client/components/ui/button';
import { useNotes } from '@/client/hooks/use-notes';
import { NoteCard } from './NoteCard';
import { NoteEditor } from './NoteEditor';
import { Plus, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/client/lib/utils';

interface NotesSheetProps {
	topicId: string;
	lessonId: string;
}

export function NotesSheet({ topicId, lessonId }: NotesSheetProps) {
	const { isOpen, view, close, setView } = useNotesSheet();
	const { data: notes = [], isLoading } = useNotes(lessonId);

	const handleNewNote = () => {
		setView('editor');
	};

	return (
		<Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
			<SheetContent
				side="right"
				className="w-full sm:max-w-lg"
			>
				<SheetHeader>
					<SheetTitle>
						{view === 'list' ? 'الملاحظات' : 'ملاحظة جديدة'}
					</SheetTitle>
				</SheetHeader>

				<div className="mt-8">
					{view === 'list' ? (
						<div className="space-y-6">
							{/* New Note Button */}
							<Button
								onClick={handleNewNote}
								className="w-full gap-2"
							>
								<Plus className="h-4 w-4" />
								كتابة ملاحظة جديدة
							</Button>

							{/* Notes List */}
							<div className="space-y-4">
								{isLoading ? (
									<div className="flex items-center justify-center py-8">
										<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
									</div>
								) : notes.length === 0 ? (
									<div className="flex flex-col items-center justify-center space-y-2 rounded-lg border-2 border-dashed p-8 text-center">
										<FileText className="h-12 w-12 text-muted-foreground/50" />
										<h3 className="text-lg font-semibold">
											لا توجد ملاحظات
										</h3>
										<p className="text-sm text-muted-foreground">
											قم بإضافة ملاحظة جديدة للبدء
										</p>
									</div>
								) : (
									notes.map((note) => (
										<NoteCard
											key={note.id}
											note={note}
											className={cn(
												note.highlightId &&
													'border-primary/50'
											)}
										/>
									))
								)}
							</div>
						</div>
					) : (
						<NoteEditor topicId={topicId} lessonId={lessonId} />
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
