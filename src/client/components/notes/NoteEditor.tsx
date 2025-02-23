import React, { useState } from 'react';
import { Button } from '@/client/components/ui/button';
import { Textarea } from '@/client/components/ui/textarea';
import { useNotesSheet } from '@/client/stores/use-notes-sheet';
import {
	useNote,
	useCreateNote,
	useUpdateNote,
} from '@/client/hooks/use-notes';
import { ArrowRight, Send } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/card';
import { TagSelector } from './TagSelector';
import { HighlightColorKey } from '@/constants/highlights';
import { NoteLabel } from './NoteLabel';
import { cn, NotoNaskhArabic } from '@/client/lib/utils';

interface NoteEditorProps {
	lessonId: string;
}

export function NoteEditor({ lessonId }: NoteEditorProps) {
	const [content, setContent] = useState('');
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [labelColor, setLabelColor] = useState<HighlightColorKey | null>(
		null
	);

	const { selectedNoteId, highlightId, close, setView } = useNotesSheet();
	const { data: existingNote } = useNote(lessonId, selectedNoteId);

	const { mutate: createNote, isPending: isCreating } = useCreateNote();
	const { mutate: updateNote, isPending: isUpdating } = useUpdateNote();

	// temp
	const initialContent = null;

	// Initialize editor with existing note data
	React.useEffect(() => {
		if (existingNote) {
			setContent(existingNote.content);
			setSelectedTags(existingNote.tags?.map((t) => t.id) || []);
			setLabelColor(existingNote.labelColor || null);
		} else {
			setContent('');
			setSelectedTags([]);
			setLabelColor(null);
		}
	}, [existingNote]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!content.trim()) return;

		if (selectedNoteId) {
			updateNote(
				{
					noteId: selectedNoteId,
					data: {
						content: content.trim(),
						tags: selectedTags,
						labelColor,
					},
				},
				{
					onSuccess: () => {
						setView('list');
					},
				}
			);
		} else {
			createNote(
				{
					lessonId,
					content: content.trim(),
					tags: selectedTags,
					highlightId: highlightId || undefined,
					labelColor: labelColor || undefined,
				},
				{
					onSuccess: () => {
						close();
					},
				}
			);
		}
	};

	const handleBack = () => {
		setView('list');
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4 w-full">
			{/* Header */}
			<div className="flex items-center justify-between">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={handleBack}
				>
					<ArrowRight className="ml-2 h-4 w-4" />
					رجوع
				</Button>
			</div>

			<div className="flex items-center gap-2">
				{/* Label Selector */}
				<NoteLabel value={labelColor} onChange={setLabelColor} />

				{/* Tag Selector */}
				<TagSelector
					selectedTags={selectedTags}
					onTagsChange={setSelectedTags}
				/>
			</div>

			{/* Content Editor */}
			<Card className="border-2 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-200">
				<CardContent className="pt-4">
					<div className="relative rounded-lg focus-within:bg-muted/50 transition-all duration-200">
						<Textarea
							// ref={textareaRef}
							placeholder="اكتب ملاحظتك هنا..."
							value={content}
							onChange={(e) => setContent(e.target.value)}
							className={cn(
								'min-h-[150px] resize-none text-base',
								NotoNaskhArabic.className
							)}
							// dir="auto"
						/>
					</div>
				</CardContent>

				<CardFooter className="flex justify-end gap-2 py-3 px-4 bg-muted/30 border-t">
					<Button
						type="submit"
						size="sm"
						disabled={!content.trim() || isCreating || isUpdating}
					>
						<Send className="h-4 w-4 ml-2" />
						{initialContent ? 'حفظ التغييرات' : 'حفظ'}
					</Button>
				</CardFooter>
			</Card>

			{/* Character Count */}
			<div className="text-xs text-muted-foreground">
				{content.length}/1000
			</div>
		</form>
	);
}
