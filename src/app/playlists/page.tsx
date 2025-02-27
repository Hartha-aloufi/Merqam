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
		<div className="container px-4 py-8 sm:py-12">
			<div className="max-w-2xl mx-auto mb-8 sm:mb-12 text-center">
				<h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">
					قوائم التشغيل
				</h1>
				<p className="text-base sm:text-lg text-muted-foreground">
					اختر قائمة التشغيل التي تريد متابعتها
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
				{playlists.map((playlist) => (
					<Link
						key={playlist.youtube_playlist_id}
						href={`/playlists/${playlist.youtube_playlist_id}`}
						className="group touch-manipulation"
					>
						<article className="relative h-full overflow-hidden rounded-lg border bg-background p-4 sm:p-6 hover:shadow-md transition-all duration-200 active:scale-[0.98]">

							<div className="flex flex-col h-full">
								{/* Icon */}
								<div className="p-2 w-fit rounded-full bg-primary/10 text-primary mb-4">
									<PlayCircle className="h-5 w-5 sm:h-6 sm:w-6" />
								</div>

								{/* Content */}
								<h2 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
									{playlist.title}
								</h2>
								{playlist.description && (
									<p className="text-sm sm:text-base text-muted-foreground line-clamp-2 mb-4 flex-grow">
										{playlist.description}
									</p>
								)}

								{/* Footer */}
								<div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
									<div className="flex items-center gap-1.5">
										<BookOpen className="h-4 w-4" />
										<span>{playlist.lessonCount} دروس</span>
									</div>
									<span>{playlist.speaker_name}</span>
								</div>
							</div>
						</article>
					</Link>
				))}
			</div>
		</div>
	);
}
