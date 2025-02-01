import { InlineNoteList } from "@/client/components/inline-notes/InlineNoteList";
import { ReadingProgressBar } from "@/client/components/reading/ReadingProgressBar";

interface PageProps {
  children: React.ReactNode;  
	params: Promise<{
		topicId: string;
		lessonId: string;
	}>;
}

export default async function LessonLayout({
	children,
  params,
}: PageProps) {
  const { topicId, lessonId } = await params; 

  return (
		<>
			<div id="lesson-top-header">
				<ReadingProgressBar />
			</div>

			<div className="grid w-full grid-cols-[minmax(0px,1fr)_minmax(0,52px)_minmax(auto,768px)_minmax(0px,1fr)] pt-14 pb-20">
				<section>
					<InlineNoteList topicId={topicId} lessonId={lessonId} />
				</section>
				<section className="col-start-3 col-end-4 ">{children}</section>
			</div>
		</>
  );
}
