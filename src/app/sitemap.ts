// app/sitemap.ts
import { getTopics } from '../../public/data/PLZmiPrHYOIsT3AhREWUIjbtPEAGH4NR5x/mdx';
import { MetadataRoute } from 'next';

// Mark as static
export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const topics = await getTopics();
	const baseUrl =
		process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com';

	// Base routes
	const routes = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: 'monthly' as const,
			priority: 1,
		},
		{
			url: `${baseUrl}/topics`,
			lastModified: new Date(),
			changeFrequency: 'monthly' as const,
			priority: 0.8,
		},
	];

	// Topic routes
	const topicRoutes = topics.map((topic) => ({
		url: `${baseUrl}/topics/${topic.id}`,
		lastModified: new Date(),
		changeFrequency: 'weekly' as const,
		priority: 0.6,
	}));

	// Lesson routes
	const lessonRoutes = topics.flatMap((topic) =>
		topic.lessons.map((lesson) => ({
			url: `${baseUrl}/topics/${topic.id}/${lesson.id}`,
			lastModified: new Date(),
			changeFrequency: 'weekly' as const,
			priority: 0.4,
		}))
	);

	return [...routes, ...topicRoutes, ...lessonRoutes];
}
