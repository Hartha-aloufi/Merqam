// src/components/auth/register-form.tsx
'use client';

import { useRegister } from '@/client/hooks/use-auth-query';
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
import { Loader2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/client/lib/utils';

const passwordSchema = z
	.string()
	.min(1, 'كلمة المرور مطلوبة')
	.min(8, 'كلمة المرور يجب أن تكون ٨ أحرف على الأقل')
	.regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير واحد على الأقل')
	.regex(/[a-z]/, 'يجب أن تحتوي على حرف صغير واحد على الأقل')
	.regex(/[0-9]/, 'يجب أن تحتوي على رقم واحد على الأقل')
	.regex(/[^A-Za-z0-9]/, 'يجب أن تحتوي على رمز خاص واحد على الأقل');

const formSchema = z.object({
	email: z
		.string()
		.min(1, 'البريد الإلكتروني مطلوب')
		.email('البريد الإلكتروني غير صالح'),
	password: passwordSchema,
	name: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function RegisterForm() {
	const { mutate: register, isPending, error } = useRegister();
	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			password: '',
			name: '',
		},
	});

	// Watch password field to show requirements
	const password = form.watch('password');
	const passwordRequirements = [
		{ regex: /.{8,}/, text: '٨ أحرف على الأقل' },
		{ regex: /[A-Z]/, text: 'حرف كبير' },
		{ regex: /[a-z]/, text: 'حرف صغير' },
		{ regex: /[0-9]/, text: 'رقم' },
		{ regex: /[^A-Za-z0-9]/, text: 'رمز خاص' },
	];

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>إنشاء حساب جديد</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4">
				{error && (
					<Alert variant="destructive">
						<AlertDescription>
							{error instanceof Error
								? error.message
								: 'حدث خطأ أثناء إنشاء الحساب'}
						</AlertDescription>
					</Alert>
				)}

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit((data) => register(data))}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>الاسم (اختياري)</FormLabel>
									<FormControl>
										<Input
											placeholder="محمد عبدالله"
											autoComplete="name"
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
											autoComplete="new-password"
											disabled={isPending}
											{...field}
										/>
									</FormControl>
									<FormMessage />
									<div className="space-y-2 text-[0.8rem] text-muted-foreground">
										<div className="text-sm">
											متطلبات كلمة المرور:
										</div>
										<ul className="text-xs space-y-1 list-inside list-disc">
											{passwordRequirements.map(
												(req, index) => (
													<li
														key={index}
														className={cn(
															'transition-colors',
															password &&
																req.regex.test(
																	password
																)
																? 'text-green-500 dark:text-green-400'
																: 'text-muted-foreground'
														)}
													>
														{req.text}
													</li>
												)
											)}
										</ul>
									</div>
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
									جاري إنشاء الحساب...
								</>
							) : (
								<>
									<UserPlus className="ml-2 h-4 w-4" />
									إنشاء حساب
								</>
							)}
						</Button>
					</form>
				</Form>
			</CardContent>

			<CardFooter className="flex justify-center">
				<Button
					variant="link"
					className="text-xs text-muted-foreground"
					asChild
				>
					<Link href="/auth/signin">لديك حساب بالفعل؟ سجل دخولك</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
