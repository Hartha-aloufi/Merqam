// src/app/topics/page.tsx
import { getTopics } from '@/client/utils/mdx';
import { BookOpen, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

// Static metadata
export const metadata: Metadata = {
	title: 'المواضيع التعليمية | مِرْقَم',
	description: 'اختر الموضوع الذي تريد تعلمه وابدأ رحلة التعلم مع مِرْقَم',
};

// Mark page as static
export const dynamic = 'force-static';

export default async function TopicsPage() {
	const topics = await getTopics();

	return (
		<div className="container px-4 py-8">
			<div className="max-w-2xl mx-auto mb-12 text-center">
				<h1 className="text-4xl font-bold mb-4">المواضيع التعليمية</h1>
				<p className="text-lg text-muted-foreground">
					اختر الموضوع الذي تريد تعلمه وابدأ رحلة التعلم
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{topics.map((topic) => (
					<Link key={topic.id} href={`/topics/${topic.id}`}>
						<div className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:shadow-md transition-all duration-200">
							<div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-10 transition-transform duration-200 group-hover:scale-150" />
							<div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-tr-full -z-10 transition-transform duration-200 group-hover:scale-150" />

							<div className="mb-4">
								<div className="p-2 w-fit rounded-full bg-primary/10 text-primary mb-4">
									<GraduationCap className="h-6 w-6" />
								</div>
								<h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
									{topic.title}
								</h2>
								<p className="text-muted-foreground line-clamp-2">
									{topic.description}
								</p>
							</div>

							<div className="flex items-center justify-between mt-4 pt-4 border-t">
								<div className="flex items-center text-muted-foreground">
									<BookOpen className="h-4 w-4 ml-1" />
									<span className="text-sm">
										{topic.lessons.length} دروس
									</span>
								</div>
								<span className="text-sm text-primary font-medium group-hover:translate-x-1 transition-transform">
									تصفح الدروس
								</span>
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
