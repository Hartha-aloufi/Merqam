'use client';
import { InlineNoteList } from '@/client/components/inline-notes/InlineNoteList';
import { ReadingProgressBar } from '@/client/components/reading/ReadingProgressBar';
import { calcTranslationValue } from '@/client/hooks/notes/use-inline-note-positions';
import { useNotesCount } from '@/client/hooks/use-notes';
import { useIsDesktop } from '@/client/hooks/use-screen-sizes';
import { CSSProperties, useCallback, useRef, useState } from 'react';
import { useDebounceCallback, useResizeObserver } from 'usehooks-ts';

interface PageProps {
	children: React.ReactNode;
	lessonId: string;
}

const useLayoutTranslator = (enabled: boolean) => {
	const [translateX, setTranslateX] = useState<CSSProperties>();
	const ref = useRef<HTMLElement | null>();
	if(typeof window !== 'undefined') {
		ref.current = document.body
	}

	const onResize = useDebounceCallback(
		useCallback(
			(size) => {
				if (!enabled) return;

				const translateVal = calcTranslationValue(size.width);
				setTranslateX(
					translateVal > 0
						? {
								transform: `translate(${-translateVal}px, 0px)`,
						  }
						: undefined
				);
			},
			[enabled]
		),
		200
	);

	useResizeObserver({
		ref,
		onResize,
	});

	if (!enabled) return;

	return translateX;
};

export default function CustomLessonLayout({
	children,
	lessonId,
}: PageProps) {
	const isDesktopScreen = useIsDesktop();

	const translateX = useLayoutTranslator(isDesktopScreen);

	const count = useNotesCount(lessonId);

	return (
		<div className="print:hidden">
			<div id="lesson-top-header">
				<ReadingProgressBar />
			</div>

			<div
				className="grid w-full grid-cols-[minmax(0px,1fr)_minmax(auto,768px)_minmax(0px,1fr)] pt-14 pb-20"
				style={count > 0 ? translateX : undefined}
			>
				{isDesktopScreen && (
					<section className="pe-14">
						<InlineNoteList lessonId={lessonId} />
					</section>
				)}
				<section className="col-start-2 col-end-3 ">{children}</section>
			</div>
		</div>
	);
}
