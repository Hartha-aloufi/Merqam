import Link from 'next/link';
import { ContentService } from '@/server/services/content.service';
import { Button } from '@/client/components/ui/button';
import { BookOpen, ArrowLeft } from 'lucide-react';

// Mark as static
export const dynamic = 'force-static';
// Optional: Add revalidation period
// export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
	const contentService = new ContentService();
	const playlists = await contentService.getPlaylists();

	// Get total lessons count across all playlists
	const totalLessons = playlists.reduce(
		(acc, playlist) => acc + playlist.lessonCount,
		0
	);

	return (
		<div className="flex flex-col min-h-screen">
			{/* Hero Section */}
			<section className="relative py-20 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
				<div className="container px-4 mx-auto relative">
					<div className="max-w-3xl mx-auto text-center">
						<h1 className="!leading-relaxed text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
							مِرْقَم
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground mb-8">
							تفريغات نافعة - لمن يفضل القراءة على مشاهدة المرئيات
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link href="/playlists">
								<Button size="lg" className="w-full sm:w-auto">
									<BookOpen className="ml-2 h-5 w-5" />
									ابدأ التعلم
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-16 bg-muted/50">
				<div className="container px-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div className="relative group">
							<div className="bg-background rounded-lg p-6 shadow-sm transition-all duration-200 hover:shadow-md">
								<div className="flex items-center gap-4">
									<div className="p-3 rounded-full bg-primary/10 text-primary">
										<BookOpen className="h-6 w-6" />
									</div>
									<div>
										<div className="text-3xl font-bold">
											{playlists.length}
										</div>
										<div className="text-muted-foreground">
											قوائم التشغيل المتوفرة
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="relative group">
							<div className="bg-background rounded-lg p-6 shadow-sm transition-all duration-200 hover:shadow-md">
								<div className="flex items-center gap-4">
									<div className="p-3 rounded-full bg-primary/10 text-primary">
										<BookOpen className="h-6 w-6" />
									</div>
									<div>
										<div className="text-3xl font-bold">
											{totalLessons}
										</div>
										<div className="text-muted-foreground">
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
			<section className="py-16">
				<div className="container px-4">
					<div className="flex justify-between items-center mb-8">
						<h2 className="text-3xl font-bold">القوائم المميزة</h2>
						<Link href="/playlists">
							<Button variant="ghost" className="group">
								جميع القوائم
								<ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
							</Button>
						</Link>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{playlists.slice(0, 3).map((playlist) => (
							<Link
								key={playlist.id}
								href={`/playlists/${playlist.id}`}
							>
								<div className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:shadow-md transition-all duration-200">
									<div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-bl-full -z-10 transition-all duration-200 group-hover:scale-150" />
									<div className="flex flex-col h-full">
										<h3 className="text-xl font-semibold mb-2">
											{playlist.title}
										</h3>
										{playlist.description && (
											<p className="text-muted-foreground mb-4 flex-grow line-clamp-2">
												{playlist.description}
											</p>
										)}
										<div className="flex items-center justify-between">
											<span className="text-sm text-muted-foreground">
												{playlist.lessonCount} دروس
											</span>
											<span className="text-sm text-muted-foreground">
												{playlist.speaker_name}
											</span>
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
