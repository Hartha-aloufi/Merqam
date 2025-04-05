import React from 'react';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/client/components/ui/popover';
import { Button } from '@/client/components/ui/button';
import { Trash2 } from 'lucide-react';
import { getHighlightColor } from '@/constants/highlights';
import { TextHighlight } from '@/types/highlight';

interface HighlightMarkProps {
	highlight: TextHighlight;
	onRemove: (id: string) => void;
	children: React.ReactNode;
}

/**
 * A highlighted text component with a delete popover
 */
export function HighlightMark({
	highlight,
	onRemove,
	children,
}: HighlightMarkProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<mark
					data-highlight={highlight.id}
					className="cursor-pointer hover:brightness-95 transition-all"
					style={{
						backgroundColor: getHighlightColor(highlight.color),
						borderRadius: '2px',
					}}
				>
					{children}
				</mark>
			</PopoverTrigger>
			<PopoverContent className="w-64 p-3">
				<p className="text-sm text-muted-foreground mb-3 line-clamp-2">
					{children}
				</p>
				<Button
					variant="destructive"
					size="sm"
					className="w-full"
					onClick={() => onRemove(highlight.id)}
				>
					<Trash2 className="h-4 w-4 ml-2" />
					حذف التظليل
				</Button>
			</PopoverContent>
		</Popover>
	);
}
