// components/highlight/CollapsibleToolbar.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useVideoSettings } from '@/stores/use-video-settings';

interface CollapsibleToolbarProps {
	children: React.ReactNode;
	pullTabContent: React.ReactNode;
	className?: string;
}

export const CollapsibleToolbar: React.FC<CollapsibleToolbarProps> = ({
	children,
	pullTabContent,
	className,
}) => {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const { position } = useVideoSettings();

	const isPlacedBottom = position === 'bottom';
	const collapsedClass = isPlacedBottom
		? '-translate-y-full'
		: 'translate-y-full';
	const expandedClass = isPlacedBottom ? 'translate-y-0' : '-translate-y-0';

	return (
		<div
			className={cn(
				'fixed inset-x-0 z-40 transition-all duration-300',
				// Place it below the header (z-50)
				isPlacedBottom ? 'top-[65px]' : 'bottom-0',
				isCollapsed ? collapsedClass : expandedClass,
				className
			)}
		>
			{/* Main Toolbar */}
			<div
				className={cn(
					'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
					'px-4 py-2 shadow-sm',
					isPlacedBottom ? 'border-b' : 'border-t',
					'flex items-center gap-3'
				)}
			>
				{/* Collapse Toggle */}
				<Button
					variant="ghost"
					size="sm"
					className="h-8 w-8 p-0 shrink-0"
					onClick={() => setIsCollapsed(!isCollapsed)}
				>
					{isPlacedBottom &&
						(isCollapsed ? (
							<ChevronDown className="h-4 w-4" />
						) : (
							<ChevronUp className="h-4 w-4" />
						))}

					{!isPlacedBottom &&
						(isCollapsed ? (
							<ChevronUp className="h-4 w-4" />
						) : (
							<ChevronDown className="h-4 w-4" />
						))}
				</Button>
				{/* Toolbar Content */}
				<div className="flex-1 flex items-center gap-3">{children}</div>
			</div>

			{/* Pull Tab (visible when collapsed) */}
			<AnimatePresence>
				{isCollapsed && (
					<motion.div
						initial={{
							opacity: 0,
							y: isPlacedBottom ? -10 : 10,
						}}
						animate={{ opacity: 1, y: 0 }}
						exit={{
							opacity: 0,
							y: isPlacedBottom ? -10 : 10,
						}}
						className={cn(
							'absolute left-1/2 -translate-x-1/2',
							isPlacedBottom ? '-bottom-[29px]' : '-top-[29px]'
						)}
					>
						<Button
							variant="outline"
							size="sm"
							className={cn(
								'h-6 px-2 py-0 bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60',
								isPlacedBottom
									? 'rounded-t-none rounded-b-lg border-t-0'
									: 'rounded-b-none rounded-t-lg border-b-0'
							)}
							onClick={() => setIsCollapsed(false)}
						>
							{pullTabContent}
						</Button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
