'use client';
import { InlineNoteList } from '@/client/components/inline-notes/InlineNoteList';
import { ReadingProgressBar } from '@/client/components/reading/ReadingProgressBar';
import { calcTranslationValue } from '@/client/hooks/notes/use-inline-note-positions';
import { useNotesCount } from '@/client/hooks/use-notes';
import {
	CSSProperties,
	HTMLAttributes,
	useCallback,
	useRef,
	useState,
} from 'react';
import { useDebounceCallback, useResizeObserver } from 'usehooks-ts';

interface PageProps {
	children: React.ReactNode;
	topicId: string;
	lessonId: string;
}

const useLayoutTranslator = () => {
	const [translateX, setTranslateX] = useState<CSSProperties>();
	const ref = useRef<HTMLElement | null>(document.body);

	const onResize = useDebounceCallback(
		useCallback((size) => {
			const translateVal = calcTranslationValue(size.width);
			setTranslateX(
				translateVal > 0
					? {
							transform: `translate(${-translateVal}px, 0px)`,
					  }
					: undefined
			);
		}, []),
		200
	);

	useResizeObserver({
		ref,
		onResize,
	});

	return translateX ;
};

export default function CustomLessonLayout({
	children,
	lessonId,
	topicId,
}: PageProps) {
	const translateX  = useLayoutTranslator();
	const count = useNotesCount(lessonId);

	return (
		<>
			<div id="lesson-top-header">
				<ReadingProgressBar />
			</div>

			<div
				className="grid w-full grid-cols-[minmax(0px,1fr)_minmax(auto,768px)_minmax(0px,1fr)] pt-14 pb-20"
				style={count > 0 ? translateX : undefined}
			>
				<section className="pe-14">
					<InlineNoteList topicId={topicId} lessonId={lessonId} />
				</section>
				<section className="col-start-2 col-end-3 ">{children}</section>
			</div>
		</>
	);
}
