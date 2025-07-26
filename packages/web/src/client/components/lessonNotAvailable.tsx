'use client';

import { Button } from '@/client/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/client/components/ui/card';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestLessonGeneration } from '@/app/actions/requestLessonGeneration';
import { toast } from 'sonner';
import { useSession } from '@/client/hooks/use-auth-query';

interface LessonNotAvailableProps {
	youtubeId: string;
}

export function LessonNotAvailable({ youtubeId }: LessonNotAvailableProps) {
	const [isProcessing, setIsProcessing] = useState(false);
	const router = useRouter();
	const { data: session } = useSession();
	const isAuthenticated = !!session?.user;

	const handleRequestToAdd = async () => {
		// Check authentication on client side first for better UX
		if (!isAuthenticated) {
			toast.error('يجب تسجيل الدخول أولاً');
			router.push('/auth/signin');
			return;
		}

		setIsProcessing(true);
		try {
			// Call requestLessonGeneration without Baheth metadata since video is not in Baheth
			const result = await requestLessonGeneration(youtubeId);

			if (result.success && result.redirectUrl) {
				router.push(result.redirectUrl);
			} else {
				toast.error(result.error || 'حدث خطأ أثناء طلب إضافة الدرس');
				setIsProcessing(false);
			}
		} catch (error) {
			toast.error('حدث خطأ أثناء طلب إضافة الدرس');
			console.error('Error requesting lesson addition:', error);
			setIsProcessing(false);
		}
	};

	return (
		<div className="container mx-auto py-12 px-4">
			<Card className="max-w-2xl mx-auto">
				<CardHeader>
					<CardTitle className="text-xl">
						الدرس غير متوفر
					</CardTitle>
					<CardDescription>
						هذا الدرس غير متوفر في مِرْقَم أو باحث حالياً
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground mb-4">يمكنك:</p>
					<div className="space-y-4">
						<div className="p-4 border rounded-lg bg-muted/50">
							<h3 className="font-medium mb-2 flex items-center gap-2">
								<Plus className="h-4 w-4" />
								طلب إضافة الدرس إلى مِرْقَم
							</h3>
							<p className="text-sm text-muted-foreground">
								سيتم إرسال طلب لمعالجة هذا الفيديو وإضافته إلى مِرْقَم مع جميع الميزات التفاعلية
							</p>
						</div>
					</div>
				</CardContent>
				<CardFooter className="flex gap-3 justify-end">
					<Button
						variant="outline"
						onClick={() => router.push('/')}
						disabled={isProcessing}
					>
						العودة للرئيسية
					</Button>
					<Button
						onClick={handleRequestToAdd}
						disabled={isProcessing}
					>
						<Plus className="mr-2 h-4 w-4" />
						{!isAuthenticated ? 'تسجيل الدخول وطلب الإضافة' : 'طلب الإضافة'}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}