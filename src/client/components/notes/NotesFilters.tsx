import React from 'react';
import { Input } from '@/client/components/ui/input';
import { Button } from '@/client/components/ui/button';
import { Search, ChevronDown } from 'lucide-react';
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
		<div className="space-y-3">
			{/* Search Input and Clear Filters */}
			<div className="flex items-center gap-2">
				<div className="relative flex-1">
					<Search className="absolute right-2 top-2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="البحث في الملاحظات..."
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						className="pl-2 pr-8 h-8 text-sm sm:text-base"
					/>
				</div>
				{(searchQuery || hasActiveFilters) && (
					<Button
						variant="ghost"
						size="sm"
						className="h-8 px-2 text-xs"
						onClick={() => {
							onSearchChange('');
							onColorChange('all');
							onTagsChange([]);
						}}
					>
						مسح
					</Button>
				)}
			</div>

			{/* Filters Collapse */}
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<div className="flex items-center justify-between">
					<CollapsibleTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="h-8 -ml-2 gap-2 text-xs text-muted-foreground hover:text-foreground"
						>
							<ChevronDown
								className={cn(
									'h-3 w-3 transition-transform duration-200',
									isOpen && 'rotate-180'
								)}
							/>
							<span>خيارات التصفية</span>
							{hasActiveFilters && (
								<Badge
									variant="secondary"
									className="h-4 px-1 text-xs font-normal"
								>
									{activeFiltersCount}
								</Badge>
							)}
						</Button>
					</CollapsibleTrigger>
				</div>

				<CollapsibleContent className="pt-3 space-y-3">
					{/* Color Filters */}
					<div className="space-y-2">
						<div className="flex flex-wrap gap-1.5">
							{(
								[
									'all',
									...Object.keys(HIGHLIGHT_COLORS),
								] as const
							).map((color) => (
								<Button
									key={color}
									variant="ghost"
									size="sm"
									onClick={() => onColorChange(color)}
									className={cn(
										'h-7 gap-1.5 px-2 text-xs',
										selectedColor === color
											? 'bg-accent text-accent-foreground'
											: 'text-muted-foreground hover:text-foreground'
									)}
								>
									{color !== 'all' && (
										<div
											className="h-3 w-3 rounded-sm ring-1  ring-border"
											style={{
												backgroundColor:
													HIGHLIGHT_COLORS[color]
														.background,
											}}
										/>
									)}
									{colorLabels[color]}
								</Button>
							))}
						</div>
					</div>

					{/* Tag Filters */}
					{availableTags.length > 0 && (
						<div className="flex flex-wrap gap-1.5">
							{availableTags.map((tag) => (
								<Button
									key={tag.id}
									variant="ghost"
									size="sm"
									onClick={() => {
										onTagsChange(
											selectedTags.includes(tag.id)
												? selectedTags.filter(
														(id) => id !== tag.id
												  )
												: [...selectedTags, tag.id]
										);
									}}
									className={cn(
										'h-7 px-2 text-xs',
										selectedTags.includes(tag.id)
											? 'bg-accent text-accent-foreground'
											: 'text-muted-foreground hover:text-foreground'
									)}
								>
									{tag.name}
								</Button>
							))}
						</div>
					)}
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
}
