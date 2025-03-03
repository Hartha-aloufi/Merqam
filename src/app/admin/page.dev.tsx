// src/app/admin/page.tsx
import { Metadata } from 'next';
import { AdminDashboard } from '@/client/components/admin/dashboard/AdminDashboard';
import { getTopics } from '../../../public/data/PLZmiPrHYOIsT3AhREWUIjbtPEAGH4NR5x/mdx';

export const metadata: Metadata = {
	title: 'لوحة التحكم | مِرْقَم',
	description: 'لوحة التحكم الرئيسية لإدارة المحتوى',
};

export default async function AdminPage() {
	const topics = await getTopics();
	const totalLessons = topics.reduce(
		(acc, topic) => acc + topic.lessons.length,
		0
	);

	return (
		<div className="container px-4 py-6 md:py-8 mx-auto">
			<AdminDashboard topics={topics} totalLessons={totalLessons} />
		</div>
	);
}
