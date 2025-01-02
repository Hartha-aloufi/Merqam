// src/components/auth/signin-form.tsx
'use client';

import { useGoogleLogin } from '@/client/hooks/use-auth-query';
import { Button } from '@/client/components/ui/button';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/client/components/ui/card';
import { Alert, AlertDescription } from '@/client/components/ui/alert';

export function SignInForm() {
	const { mutate: signInWithGoogle, isPending, error } = useGoogleLogin();

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>تسجيل الدخول</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{error && (
					<Alert variant="destructive">
						<AlertDescription>
							حدث خطأ أثناء تسجيل الدخول
						</AlertDescription>
					</Alert>
				)}

				<Button
					variant="outline"
					type="button"
					disabled={isPending}
					className="w-full"
					onClick={() => signInWithGoogle()}
				>
					{isPending ? (
						<span className="flex items-center gap-2">
							<span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
							جاري التحميل...
						</span>
					) : (
						<span className="flex items-center gap-2">
							<svg className="h-4 w-4" viewBox="0 0 24 24">
								{/* Google icon paths */}
							</svg>
							الدخول باستخدام Google
						</span>
					)}
				</Button>
			</CardContent>
		</Card>
	);
}
