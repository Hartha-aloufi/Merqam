// src/app/admin/jobs/new/page.tsx
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { JobSubmissionForm } from '@/client/components/jobs/job-submission-form';
import { db } from '@/server/config/db';
import { getPlaylists, getSpeakers } from '@/app/admin/generate/actions';
import { Button } from '@/client/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'إنشاء مهمة جديدة | مِرْقَم',
	description: 'إنشاء مهمة جديدة لتوليد درس من النص المفرغ',
};

export default async function NewJobPage() {
	// Get the current user - in production, use your auth system
	const adminUser = await db
		.selectFrom('users')
		.where('email', '=', 'admin@example.com')
		.select(['id'])
		.executeTakeFirst();

	if (!adminUser) {
		redirect('/auth/signin?returnUrl=/admin/jobs/new');
	}

	// Fetch initial data for form
	const [speakers, playlists] = await Promise.all([
		getSpeakers(),
		getPlaylists(),
	]);

	return (
		<div className="container px-4 py-6 md:py-8 mx-auto">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
				<div>
					<h1 className="text-2xl md:text-3xl font-bold mb-2">
						إنشاء مهمة جديدة
					</h1>
					<p className="text-muted-foreground">
						إنشاء مهمة جديدة لتوليد درس من النص المفرغ
					</p>
				</div>
				<Button variant="outline" asChild>
					<Link href="/admin/jobs">
						<ArrowLeft className="h-4 w-4 mr-2" />
						العودة إلى قائمة المهام
					</Link>
				</Button>
			</div>

			<div className="max-w-3xl mx-auto">
				<JobSubmissionForm
					userId={adminUser.id}
					initialSpeakers={speakers}
					initialPlaylists={playlists}
				/>
			</div>
		</div>
	);
}
