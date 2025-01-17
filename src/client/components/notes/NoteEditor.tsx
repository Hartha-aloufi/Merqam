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
import { Tag, Tags, Plus, X, Loader2, ArrowRight } from 'lucide-react';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from '@/client/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/client/components/ui/popover';
import { cn } from '@/client/lib/utils';

interface NoteEditorProps {
	topicId: string;
	lessonId: string;
}

export function NoteEditor({ topicId, lessonId }: NoteEditorProps) {
	const [content, setContent] = React.useState('');
	const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
	const [isTagsOpen, setIsTagsOpen] = React.useState(false);

	const { selectedNoteId, highlightId, close, setView } = useNotesSheet();
	const { data: tags = [] } = useTags();

	const { data: existingNote, isLoading: isLoadingNote } = useNote(
		selectedNoteId || '',
		!!selectedNoteId
	);

	const { mutate: createNote, isPending: isCreating } = useCreateNote();
	const { mutate: updateNote, isPending: isUpdating } = useUpdateNote();

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

		if (!content.trim()) {
			return;
		}

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
					highlightId,
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

	const toggleTag = (tagId: string) => {
		setSelectedTags((prev) =>
			prev.includes(tagId)
				? prev.filter((id) => id !== tagId)
				: [...prev, tagId]
		);
	};

	if (isLoadingNote) {
		return (
			<div className="flex h-96 items-center justify-center">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
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
				<Button
					type="submit"
					disabled={!content.trim() || isCreating || isUpdating}
				>
					{isCreating || isUpdating ? (
						<>
							<Loader2 className="ml-2 h-4 w-4 animate-spin" />
							جاري الحفظ...
						</>
					) : selectedNoteId ? (
						'تحديث'
					) : (
						'إضافة'
					)}
				</Button>
			</div>

			{/* Tags Section */}
			<div className="space-y-2">
				<div className="flex flex-wrap gap-1">
					{selectedTags.map((tagId) => {
						const tag = tags.find((t) => t.id === tagId);
						if (!tag) return null;

						return (
							<span
								key={tag.id}
								className="group flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-sm text-primary"
							>
								{tag.name}
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="h-4 w-4 p-0 opacity-50 hover:opacity-100"
									onClick={() => toggleTag(tag.id)}
								>
									<X className="h-3 w-3" />
								</Button>
							</span>
						);
					})}

					<Popover open={isTagsOpen} onOpenChange={setIsTagsOpen}>
						<PopoverTrigger asChild>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="h-7 gap-1"
							>
								<Tag className="h-3 w-3" />
								<Plus className="h-3 w-3" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="p-0" align="start">
							<Command>
								<CommandInput placeholder="ابحث عن تصنيف..." />
								<CommandEmpty>لا يوجد تصنيفات</CommandEmpty>
								<CommandGroup>
									{tags.map((tag) => (
										<CommandItem
											key={tag.id}
											onSelect={() => {
												toggleTag(tag.id);
												setIsTagsOpen(false);
											}}
										>
											<div
												className={cn(
													'ml-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
													selectedTags.includes(
														tag.id
													)
														? 'bg-primary text-primary-foreground'
														: 'opacity-50 [&_svg]:invisible'
												)}
											>
												<Tags className="h-4 w-4" />
											</div>
											{tag.name}
										</CommandItem>
									))}
								</CommandGroup>
							</Command>
						</PopoverContent>
					</Popover>
				</div>
			</div>

			{/* Content Editor */}
			<Textarea
				value={content}
				onChange={(e) => setContent(e.target.value)}
				placeholder="اكتب ملاحظتك هنا..."
				className="min-h-[300px] resize-none"
				maxLength={1000}
			/>

			{/* Character Count */}
			<div className="text-xs text-muted-foreground">
				{content.length}/1000
			</div>
		</form>
	);
}
