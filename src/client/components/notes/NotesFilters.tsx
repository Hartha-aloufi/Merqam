import React from 'react';
import { Input } from '@/client/components/ui/input';
import { Search, ChevronDown, Filter } from 'lucide-react';
import { Badge } from '@/client/components/ui/badge';
import { cn } from '@/client/lib/utils';
import { HIGHLIGHT_COLORS, HighlightColorKey } from '@/constants/highlights';
import { NoteTag } from '@/types/note';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/client/components/ui/collapsible';

interface NotesFiltersProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
	selectedColor: HighlightColorKey | 'all';
	onColorChange: (color: HighlightColorKey | 'all') => void;
	selectedTags: string[];
	onTagsChange: (tags: string[]) => void;
	availableTags: NoteTag[];
}

const colorLabels: Record<HighlightColorKey | 'all', string> = {
	all: 'الكل',
	yellow: 'أصفر',
	green: 'أخضر',
	blue: 'أزرق',
	purple: 'بنفسجي',
};

export function NotesFilters({
	searchQuery,
	onSearchChange,
	selectedColor,
	onColorChange,
	selectedTags,
	onTagsChange,
	availableTags,
}: NotesFiltersProps) {
	const [isOpen, setIsOpen] = React.useState(false);

	const hasActiveFilters = selectedColor !== 'all' || selectedTags.length > 0;
	const activeFiltersCount =
		(selectedColor !== 'all' ? 1 : 0) + (selectedTags.length > 0 ? 1 : 0);

	return (
		<div className="space-y-4">
			{/* Search Input */}
			<div className="relative">
				<Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="البحث في الملاحظات..."
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					className="pl-3 pr-9"
				/>
			</div>

			{/* Filters Collapse */}
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
					<ChevronDown
						className={cn(
							'h-3 w-3 transition-transform duration-200',
							isOpen && 'rotate-180'
						)}
					/>
					<span>تصفية</span>
					{hasActiveFilters && (
						<Badge
							variant="secondary"
							className="h-4 px-1 text-xs font-normal"
						>
							{activeFiltersCount}
						</Badge>
					)}
					<Filter className="h-3 w-3" />
				</CollapsibleTrigger>

				<CollapsibleContent className="space-y-4 pt-4">
					{/* Color Filters */}
					<div className="space-y-2">
						<h4 className="text-sm font-medium text-muted-foreground px-1">
							تصفية حسب اللون
						</h4>
						<div className="flex flex-wrap gap-2">
							{(
								[
									'all',
									...Object.keys(HIGHLIGHT_COLORS),
								] as const
							).map((color) => (
								<button
									key={color}
									onClick={() => onColorChange(color)}
									className={cn(
										'flex items-center gap-2 rounded-full px-3 py-1 text-sm transition-colors',
										'border border-input hover:bg-accent',
										selectedColor === color && 'bg-accent'
									)}
								>
									{color !== 'all' && (
										<div
											className="h-2 w-2 rounded-full"
											style={{
												backgroundColor:
													HIGHLIGHT_COLORS[color]
														.background,
											}}
										/>
									)}
									{colorLabels[color]}
								</button>
							))}
						</div>
					</div>

					{/* Tag Filters */}
					{availableTags.length > 0 && (
						<div className="space-y-2">
							<h4 className="text-sm font-medium text-muted-foreground px-1">
								تصفية حسب التصنيفات
							</h4>
							<div className="flex flex-wrap gap-1">
								{availableTags.map((tag) => (
									<Badge
										key={tag.id}
										variant={
											selectedTags.includes(tag.id)
												? 'default'
												: 'outline'
										}
										className="cursor-pointer"
										onClick={() => {
											onTagsChange(
												selectedTags.includes(tag.id)
													? selectedTags.filter(
															(id) =>
																id !== tag.id
													  )
													: [...selectedTags, tag.id]
											);
										}}
									>
										{tag.name}
									</Badge>
								))}
							</div>
						</div>
					)}
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
}
