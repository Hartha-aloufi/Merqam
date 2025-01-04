// src/components/speakers/speaker-list-card.tsx
import { Speaker } from '@/client/services/baheth.service';
import { PlayCircle, ExternalLink, List, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/client/lib/utils';

interface SpeakerListCardProps {
	speaker: Speaker;
}

export function SpeakerListCard({ speaker }: SpeakerListCardProps) {
	const [isLiked, setIsLiked] = useState(false);

	return (
		<motion.div
			className="group relative bg-background rounded-xl overflow-hidden flex h-48"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			whileHover={{ y: -5 }}
			transition={{ duration: 0.3 }}
		>
			{/* Image Section */}
			<div className="relative w-48 shrink-0">
				<Image
					src={speaker.image}
					alt={speaker.name}
					fill
					className="object-cover transition-transform duration-500 group-hover:scale-110"
					sizes="192px"
				/>
				<div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
			</div>

			{/* Content Section */}
			<div className="relative flex-1 flex flex-col justify-between p-6 bg-gradient-to-l from-black/80 via-black/95 to-black">
				{/* Like Button */}
				<motion.button
					className="absolute top-4 right-4 z-20"
					whileTap={{ scale: 0.9 }}
					onClick={() => setIsLiked(!isLiked)}
				>
					<Heart
						className={cn(
							'h-6 w-6 transition-all',
							isLiked
								? 'fill-red-500 stroke-red-500'
								: 'stroke-white'
						)}
					/>
				</motion.button>

				{/* Main Content */}
				<div>
					<h3 className="text-xl font-bold text-white mb-2">
						{speaker.name}
					</h3>
					<p className="text-sm text-gray-200 line-clamp-2">
						{speaker.description}
					</p>
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between mt-4">
					{/* Stats */}
					<div className="flex items-center gap-2 text-white/90">
						<PlayCircle className="h-4 w-4" />
						<span className="text-sm font-medium">
							{speaker.playlists_count} playlist
						</span>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-2">
						<Link href={speaker.baheth_link} target="_blank">
							<Button
								size="sm"
								variant="secondary"
								className="bg-white/10 hover:bg-white/20 backdrop-blur-sm"
							>
								<List className="h-4 w-4 text-white" />
							</Button>
						</Link>
						<Link href={speaker.external_link} target="_blank">
							<Button
								size="sm"
								variant="secondary"
								className="bg-white/10 hover:bg-white/20 backdrop-blur-sm"
							>
								<ExternalLink className="h-4 w-4 text-white" />
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
