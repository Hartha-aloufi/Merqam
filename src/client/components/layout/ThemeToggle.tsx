'use client';

import { Button } from '@/client/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/client/components/ui/dropdown-menu';
import { Moon, Sun, Paintbrush } from 'lucide-react';
import { useTheme } from 'next-themes';

const ThemeToggle = () => {
	const { setTheme } = useTheme();

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon">
					<Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					<span className="sr-only">تغيير المظهر</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => setTheme('light')}>
					<Sun className="ml-2 h-4 w-4" />
					فاتح
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('dark')}>
					<Moon className="ml-2 h-4 w-4" />
					داكن
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('sepia')}>
					<Paintbrush className="ml-2 h-4 w-4" />
					بني فاتح
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ThemeToggle;
