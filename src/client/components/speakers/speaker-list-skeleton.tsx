// src/components/speakers/speaker-list-skeleton.tsx
import { Skeleton } from '@/client/components/ui/skeleton';
import { motion } from 'framer-motion';

export function SpeakerListSkeleton() {
	return (
		<motion.div
			className="relative bg-background rounded-xl overflow-hidden border shadow-lg"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2 }}
		>
			<div className="flex h-40">
				{/* Image Container */}
				<div className="relative w-56 shrink-0 bg-muted">
					<div className="absolute inset-0 bg-gradient-to-l from-background via-transparent to-transparent" />
				</div>

				{/* Content Container */}
				<div className="flex-1 flex flex-col justify-between p-6">
					{/* Header */}
					<div className="flex justify-between items-start">
						<div className="space-y-3 flex-1">
							<Skeleton className="h-6 w-3/4" />
							<div className="space-y-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-2/3" />
							</div>
						</div>
						<Skeleton className="h-5 w-5 rounded-full shrink-0 ml-4" />
					</div>

					{/* Footer */}
					<div className="flex items-center justify-between mt-4 border-t pt-4">
						<Skeleton className="h-4 w-24" />
						<div className="flex gap-2">
							<Skeleton className="h-9 w-28" />
							<Skeleton className="h-9 w-24" />
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
