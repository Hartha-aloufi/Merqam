// src/components/auth/signin-form.tsx
'use client';

import { useLogin } from '@/client/hooks/use-auth-query';
import { Button } from '@/client/components/ui/button';
import {
	Card,
	CardContent,
	CardFooter,
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
import * as z from 'zod';
import { Loader2, Mail } from 'lucide-react';
import Link from 'next/link';
import { GoogleAuthButton } from './google-auth-button';

const formSchema = z.object({
	email: z
		.string()
		.min(1, 'البريد الإلكتروني مطلوب')
		.email('البريد الإلكتروني غير صالح'),
	password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

type FormData = z.infer<typeof formSchema>;

export function SignInForm() {
	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
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
					>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>البريد الإلكتروني</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="example@domain.com"
											autoComplete="email"
											disabled={isPending}
											{...field}
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
											type="password"
											autoComplete="current-password"
											disabled={isPending}
											{...field}
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

				<div className="relative my-6">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-background px-2 text-muted-foreground">
							أو
						</span>
					</div>
				</div>
				<GoogleAuthButton />
			</CardContent>

			<CardFooter className="flex flex-col gap-2">
				<Button
					variant="link"
					className="text-xs text-muted-foreground"
					asChild
				>
					<Link href="/auth/register">ليس لديك حساب؟ سجل الآن</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
