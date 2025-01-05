// src/components/auth/signin-form.tsx
'use client';

import { useGoogleLogin, useLogin } from '@/client/hooks/use-auth-query';
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
	const { mutate: signInWithGoogle, isPending: isGooglePending } =
		useGoogleLogin();

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>تسجيل الدخول</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4">
				{error && (
					<Alert variant="destructive">
						<AlertDescription>
							{error instanceof Error
								? error.message
								: 'حدث خطأ أثناء تسجيل الدخول'}
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
