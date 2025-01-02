// src/components/auth/signin-form.tsx
'use client';

import { useLogin, useGoogleLogin } from '@/client/hooks/use-auth-query';
import { Button } from '@/client/components/ui/button';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/client/components/ui/card';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/client/components/ui/form';
import { Input } from '@/client/components/ui/input';
import { Alert, AlertDescription } from '@/client/components/ui/alert';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, Mail } from 'lucide-react';
import { loginSchema } from '@/server/lib/validation/auth';
import type { z } from 'zod';

type FormData = z.infer<typeof loginSchema>;

export function SignInForm() {
	const form = useForm<FormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const { mutate: login, isPending, error } = useLogin();

	const getErrorMessage = (error: unknown) => {
		if (!error) return null;
		if (error instanceof Error) {
			// Map backend error messages to user-friendly Arabic messages
			switch (error.message) {
				case 'Invalid credentials':
					return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
				case 'Too many requests':
					return 'عدد محاولات تسجيل الدخول تجاوز الحد المسموح. الرجاء المحاولة لاحقاً';
				default:
					return 'عذراً، حدث خطأ. الرجاء المحاولة مرة أخرى';
			}
		}
		return 'عذراً، حدث خطأ. الرجاء المحاولة مرة أخرى';
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>تسجيل الدخول</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4">
				{error && (
					<Alert variant="destructive">
						<AlertDescription>
							{getErrorMessage(error)}
						</AlertDescription>
					</Alert>
				)}

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit((data) => login(data))}
						className="space-y-4"
						noValidate // Let Zod handle validation
					>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>البريد الإلكتروني</FormLabel>
									<FormControl>
										<Input
											{...field}
											type="email"
											autoComplete="email"
											placeholder="example@domain.com"
											disabled={isPending}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>كلمة المرور</FormLabel>
									<FormControl>
										<Input
											{...field}
											type="password"
											autoComplete="current-password"
											disabled={isPending}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button
							type="submit"
							className="w-full"
							disabled={isPending}
						>
							{isPending ? (
								<>
									<Loader2 className="ml-2 h-4 w-4 animate-spin" />
									جاري تسجيل الدخول...
								</>
							) : (
								<>
									<Mail className="ml-2 h-4 w-4" />
									تسجيل الدخول
								</>
							)}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
