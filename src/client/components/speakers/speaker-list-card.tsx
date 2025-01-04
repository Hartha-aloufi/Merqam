// src/components/speakers/speaker-list-card.tsx
import { Speaker } from '@/client/services/baheth.service';
import {
	ExternalLink,
	List,
	Heart,
	BookOpen,
	Ribbon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/client/lib/utils';

interface SpeakerListCardProps {
	speaker: Speaker;
}

export function SpeakerListCard({ speaker }: SpeakerListCardProps) {
	const [isHovered, setIsHovered] = useState(false);
	const [isLiked, setIsLiked] = useState(false);

	return (
		<motion.div
			className="relative bg-background rounded-xl overflow-hidden border shadow-lg"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			whileHover={{ y: -2 }}
			transition={{ duration: 0.2 }}
			onHoverStart={() => setIsHovered(true)}
			onHoverEnd={() => setIsHovered(false)}
		>
			<div className="flex h-40">
				{/* Image Container with Featured Ribbon */}
				<div className="relative w-56 shrink-0">
					{/* Ribbon */}
					{speaker.playlists_count > 10 && (
						<div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-purple-500/90 to-purple-700/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm border border-purple-400/20">
							<span className="flex items-center gap-1">
								<Ribbon className="h-3 w-3" />
								متميز
							</span>
						</div>
					)}

					{/* Image */}
					<Image
						src={speaker.image}
						alt={speaker.name}
						fill
						className="object-cover filter brightness-90 group-hover:brightness-100 transition-all duration-300"
						sizes="224px"
					/>

					{/* Gradient Overlay */}
					<div className="absolute inset-0 bg-gradient-to-l from-background via-transparent to-transparent" />
				</div>

				{/* Content Section */}
				<div className="flex-1 flex flex-col justify-between p-6">
					{/* Header */}
					<div className="flex justify-between items-start">
						<div>
							<h3 className="text-xl font-bold mb-2">
								{speaker.name}
							</h3>
							<p className="text-sm text-muted-foreground line-clamp-2">
								{speaker.description}
							</p>
						</div>

						<motion.button
							className="shrink-0 ml-4"
							whileTap={{ scale: 0.9 }}
							onClick={() => setIsLiked(!isLiked)}
						>
							<Heart
								className={cn(
									'h-5 w-5 transition-all',
									isLiked
										? 'fill-red-500 stroke-red-500'
										: 'stroke-muted-foreground'
								)}
							/>
						</motion.button>
					</div>

					{/* Stats and Actions */}
					<div className="flex items-center justify-between mt-4 border-t pt-4">
						<div className="flex gap-4 text-sm text-muted-foreground">
							<div className="flex items-center gap-1.5">
								<BookOpen className="h-4 w-4" />
								<span>{speaker.playlists_count} دروس</span>
							</div>
						</div>

						{/* Actions */}
						<AnimatePresence>
							{isHovered && (
								<motion.div
									className="flex gap-2"
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: 20 }}
									transition={{ duration: 0.2 }}
								>
									<Link
										href={speaker.baheth_link}
										target="_blank"
									>
										<Button
											size="sm"
											variant="secondary"
											className="gap-2"
										>
											<List className="h-4 w-4" />
											تصفح الدروس
										</Button>
									</Link>
									<Link
										href={speaker.external_link}
										target="_blank"
									>
										<Button
											size="sm"
											variant="outline"
											className="gap-2"
										>
											<ExternalLink className="h-4 w-4" />
											المصدر
										</Button>
									</Link>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
