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
import { HIGHLIGHT_COLORS } from '@/constants/highlights';
import { useScrollToHighlight } from '@/client/hooks/highlights/use-scroll-to-highlight';

interface NoteCardProps {
	note: Note;
	className?: string;
}

const PREVIEW_LENGTH = 150; // Characters to show in preview

export function NoteCard({ note, className }: NoteCardProps) {
	const { setView, setSelectedNoteId } = useNotesSheet();
	const { mutate: deleteNote } = useDeleteNote();
	const [isExpanded, setIsExpanded] = React.useState(false);

	const scrollToHighlight = useScrollToHighlight();


	// Check if content needs expansion
	const needsExpansion = note.content.length > PREVIEW_LENGTH;
	const previewContent = needsExpansion
		? `${note.content.slice(0, PREVIEW_LENGTH).trim()}...`
		: note.content;


	const handleEdit = () => {
		setSelectedNoteId(note.id);
		setView('editor');
	};

	const handleDelete = () => {
		if (confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
			deleteNote(note.id);
		}
	};

	const handleJumpToHighlight = () => {
		scrollToHighlight(note.highlightId!);
	};

	return (
		<Card
			className={cn(
				'group transition-colors hover:bg-muted/50',
				needsExpansion && 'cursor-pointer',
				note.labelColor && `border-r-[3px]`,
				note.labelColor &&
					`border-r-[${
						HIGHLIGHT_COLORS[note.labelColor].background
					}]`,
				className
			)}
		>
			<CardHeader className="space-y-2 p-4">
				{/* Note Header */}
				<div className="flex items-start justify-between gap-4">
					{/* Date and Label */}
					<div className="flex items-center gap-2">
						<span className="text-xs text-muted-foreground">
							{format(new Date(note.createdAt), 'PPP', {
								locale: ar,
							})}
						</span>
						{note.labelColor && (
							<div
								className="h-2 w-2 rounded-sm"
								style={{
									backgroundColor:
										HIGHLIGHT_COLORS[note.labelColor]
											.background,
								}}
							/>
						)}
					</div>

					{/* Actions */}
					<div className="flex items-center gap-1">
						{note.highlightId && (
							<Button
								variant="ghost"
								onClick={handleJumpToHighlight}
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
				{needsExpansion ? (
					<div
						className="text-sm cursor-pointer"
						onClick={() => setIsExpanded(!isExpanded)}
					>
						{isExpanded ? note.content : previewContent}
						<Button
							variant="ghost"
							size="sm"
							className="mt-2 w-full justify-center hover:bg-muted"
						>
							{isExpanded ? 'عرض أقل' : 'عرض المزيد'}
						</Button>
					</div>
				) : (
					<p className="text-sm">{note.content}</p>
				)}
			</CardContent>
		</Card>
	);
}
