import React from 'react';
import { cn, tajawal } from '@/client/lib/utils';
import Image from 'next/image';
import PrintQRCode from './print-qr-code';

// PrintOnly component to wrap content that should only appear in print
const PrintOnly = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => <div className={cn('hidden print:block', className)}>{children}</div>;

interface PrintableLessonProps {
	title: string;
	content: React.ReactNode;
	topicId: string;
	lessonId: string;
}

const PrintableLesson = ({
	title,
	content,
	topicId,
	lessonId,
}: PrintableLessonProps) => {
	return (
		<div
			className={cn(
				// Print-specific styles
				'print:max-w-none print:mx-0 print:px-0 print:text-black print:bg-white',
				// Hide by default in screen view
				'hidden print:block',
				tajawal.className
			)}
		>
			{/* Cover Page */}
			<div className="first-page flex flex-col items-center justify-center min-h-screen">
				{/* Logo and Main Title */}
				<div className="flex flex-col items-center mb-12">
					<Image
						src="/logo.webp"
						alt="مِرْقَم"
						width={120}
						height={120}
						className="print:grayscale mb-8"
					/>
					<h1 className="text-4xl font-bold text-center mb-4">
						مِرْقَم
					</h1>
					<h2 className="text-2xl font-bold text-center text-muted-foreground">
						{title}
					</h2>
				</div>

				{/* QR Code */}
				<div className="mt-8">
					<PrintQRCode topicId={topicId} lessonId={lessonId} />
				</div>
			</div>

			{/* Main Content */}
			<div
				className={cn(
					'prose max-w-none',
					// Print-specific prose styles
					'print:prose-h1:text-3xl print:prose-h2:text-2xl print:prose-h3:text-xl',
					'print:prose-img:mx-auto print:prose-img:max-w-md',
					'print:prose-pre:bg-gray-100 print:prose-pre:text-black',
					'print:break-inside-avoid-page'
				)}
			>
				{content}
			</div>

			{/* Footer */}
			<PrintOnly className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
				<p>
					تم تحميل هذا المحتوى من منصة مِرْقَم - edu-temp.vercel.app
				</p>
			</PrintOnly>
		</div>
	);
};

export default PrintableLesson;
