import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Note } from '@/types/note';
import { Card, CardContent, CardFooter } from '@/client/components/ui/card';
import { Button } from '@/client/components/ui/button';
import { Pencil, Trash2, X, Check, ChevronLeft } from 'lucide-react';
import { Textarea } from '@/client/components/ui/textarea';
import { useNotes } from '@/client/contexts/notes-context';
import { cn } from '@/client/lib/utils';

interface NoteCardProps {
	note: Note;
	variant: 'preview' | 'full';
	onClick?: () => void;
}

export function NoteCard({ note, variant, onClick }: NoteCardProps) {
	  const [isEditing, setIsEditing] = React.useState(false);
		const [editedContent, setEditedContent] = React.useState(note.content);
		const { actions } = useNotes();

		const handleUpdate = () => {
			if (editedContent.trim() && editedContent !== note.content) {
				actions.updateNote(note.id, editedContent.trim());
			}
			setIsEditing(false);
		};

		const handleCancel = () => {
			setEditedContent(note.content);
			setIsEditing(false);
		};

	const isPreview = variant === 'preview';

	return (
		<Card
			className={cn(
				'transition-all duration-200',
				'hover:shadow-md',
				'group relative',
				isPreview && 'cursor-pointer'
			)}
			onClick={onClick}
		>
			<CardContent className="pt-4">
				{isEditing ? (
					<Textarea
						value={editedContent}
						onChange={(e) => setEditedContent(e.target.value)}
						className="min-h-[100px] resize-none"
						dir="auto"
						placeholder="اكتب ملاحظتك هنا..."
						onClick={(e) => e.stopPropagation()}
					/>
				) : (
					<p
						className={cn(
							'whitespace-pre-wrap',
							isPreview ? 'text-sm line-clamp-3' : 'text-base'
						)}
						dir="auto"
					>
						{note.content}
					</p>
				)}
			</CardContent>
			<CardFooter className="flex justify-between">
				<span className="text-xs text-muted-foreground">
					{formatDistanceToNow(new Date(note.updatedAt), {
						addSuffix: true,
						locale: ar,
					})}
				</span>
				{!isPreview && (
					<div className="flex gap-1">
						{isEditing ? (
							<>
								<Button
									variant="ghost"
									size="sm"
									onClick={(e) => {
										e.stopPropagation();
										handleCancel();
									}}
									title="إلغاء"
								>
									<X className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={(e) => {
										e.stopPropagation();
										handleUpdate();
									}}
									disabled={
										!editedContent.trim() ||
										editedContent === note.content
									}
									title="حفظ"
								>
									<Check className="h-4 w-4" />
								</Button>
							</>
						) : (
							<>
								<Button
									variant="ghost"
									size="sm"
									onClick={(e) => {
										e.stopPropagation();
										setIsEditing(true);
									}}
									title="تعديل"
								>
									<Pencil className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={(e) => {
										e.stopPropagation();
										actions.deleteNote(note.id);
									}}
									title="حذف"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</>
						)}
					</div>
				)}
				{isPreview && (
					<ChevronLeft className="h-4 w-4 text-muted-foreground" />
				)}
			</CardFooter>
		</Card>
	);
}
