import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Video, BookOpen, GraduationCap } from 'lucide-react';
import { ContentService } from '@/server/services/content.service';

interface PlaylistPageProps {
	params: {
		playlistId: string;
	};
}

export async function generateMetadata({
	params,
}: PlaylistPageProps): Promise<Metadata> {
	const contentService = new ContentService();
	const playlist = await contentService.getPlaylist(params.playlistId);

	if (!playlist) {
		return {
			title: 'قائمة التشغيل غير موجودة | مِرْقَم',
		};
	}

	return {
		title: `${playlist.title} | مِرْقَم`,
		description: playlist.description,
	};
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
	const contentService = new ContentService();
	const playlist = await contentService.getPlaylist(params.playlistId);

	if (!playlist) {
		notFound();
	}

	return (
		<div className="container px-4 sm:px-6 py-6 sm:py-8">
			{/* Header */}
			<div className="max-w-2xl mb-8 sm:mb-12">
				<Link
					href="/playlists"
					className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition-colors"
				>
					<ArrowRight className="mr-2 h-4 w-4" />
					العودة إلى قوائم التشغيل
				</Link>

				<div>
					<h1 className="text-2xl sm:text-3xl font-bold mb-3">
						{playlist.title}
					</h1>
					{playlist.description && (
						<p className="text-base sm:text-lg text-muted-foreground">
							{playlist.description}
						</p>
					)}
				</div>
			</div>

			{/* Course Overview */}
			<div className="max-w-4xl mb-8 sm:mb-12">
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					<div className="bg-background border rounded-lg p-4">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary/10 rounded-full">
								<GraduationCap className="h-4 w-4 text-primary" />
							</div>
							<div className="text-sm">
								<div className="font-medium">المحاضر</div>
								<div className="text-muted-foreground">
									{playlist.speaker_name}
								</div>
							</div>
						</div>
					</div>
					<div className="bg-background border rounded-lg p-4">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary/10 rounded-full">
								<BookOpen className="h-4 w-4 text-primary" />
							</div>
							<div className="text-sm">
								<div className="font-medium">عدد الدروس</div>
								<div className="text-muted-foreground">
									{playlist.lessons.length} درس
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Lessons List */}
			<div className="max-w-4xl">
				<div className="space-y-4">
					{playlist.lessons.map((lesson, index) => (
						<Link
							key={lesson.id}
							href={`/playlists/${playlist.id}/lessons/${lesson.id}`}
						>
							<article className="group relative rounded-lg border bg-background hover:shadow-md transition-all duration-200">
								{/* Decoration */}
								<div className="absolute top-0 left-0 w-24 h-24 bg-primary/5 rounded-br-full -z-10 transition-all duration-200 group-hover:scale-150" />

								<div className="p-4 sm:p-6">
									<div className="flex items-start gap-3 sm:gap-4">
										{/* Lesson Number */}
										<div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
											{index + 1}
										</div>

										<div className="flex-grow min-w-0">
											{/* Title */}
											<h3 className="text-base sm:text-lg font-medium mb-2 group-hover:text-primary transition-colors truncate">
												{lesson.title}
											</h3>

											{/* Lesson Info */}
											<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
												<div className="flex items-center gap-1.5">
													<BookOpen className="h-4 w-4" />
													<span>تفريغ</span>
												</div>
												{lesson.youtubeUrl && (
													<div className="flex items-center gap-1.5">
														<Video className="h-4 w-4" />
														<span>فيديو</span>
													</div>
												)}
												<div className="flex items-center gap-1.5">
													<span>
														{lesson.views_count}{' '}
														مشاهدة
													</span>
												</div>
											</div>
										</div>
									</div>
								</div>
							</article>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
