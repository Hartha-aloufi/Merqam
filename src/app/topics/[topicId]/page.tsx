// src/app/topics/[topicId]/page.tsx
import { getTopics, getLessons } from '@/client/utils/mdx';
import Link from 'next/link';
import { BookOpen, Video, ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Generate static paths
export async function generateStaticParams() {
	const topics = await getTopics();
	return topics.map((topic) => ({
		topicId: topic.id,
	}));
}

// Dynamic metadata
export async function generateMetadata({
	params,
}: {
	params: Promise<{ topicId: string }>;
}): Promise<Metadata> {
	const topics = await getTopics();
	const topic = topics.find(async (t) => t.id === (await params).topicId);

	if (!topic)
		return {
			title: 'الموضوع غير موجود | مِرْقَم',
		};

	return {
		title: `${topic.title} | مِرْقَم`,
		description: topic.description,
	};
}

// Mark page as static
export const dynamic = 'force-static';

export default async function TopicPage({
	params,
}: {
	params: Promise<{ topicId: string }>;
}) {
	const topics = await getTopics();
	const { topicId } = await params;
	const topic = topics.find((t) => t.id === topicId);
	const lessons = getLessons(topicId);

	if (!topic) return notFound();

	return (
		<div className="container px-4 py-8">
			{/* Topic Header */}
			<div className="relative mb-12 pb-8 border-b">
				<Link
					href="/topics"
					className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
				>
					<ArrowLeft className="ml-2 h-4 w-4" />
					العودة إلى المواضيع
				</Link>

				<div className="flex flex-col md:flex-row justify-between gap-6">
					<div>
						<h1 className="text-3xl font-bold mb-4">
							{topic.title}
						</h1>
						<p className="text-lg text-muted-foreground max-w-2xl">
							{topic.description}
						</p>
					</div>
					<div className="flex items-center gap-4 text-muted-foreground">
						<div className="flex items-center gap-2">
							<BookOpen className="h-5 w-5" />
							<span>{lessons.length} دروس</span>
						</div>
					</div>
				</div>
			</div>

			{/* Lessons List */}
			<div className="max-w-4xl mx-auto">
				<div className="space-y-4 flex flex-col gap-1">
					{lessons.map((lesson, index) => (
						<Link
							key={lesson.id}
							href={`/topics/${topicId}/${lesson.id}`}
						>
							<div className="group relative rounded-lg border bg-background px-3 sm:px-6 py-6 hover:shadow-md transition-all duration-200">
								<div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full -z-10 transition-all duration-200 group-hover:scale-150" />

								<div className="flex items-start gap-2 sm:gap-4">
									<div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
										{index + 1}
									</div>

									<div className="flex-grow">
										<h3 className="text-sm md:text-lg font-medium mb-2 group-hover:text-primary transition-colors">
											{lesson.title}
										</h3>

										<div className="flex items-center gap-4 text-sm text-muted-foreground">
											<div className="flex items-center gap-1">
												<BookOpen className="h-4 w-4" />
												<span>تفريغ</span>
											</div>
											{lesson.youtubeUrl && (
												<div className="flex items-center gap-1">
													<Video className="h-4 w-4" />
													<span>فيديو</span>
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
