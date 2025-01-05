'use client';

import { forwardRef } from 'react';
import { cn } from '@/client/lib/utils';

interface TrackedElementProps extends React.HTMLAttributes<HTMLElement> {
	as?: keyof JSX.IntrinsicElements;
	index: number;
}

export const TrackedElement = forwardRef<HTMLElement, TrackedElementProps>(
	({ as: Component = 'p', className, index, ...props }, ref) => {
		return (
			// @ts-ignore - dynamic element type
			<Component
				ref={ref}
				className={cn('relative', className)}
				data-paragraph-index={index}
				id={`paragraph-${index}`}
				{...props}
			/>
		);
	}
);

TrackedElement.displayName = 'TrackedElement';
