import React from 'react';
import { Button } from '@/client/components/ui/button';
import { Textarea } from '@/client/components/ui/textarea';
import {
	useNote,
	useCreateNote,
	useUpdateNote,
} from '@/client/hooks/use-notes';
import { Loader2, Tag as TagIcon } from 'lucide-react';
import { NoteLabel } from './NoteLabel';
import { TagSelector } from './TagSelector';
import { HIGHLIGHT_COLORS, HighlightColorKey } from '@/constants/highlights';

interface NoteEditorMobileProps {
	topicId: string;
	lessonId: string;
	noteId?: string;
	highlightId?: string;
	onSave?: () => void;
}

export function NoteEditorMobile({
	topicId,
	lessonId,
	noteId,
	highlightId,
	onSave,
}: NoteEditorMobileProps) {
	const [content, setContent] = React.useState('');
	const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
	const [labelColor, setLabelColor] =
		React.useState<HighlightColorKey | null>(null);

	const { data: existingNote, isLoading: isLoadingNote } = useNote(
		lessonId,
		noteId || null
	);
	const { mutate: createNote, isPending: isCreating } = useCreateNote();
	const { mutate: updateNote, isPending: isUpdating } = useUpdateNote();

	// Reset form when note changes
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

	const handleSave = () => {
		if (!content.trim()) return;

		const handleSuccess = () => {
			onSave?.();
		};

		if (noteId) {
			updateNote(
				{
					noteId,
					data: {
						content: content.trim(),
						tags: selectedTags,
						labelColor,
					},
				},
				{ onSuccess: handleSuccess }
			);
		} else {
			createNote(
				{
					topicId,
					lessonId,
					content: content.trim(),
					tags: selectedTags,
					labelColor,
					highlightId,
				},
				{ onSuccess: handleSuccess }
			);
		}
	};

	if (isLoadingNote) {
		return (
			<div className="flex h-24 items-center justify-center">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col">
			{/* Content Editor - Main Focus */}
			<div className="p-4 pb-t">
				<Textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="اكتب ملاحظتك هنا..."
					className="min-h-[120px] resize-none rounded-none border-0 p-0 text-base shadow-none focus-visible:ring-0"
				/>
			</div>

			{/* Bottom Bar */}
			<div className="border-t bg-muted/50">
				{/* Controls Bar */}
				<div className="flex items-center justify-between gap-2 px-4 py-2">
					{/* Left Controls */}
					<div className="flex items-center gap-1">
						<NoteLabel value={labelColor} onChange={setLabelColor}>
							<Button
								variant="ghost"
								size="sm"
								className={
									labelColor
										? 'text-primary'
										: 'text-muted-foreground'
								}
							>
								<div
									className="h-3 w-3 rounded-sm"
									style={{
										backgroundColor: labelColor
											? HIGHLIGHT_COLORS[labelColor]
													.background
											: 'transparent',
										border: !labelColor
											? '1px solid currentColor'
											: 'none',
									}}
								/>
							</Button>
						</NoteLabel>

						<TagSelector
							selectedTags={selectedTags}
							onTagsChange={setSelectedTags}
              renderSelectedTags={false}
						>
							<Button
								variant="ghost"
								size="sm"
								className={
									selectedTags.length > 0
										? 'text-primary'
										: 'text-muted-foreground'
								}
							>
								<TagIcon className="h-4 w-4" />
								{selectedTags.length > 0 && (
									<span className="text-xs">
										{selectedTags.length}
									</span>
								)}
							</Button>
						</TagSelector>
					</div>

					{/* Right Controls */}
					<div className="flex items-center gap-1">
						<Button
							size="sm"
							onClick={handleSave}
							disabled={
								!content.trim() || isCreating || isUpdating
							}
						>
							{isCreating || isUpdating ? (
								<>
									<Loader2 className="ml-2 h-3 w-3 animate-spin" />
									جاري الحفظ...
								</>
							) : noteId ? (
								'تحديث'
							) : (
								'إضافة'
							)}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
