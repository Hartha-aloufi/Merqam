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
import { CheckCircle, Home } from 'lucide-react';
import Link from 'next/link';

interface RequestSuccessProps {
	title: string;
}

export function RequestSuccess({ title }: RequestSuccessProps) {
	return (
		<div className="container mx-auto py-12 px-4">
			<Card className="max-w-2xl mx-auto">
				<CardHeader>
					<div className="flex justify-center mb-4">
						<CheckCircle className="h-12 w-12 text-green-500" />
					</div>
					<CardTitle className="text-xl text-center">
						تم طلب إضافة الدرس بنجاح
					</CardTitle>
					<CardDescription className="text-center">
						{title}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-center mb-4">
						سيتم معالجة طلبك قريبًا وإضافة الدرس إلى مِرْقَم. قد
						تستغرق هذه العملية بعض الوقت.
					</p>
				</CardContent>
				<CardFooter className="flex justify-center">
					<Link href="/">
						<Button>
							<Home className="mr-2 h-4 w-4" />
							العودة للصفحة الرئيسية
						</Button>
					</Link>
				</CardFooter>
			</Card>
		</div>
	);
}
