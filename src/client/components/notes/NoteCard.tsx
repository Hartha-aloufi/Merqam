import React from 'react';
import { Note } from '@/types/note';
import { Card, CardContent, CardHeader } from '@/client/components/ui/card';
import { Button } from '@/client/components/ui/button';
import { Pen, Trash2, Link } from 'lucide-react';
import { cn } from '@/client/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNotesSheet } from '@/client/stores/use-notes-sheet';
import { useDeleteNote } from '@/client/hooks/use-notes';

interface NoteCardProps {
	note: Note;
	className?: string;
}

export function NoteCard({ note, className }: NoteCardProps) {
	const { setView, setSelectedNoteId } = useNotesSheet();
	const { mutate: deleteNote } = useDeleteNote();

	const handleEdit = () => {
		setSelectedNoteId(note.id);
		setView('editor');
	};

	const handleDelete = () => {
		if (confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
			deleteNote(note.id);
		}
	};

	return (
		<Card
			className={cn(
				'group transition-colors hover:bg-muted/50',
				className
			)}
		>
			<CardHeader className="space-y-2 p-4">
				{/* Note Header */}
				<div className="flex items-start justify-between gap-4">
					{/* Date */}
					<span className="text-xs text-muted-foreground">
						{format(new Date(note.createdAt), 'PPP', {
							locale: ar,
						})}
					</span>

					{/* Actions */}
					<div className="flex items-center gap-1">
						{note.highlightId && (
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 opacity-0 group-hover:opacity-100"
								title="الانتقال إلى التظليل"
							>
								<Link className="h-4 w-4" />
							</Button>
						)}
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={handleEdit}
							title="تعديل"
						>
							<Pen className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 hover:text-destructive"
							onClick={handleDelete}
							title="حذف"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{/* Tags */}
				{note.tags && note.tags.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{note.tags.map((tag) => (
							<span
								key={tag.id}
								className="inline-block rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary"
							>
								{tag.name}
							</span>
						))}
					</div>
				)}
			</CardHeader>

			<CardContent className="p-4 pt-0">
				{/* Note Content - Show only first 3 lines */}
				<p className="line-clamp-3 text-sm">{note.content}</p>
			</CardContent>
		</Card>
	);
}
