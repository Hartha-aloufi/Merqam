// src/components/speakers/speaker-card.tsx
import { Speaker } from '@/client/services/baheth.service';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/client/components/ui/card';
import { Button } from '@/client/components/ui/button';
import { ExternalLink, List, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface SpeakerCardProps {
	speaker: Speaker;
}

export function SpeakerCard({ speaker }: SpeakerCardProps) {
	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader className="relative h-48 p-0 overflow-hidden">
				<Image
					src={speaker.image}
					alt={speaker.name}
					fill
					className="object-cover"
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
				/>
			</CardHeader>
			<CardContent className="p-4">
				<CardTitle className="mb-2 flex items-center gap-2">
					{speaker.name}
				</CardTitle>
				<p className="text-sm text-muted-foreground line-clamp-2">
					{speaker.description}
				</p>
			</CardContent>
			<CardFooter className="p-4 pt-0 flex items-center justify-between">
				<div className="flex items-center text-sm text-muted-foreground">
					<PlayCircle className="h-4 w-4 ml-1" />
					<span>{speaker.playlists_count} playlist</span>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="icon" asChild>
						<Link href={speaker.baheth_link} target="_blank">
							<List className="h-4 w-4" />
							<span className="sr-only">View on Baheth</span>
						</Link>
					</Button>
					<Button variant="outline" size="icon" asChild>
						<Link href={speaker.external_link} target="_blank">
							<ExternalLink className="h-4 w-4" />
							<span className="sr-only">Visit external link</span>
						</Link>
					</Button>
				</div>
			</CardFooter>
		</Card>
	);
}
