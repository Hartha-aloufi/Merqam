import React from 'react';
import { Button } from '@/components/ui/button';
import { Gauge } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

interface SpeedControlProps {
	currentSpeed: number;
	onSpeedChange: (speed: number) => void;
}

export const SpeedControl = React.memo(function SpeedControl({
	currentSpeed,
	onSpeedChange,
}: SpeedControlProps) {
	return (
		<DropdownMenu modal={false}>
			<Tooltip>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="h-8 w-8">
							<div className="flex items-center">
								<Gauge className="h-4 w-4" />
							</div>
						</Button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent side="top">
					<p>سرعة التشغيل</p>
				</TooltipContent>
			</Tooltip>

			<DropdownMenuContent align="center" className="w-28">
				{PLAYBACK_SPEEDS.map((speed) => (
					<DropdownMenuItem
						key={speed}
						className="justify-center"
						onSelect={() => onSpeedChange(speed)}
					>
						<div
							className="flex items-center gap-2"
							style={{
								fontWeight:
									currentSpeed === speed ? 'bold' : 'normal',
							}}
						>
							<span>{speed}x</span>
							{currentSpeed === speed && (
								<div className="h-1.5 w-1.5 rounded-sm bg-primary" />
							)}
						</div>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
});
