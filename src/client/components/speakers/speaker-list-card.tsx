// src/components/speakers/speaker-list-card.tsx
import { Speaker } from '@/client/services/baheth.service';
import {
	BookOpen,
	ExternalLink,
	Heart,
	Share2,
	MoreVertical,
	PlayCircle,
	FolderOpen,
	BookMarked,
	BadgeCheck,
	ChevronLeft,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/client/lib/utils';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/client/components/ui/dropdown-menu';

interface SpeakerListCardProps {
	speaker: Speaker;
}

export function SpeakerListCard({ speaker }: SpeakerListCardProps) {
	const [isLiked, setIsLiked] = useState(false);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="group relative bg-card hover:bg-accent/5 rounded-lg border shadow-sm transition-colors duration-200"
		>
			<div className="flex p-4 gap-6">
				{/* Left Section - Image and Quick Stats */}
				<div className="shrink-0">
					{/* Image with Featured Badge */}
					<div className="relative w-[200px] h-[140px] rounded-md overflow-hidden">
						<Image
							src={speaker.image}
							alt={speaker.name}
							fill
							className="object-cover transition-transform duration-500 group-hover:scale-105"
						/>
						{speaker.playlists_count > 10 && (
							<div className="absolute top-2 right-2">
								<BadgeCheck className="h-5 w-5 text-primary drop-shadow-md" />
							</div>
						)}
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
						<div className="absolute bottom-2 right-2 flex items-center gap-1.5 text-xs text-white font-medium">
							<BookOpen className="h-3.5 w-3.5" />
							<span>{speaker.playlists_count} درس</span>
						</div>
					</div>
				</div>

				{/* Middle Section - Main Content */}
				<div className="flex-1 min-w-0 flex flex-col">
					<div className="flex items-start justify-between gap-4">
						{/* Title and Tags */}
						<div className="space-y-2 flex-1">
							<div className="flex items-center gap-2">
								<h3 className="text-lg font-semibold truncate">
									{speaker.name}
								</h3>
								<span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
									مُحدّث علمي
								</span>
							</div>
							<p className="text-sm text-muted-foreground line-clamp-2">
								{speaker.description}
							</p>
						</div>

						{/* Action Menu */}
						<div className="shrink-0">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8"
									>
										<MoreVertical className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className="w-52"
								>
									<DropdownMenuItem>
										<Share2 className="h-4 w-4 mr-2" />
										مشاركة الصفحة
									</DropdownMenuItem>
									<DropdownMenuItem>
										<FolderOpen className="h-4 w-4 mr-2" />
										إضافة إلى قائمة
									</DropdownMenuItem>
									<DropdownMenuItem>
										<BookMarked className="h-4 w-4 mr-2" />
										حفظ للمشاهدة لاحقاً
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>

					{/* Stats and Tags */}
					<div className="mt-auto pt-4 flex items-center justify-between">
						{/* Stats */}
						<div className="flex items-center gap-4 text-sm text-muted-foreground">
							<div className="flex items-center gap-1">
								<PlayCircle className="h-4 w-4" />
								<span>٢٠٠ مشاهدة</span>
							</div>
							<span>•</span>
							<span>تم النشر منذ ٣ أشهر</span>
						</div>

						{/* Like Button and Primary Action */}
						<div className="flex items-center gap-2">
							<motion.button
								whileTap={{ scale: 0.95 }}
								onClick={() => setIsLiked(!isLiked)}
								className={cn(
									'p-2 rounded-full transition-colors',
									isLiked
										? 'text-red-500 bg-red-50 dark:bg-red-500/10'
										: 'hover:bg-accent'
								)}
							>
								<Heart
									className={cn(
										'h-5 w-5',
										isLiked && 'fill-current'
									)}
								/>
							</motion.button>

							<Link href={speaker.baheth_link} target="_blank">
								<Button className="gap-2">
									تصفح المحتوى
									<ChevronLeft className="h-4 w-4" />
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
