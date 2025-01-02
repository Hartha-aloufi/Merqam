import { memo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/client/lib/utils';
import { CollapseButtonProps } from '@/types/video';

export const CollapseButton = memo(function CollapseButton({
	position,
	isCollapsed,
	isPlaying,
	onToggle,
}: CollapseButtonProps) {
	return (
		<button
			onClick={onToggle}
			className={cn(
				'absolute left-1/2 transform -translate-x-1/2',
				'bg-background border px-3 py-1 shadow-lg',
				'group hover:bg-accent transition-colors',
				position === 'bottom'
					? '-top-8 border-b-0 rounded-t-lg'
					: '-bottom-8 border-t-0 rounded-b-lg'
			)}
		>
			{isCollapsed ? (
				<div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground">
					{position === 'bottom' ? (
						<ChevronUp className="h-4 w-4" />
					) : (
						<ChevronDown className="h-4 w-4" />
					)}
					<span>{isPlaying ? 'يتم التشغيل' : 'متوقف'}</span>
				</div>
			) : position === 'bottom' ? (
				<ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
			) : (
				<ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
			)}
		</button>
	);
});
