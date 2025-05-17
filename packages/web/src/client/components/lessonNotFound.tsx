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
import type { BahethMedium } from '@/server/services/baheth.service';
import { Eye, Plus } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestLessonGeneration } from '@/app/actions/requestLessonGeneration';
import { toast } from 'sonner';

interface LessonNotFoundProps {
	youtubeId: string;
	bahethMedium: BahethMedium;
}

export function LessonNotFound({
	youtubeId,
	bahethMedium,
}: LessonNotFoundProps) {
	const [isProcessing, setIsProcessing] = useState(false);
	const router = useRouter();

	const handleViewOnly = () => {
		setIsProcessing(true);
		router.push(`/external/lessons/${youtubeId}`);
	};

	const handleRequestToAdd = async () => {
		setIsProcessing(true);
		try {
			const result = await requestLessonGeneration(
				youtubeId,
				bahethMedium
			);

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
						{bahethMedium.title}
					</CardTitle>
					<CardDescription>
						هذا الدرس متوفر في باحث، ولكن غير متوفر بالكامل في
						مِرْقَم
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground mb-4">يمكنك الآن:</p>
					<div className="space-y-4">
						<div className="p-4 border rounded-lg bg-muted/50">
							<h3 className="font-medium mb-2 flex items-center gap-2">
								<Eye className="h-4 w-4" />
								عرض الدرس في وضع القراءة فقط
							</h3>
							<p className="text-sm text-muted-foreground">
								ستتمكن من قراءة المحتوى، ولكن لن تتمكن من
								استخدام ميزات التعليقات والتظليل
							</p>
						</div>
						<div className="p-4 border rounded-lg bg-muted/50">
							<h3 className="font-medium mb-2 flex items-center gap-2">
								<Plus className="h-4 w-4" />
								طلب إضافة الدرس إلى مِرْقَم
							</h3>
							<p className="text-sm text-muted-foreground">
								سيتم إرسال طلب لإضافة هذا الدرس بالكامل إلى
								مِرْقَم مع جميع الميزات
							</p>
						</div>
					</div>
				</CardContent>
				<CardFooter className="flex gap-3 justify-end">
					<Button
						variant="outline"
						onClick={handleViewOnly}
						disabled={isProcessing}
					>
						<Eye className="mr-2 h-4 w-4" />
						قراءة فقط
					</Button>
					<Button
						onClick={handleRequestToAdd}
						disabled={isProcessing}
					>
						<Plus className="mr-2 h-4 w-4" />
						طلب الإضافة
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
