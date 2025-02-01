import React, { useRef, useEffect } from 'react';
import { Note } from '@/types/note';
import { useUpdateNote } from '@/client/hooks/use-notes';
import { Textarea } from '@/client/components/ui/textarea';
import { Button } from '@/client/components/ui/button';
import { Loader2, X } from 'lucide-react';

interface InlineNoteEditorProps {
	note: Note;
	onClose: () => void;
}

/**
 * Minimal inline editor for notes
 */
export function InlineNoteEditor({ note, onClose }: InlineNoteEditorProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const { mutate: updateNote, isPending } = useUpdateNote();

	// Focus textarea on mount
	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.focus();
			textareaRef.current.setSelectionRange(
				textareaRef.current.value.length,
				textareaRef.current.value.length
			);
		}
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!textareaRef.current?.value.trim()) return;

		updateNote(
			{
				noteId: note.id,
				data: {
					content: textareaRef.current.value.trim(),
				},
			},
			{
				onSuccess: () => onClose(),
			}
		);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-2">
			<Textarea
				ref={textareaRef}
				defaultValue={note.content}
				className="min-h-[100px] resize-none focus-visible:ring-1"
				placeholder="اكتب ملاحظتك هنا..."
			/>

			<div className="flex justify-end gap-2">
				<Button
					type="button"
					size="sm"
					variant="ghost"
					onClick={onClose}
				>
					<X className="h-4 w-4 ml-1" />
					إلغاء
				</Button>
				<Button type="submit" size="sm" disabled={isPending}>
					{isPending ? (
						<>
							<Loader2 className="ml-2 h-3 w-3 animate-spin" />
							جاري الحفظ...
						</>
					) : (
						'حفظ'
					)}
				</Button>
			</div>
		</form>
	);
}
