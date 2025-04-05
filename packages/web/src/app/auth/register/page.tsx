// src/app/auth/register/page.tsx
'use client';

import { Suspense } from 'react';
import { RegisterForm } from '@/client/components/auth/register-form';
import { Loader2 } from 'lucide-react';
import { useSession } from '@/client/hooks/use-auth-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function LoadingState() {
	return (
		<div className="flex items-center justify-center p-4">
			<Loader2 className="h-6 w-6 animate-spin" />
		</div>
	);
}

export default function RegisterPage() {
	const router = useRouter();
	const { data: sessionData, isLoading } = useSession();

	useEffect(() => {
		if (sessionData?.user && !isLoading) {
			router.push('/');
		}
	}, [sessionData, isLoading, router]);

	if (isLoading) {
		return <LoadingState />;
	}

	if (sessionData?.user) {
		return <LoadingState />;
	}

	return (
		<div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
			<div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
				<div className="absolute inset-0 bg-zinc-900" />
				<div className="relative z-20 flex items-center text-lg font-medium">
					<img
						src="/logo.webp"
						alt="مِرْقَم"
						className="ml-2 h-8 w-8"
					/>
					مِرْقَم
				</div>
				<div className="relative z-20 mt-auto">
					<blockquote className="space-y-2">
						<p className="text-lg">
							منصة لتسهيل العلم لمن يفضل القراءة على المشاهدة
						</p>
					</blockquote>
				</div>
			</div>
			<div className="lg:p-8">
				<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
					<div className="flex flex-col space-y-2 text-center">
						<h1 className="text-2xl font-semibold tracking-tight">
							إنشاء حساب جديد
						</h1>
						<p className="text-sm text-muted-foreground">
							قم بإنشاء حساب للوصول إلى محتوى المنصة
						</p>
					</div>
					<Suspense fallback={<LoadingState />}>
						<RegisterForm />
					</Suspense>
				</div>
			</div>
		</div>
	);
}
