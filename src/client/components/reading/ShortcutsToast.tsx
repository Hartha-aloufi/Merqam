// components/reading/ShortcutsToast.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Keyboard } from 'lucide-react';
import { cn } from '@/client/lib/utils';

const ShortcutKey = ({ children }: { children: React.ReactNode }) => (
	<kbd className="px-2 py-1 text-xs font-semibold bg-background rounded border shadow-sm min-w-[24px] inline-flex items-center justify-center">
		{children}
	</kbd>
);

export const ShortcutsToast = () => {
	const [isVisible, setIsVisible] = useState(false);
	const [isDismissed, setIsDismissed] = useState(false);

	useEffect(() => {
		const hasSeenShortcuts = localStorage.getItem('hasSeenShortcuts');
		if (!hasSeenShortcuts) {
			setIsVisible(true);
			localStorage.setItem('hasSeenShortcuts', 'true');
		}
	}, []);

	if (!isVisible || isDismissed) return null;

	const shortcuts = [
		{ keys: ['↑', 'k'], description: 'الفقرة السابقة' },
		{ keys: ['↓', 'j'], description: 'الفقرة التالية' },
		{ keys: ['Alt', '+', 'p'], description: 'التظليل السابق' },
		{ keys: ['Alt', '+', 'n'], description: 'التظليل التالي' },
		{ keys: ['Ctrl/⌘', '+', 'z'], description: 'تراجع' },
		{ keys: ['Ctrl/⌘', '+', 'Shift', '+', 'z'], description: 'إعادة' },
		{ keys: ['Space'], description: 'صفحة للأسفل' },
		{ keys: ['Shift', '+', 'Space'], description: 'صفحة للأعلى' },
		{ keys: ['Home'], description: 'بداية الصفحة' },
		{ keys: ['End'], description: 'نهاية الصفحة' },
	];

	return (
		<div
			className={cn(
				'fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50',
				'bg-popover/95 backdrop-blur-sm text-popover-foreground rounded-lg shadow-lg',
				'animate-in fade-in-50 slide-in-from-bottom-5',
				'border border-border max-w-sm w-full mx-4'
			)}
		>
			<div className="p-4 border-b border-border">
				<div className="flex items-center gap-2">
					<Keyboard className="h-4 w-4" />
					<span className="font-medium">اختصارات لوحة المفاتيح</span>
				</div>
			</div>

			<div className="p-4 space-y-3">
				{shortcuts.map(({ keys, description }, index) => (
					<div
						key={index}
						className="flex items-center justify-between text-sm"
					>
						<div className="flex items-center gap-1 rtl:flex-row-reverse">
							{keys.map((key, keyIndex) => (
								<React.Fragment key={keyIndex}>
									<ShortcutKey>{key}</ShortcutKey>
									{keyIndex < keys.length - 1 &&
										key !== '+' && (
											<span className="text-muted-foreground mx-1">
												/
											</span>
										)}
								</React.Fragment>
							))}
						</div>
						<span className="text-muted-foreground">
							{description}
						</span>
					</div>
				))}
			</div>

			<div className="p-3 border-t border-border bg-muted/50">
				<button
					onClick={() => setIsDismissed(true)}
					className="text-xs text-primary hover:text-primary/80 w-full text-center transition-colors"
				>
					حسناً، فهمت
				</button>
			</div>
		</div>
	);
};
