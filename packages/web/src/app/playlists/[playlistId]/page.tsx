import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Video, BookOpen, GraduationCap, Eye } from 'lucide-react';
import { ContentService } from '@/server/services/content.service';

export const dynamic = 'force-dynamic';

interface PlaylistPageProps {
	params: Promise<{
		playlistId: string;
	}>;
}

export async function generateMetadata({
	params,
}: PlaylistPageProps): Promise<Metadata> {
	const { playlistId } = await params;

	const contentService = new ContentService();
	const playlist = await contentService.getPlaylist(playlistId);

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

const LessonCard = (props: {
	playlistId: string;
	id: string;
	index: number;
	title: string;
	youtubeUrl: string | null;
	viewsCount: number;
}) => {
	return (
		<Link
			key={props.id}
			href={`/playlists/${props.playlistId}/lessons/${props.id}`}
			className="group touch-manipulation"
		>
			<article className="relative bg-background border rounded-lg transition-all duration-200 hover:shadow-md active:scale-[0.98]">
				<div className="p-4 sm:p-6">
					<div className="flex items-start gap-4">
						{/* Lesson Number */}
						<div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
							{props.index + 1}
						</div>

						<div className="flex-grow min-w-0">
							{/* Title */}
							<h3 className="text-base sm:text-lg font-medium mb-2 group-hover:text-primary transition-colors line-clamp-2">
								{props.title}
							</h3>

							{/* Lesson Meta */}
							<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
								<div className="flex items-center gap-1.5">
									<BookOpen className="h-4 w-4" />
									<span>تفريغ</span>
								</div>
								{props.youtubeUrl && (
									<div className="flex items-center gap-1.5">
										<Video className="h-4 w-4" />
										<span>فيديو</span>
									</div>
								)}
								<div className="flex items-center gap-1.5">
									<Eye className="h-4 w-4" />
									<span>{props.viewsCount} مشاهدة</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</article>
		</Link>
	);
};

export default async function PlaylistPage({ params }: PlaylistPageProps) {
	const { playlistId } = await params;

	const contentService = new ContentService();
	const playlist = await contentService.getPlaylist(playlistId);

	if (!playlist) {
		notFound();
	}

	return (
		<div className="container px-4 py-6 sm:py-8">
			{/* Header with Back Link */}
			<div className="max-w-4xl mx-auto mb-8">
				<Link
					href="/playlists"
					className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors group touch-manipulation"
				>
					<ArrowRight className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
					العودة إلى قوائم التشغيل
				</Link>

				<div className="space-y-3">
					<h1 className="text-2xl sm:text-3xl font-bold">
						{playlist.title}
					</h1>
					{playlist.description && (
						<p className="text-base sm:text-lg text-muted-foreground">
							{playlist.description}
						</p>
					)}
				</div>
			</div>

			{/* Course Stats */}
			<div className="max-w-4xl mx-auto mb-8">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{/* Speaker Card */}
					<div className="bg-background border rounded-lg p-4 transition-shadow hover:shadow-md">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary/10 rounded-full">
								<GraduationCap className="h-5 w-5 text-primary" />
							</div>
							<div>
								<div className="font-medium text-sm">
									المحاضر
								</div>
								<div className="text-muted-foreground text-sm">
									{playlist.speaker_name}
								</div>
							</div>
						</div>
					</div>

					{/* Lessons Count Card */}
					<div className="bg-background border rounded-lg p-4 transition-shadow hover:shadow-md">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary/10 rounded-full">
								<BookOpen className="h-5 w-5 text-primary" />
							</div>
							<div>
								<div className="font-medium text-sm">
									عدد الدروس
								</div>
								<div className="text-muted-foreground text-sm">
									{playlist.lessons.length} درس
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Lessons List */}
			<div className="max-w-4xl mx-auto">
				<div className="flex flex-col gap-4">
					{playlist.lessons.map((lesson, index) => (
						<LessonCard
							key={lesson.id}
							playlistId={playlist.youtube_playlist_id}
							id={lesson.id}
							index={index}
							title={lesson.title}
							youtubeUrl={lesson.youtubeUrl}
							viewsCount={lesson.views_count}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
