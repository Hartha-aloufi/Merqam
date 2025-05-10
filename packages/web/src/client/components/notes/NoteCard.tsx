import React from 'react';
import { Note } from '@/types/note';
import { Card, CardContent, CardHeader } from '@/client/components/ui/card';
import { Button } from '@/client/components/ui/button';
import { Pen, Trash2, Link, ChevronDown } from 'lucide-react';
import { cn, NotoNaskhArabic } from '@/client/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNotesSheet } from '@/client/stores/use-notes-sheet';
import { useDeleteNote } from '@/client/hooks/use-notes';
import { useScrollToHighlight } from '@/client/hooks/highlights/use-scroll-to-highlight';
import { HIGHLIGHT_COLORS } from '@/constants/highlights';

interface NoteCardProps {
	note: Note;
	className?: string;
}

const PREVIEW_LENGTH = 150; // Characters to show in preview

export function NoteCard({ note, className }: NoteCardProps) {
	const { setView, setSelectedNoteId } = useNotesSheet();
	const { mutate: deleteNote } = useDeleteNote();
	const scrollToHighlight = useScrollToHighlight();
	const [isExpanded, setIsExpanded] = React.useState(false);

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
				note.labelColor && 'border-r-[3px]',
				note.labelColor && {
					'border-r-yellow-200': note.labelColor === 'yellow',
					'border-r-green-200': note.labelColor === 'green',
					'border-r-blue-200': note.labelColor === 'blue',
					'border-r-purple-200': note.labelColor === 'purple',
				},
				className
			)}
		>
			<CardHeader className="space-y-2 p-3 sm:p-4">
				{/* Note Header */}
				<div className="flex items-start justify-between gap-2">
					{/* Date and Label */}
					<div className="flex items-center gap-2 min-w-0">
						{note.labelColor && (
							<div
								className="h-2 w-2 shrink-0 rounded-sm"
								style={{
									backgroundColor:
										HIGHLIGHT_COLORS[note.labelColor]
											.background,
								}}
							/>
						)}
						<span className="text-xs text-muted-foreground truncate">
							{format(new Date(note.createdAt), 'PPP', {
								locale: ar,
							})}
						</span>
					</div>

					{/* Actions */}
					<div className="flex items-center gap-1">
						{note.highlightId && (
							<Button
								variant="ghost"
								size="icon"
								className="h-7 w-7 sm:h-8 sm:w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
								onClick={handleJumpToHighlight}
								title="الانتقال إلى التظليل"
							>
								<Link className="h-3 w-3 sm:h-4 sm:w-4" />
							</Button>
						)}
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-7 sm:h-8 sm:w-8"
							onClick={handleEdit}
							title="تعديل"
						>
							<Pen className="h-3 w-3 sm:h-4 sm:w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-7 sm:h-8 sm:w-8 hover:text-destructive"
							onClick={handleDelete}
							title="حذف"
						>
							<Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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

			<CardContent className="p-3 sm:p-4 pt-0">
				{needsExpansion ? (
					<div
						className="space-y-2"
						onClick={() => setIsExpanded(!isExpanded)}
					>
						<p className={cn('text-sm', NotoNaskhArabic.className)}>
							{isExpanded ? note.content : previewContent}
						</p>
						<Button
							variant="ghost"
							size="sm"
							className="h-6 w-full justify-center text-xs hover:bg-muted"
						>
							<ChevronDown
								className={cn(
									'h-3 w-3 transition-transform duration-200',
									isExpanded && 'rotate-180'
								)}
							/>
							<span className="ml-1">
								{isExpanded ? 'عرض أقل' : 'عرض المزيد'}
							</span>
						</Button>
					</div>
				) : (
					<p className={cn('text-sm', NotoNaskhArabic.className)}>
						{note.content}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
