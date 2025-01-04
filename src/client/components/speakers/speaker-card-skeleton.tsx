// src/components/speakers/speaker-card-skeleton.tsx
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from '@/client/components/ui/card';
import { Skeleton } from '@/client/components/ui/skeleton';

export function SpeakerCardSkeleton() {
	return (
		<Card className="overflow-hidden">
			<CardHeader className="relative h-48 p-0">
				<Skeleton className="h-full w-full" />
			</CardHeader>
			<CardContent className="p-4">
				{/* Title */}
				<Skeleton className="h-6 w-3/4 mb-2" />
				{/* Description */}
				<div className="space-y-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-2/3" />
				</div>
			</CardContent>
			<CardFooter className="p-4 pt-0 flex items-center justify-between">
				{/* Playlists count */}
				<Skeleton className="h-4 w-20" />
				{/* Action buttons */}
				<div className="flex gap-2">
					<Skeleton className="h-8 w-8" />
					<Skeleton className="h-8 w-8" />
				</div>
			</CardFooter>
		</Card>
	);
}
