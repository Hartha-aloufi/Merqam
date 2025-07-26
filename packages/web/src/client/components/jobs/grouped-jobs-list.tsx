'use client';

import {
	useGroupedGenerationJobs,
	useCancelGenerationJob,
	useRetryFailedJob,
} from '@/client/hooks/use-job-query';
import { Button } from '@/client/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/client/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/client/components/ui/table';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/client/components/ui/collapsible';
import { JobStatus } from '@/types/db';
import {
	CircleDot,
	CheckCircle,
	XCircle,
	AlertCircle,
	Clock,
	ExternalLink,
	StopCircle,
	RefreshCw,
	Loader2,
	ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Skeleton } from '@/client/components/ui/skeleton';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/client/components/ui/alert-dialog';
import { Progress } from '@/client/components/ui/progress';
import { formatDate } from '@/client/lib/utils';
import { Badge } from '@/client/components/ui/badge';
import React from 'react';

interface GroupedJobsListProps {
	userId: string | null;
}

interface PlaylistGroup {
	playlist_id: string | null;
	playlist_title: string | null;
	total_count: number;
	completed_count: number;
	failed_count: number;
	processing_count: number;
	pending_count: number;
	cancelled_count: number;
	jobs: string; // JSON string of jobs
}

interface Job {
	id: string;
	url: string;
	status: JobStatus;
	progress: number;
	error: string | null;
	created_at: string;
	started_at: string | null;
	completed_at: string | null;
	new_playlist_title: string | null;
}

