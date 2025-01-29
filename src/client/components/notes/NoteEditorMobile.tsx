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
import { HighlightColorKey } from '@/constants/highlights';
import { cn, NotoNaskhArabic } from '@/client/lib/utils';


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
				<Loader2 className="h-6 w-6 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col bg-background">
			{/* Editor Area */}
			<div className="flex-1 p-4 bg-accent/30">
				<Textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="اكتب ملاحظتك هنا..."
					className={cn(
						'min-h-[120px] w-full resize-none',
						'rounded-lg bg-background/80 backdrop-blur-sm',
						'border-0 shadow-none',
						'text-base leading-relaxed',
						NotoNaskhArabic.className,
						'focus-visible:ring-1 focus-visible:ring-primary/30',
						'placeholder:text-muted-foreground/60'
					)}
				/>
			</div>

			{/* Bottom Controls */}
			<div className="bg-background/95 backdrop-blur-md border-t border-border/20 shadow-lg">
				<div className="flex items-center justify-between gap-2 p-3">
					{/* Left Controls */}
					<div className="flex items-center gap-1">
						<NoteLabel value={labelColor} onChange={setLabelColor}>
							<Button
								variant="ghost"
								size="sm"
								className={cn(
									'h-8 w-8 rounded-full',
									labelColor
										? 'text-primary bg-primary/10'
										: 'text-muted-foreground'
								)}
							>
								<div
									className="h-3 w-3 rounded-sm transition-colors"
									style={{
										backgroundColor: labelColor
											? `hsl(var(--${labelColor}))`
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
								className={cn(
									'h-8 w-8 rounded-full',
									selectedTags.length > 0
										? 'text-primary bg-primary/10'
										: 'text-muted-foreground'
								)}
							>
								<TagIcon className="h-4 w-4" />
								{selectedTags.length > 0 && (
									<span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
										{selectedTags.length}
									</span>
								)}
							</Button>
						</TagSelector>
					</div>

					{/* Right Controls */}
					<Button
						size="sm"
						onClick={handleSave}
						disabled={!content.trim() || isCreating || isUpdating}
						className={cn(
							'min-w-[60px] rounded-sm',
							'bg-primary/90 hover:bg-primary',
							'text-primary-foreground shadow-sm'
						)}
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
	);
}
