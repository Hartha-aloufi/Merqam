'use client';

import { useSettings } from '@/client/hooks/use-settings';
import { cn } from '@/client/lib/utils';
import { HighlightContainer } from '@/client/components/highlight/HighlightContainer';
import { useEffect } from 'react';

interface MDXClientWrapperProps {
	children: React.ReactNode;
	lessonId: string;
}

/**
 * Client wrapper for MDX content that handles:
 * - Font size settings
 * - Heading visibility settings
 * - Text highlighting functionality
 */
export function MDXClientWrapper({
	children,
	lessonId,
}: MDXClientWrapperProps) {
	const { fontSize, showHeadings } = useSettings();

	useEffect(() => {
		console.log('finish rendering mdx wrapper');
	}, []);

	return (
		<HighlightContainer
			lessonId={lessonId}
			className={cn(
				'dark:prose-invert max-w-none',
				`prose-${fontSize}`,
				!showHeadings && 'prose-no-headings'
			)}
		>
			{children}
		</HighlightContainer>
	);
}
