import Link from 'next/link';
import { ContentService } from '@/server/services/content.service';
import { Button } from '@/client/components/ui/button';
import { BookOpen, ArrowRight, Video } from 'lucide-react';


export default async function HomePage() {
	const contentService = new ContentService();
	const playlists = await contentService.getPlaylists();
	const totalLessons = playlists.reduce(
		(acc, playlist) => acc + playlist.lessonCount,
		0
	);

	return (
		<div className="flex flex-col min-h-screen">
			{/* Hero Section */}
			<section className="relative py-12 sm:py-16 lg:py-20 px-4">
				<div className="absolute inset-0 bg-gradient-to-l from-primary/10 via-primary/5 to-transparent" />
				<div className="container mx-auto relative">
					<div className="max-w-3xl mx-auto text-center">
						<h1 className="!leading-relaxed text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-l from-primary to-primary/60 bg-clip-text text-transparent">
							مِرْقَم
						</h1>

						<p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
							تفريغات نافعة - لمن يفضل القراءة على مشاهدة المرئيات
						</p>

						<Link href="/playlists">
							<Button
								size="lg"
								className="w-full sm:w-auto h-12 sm:h-14 text-base"
							>
								<BookOpen className="mr-2 h-5 w-5" />
								ابدأ التعلم
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-12 sm:py-16 bg-muted/50">
				<div className="container px-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 max-w-4xl mx-auto">
						<div className="group touch-manipulation">
							<div className="bg-background rounded-lg p-4 sm:p-6 shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]">
								<div className="flex items-center gap-4">
									<div className="p-3 rounded-full bg-primary/10 text-primary">
										<BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
									</div>
									<div>
										<div className="text-2xl sm:text-3xl font-bold">
											{playlists.length}
										</div>
										<div className="text-muted-foreground text-sm sm:text-base">
											قوائم التشغيل المتوفرة
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="group touch-manipulation">
							<div className="bg-background rounded-lg p-4 sm:p-6 shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]">
								<div className="flex items-center gap-4">
									<div className="p-3 rounded-full bg-primary/10 text-primary">
										<Video className="h-5 w-5 sm:h-6 sm:w-6" />
									</div>
									<div>
										<div className="text-2xl sm:text-3xl font-bold">
											{totalLessons}
										</div>
										<div className="text-muted-foreground text-sm sm:text-base">
											الدروس التعليمية
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Featured Playlists */}
			<section className="py-12 sm:py-16">
				<div className="container px-4">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
						<h2 className="text-2xl sm:text-3xl font-bold">
							القوائم المميزة
						</h2>
						<Link href="/playlists">
							<Button
								variant="ghost"
								className="group h-9 sm:h-10"
							>
								جميع القوائم
								<ArrowRight className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
							</Button>
						</Link>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
						{playlists.slice(0, 3).map((playlist) => (
							<Link
								key={playlist.youtube_playlist_id}
								href={`/playlists/${playlist.youtube_playlist_id}`}
								className="group touch-manipulation"
							>
								<div className="relative h-full overflow-hidden rounded-lg border bg-background p-4 sm:p-6 hover:shadow-md transition-all duration-200 active:scale-[0.98]">
									<div className="absolute top-0 left-0 w-20 h-20 bg-primary/10 rounded-br-full -z-10 transition-all duration-200 group-hover:scale-150" />

									<div className="flex flex-col h-full">
										<h3 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-2">
											{playlist.title}
										</h3>
										{playlist.description && (
											<p className="text-muted-foreground text-sm sm:text-base mb-4 flex-grow line-clamp-2">
												{playlist.description}
											</p>
										)}
										<div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
											<div className="flex items-center gap-1.5">
												<BookOpen className="h-4 w-4" />
												<span>
													{playlist.lessonCount} دروس
												</span>
											</div>
											<span>{playlist.speaker_name}</span>
										</div>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
