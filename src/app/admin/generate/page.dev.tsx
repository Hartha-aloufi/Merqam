// src/app/admin/generate/page.tsx
import { Metadata } from 'next';
import { LessonGeneratorForm } from '@/client/components/admin/lesson-generator/form';
import { getTopics } from '@/client/utils/mdx';

export const metadata: Metadata = {
	title: 'إنشاء درس جديد | مِرْقَم',
	description: 'إنشاء درس جديد من صفحة النص المفرغ',
};

export default async function LessonGeneratorPage() {
	const topics = await getTopics();

	return (
		<div className="container px-4 py-6 md:py-8 mx-auto">
			<div className="mb-6 md:mb-8">
				<h1 className="text-2xl md:text-3xl font-bold mb-2">
					إنشاء درس جديد
				</h1>
				<p className="text-muted-foreground">
					أنشئ درسًا جديدًا من صفحة النص المفرغ في موقع باحث
				</p>
			</div>

			<div className="max-w-2xl mx-auto">
				<LessonGeneratorForm existingTopics={topics} />
			</div>
		</div>
	);
}
