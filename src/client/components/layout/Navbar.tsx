// src/components/layout/Navbar.tsx
'use client';

import { Button } from '@/client/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { SettingsSheet } from '../settings/SettingsSheet';
import ThemeToggle from './ThemeToggle';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/client/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/client/components/ui/avatar';
import { useSession, useLogout } from '@/client/hooks/use-auth-query';
import { toast } from 'sonner';

export default function Navbar() {
	const { data: session, isLoading } = useSession();
	const { mutate: logout, isPending: isLoggingOut } = useLogout();

	const handleSignOut = () => {
		logout(undefined, {
			onError: () => toast.error('فشل تسجيل الخروج. حاول مرة أخرى'),
		});
	};

	const user = session?.user;

	return (
		<nav>
			<div className="container mx-auto px-4 h-16 flex items-center justify-between">
				<Link href="/" className="flex items-center gap-2">
					<div className="relative h-8 w-8">
						<Image
							src="/logo.webp"
							alt="مِرْقَم"
							fill
							sizes="32px"
							className="object-contain"
							priority
						/>
					</div>
					<span className="text-xl font-bold hidden sm:inline-block">
						مِرْقَم
					</span>
				</Link>

				<div className="flex items-center gap-4">
					<Link href="/playlists">
						<Button variant="ghost">المواضيع</Button>
					</Link>

					{!isLoading && (
						<>
							{user ? (
								<DropdownMenu modal={false}>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											className="relative h-8 w-8 rounded-full"
										>
											<Avatar className="h-8 w-8">
												<AvatarFallback>
													{user.email?.[0].toUpperCase() ||
														'مـ'}
												</AvatarFallback>
											</Avatar>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="end"
										className="w-56"
									>
										<div className="flex items-center justify-start gap-2 p-2">
											<div className="flex flex-col space-y-1">
												<p className="text-sm font-medium">
													{user.email}
												</p>
											</div>
										</div>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											className="text-red-600 focus:text-red-600"
											onClick={handleSignOut}
											disabled={isLoggingOut}
										>
											{isLoggingOut ? (
												<span className="flex items-center gap-2">
													<span className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-r-transparent" />
													جاري تسجيل الخروج...
												</span>
											) : (
												<>
													<LogOut className="ml-2 h-4 w-4" />
													<span>تسجيل الخروج</span>
												</>
											)}
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							) : (
								<Link
									href={`/auth/signin?returnUrl=${encodeURIComponent(
										window.location.pathname
									)}`}
								>
									<Button>تسجيل الدخول</Button>
								</Link>
							)}
						</>
					)}

					<SettingsSheet />
					<ThemeToggle />
				</div>
			</div>
		</nav>
	);
}
