import React from 'react';
import { Button } from '@/client/components/ui/button';
import { Tag as TagIcon, Tags, Plus, X, Loader2 } from 'lucide-react';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '@/client/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/client/components/ui/popover';
import { cn } from '@/client/lib/utils';
import { useTags, useCreateTag } from '@/client/hooks/use-notes';

interface TagSelectorProps {
	selectedTags: string[];
	onTagsChange: (tags: string[]) => void;
	renderSelectedTags?: boolean
}

export function TagSelector({
	selectedTags,
	onTagsChange,
	renderSelectedTags,
}: TagSelectorProps) {
	const [isOpen, setIsOpen] = React.useState(false);
	const [search, setSearch] = React.useState('');
	const inputRef = React.useRef<HTMLInputElement>(null);

	const { data: tags = [] } = useTags();
	const { mutate: createTag, isPending: isCreating } = useCreateTag();

	const filteredTags = React.useMemo(() => {
		return tags.filter((tag) =>
			tag.name.toLowerCase().includes(search.toLowerCase())
		);
	}, [tags, search]);

	const handleTagSelect = (tagId: string) => {
		onTagsChange(
			selectedTags.includes(tagId)
				? selectedTags.filter((id) => id !== tagId)
				: [...selectedTags, tagId]
		);
	};

	const handleCreateTag = () => {
		if (!search.trim()) return;

		createTag(
			{ name: search.trim() },
			{
				onSuccess: (newTag) => {
					handleTagSelect(newTag.id);
					setSearch('');
				},
			}
		);
	};

	const isValidNewTag =
		search.trim().length > 0 &&
		!filteredTags.some(
			(tag) => tag.name.toLowerCase() === search.toLowerCase()
		);

	return (
		<div>
			<div className="flex flex-wrap gap-1">
				{/* Selected Tags */}
				{renderSelectedTags &&
					selectedTags.map((tagId) => {
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
									className="h-4 w-4 p-0 opacity-50 hover:opacity-100"
									onClick={() => handleTagSelect(tag.id)}
								>
									<X className="h-3 w-3" />
								</Button>
							</span>
						);
					})}

				{/* Tag Selector */}
				<Popover open={isOpen} onOpenChange={setIsOpen}>
					<PopoverTrigger asChild>
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="h-7 gap-1"
						>
							<TagIcon className="h-3 w-3" />
							<Plus className="h-3 w-3" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="p-0 w-[200px]" align="start">
						<Command shouldFilter={false}>
							<CommandInput
								ref={inputRef}
								placeholder="ابحث عن تصنيف..."
								value={search}
								onValueChange={setSearch}
							/>
							<CommandList>
								<CommandEmpty>
									{isValidNewTag ? (
										<button
											className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
											onClick={handleCreateTag}
											disabled={isCreating}
										>
											{isCreating ? (
												<Loader2 className="h-3 w-3 animate-spin" />
											) : (
												<Plus className="h-3 w-3" />
											)}
											إنشاء تصنيف &quot;{search}&quot;
										</button>
									) : (
										'لا توجد تصنيفات'
									)}
								</CommandEmpty>

								{filteredTags.length > 0 && (
									<>
										<CommandGroup>
											{filteredTags.map((tag) => (
												<CommandItem
													key={tag.id}
													onSelect={() => {
														handleTagSelect(tag.id);
														setSearch('');
													}}
												>
													<div
														className={cn(
															'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
															selectedTags.includes(
																tag.id
															)
																? 'bg-primary text-primary-foreground'
																: 'opacity-50'
														)}
													>
														{selectedTags.includes(
															tag.id
														) && (
															<Tags className="h-4 w-4" />
														)}
													</div>
													<span>{tag.name}</span>
												</CommandItem>
											))}
										</CommandGroup>

										{isValidNewTag && (
											<>
												<CommandSeparator />
												<CommandGroup>
													<CommandItem
														onSelect={
															handleCreateTag
														}
														disabled={isCreating}
													>
														{isCreating ? (
															<Loader2 className="mr-2 h-3 w-3 animate-spin" />
														) : (
															<Plus className="mr-2 h-3 w-3" />
														)}
														إنشاء تصنيف &quot;
														{search}&quot;
													</CommandItem>
												</CommandGroup>
											</>
										)}
									</>
								)}
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
}

TagSelector.defaultProps = {
	renderSelectedTags: true,
};