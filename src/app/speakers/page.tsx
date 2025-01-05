// src/app/speakers/page.tsx
'use client';

import { useSpeakers } from '@/client/hooks/use-speakers';
import { SpeakerCard } from '@/client/components/speakers/speaker-card';
import { SpeakerCardSkeleton } from '@/client/components/speakers/speaker-card-skeleton';
import { Button } from '@/client/components/ui/button';
import { Input } from '@/client/components/ui/input';
import { useIntersectionObserver, useDebounce } from '@uidotdev/usehooks';
import { LayoutGrid, List, Loader2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpeakerListCard } from '@/client/components/speakers/speaker-list-card';
import { SpeakerListSkeleton } from '@/client/components/speakers/speaker-list-skeleton';
import { useLayoutPreference } from '@/client/hooks/use-layout-preference';

const layouts = {
	list: 'grid grid-cols-1 gap-6 max-w-4xl mx-auto',
	featured:
		'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 [&>*:first-child]:col-span-2 [&>*:first-child]:row-span-2',
} as const;

type LayoutType = keyof typeof layouts;

export default function SpeakersPage() {
	const [searchQuery, setSearchQuery] = useState('');
	// Use the layout preference hook
	const { layout, updateLayout } = useLayoutPreference('list');
	const debouncedQuery = useDebounce(searchQuery, 300);

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isError,
		isPlaceholderData,
	} = useSpeakers(debouncedQuery);

	const [ref, entry] = useIntersectionObserver({
		threshold: 0,
		rootMargin: '100px',
	});

	useEffect(() => {
		if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [entry?.isIntersecting, fetchNextPage, hasNextPage, isFetchingNextPage]);

	const speakers = data?.pages.flatMap((page) => page.speakers) ?? [];
	const isInitialLoad = speakers.length <= 12;

	return (
		<div className="container py-8 space-y-8">
			{/* Header with Search and Filters */}
			<div className="sticky top-0 z-30 -mx-4 px-4 py-4 backdrop-blur-xl bg-background/80 border-b">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<h1 className="text-3xl font-bold">المتحدثون</h1>

					<div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
						{/* Search */}
						<div className="relative w-full sm:w-auto min-w-[240px]">
							<Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="ابحث عن متحدث..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-4 pr-10"
							/>
						</div>

						{/* Layout Switcher */}
						<div className="flex items-center gap-1 border rounded-md">
							<Button
								variant={
									layout === 'featured'
										? 'secondary'
										: 'ghost'
								}
								size="icon"
								onClick={() => updateLayout('featured')}
								className="rounded-none rounded-r-md"
							>
								<LayoutGrid className="h-4 w-4" />
							</Button>
							<Button
								variant={
									layout === 'list' ? 'secondary' : 'ghost'
								}
								size="icon"
								onClick={() => updateLayout('list')}
								className="rounded-none rounded-l-md"
							>
								<List className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Error state */}
			{isError && (
				<div className="text-center py-8 text-destructive">
					حدث خطأ أثناء تحميل البيانات. الرجاء المحاولة مرة أخرى.
				</div>
			)}

			{/* Speakers grid */}
			<AnimatePresence mode="wait">
				<motion.div
					key={layout}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
					className={layouts[layout]}
				>
					{isPlaceholderData
						? // Skeletons
						  Array.from({ length: 12 }).map((_, index) =>
								layout === 'list' ? (
									<SpeakerListSkeleton key={index} />
								) : (
									<SpeakerCardSkeleton key={index} />
								)
						  )
						: // Actual content
						  speakers.map((speaker, index) => (
								<motion.div
									key={speaker.id}
									initial={
										isInitialLoad
											? { opacity: 0, y: 20 }
											: false
									}
									animate={
										isInitialLoad
											? { opacity: 1, y: 0 }
											: {}
									}
									transition={
										isInitialLoad
											? { delay: index * 0.05 }
											: {}
									}
								>
									{layout === 'list' ? (
										<SpeakerListCard speaker={speaker} />
									) : (
										<SpeakerCard speaker={speaker} />
									)}
								</motion.div>
						  ))}
				</motion.div>
			</AnimatePresence>

			{/* No results */}
			{!isPlaceholderData && speakers.length === 0 && (
				<div className="text-center py-8 text-muted-foreground">
					لا توجد نتائج للبحث
				</div>
			)}

			{/* Load more trigger */}
			{hasNextPage && !isPlaceholderData && (
				<div ref={ref} className="flex justify-center py-8">
					<Button
						variant="outline"
						onClick={() => fetchNextPage()}
						disabled={isFetchingNextPage}
					>
						{isFetchingNextPage ? (
							<>
								<Loader2 className="ml-2 h-4 w-4 animate-spin" />
								جاري التحميل...
							</>
						) : (
							'تحميل المزيد'
						)}
					</Button>
				</div>
			)}
		</div>
	);
}
