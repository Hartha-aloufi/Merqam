'use client';

import {
	useGenerationJobs,
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
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/client/components/ui/pagination';
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
	Layers,
	List,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
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
import { GroupedJobsList } from './grouped-jobs-list';
import { Switch } from '@/client/components/ui/switch';

interface JobsListProps {
	userId: string | null; // null means show all users
	pageSize?: number;
}

export function JobsList({ userId, pageSize = 10 }: JobsListProps) {
	const [currentPage, setCurrentPage] = useState(0);
	const [isGroupedView, setIsGroupedView] = useState(false);
	const [users, setUsers] = useState<Map<string, string>>(new Map());
	const { data, isLoading, isError, error } = useGenerationJobs(
		userId,
		pageSize,
		currentPage * pageSize
	);
	const { mutate: cancelJob, isPending: isCancelling } =
		useCancelGenerationJob();
	const { mutate: retryJob, isPending: isRetrying } = useRetryFailedJob();
	const [jobToCancelId, setJobToCancelId] = useState<string | null>(null);
	const [jobToRetryId, setJobToRetryId] = useState<string | null>(null);

	// Fetch user emails when jobs data changes (only when showing all users)
	useEffect(() => {
		if (!data?.jobs || userId !== null) return; // Only fetch users when showing all users
		
		const userIds = [...new Set(data.jobs.map(job => job.user_id))];
		if (userIds.length === 0) return;

		// Simple user lookup - in a real app you'd want a proper API endpoint
		fetch('/api/profile') // This endpoint would need to be created to fetch user info by IDs
			.then(res => res.json())
			.then(userData => {
				const userMap = new Map();
				// For now, we'll just show partial emails for privacy
				userIds.forEach(id => {
					userMap.set(id, `مستخدم ${id.slice(0, 8)}...`);
				});
				setUsers(userMap);
			})
			.catch(() => {
				// Fallback: show user ID fragments
				const userMap = new Map();
				userIds.forEach(id => {
					userMap.set(id, `مستخدم ${id.slice(0, 8)}...`);
				});
				setUsers(userMap);
			});
	}, [data?.jobs, userId]);

	const handleCancelJob = (jobId: string) => {
		// Find the job to get the actual user_id
		const job = data?.jobs.find(j => j.id === jobId);
		const jobUserId = job?.user_id || userId;
		cancelJob({ jobId, userId: jobUserId });
		setJobToCancelId(null);
	};

	const handleRetryJob = (jobId: string) => {
		// Find the job to get the actual user_id
		const job = data?.jobs.find(j => j.id === jobId);
		const jobUserId = job?.user_id || userId;
		retryJob({ jobId, userId: jobUserId });
		setJobToRetryId(null);
	};

	const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

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

	// Render loading skeleton
	if (isLoading && !isGroupedView) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>المهام</CardTitle>
					<CardDescription>
						قائمة المهام المجدولة والمكتملة
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{Array(5)
							.fill(0)
							.map((_, i) => (
								<div
									key={i}
									className="flex items-center gap-4"
								>
									<Skeleton className="h-12 w-full" />
								</div>
							))}
					</div>
				</CardContent>
			</Card>
		);
	}

	// Render error
	if (isError && !isGroupedView) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>المهام</CardTitle>
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

	return (
		<Card>
			<CardHeader>
				<div className="flex justify-between items-center">
					<div>
						<CardTitle>المهام</CardTitle>
						<CardDescription>
							قائمة المهام المجدولة والمكتملة
						</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant={isGroupedView ? 'outline' : 'default'}
							size="sm"
							onClick={() => setIsGroupedView(false)}
						>
							<List className="h-4 w-4 mr-1" />
							<span>عرض قائمة</span>
						</Button>
						<Button
							variant={!isGroupedView ? 'outline' : 'default'}
							size="sm"
							onClick={() => setIsGroupedView(true)}
						>
							<Layers className="h-4 w-4 mr-1" />
							<span>تجميع حسب القائمة</span>
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{isGroupedView ? (
					<GroupedJobsList userId={userId} />
				) : (
					<>
						{data?.jobs.length === 0 ? (
							<div className="text-center py-8">
								<p className="text-muted-foreground">
									لا توجد مهام
								</p>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>العنوان</TableHead>
										<TableHead>الحالة</TableHead>
										<TableHead>التاريخ</TableHead>
										{userId === null && <TableHead>المستخدم</TableHead>}
										<TableHead className="text-left">
											الإجراءات
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{data?.jobs.map((job) => (
										<TableRow key={job.id}>
											<TableCell>
												<div className="flex flex-col">
													{job.new_playlist_title ? (
														<span className="font-medium">
															{
																job.new_playlist_title
															}
														</span>
													) : job.playlist_id ? (
														<span className="font-medium">
															{job.playlist_id}
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
												{renderStatus(
													job.status,
													job.progress
												)}
											</TableCell>
											<TableCell>
												<div className="flex flex-col gap-1">
													<span className="text-xs text-muted-foreground">
														تم الإنشاء{' '}
														{formatDate(
															job.created_at.toString()
														)}
													</span>
													{job.started_at && (
														<span className="text-xs text-muted-foreground">
															بدأ{' '}
															{formatDate(
																job.started_at.toString()
															)}
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
											{userId === null && (
												<TableCell>
													<span className="text-sm text-muted-foreground">
														{users.get(job.user_id) || `مستخدم ${job.user_id.slice(0, 8)}...`}
													</span>
												</TableCell>
											)}
											<TableCell>
												<div className="flex items-center gap-2">
													<Link
														href={`/admin/jobs/${job.id}`}
													>
														<Button
															variant="outline"
															size="sm"
														>
															<ExternalLink className="h-4 w-4" />
															<span className="sr-only">
																عرض
															</span>
														</Button>
													</Link>

													{job.status ===
														'failed' && (
														<AlertDialog>
															<AlertDialogTrigger
																asChild
															>
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() =>
																		setJobToRetryId(
																			job.id
																		)
																	}
																	disabled={
																		isRetrying &&
																		jobToRetryId ===
																			job.id
																	}
																>
																	{isRetrying &&
																	jobToRetryId ===
																		job.id ? (
																		<Loader2 className="h-4 w-4 animate-spin" />
																	) : (
																		<RefreshCw className="h-4 w-4" />
																	)}
																	<span className="sr-only">
																		إعادة
																		المهمة
																	</span>
																</Button>
															</AlertDialogTrigger>
															<AlertDialogContent>
																<AlertDialogHeader>
																	<AlertDialogTitle>
																		إعادة
																		المهمة
																	</AlertDialogTitle>
																	<AlertDialogDescription>
																		هل أنت
																		متأكد من
																		إعادة
																		هذه
																		المهمة؟
																	</AlertDialogDescription>
																</AlertDialogHeader>
																<AlertDialogFooter>
																	<AlertDialogCancel>
																		إلغاء
																	</AlertDialogCancel>
																	<AlertDialogAction
																		onClick={() =>
																			handleRetryJob(
																				job.id
																			)
																		}
																	>
																		نعم،
																		إعادة
																	</AlertDialogAction>
																</AlertDialogFooter>
															</AlertDialogContent>
														</AlertDialog>
													)}

													{(job.status ===
														'pending' ||
														job.status ===
															'processing') && (
														<AlertDialog>
															<AlertDialogTrigger
																asChild
															>
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() =>
																		setJobToCancelId(
																			job.id
																		)
																	}
																	disabled={
																		isCancelling &&
																		jobToCancelId ===
																			job.id
																	}
																>
																	{isCancelling &&
																	jobToCancelId ===
																		job.id ? (
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
																		إلغاء
																		المهمة
																	</AlertDialogTitle>
																	<AlertDialogDescription>
																		هل أنت
																		متأكد من
																		إلغاء
																		هذه
																		المهمة؟
																	</AlertDialogDescription>
																</AlertDialogHeader>
																<AlertDialogFooter>
																	<AlertDialogCancel>
																		إلغاء
																	</AlertDialogCancel>
																	<AlertDialogAction
																		onClick={() =>
																			handleCancelJob(
																				job.id
																			)
																		}
																	>
																		نعم،
																		إلغاء
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
						)}
					</>
				)}
			</CardContent>
			{!isGroupedView && totalPages > 1 && (
				<CardFooter>
					<Pagination>
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									onClick={() =>
										setCurrentPage((prev) =>
											Math.max(0, prev - 1)
										)
									}
								/>
							</PaginationItem>
							{Array.from({ length: totalPages }).map((_, i) => (
								<PaginationItem key={i}>
									<PaginationLink
										isActive={currentPage === i}
										onClick={() => setCurrentPage(i)}
									>
										{i + 1}
									</PaginationLink>
								</PaginationItem>
							))}
							<PaginationItem>
								<PaginationNext
									onClick={() =>
										setCurrentPage((prev) =>
											Math.min(totalPages - 1, prev + 1)
										)
									}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</CardFooter>
			)}
		</Card>
	);
}
