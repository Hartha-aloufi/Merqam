import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ContentGeneratorForm } from './content-generator-form';
import { getPlaylists, getSpeakers } from './actions';
import { db } from '@/server/config/db';

export const metadata: Metadata = {
	title: 'إنشاء درس جديد | مِرْقَم',
	description: 'إنشاء درس جديد من صفحة النص المفرغ',
};

export default async function ContentGeneratorPage() {
	// For now, we'll use a default admin user
	// TODO: Implement proper authentication
	const adminUser = await db
		.selectFrom('users')
		.where('email', '=', 'admin@example.com')
		.select(['id'])
		.executeTakeFirst();

	if (!adminUser) {
		redirect('/auth/signin?returnUrl=/admin/generate');
	}

	// Fetch initial data
	const [speakers, playlists] = await Promise.all([
		getSpeakers(),
		getPlaylists(),
	]);

	return (
		<div className="container px-4 py-6 md:py-8 mx-auto">
			<div className="mb-6 md:mb-8">
				<h1 className="text-2xl md:text-3xl font-bold mb-2">
					إنشاء درس جديد
				</h1>
				<p className="text-muted-foreground">
					أنشئ درسًا جديدًا من صفحة النص المفرغ
				</p>
			</div>

			<div className="max-w-3xl mx-auto">
				<ContentGeneratorForm
					userId={adminUser.id}
					initialSpeakers={speakers}
					initialPlaylists={playlists}
				/>
			</div>
		</div>
	);
}
