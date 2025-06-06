'use client';

import { useState, useEffect } from 'react';
import {
	useGenerationJobById,
	useCancelGenerationJob,
	useRetryFailedJob,
	useJobLogs,
} from '@/client/hooks/use-job-query';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/client/components/ui/card';
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from '@/client/components/ui/alert';
import { Button } from '@/client/components/ui/button';
import {
	CircleDot,
	CheckCircle,
	XCircle,
	AlertCircle,
	Clock,
	ExternalLink,
	StopCircle,
	ArrowLeft,
	Loader2,
	RefreshCw,
	Code,
} from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/client/components/ui/skeleton';
import { Progress } from '@/client/components/ui/progress';
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
import { Separator } from '@/client/components/ui/separator';
import { cn, formatDate } from '@/client/lib/utils';
import { JobStatus } from '@/types/db';
import { ScrollArea } from '@/client/components/ui/scroll-area';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/client/components/ui/collapsible';

interface JobDetailProps {
	jobId: string;
	userId: string;
}

export function JobDetail({ jobId, userId }: JobDetailProps) {
	const {
		data: job,
		isLoading,
		isError,
		error,
		refetch,
	} = useGenerationJobById(jobId, userId);
	const { mutate: cancelJob, isPending: isCancelling } =
		useCancelGenerationJob();
	const { mutate: retryJob, isPending: isRetrying } = useRetryFailedJob();
	const {
		data: jobLogs,
		isLoading: isLoadingLogs,
		isError: isLogsError,
		refetch: refetchLogs,
	} = useJobLogs(jobId, userId, job?.status === 'failed');

	// Auto-refresh for in-progress jobs
	const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

	const isActive = job?.status === 'pending' || job?.status === 'processing';

	useEffect(() => {
		let intervalId: NodeJS.Timeout;

		if (isActive) {
			// Refresh every 3 seconds for active jobs
			intervalId = setInterval(() => {
				refetch();
				setLastRefreshTime(Date.now());
			}, 3000);
		}

		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	}, [isActive, refetch]);

	const handleCancelJob = () => {
		cancelJob({ jobId, userId });
	};

	const handleRetryJob = () => {
		retryJob({ jobId, userId });
	};

	// Status badge component
	const StatusBadge = ({
		status,
		progress,
	}: {
		status: JobStatus;
		progress: number;
	}) => {
		const statusConfig = {
			pending: {
				icon: Clock,
				color: 'bg-yellow-100 text-yellow-800 border-yellow-400',
			},
			processing: {
				icon: CircleDot,
				color: 'bg-blue-100 text-blue-800 border-blue-400',
			},
			completed: {
				icon: CheckCircle,
				color: 'bg-green-100 text-green-800 border-green-400',
			},
			failed: {
				icon: XCircle,
				color: 'bg-red-100 text-red-800 border-red-400',
			},
			cancelled: {
				icon: StopCircle,
				color: 'bg-gray-100 text-gray-800 border-gray-400',
			},
		};

		const config = statusConfig[status] || {
			icon: AlertCircle,
			color: 'bg-gray-100 text-gray-800 border-gray-400',
		};
		const Icon = config.icon;

		const getStatusText = (status: JobStatus) => {
			switch (status) {
				case 'pending':
					return 'في الانتظار';
				case 'processing':
					return 'قيد المعالجة';
				case 'completed':
					return 'مكتمل';
				case 'failed':
					return 'فشل';
				case 'cancelled':
					return 'ملغي';
				default:
					return status;
			}
		};

		return (
			<div className="flex flex-col gap-2">
				<div
					className={cn(
						'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
						config.color
					)}
				>
					<Icon className="h-3 w-3 mr-1" />
					{getStatusText(status)}
				</div>

				{status === 'processing' && (
					<div className="flex flex-col gap-1 mt-1">
						<Progress value={progress} className="h-2 w-full" />
						<span className="text-xs text-muted-foreground">
							{progress}%
						</span>
					</div>
				)}
			</div>
		);
	};

	// Loading state
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>تفاصيل المهمة</CardTitle>
					<CardDescription>جاري تحميل البيانات...</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-8 w-3/4" />
						<Skeleton className="h-8 w-1/2" />
						<Skeleton className="h-20 w-full" />
					</div>
				</CardContent>
			</Card>
		);
	}

	// Error state
	if (isError) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>تفاصيل المهمة</CardTitle>
					<CardDescription>
						حدث خطأ أثناء تحميل البيانات
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>خطأ</AlertTitle>
						<AlertDescription>
							{error instanceof Error
								? error.message
								: 'خطأ غير معروف'}
						</AlertDescription>
					</Alert>
					<div className="mt-4">
						<Button asChild>
							<Link href="/admin/jobs">
								<ArrowLeft className="h-4 w-4 mr-2" />
								العودة إلى قائمة المهام
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Not found state
	if (!job) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>تفاصيل المهمة</CardTitle>
					<CardDescription>المهمة غير موجودة</CardDescription>
				</CardHeader>
				<CardContent>
					<Alert>
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>غير موجود</AlertTitle>
						<AlertDescription>
							لم يتم العثور على المهمة المطلوبة
						</AlertDescription>
					</Alert>
					<div className="mt-4">
						<Button asChild>
							<Link href="/admin/jobs">
								<ArrowLeft className="h-4 w-4 mr-2" />
								العودة إلى قائمة المهام
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="max-w-4xl mx-auto">
			<CardHeader className="flex flex-row items-start justify-between">
				<div>
					<CardTitle>تفاصيل المهمة</CardTitle>
					<CardDescription>
						{job.new_playlist_title ||
							job.playlist_id ||
							'مهمة إنشاء درس جديد'}
					</CardDescription>
				</div>
				<StatusBadge status={job.status} progress={job.progress} />
			</CardHeader>

			<CardContent className="space-y-6">
				{/* Job Information */}
				<div className="space-y-4">
					<h3 className="text-sm font-medium">معلومات المهمة</h3>
					<dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
						<div>
							<dt className="text-muted-foreground">
								رابط المحتوى
							</dt>
							<dd className="font-medium overflow-hidden text-ellipsis dir-ltr break-words">
								<a
									href={job.url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 hover:underline"
								>
									{job.url}
								</a>
							</dd>
						</div>

						<div>
							<dt className="text-muted-foreground">
								خدمة الذكاء الاصطناعي
							</dt>
							<dd className="font-medium">
								{job.ai_service === 'openai'
									? 'OpenAI GPT-4'
									: 'Google Gemini'}
							</dd>
						</div>

						<div>
							<dt className="text-muted-foreground">القائمة</dt>
							<dd className="font-medium">
								{job.playlist_id ? (
									<Link
										href={`/playlists/${job.playlist_id}`}
										className="text-blue-600 hover:underline"
									>
										{job.playlist_id}
									</Link>
								) : job.new_playlist_title ? (
									<span>{job.new_playlist_title} (جديد)</span>
								) : (
									<span className="text-muted-foreground">
										غير محدد
									</span>
								)}
							</dd>
						</div>

						<div>
							<dt className="text-muted-foreground">المتحدث</dt>
							<dd className="font-medium">
								{job.speaker_id ? (
									<span>{job.speaker_id}</span>
								) : job.new_speaker_name ? (
									<span>{job.new_speaker_name} (جديد)</span>
								) : (
									<span className="text-muted-foreground">
										غير محدد
									</span>
								)}
							</dd>
						</div>
					</dl>
				</div>

				<Separator />

				{/* Timestamps */}
				<div className="space-y-4">
					<h3 className="text-sm font-medium">الجدول الزمني</h3>
					<dl className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
						<div>
							<dt className="text-muted-foreground">
								تم الإنشاء
							</dt>
							<dd className="font-medium">
								{formatDate(job.created_at?.toString())}
							</dd>
						</div>

						{job.started_at && (
							<div>
								<dt className="text-muted-foreground">
									بدأ المعالجة
								</dt>
								<dd className="font-medium">
									{formatDate(job.started_at?.toString())}
								</dd>
							</div>
						)}

						{job.completed_at && (
							<div>
								<dt className="text-muted-foreground">اكتمل</dt>
								<dd className="font-medium">
									{formatDate(job.completed_at?.toString())}
								</dd>
							</div>
						)}
					</dl>
				</div>

				{/* Status & Progress */}
				{job.status === 'processing' && (
					<div className="space-y-4">
						<h3 className="text-sm font-medium">التقدم</h3>
						<div className="space-y-2">
							<Progress
								value={job.progress}
								className="h-2 w-full"
							/>
							<div className="flex justify-between text-xs text-muted-foreground">
								<span>{job.progress}% مكتمل</span>
								<span>
									آخر تحديث:{' '}
									{formatDate(
										new Date(lastRefreshTime).toString()
									)}
								</span>
							</div>
						</div>
					</div>
				)}

				{/* Error Details */}
				{job.status === 'failed' && job.error && (
					<div className="space-y-4">
						<h3 className="text-sm font-medium">تفاصيل الخطأ</h3>
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertTitle>فشلت المعالجة</AlertTitle>
							<AlertDescription>{job.error}</AlertDescription>
						</Alert>

						<Collapsible>
							<CollapsibleTrigger asChild>
								<Button
									variant="outline"
									className="w-full flex justify-between items-center"
								>
									<div className="flex items-center">
										<Code className="h-4 w-4 mr-2" />
										<span>عرض سجلات الخطأ المفصلة</span>
									</div>
									{isLoadingLogs && (
										<Loader2 className="h-4 w-4 animate-spin" />
									)}
								</Button>
							</CollapsibleTrigger>
							<CollapsibleContent className="mt-2">
								{isLogsError ? (
									<Alert variant="destructive">
										<AlertCircle className="h-4 w-4" />
										<AlertTitle>خطأ</AlertTitle>
										<AlertDescription>
											فشل في تحميل سجلات الخطأ
											<Button
												variant="outline"
												size="sm"
												onClick={() => refetchLogs()}
												className="mt-2"
											>
												<RefreshCw className="h-3 w-3 mr-1" />
												إعادة المحاولة
											</Button>
										</AlertDescription>
									</Alert>
								) : jobLogs?.logs?.length ? (
									<ScrollArea className="h-80 w-full rounded-md border p-4 bg-black text-white font-mono text-sm">
										{jobLogs.logs.map((log, i) => (
											<div
												key={i}
												className="mb-2 pb-2 border-b border-gray-700"
											>
												<div className="text-gray-400">
													{new Date(
														log.timestamp
													).toLocaleString('ar-SA')}
												</div>
												<div
													className={`${
														log.level === 'error'
															? 'text-red-400'
															: 'text-white'
													}`}
												>
													{log.message}
												</div>
												{log.metadata?.error && (
													<div className="text-orange-400 mt-1">
														{typeof log.metadata
															.error === 'string'
															? log.metadata.error
															: JSON.stringify(
																	log.metadata
																		.error,
																	null,
																	2
															  )}
													</div>
												)}
											</div>
										))}
									</ScrollArea>
								) : (
									<div className="text-center p-4 text-muted-foreground">
										{jobLogs?.fileExists === false
											? 'ملف السجل غير موجود. قد تكون السجلات قد انتهت صلاحيتها أو تمت إزالتها.'
											: 'لا توجد سجلات خطأ متاحة لهذه المهمة.'}
									</div>
								)}
							</CollapsibleContent>
						</Collapsible>
					</div>
				)}

				{/* Result */}
				{job.status === 'completed' && job.result && (
					<div className="space-y-4">
						<h3 className="text-sm font-medium">النتيجة</h3>
						<Alert
							variant="default"
							className="bg-green-50 border-green-200"
						>
							<CheckCircle className="h-4 w-4 text-green-500" />
							<AlertTitle>تمت المعالجة بنجاح</AlertTitle>
							<AlertDescription>
								<p>
									تم إنشاء الدرس بنجاح. يمكنك مشاهدته من خلال
									الرابط أدناه.
								</p>

								<Button className="mt-2" asChild>
									<Link
										href={`/playlists/${job.result.playlistId}/lessons/${job.result.lessonId}`}
									>
										<ExternalLink className="h-4 w-4 mr-2" />
										مشاهدة الدرس
									</Link>
								</Button>
							</AlertDescription>
						</Alert>
					</div>
				)}
			</CardContent>

			<CardFooter className="flex gap-2">
				<Button variant="outline" asChild>
					<Link href="/admin/jobs">
						<ArrowLeft className="h-4 w-4 mr-2" />
						العودة للقائمة
					</Link>
				</Button>

				{/* Retry button for failed jobs */}
				{job.status === 'failed' && (
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="default" disabled={isRetrying}>
								{isRetrying ? (
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								) : (
									<RefreshCw className="h-4 w-4 mr-2" />
								)}
								إعادة المهمة
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									تأكيد إعادة المهمة
								</AlertDialogTitle>
								<AlertDialogDescription>
									هل أنت متأكد من رغبتك في إعادة هذه المهمة؟
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>إلغاء</AlertDialogCancel>
								<AlertDialogAction onClick={handleRetryJob}>
									إعادة المهمة
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				)}

				{/* Cancel button for active jobs */}
				{(job.status === 'pending' || job.status === 'processing') && (
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								variant="destructive"
								disabled={isCancelling}
							>
								{isCancelling ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										جاري الإلغاء...
									</>
								) : (
									<>
										<StopCircle className="h-4 w-4 mr-2" />
										إلغاء المهمة
									</>
								)}
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									إلغاء المهمة
								</AlertDialogTitle>
								<AlertDialogDescription>
									هل أنت متأكد أنك تريد إلغاء هذه المهمة؟ لا
									يمكن التراجع عن هذا الإجراء.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>إلغاء</AlertDialogCancel>
								<AlertDialogAction
									onClick={() => handleCancelJob()}
									disabled={isCancelling}
									className="bg-red-500 hover:bg-red-600"
								>
									{isCancelling
										? 'جاري الإلغاء...'
										: 'تأكيد الإلغاء'}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				)}
			</CardFooter>
		</Card>
	);
}
