// src/components/speakers/speaker-list-skeleton.tsx
import { Skeleton } from '@/client/components/ui/skeleton';

export function SpeakerListSkeleton() {
	return (
		<div className="bg-card rounded-lg border shadow-sm p-4">
			<div className="flex gap-6">
				{/* Left Section - Image */}
				<div className="shrink-0">
					<Skeleton className="w-[200px] h-[140px] rounded-md" />
				</div>

				{/* Middle Section - Content */}
				<div className="flex-1 min-w-0">
					<div className="flex items-start justify-between gap-4">
						{/* Title and Description */}
						<div className="space-y-2 flex-1">
							<div className="flex items-center gap-2">
								<Skeleton className="h-6 w-48" />
								<Skeleton className="h-5 w-20" />
							</div>
							<div className="space-y-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
							</div>
						</div>

						{/* Action Menu */}
						<Skeleton className="h-8 w-8 rounded-full shrink-0" />
					</div>

					{/* Stats and Actions */}
					<div className="mt-auto pt-4 flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-2 rounded-full" />
							<Skeleton className="h-4 w-32" />
						</div>

						<div className="flex items-center gap-2">
							<Skeleton className="h-10 w-10 rounded-full" />
							<Skeleton className="h-10 w-32 rounded-lg" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
