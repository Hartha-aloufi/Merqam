// src/components/speakers/speaker-list-skeleton.tsx
import { Skeleton } from '@/client/components/ui/skeleton';
import { motion } from 'framer-motion';

export function SpeakerListSkeleton() {
	return (
		<motion.div
			className="relative bg-background rounded-xl overflow-hidden flex h-48"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
		>
			{/* Image Container */}
			<div className="relative w-48 shrink-0 bg-muted">
				<div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
			</div>

			{/* Content Container */}
			<div className="relative flex-1 flex flex-col justify-between p-6 bg-gradient-to-l from-black/80 via-black/95 to-black">
				{/* Title and Description */}
				<div>
					<Skeleton className="h-7 w-3/4 mb-4 bg-white/20" />
					<div className="space-y-2">
						<Skeleton className="h-4 w-full bg-white/10" />
						<Skeleton className="h-4 w-2/3 bg-white/10" />
					</div>
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between mt-4">
					<Skeleton className="h-4 w-24 bg-white/10" />
					<div className="flex gap-2">
						<Skeleton className="h-8 w-8 bg-white/10 rounded-md" />
						<Skeleton className="h-8 w-8 bg-white/10 rounded-md" />
					</div>
				</div>
			</div>
		</motion.div>
	);
}
