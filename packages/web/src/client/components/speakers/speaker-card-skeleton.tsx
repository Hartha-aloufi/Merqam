// src/components/speakers/speaker-card-skeleton.tsx
import { Skeleton } from '@/client/components/ui/skeleton';
import { motion } from 'framer-motion';

export function SpeakerCardSkeleton() {
	return (
		<motion.div
			className="relative bg-background rounded-xl overflow-hidden"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
		>
			<div className="relative aspect-[4/5] w-full bg-muted">
				{/* Glass effect overlay */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

				{/* Content Overlay */}
				<div className="absolute inset-0 flex flex-col justify-end p-6">
					{/* Title */}
					<Skeleton className="h-7 w-3/4 mb-2 bg-white/20" />

					{/* Description */}
					<div className="space-y-2 mb-4">
						<Skeleton className="h-4 w-full bg-white/10" />
						<Skeleton className="h-4 w-2/3 bg-white/10" />
					</div>

					{/* Stats and Actions */}
					<div className="flex items-center justify-between">
						<Skeleton className="h-4 w-24 bg-white/10" />
						<div className="flex gap-2">
							<Skeleton className="h-8 w-8 bg-white/10" />
							<Skeleton className="h-8 w-8 bg-white/10" />
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
