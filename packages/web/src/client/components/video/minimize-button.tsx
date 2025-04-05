import { memo } from 'react';
import { Button } from '@/client/components/ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/client/components/ui/tooltip';

interface MinimizeButtonProps {
	isMinimized: boolean;
	onToggle: () => void;
}

export const MinimizeButton = memo(function MinimizeButton({
	isMinimized,
	onToggle,
}: MinimizeButtonProps) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button variant="ghost" size="icon" onClick={onToggle}>
					{isMinimized ? (
						<Maximize2 className="h-4 w-4" />
					) : (
						<Minimize2 className="h-4 w-4" />
					)}
				</Button>
			</TooltipTrigger>
			<TooltipContent>
				<p>{isMinimized ? 'تكبير' : 'تصغير'} المشغل</p>
			</TooltipContent>
		</Tooltip>
	);
});
