import { Metadata } from 'next';
import Link from 'next/link';
import { PlayCircle, BookOpen } from 'lucide-react';
import { ContentService } from '@/server/services/content.service';

export const metadata: Metadata = {
	title: 'قوائم التشغيل | مِرْقَم',
	description: 'استعرض قوائم التشغيل المتوفرة',
};

export default async function PlaylistsPage() {
	const contentService = new ContentService();
	const playlists = await contentService.getPlaylists();

	return (
		<div className="container px-4 py-8">
			<div className="max-w-2xl mx-auto mb-12 text-center">
				<h1 className="text-4xl font-bold mb-4">قوائم التشغيل</h1>
				<p className="text-lg text-muted-foreground">
					اختر قائمة التشغيل التي تريد متابعتها
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{playlists.map((playlist) => (
					<Link
						key={playlist.id}
						href={`/playlists/${playlist.id}`}
						className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:shadow-md transition-all duration-200"
					>
						{/* Background decoration */}
						<div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-10 transition-transform duration-200 group-hover:scale-150" />
						<div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-tr-full -z-10 transition-transform duration-200 group-hover:scale-150" />

						<div className="mb-4">
							{/* Icon */}
							<div className="p-2 w-fit rounded-full bg-primary/10 text-primary mb-4">
								<PlayCircle className="h-6 w-6" />
							</div>

							{/* Title and Description */}
							<h2 className="text-md sm:text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
								{playlist.title}
							</h2>
							{playlist.description && (
								<p className="text-muted-foreground line-clamp-2">
									{playlist.description}
								</p>
							)}
						</div>

						{/* Footer Info */}
						<div className="flex items-center justify-between mt-4 pt-4 border-t">
							<div className="flex items-center text-muted-foreground">
								<BookOpen className="h-4 w-4 ml-1" />
								<span className="text-sm">
									{playlist.lessonCount} دروس
								</span>
							</div>
							<span className="text-sm text-muted-foreground">
								{playlist.speaker_name}
							</span>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
