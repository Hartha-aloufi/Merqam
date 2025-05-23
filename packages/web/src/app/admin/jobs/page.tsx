// src/app/admin/jobs/page.tsx
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { JobsList } from '@/client/components/jobs/job-list-component';
import { Button } from '@/client/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/server/config/db';


export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
	title: 'إدارة المهام | مِرْقَم',
	description: 'إدارة مهام إنشاء الدروس وعرض حالتها',
};

export default async function JobsPage() {
	// Get the current user - in production, use your auth system
	const adminUser = await db
		.selectFrom('users')
		.where('email', '=', 'admin@example.com')
		.select(['id'])
		.executeTakeFirst();

	if (!adminUser) {
		redirect('/auth/signin?returnUrl=/admin/jobs');
	}

	return (
		<div className="container px-4 py-6 md:py-8 mx-auto">
			<div className="flex justify-between items-center mb-6 md:mb-8">
				<div>
					<h1 className="text-2xl md:text-3xl font-bold mb-2">
						إدارة المهام
					</h1>
					<p className="text-muted-foreground">
						مراقبة وإدارة مهام إنشاء الدروس
					</p>
				</div>
					<Link href="/admin/jobs/new">
						<Button>
								<PlusCircle className="h-4 w-4 mr-2" />
								مهمة جديدة
						</Button>
					</Link>
			</div>

			<div className="max-w-6xl mx-auto">
				<JobsList userId={adminUser.id} />
			</div>
		</div>
	);
}