export function GroupedJobsList({ userId }: GroupedJobsListProps) {
	const { data, isLoading, isError, error } =
		useGroupedGenerationJobs(userId);

	// Render loading skeleton
	if (isLoading) {
		return (
			<div className="space-y-4">
				{Array(3)
					.fill(0)
					.map((_, i) => (
						<div key={i} className="border rounded-md">
							<div className="p-4 flex justify-between items-center">
								<Skeleton className="h-6 w-48" />
								<Skeleton className="h-6 w-24" />
							</div>
							<div className="border-t p-2">
								<Skeleton className="h-32 w-full" />
							</div>
						</div>
					))}
			</div>
		);
	}

	// Render error
	if (isError) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>المهام المجمعة</CardTitle>
					<CardDescription>
						حدث خطأ أثناء تحميل المهام
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-red-500">
						{error instanceof Error
							? error.message
							: 'خطأ غير معروف'}
					</p>
				</CardContent>
			</Card>
		);
	}

	// No data
	if (!data?.jobsWithPlaylist.length && !data?.individualJobs.length) {
		return (
			<div className="text-center py-8">
				<p className="text-muted-foreground">لا توجد مهام</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Playlist Groups */}
			{data.jobsWithPlaylist.length > 0 && (
				<div className="space-y-4">
					<h3 className="text-lg font-medium">قوائم التشغيل</h3>
					{data.jobsWithPlaylist.map((group) => (
						<PlaylistJobGroup
							key={group.playlist_id || 'ungrouped'}
							group={group}
							userId={userId}
						/>
					))}
				</div>
			)}

			{/* Individual Jobs */}
			{data.individualJobs.length > 0 && (
				<div className="space-y-4">
					<h3 className="text-lg font-medium">مهام فردية</h3>
					<Card>
						<CardContent className="pt-6">
							<JobsTable
								jobs={data.individualJobs}
								userId={userId}
							/>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}

function PlaylistJobGroup({
	group,
	userId,
}: {
	group: PlaylistGroup;
	userId: string;
}) {
	const [isOpen, setIsOpen] = useState(true);

	// Status badges
	const statusBadges = [];
	if (group.completed_count > 0) {
		statusBadges.push(
			<Badge key="completed" variant="success" className="mr-1">
				{group.completed_count} مكتمل
			</Badge>
		);
	}
	if (group.failed_count > 0) {
		statusBadges.push(
			<Badge key="failed" variant="destructive" className="mr-1">
				{group.failed_count} فشل
			</Badge>
		);
	}
	if (group.processing_count > 0) {
		statusBadges.push(
			<Badge key="processing" variant="default" className="mr-1">
				{group.processing_count} قيد المعالجة
			</Badge>
		);
	}
	if (group.pending_count > 0) {
		statusBadges.push(
			<Badge key="pending" variant="outline" className="mr-1">
				{group.pending_count} في الانتظار
			</Badge>
		);
	}

	const progress =
		group.total_count > 0
			? Math.round((group.completed_count / group.total_count) * 100)
			: 0;

	// Parse jobs from JSON string to array
	const jobs = React.useMemo(() => {
		try {
			// Handle both string and already parsed array (for type safety)
			if (typeof group.jobs === 'string') {
				return JSON.parse(group.jobs);
			} else if (Array.isArray(group.jobs)) {
				return group.jobs;
			}
			return [];
		} catch (error) {
			console.error('Failed to parse jobs JSON:', error);
			return [];
		}
	}, [group.jobs]);

	return (
		<Card>
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<CollapsibleTrigger className="w-full">
					<CardHeader className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<CardTitle className="text-md flex items-center">
									{group.playlist_title || 'قائمة غير معروفة'}{' '}
									<Badge className="ml-2">
										{group.total_count} مهمة
									</Badge>
								</CardTitle>
								<CardDescription className="mt-1 flex flex-wrap">
									{statusBadges}
								</CardDescription>
							</div>
							<div className="flex items-center">
								<Progress
									value={progress}
									className="w-24 h-2 mr-2"
								/>
								<span className="text-xs text-muted-foreground mr-2">
									{progress}%
								</span>
								<ChevronDown
									className={`h-4 w-4 transform transition-transform ${
										isOpen ? 'rotate-180' : ''
									}`}
								/>
							</div>
						</div>
					</CardHeader>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<CardContent className="pt-0 pb-4">
						<JobsTable jobs={jobs} userId={userId} />
					</CardContent>
				</CollapsibleContent>
			</Collapsible>
		</Card>
	);
}

function JobsTable({ jobs, userId }: { jobs: Job[]; userId: string }) {
	const { mutate: cancelJob, isPending: isCancelling } =
		useCancelGenerationJob();
	const { mutate: retryJob, isPending: isRetrying } = useRetryFailedJob();
	const [jobToCancelId, setJobToCancelId] = useState<string | null>(null);
	const [jobToRetryId, setJobToRetryId] = useState<string | null>(null);

	const handleCancelJob = (jobId: string) => {
		cancelJob({ jobId, userId });
		setJobToCancelId(null);
	};

	const handleRetryJob = (jobId: string) => {
		retryJob({ jobId, userId });
		setJobToRetryId(null);
	};

	// Status renderer
	const renderStatus = (status: JobStatus, progress: number) => {
		switch (status) {
			case 'pending':
				return (
					<div className="flex items-center">
						<Clock className="h-4 w-4 text-yellow-500 mr-2" />
						<span>في الانتظار</span>
					</div>
				);
			case 'processing':
				return (
					<div className="flex flex-col gap-1">
						<div className="flex items-center">
							<CircleDot className="h-4 w-4 text-blue-500 mr-2" />
							<span>قيد المعالجة</span>
						</div>
						<Progress value={progress} className="h-2 w-full" />
						<span className="text-xs text-muted-foreground">
							{progress}%
						</span>
					</div>
				);
			case 'completed':
				return (
					<div className="flex items-center">
						<CheckCircle className="h-4 w-4 text-green-500 mr-2" />
						<span>مكتمل</span>
					</div>
				);
			case 'failed':
				return (
					<div className="flex items-center">
						<XCircle className="h-4 w-4 text-red-500 mr-2" />
						<span>فشل</span>
					</div>
				);
			case 'cancelled':
				
				return (
					<div className="flex items-center">
						<StopCircle className="h-4 w-4 text-gray-500 mr-2" />
						<span>ملغي</span>
					</div>
				);
			default:
				return (
					<div className="flex items-center">
						<AlertCircle className="h-4 w-4 text-muted-foreground mr-2" />
						<span>{status}</span>
					</div>
				);
		}
	};

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>العنوان</TableHead>
					<TableHead>الحالة</TableHead>
					<TableHead>التاريخ</TableHead>
					<TableHead className="text-left">الإجراءات</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{jobs.map((job) => (
					<TableRow key={job.id}>
						<TableCell>
							<div className="flex flex-col">
								{job.new_playlist_title ? (
									<span className="font-medium">
										{job.new_playlist_title}
									</span>
								) : (
									<span className="text-muted-foreground">
										مهمة جديدة
									</span>
								)}
								<span className="text-xs text-muted-foreground truncate max-w-[200px]">
									{job.url}
								</span>
							</div>
						</TableCell>
						<TableCell>
							{renderStatus(job.status, job.progress)}
						</TableCell>
						<TableCell>
							<div className="flex flex-col gap-1">
								<span className="text-xs text-muted-foreground">
									تم الإنشاء{' '}
									{formatDate(job.created_at.toString())}
								</span>
								{job.started_at && (
									<span className="text-xs text-muted-foreground">
										بدأ{' '}
										{formatDate(job.started_at.toString())}
									</span>
								)}
								{job.completed_at && (
									<span className="text-xs text-muted-foreground">
										اكتمل{' '}
										{formatDate(
											job.completed_at.toString()
										)}
									</span>
								)}
							</div>
						</TableCell>
						<TableCell>
							<div className="flex items-center gap-2">
								<Link href={`/admin/jobs/${job.id}`}>
									<Button variant="outline" size="sm">
										<ExternalLink className="h-4 w-4" />
										<span className="sr-only">عرض</span>
									</Button>
								</Link>

								{job.status === 'failed' && (
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													setJobToRetryId(job.id)
												}
												disabled={
													isRetrying &&
													jobToRetryId === job.id
												}
											>
												{isRetrying &&
												jobToRetryId === job.id ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<RefreshCw className="h-4 w-4" />
												)}
												<span className="sr-only">
													إعادة المهمة
												</span>
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>
													إعادة المهمة
												</AlertDialogTitle>
												<AlertDialogDescription>
													هل أنت متأكد من إعادة هذه
													المهمة؟
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>
													إلغاء
												</AlertDialogCancel>
												<AlertDialogAction
													onClick={() =>
														handleRetryJob(job.id)
													}
												>
													نعم، إعادة
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								)}

								{(job.status === 'pending' ||
									job.status === 'processing') && (
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													setJobToCancelId(job.id)
												}
												disabled={
													isCancelling &&
													jobToCancelId === job.id
												}
											>
												{isCancelling &&
												jobToCancelId === job.id ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<StopCircle className="h-4 w-4" />
												)}
												<span className="sr-only">
													إلغاء
												</span>
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>
													إلغاء المهمة
												</AlertDialogTitle>
												<AlertDialogDescription>
													هل أنت متأكد من إلغاء هذه
													المهمة؟
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>
													إلغاء
												</AlertDialogCancel>
												<AlertDialogAction
													onClick={() =>
														handleCancelJob(job.id)
													}
												>
													نعم، إلغاء
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								)}
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
