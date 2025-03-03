// src/app/admin/jobs/[jobId]/page.tsx
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { JobDetail } from '@/client/components/jobs/job-detail-component';
import { db } from '@/server/config/db';

interface JobDetailPageProps {
	params: Promise< {
		jobId: string;
	}>;
}

export async function generateMetadata({
	params,
}: JobDetailPageProps): Promise<Metadata> {
  const {jobId} = await params;
  
	return {
		title: `تفاصيل المهمة ${jobId} | مِرْقَم`,
		description: 'عرض تفاصيل مهمة إنشاء درس',
	};
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
	// Get the current user - in production, use your auth system
	const adminUser = await db
		.selectFrom('users')
		.where('email', '=', 'admin@example.com')
		.select(['id'])
		.executeTakeFirst();

  const {jobId} = await params;

	if (!adminUser) {
		redirect('/auth/signin?returnUrl=/admin/jobs/' + jobId);
	}

	return (
		<div className="container px-4 py-6 md:py-8 mx-auto">
			<div className="mb-6 md:mb-8">
				<h1 className="text-2xl md:text-3xl font-bold mb-2">
					تفاصيل المهمة
				</h1>
				<p className="text-muted-foreground">
					عرض حالة ومعلومات المهمة
				</p>
			</div>

			<div className="max-w-4xl mx-auto">
				<JobDetail jobId={jobId} userId={adminUser.id} />
			</div>
		</div>
	);
}
