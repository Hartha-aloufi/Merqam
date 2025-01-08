// src/client/components/auth/google-auth-button.tsx
import { Button } from '@/client/components/ui/button';
import { useGoogleLogin } from '@/client/hooks/use-auth-query';
import { Loader2 } from 'lucide-react';

export function GoogleAuthButton() {
	const { mutate: login, isPending: isLoading } = useGoogleLogin();

	return (
		<Button
			type="button"
			variant="outline"
			className="w-full"
			onClick={() => login()}
			disabled={isLoading}
		>
			{isLoading ? (
				<>
					<Loader2 className="ml-2 h-4 w-4 animate-spin" />
					جاري تسجيل الدخول...
				</>
			) : (
				<>المتابعة باستخدام Google</>
			)}
		</Button>
	);
}
