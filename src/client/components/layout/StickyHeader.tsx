'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/client/lib/utils';
import Navbar from './Navbar';
import { useMemo } from 'react';

/**
 * Client component that handles sticky header behavior
 */
export const StickyHeader = () => {
	const pathname = usePathname();
	// Matches routes like /playlists/[topicId]/[lessonId] but not /playlists/[topicId]/[lessonId]/exercise
	const isLessonPage = useMemo(
		() => /^\/playlists\/[^/]+\/lessons\/[^/]+\/?$/.test(pathname),
		[pathname]
	);

	return (
		<header
			className={cn(
				'bg-background border-b z-50 transition-all duration-300',
				isLessonPage && 'sticky top-0'
			)}
		>
			<Navbar />
		</header>
	);
};
