import React from 'react';
import { Button } from '@/client/components/ui/button';
import { Textarea } from '@/client/components/ui/textarea';
import { useNotesSheet } from '@/client/stores/use-notes-sheet';
import {
	useNote,
	useCreateNote,
	useUpdateNote,
	useTags,
} from '@/client/hooks/use-notes';
import { X, ArrowRight, Send } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/card';
import { TagSelector } from './TagSelector';

interface NoteEditorProps {
	topicId: string;
	lessonId: string;
}

export function NoteEditor({ topicId, lessonId }: NoteEditorProps) {
	const [content, setContent] = React.useState('');
	const [selectedTags, setSelectedTags] = React.useState<string[]>([]);

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
		} else {
			setContent('');
			setSelectedTags([]);
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
					topicId,
					lessonId,
					content: content.trim(),
					tags: selectedTags,
					highlightId: highlightId || undefined,
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
		if (selectedNoteId) {
			setView('list');
		} else {
			close();
		}
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

			{/* Tags Section */}
			<TagSelector
				selectedTags={selectedTags}
				onTagsChange={setSelectedTags}
			/>

			{/* Content Editor */}
			<Card className="border-2 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-200">
				<CardContent className="pt-4">
					<div className="relative rounded-lg focus-within:bg-muted/50 transition-all duration-200">
						<Textarea
							// ref={textareaRef}
							placeholder="اكتب ملاحظتك هنا..."
							value={content}
							onChange={(e) => setContent(e.target.value)}
							className="min-h-[150px] resize-none border-none focus:ring-0 text-base bg-transparent"
							dir="auto"
						/>
					</div>
				</CardContent>

				<CardFooter className="flex justify-end gap-2 py-3 px-4 bg-muted/30 border-t">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setContent('')}
						disabled={!content}
					>
						<X className="h-4 w-4 ml-2" />
						مسح
					</Button>
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
