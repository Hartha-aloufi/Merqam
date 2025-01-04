// src/components/speakers/speaker-card.tsx
import { Speaker } from '@/client/services/baheth.service';
import { PlayCircle, ExternalLink, List, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/client/lib/utils';

interface SpeakerCardProps {
	speaker: Speaker;
}

export function SpeakerCard({ speaker }: SpeakerCardProps) {
	const [isHovered, setIsHovered] = useState(false);
	const [isLiked, setIsLiked] = useState(false);

	return (
		<motion.div
			className="group relative bg-background rounded-xl overflow-hidden"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			whileHover={{ y: -5 }}
			transition={{ duration: 0.3 }}
			onHoverStart={() => setIsHovered(true)}
			onHoverEnd={() => setIsHovered(false)}
		>
			{/* Glass effect overlay */}
			<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />

			{/* Content */}
			<div className="relative aspect-[4/5] w-full">
				{/* Background Image */}
				<Image
					src={speaker.image}
					alt={speaker.name}
					fill
					className="object-cover transition-transform duration-500 group-hover:scale-110"
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
				/>

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

				{/* Content Overlay */}
				<div className="absolute inset-0 z-10 flex flex-col justify-end p-6">
					{/* Title */}
					<motion.h3
						className="text-xl font-bold text-white mb-2"
						initial={false}
						animate={{ y: isHovered ? 0 : 10 }}
						transition={{ duration: 0.3 }}
					>
						{speaker.name}
					</motion.h3>

					{/* Description */}
					<AnimatePresence>
						{isHovered && (
							<motion.p
								className="text-sm text-gray-200 mb-4 line-clamp-2"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 20 }}
								transition={{ duration: 0.2 }}
							>
								{speaker.description}
							</motion.p>
						)}
					</AnimatePresence>

					{/* Stats and Actions */}
					<div className="flex items-center justify-between">
						{/* Stats */}
						<motion.div
							className="flex items-center gap-2 text-white/90"
							initial={false}
							animate={{
								y: isHovered ? 0 : 20,
								opacity: isHovered ? 1 : 0,
							}}
						>
							<PlayCircle className="h-4 w-4" />
							<span className="text-sm font-medium">
								{speaker.playlists_count} playlist
							</span>
						</motion.div>

						{/* Action Buttons */}
						<motion.div
							className="flex gap-2"
							initial={false}
							animate={{
								y: isHovered ? 0 : 20,
								opacity: isHovered ? 1 : 0,
							}}
						>
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
						</motion.div>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
