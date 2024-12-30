// components/highlight/HighlightNavigationControls.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';

interface HighlightNavigationControlsProps {
	navigableCount: number;
	currentIndex: number;
	currentIsGroup: boolean;
	onNavigate: (direction: 'prev' | 'next') => void;
}

export const HighlightNavigationControls = React.memo(
	function HighlightNavigationControls({
		navigableCount,
		currentIndex,
		currentIsGroup,
		onNavigate,
	}: HighlightNavigationControlsProps) {
		if (navigableCount === 0) return null;

		return (
			<div className="flex items-center gap-2">
				{/* Current position indicator with group icon */}
				<div className="flex items-center gap-1 text-sm text-muted-foreground">
					<span>{currentIndex + 1}</span>
					<span>/</span>
					<span>{navigableCount}</span>
					{currentIsGroup && (
						<Tooltip>
							<TooltipTrigger>
								<div className="rounded-sm bg-muted px-1 text-[10px]">
									مجموعة
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>تظليل متعدد الفقرات</p>
							</TooltipContent>
						</Tooltip>
					)}
				</div>

				{/* Navigation buttons */}
				<div className="flex gap-1">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => onNavigate('prev')}
								className="h-8 w-8"
							>
								<ChevronUp className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>التظليل السابق (Alt + P)</p>
						</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => onNavigate('next')}
								className="h-8 w-8"
							>
								<ChevronDown className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>التظليل التالي (Alt + N)</p>
						</TooltipContent>
					</Tooltip>
				</div>
			</div>
		);
	}
);
