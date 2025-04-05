import React from 'react';
import { Button } from '@/client/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/client/components/ui/popover';
import { Tag } from 'lucide-react';
import { cn } from '@/client/lib/utils';
import { HIGHLIGHT_COLORS, HighlightColorKey } from '@/constants/highlights';

interface NoteLabelProps {
	value?: HighlightColorKey | null;
	onChange: (color: HighlightColorKey | null) => void;
	className?: string;
}

// Color names in Arabic
const colorNames: Record<HighlightColorKey, string> = {
	yellow: 'أصفر',
	green: 'أخضر',
	blue: 'أزرق',
	purple: 'بنفسجي',
};

export function NoteLabel({ value, onChange, className }: NoteLabelProps) {
	const [open, setOpen] = React.useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className={cn(
						'gap-2 h-7',
						!value && 'text-muted-foreground',
						className
					)}
				>
					<Tag className="h-3 w-3" />
					{value ? (
						<>
							<div
								className="h-3 w-3 rounded-sm"
								style={{
									backgroundColor:
										HIGHLIGHT_COLORS[value].background,
								}}
							/>
							<span className="text-xs">{colorNames[value]}</span>
						</>
					) : (
						<span className="text-xs">تعليم الملاحظة</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-48 p-2" align="start">
				<div className="flex flex-col gap-1">
					{/* Remove label option */}
					{value && (
						<Button
							variant="ghost"
							size="sm"
							className="justify-start text-xs"
							onClick={() => {
								onChange(null);
								setOpen(false);
							}}
						>
							إزالة التعليم
						</Button>
					)}

					{/* Color options */}
					{Object.entries(HIGHLIGHT_COLORS).map(
						([key, { background }]) => (
							<Button
								key={key}
								variant="ghost"
								size="sm"
								className={cn(
									'justify-start gap-2',
									value === key && 'bg-accent'
								)}
								onClick={() => {
									onChange(key as HighlightColorKey);
									setOpen(false);
								}}
							>
								<div
									className="h-3 w-3 rounded-sm ring-1 ring-inset ring-black/10"
									style={{ backgroundColor: background }}
								/>
								<span className="text-xs">
									{colorNames[key as HighlightColorKey]}
								</span>
							</Button>
						)
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
