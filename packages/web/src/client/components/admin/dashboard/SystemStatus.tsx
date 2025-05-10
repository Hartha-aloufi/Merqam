'use client';

import { useState, useEffect } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/client/components/ui/card';
import { testYtDlp } from '@/app/admin/jobs/lessons-queue/actions';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/client/components/ui/button';

interface SystemStatus {
	ytDlp: {
		installed: boolean;
		version?: string;
		message?: string;
	};
}

export function SystemStatus() {
	const [status, setStatus] = useState<SystemStatus>({
		ytDlp: { installed: false },
	});
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const checkSystemStatus = async () => {
		setLoading(true);
		setError(null);

		try {
			// Check yt-dlp status
			const ytDlpResult = await testYtDlp();

			setStatus({
				ytDlp: {
					installed: ytDlpResult.status === 'success',
					version: ytDlpResult.version,
					message: ytDlpResult.message || ytDlpResult.error,
				},
			});
		} catch (err) {
			console.error('Error checking system status:', err);
			setError('Failed to check system status');
		} finally {
			setLoading(false);
		}
	};

	// Check status on component mount
	useEffect(() => {
		checkSystemStatus();
	}, []);

	return (
		<Card>
			<CardHeader>
				<CardTitle>حالة النظام</CardTitle>
				<CardDescription>
					التحقق من حالة مكونات النظام المطلوبة
				</CardDescription>
			</CardHeader>
			<CardContent>
				{loading ? (
					<div className="flex items-center gap-2 text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
						جاري التحقق من حالة النظام...
					</div>
				) : error ? (
					<div className="flex items-center gap-2 text-destructive">
						<AlertCircle className="h-4 w-4" />
						{error}
					</div>
				) : (
					<div className="space-y-4">
						<div className="flex items-center justify-between border-b pb-2">
							<div>
								<h3 className="font-medium">أداة yt-dlp</h3>
								<p className="text-sm text-muted-foreground">
									مطلوبة لتنزيل معلومات قوائم التشغيل
								</p>
							</div>
							<div className="flex items-center gap-2">
								{status.ytDlp.installed ? (
									<span className="flex items-center text-green-600">
										<CheckCircle className="h-5 w-5 mr-1" />
										{status.ytDlp.version && (
											<span className="text-xs font-mono">
												{status.ytDlp.version}
											</span>
										)}
									</span>
								) : (
									<span className="flex items-center text-destructive">
										<XCircle className="h-5 w-5 mr-1" />
										غير مثبتة
									</span>
								)}
							</div>
						</div>

						{!status.ytDlp.installed && (
							<div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
								<p>
									يجب تثبيت أداة yt-dlp لتتمكن من استخدام ميزة
									إنشاء مهام من قوائم التشغيل.
									<br />
									قم بتثبيت الأداة من خلال:{' '}
									<a
										href="https://github.com/yt-dlp/yt-dlp/wiki/Installation"
										target="_blank"
										rel="noopener noreferrer"
										className="underline"
									>
										رابط التثبيت
									</a>
								</p>
							</div>
						)}

						<Button
							variant="outline"
							size="sm"
							onClick={checkSystemStatus}
							disabled={loading}
						>
							{loading ? (
								<>
									<Loader2 className="ml-2 h-4 w-4 animate-spin" />
									جاري التحقق...
								</>
							) : (
								'تحديث الحالة'
							)}
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
