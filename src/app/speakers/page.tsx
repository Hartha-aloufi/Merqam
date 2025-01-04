// src/app/speakers/page.tsx
'use client';

import { useSpeakers } from '@/client/hooks/use-speakers';
import { SpeakerCard } from '@/client/components/speakers/speaker-card';
import { SpeakerCardSkeleton } from '@/client/components/speakers/speaker-card-skeleton';
import { Button } from '@/client/components/ui/button';
import { Input } from '@/client/components/ui/input';
import { useIntersectionObserver } from '@uidotdev/usehooks';
import { Loader2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebounce } from '@uidotdev/usehooks';

export default function SpeakersPage() {
	const [searchQuery, setSearchQuery] = useState('');
	const debouncedQuery = useDebounce(searchQuery, 300);

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
		isPlaceholderData,
	} = useSpeakers(debouncedQuery);

	// Infinite scroll using intersection observer
	const [ref, entry] = useIntersectionObserver({
		threshold: 0,
		rootMargin: '100px',
	});

	useEffect(() => {
		if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [entry?.isIntersecting, fetchNextPage, hasNextPage, isFetchingNextPage]);

	// Flatten all pages data
	const speakers = data?.pages.flatMap((page) => page.speakers) ?? [];

	return (
		<div className="container py-8 space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4">
				<h1 className="text-3xl font-bold">المحدثون</h1>
				<div className="relative w-full max-w-sm">
					<Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="ابحث عن محدث..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-4 pr-10"
					/>
				</div>
			</div>

			{/* Error state */}
			{isError && (
				<div className="text-center py-8 text-destructive">
					حدث خطأ أثناء تحميل البيانات. الرجاء المحاولة مرة أخرى.
				</div>
			)}

			{/* Speakers grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{isPlaceholderData || isLoading
					? // Show skeletons while loading or using placeholder data
					  Array.from({ length: 12 }).map((_, index) => (
							<SpeakerCardSkeleton key={index} />
					  ))
					: // Show actual data
					  speakers.map((speaker) => (
							<SpeakerCard key={speaker.id} speaker={speaker} />
					  ))}
			</div>

			{/* No results */}
			{!isLoading && !isPlaceholderData && speakers.length === 0 && (
				<div className="text-center py-8 text-muted-foreground">
					لا توجد نتائج للبحث
				</div>
			)}

			{/* Load more trigger for intersection observer */}
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
