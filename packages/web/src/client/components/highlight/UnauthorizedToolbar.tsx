import React from 'react';
import { Highlighter, ChevronDown } from 'lucide-react';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/client/components/ui/tooltip';
import { cn } from '@/client/lib/utils';
import { CollapsibleToolbar } from './CollapsibleToolbar';
import { motion, AnimatePresence } from 'framer-motion';

interface UnauthorizedToolbarProps {
	className?: string;
}

export const UnauthorizedToolbar: React.FC<UnauthorizedToolbarProps> = ({
	className,
}) => {
	return (
		<CollapsibleToolbar
			className={className}
			pullTabContent={
				<>
					<Highlighter className="mr-2 h-3 w-3" />
					<span className="text-xs">ميزة التظليل</span>
					<ChevronDown className="ml-2 h-3 w-3" />
				</>
			}
		>
			{/* Highlight Icon */}
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="rounded-md bg-muted p-2">
						<Highlighter className="h-4 w-4 text-muted-foreground" />
					</div>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					<p>ميزة التظليل</p>
				</TooltipContent>
			</Tooltip>

			{/* Message */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="text-sm text-muted-foreground"
			>
				سجل دخولك للوصول إلى ميزة التظليل والمزيد من المميزات
			</motion.div>
		</CollapsibleToolbar>
	);
};
