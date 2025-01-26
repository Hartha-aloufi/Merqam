import React from 'react';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from '@/client/components/ui/sheet';
import { useNotesSheet } from '@/client/stores/use-notes-sheet';
import { Button } from '@/client/components/ui/button';
import { useNotes, useTags } from '@/client/hooks/use-notes';
import { NoteCard } from './NoteCard';
import { NoteEditor } from './NoteEditor';
import { NotesFilters } from './NotesFilters';
import { Plus, FileText, Loader2 } from 'lucide-react';
import { HighlightColorKey } from '@/constants/highlights';

interface NotesSheetProps {
	topicId: string;
	lessonId: string;
}

export function NotesSheet({ topicId, lessonId }: NotesSheetProps) {
	const { isOpen, view, close, setView } = useNotesSheet();
	const { data: notes = [], isLoading } = useNotes(lessonId);
	const { data: tags = [] } = useTags();

	// Filter states
	const [searchQuery, setSearchQuery] = React.useState('');
	const [selectedColor, setSelectedColor] = React.useState<
		HighlightColorKey | 'all'
	>('all');
	const [selectedTags, setSelectedTags] = React.useState<string[]>([]);

	// Filter and sort notes
	const filteredNotes = React.useMemo(() => {
		const filtered = notes.filter((note) => {
			// Search filter
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				const matchesContent = note.content
					.toLowerCase()
					.includes(query);
				const matchesTags = note.tags?.some((tag) =>
					tag.name.toLowerCase().includes(query)
				);
				if (!matchesContent && !matchesTags) return false;
			}

			// Color filter
			if (selectedColor !== 'all' && note.labelColor !== selectedColor) {
				return false;
			}

			// Tags filter
			if (selectedTags.length > 0) {
				const noteTagIds = note.tags?.map((t) => t.id) || [];
				if (
					!selectedTags.every((tagId) => noteTagIds.includes(tagId))
				) {
					return false;
				}
			}

			return true;
		});

		// Sort by creation date (newest first)
		return filtered.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() -
				new Date(a.createdAt).getTime()
		);
	}, [notes, searchQuery, selectedColor, selectedTags]);

	const handleNewNote = () => {
		setView('editor');
	};

	// Reset filters when sheet closes
	React.useEffect(() => {
		if (!isOpen) {
			setSearchQuery('');
			setSelectedColor('all');
			setSelectedTags([]);
		}
	}, [isOpen]);

	return (
		<Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
			<SheetContent
				side="right"
				className="w-full sm:max-w-lg flex flex-col h-full p-0 border-0 sm:border-l"
				showOverlay={false}
			>
				{/* Fixed Header */}
				<div className="p-6 pb-0">
					<SheetHeader className="flex flex-row items-center justify-between">
						<SheetTitle>
							{view === 'list' ? 'الملاحظات' : 'ملاحظة جديدة'}
						</SheetTitle>

						<Button
							size="sm"
							onClick={handleNewNote}
							className="gap-1"
						>
							<Plus className="h-3 w-3" />
							كتابة ملاحظة جديدة
						</Button>
					</SheetHeader>
				</div>

				{/* Scrollable Content */}
				<div className="flex-1 overflow-y-auto">
					<div className="p-6">
						{view === 'list' ? (
							<div className="space-y-6">
								{/* Filters */}
								<NotesFilters
									searchQuery={searchQuery}
									onSearchChange={setSearchQuery}
									selectedColor={selectedColor}
									onColorChange={setSelectedColor}
									selectedTags={selectedTags}
									onTagsChange={setSelectedTags}
									availableTags={tags}
								/>

								{/* Notes List */}
								<div className="space-y-4">
									{isLoading ? (
										<div className="flex items-center justify-center py-8">
											<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
										</div>
									) : filteredNotes.length === 0 ? (
										<div className="flex flex-col items-center justify-center space-y-2 rounded-lg border-2 border-dashed p-8 text-center">
											<FileText className="h-12 w-12 text-muted-foreground/50" />
											<h3 className="text-lg font-semibold">
												لا توجد ملاحظات
											</h3>
											<p className="text-sm text-muted-foreground">
												{notes.length === 0
													? 'قم بإضافة ملاحظة جديدة للبدء'
													: 'لا توجد نتائج تطابق عوامل التصفية المحددة'}
											</p>
										</div>
									) : (
										filteredNotes.map((note) => (
											<NoteCard
												key={note.id}
												note={note}
											/>
										))
									)}
								</div>
							</div>
						) : (
							<NoteEditor topicId={topicId} lessonId={lessonId} />
						)}
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
