import { findAndRedirectToLesson } from '@/app/actions/findAndRedirectToLesson';
import { redirect } from 'next/navigation';
import { LessonNotFound } from '@/client/components/lessonNotFound';

export default async function RequestPage({
	params,
}: {
	params: Promise<{ youtube_video_id: string }>;
}) {
	const { youtube_video_id } = await params;
	const formData = new FormData();
	formData.set(
		'youtubeUrl',
		`https://www.youtube.com/watch?v=${youtube_video_id}`
	);

	const result = await findAndRedirectToLesson(formData);

	if (result?.error) {
		// If there's an error, redirect back to home with error message
		redirect(`/?error=${encodeURIComponent(result.error)}`);
	} else if (result?.redirectUrl) {
		// Lesson found in Merqam, redirect to it
		redirect(result.redirectUrl);
	} else if (
		result?.notFound &&
		result?.bahethAvailable &&
		result.bahethMedium
	) {
		// Lesson exists in Baheth but not in Merqam
		return (
			<LessonNotFound
				youtubeId={youtube_video_id}
				bahethMedium={result.bahethMedium}
			/>
		);
	} else {
		// Lesson not found in either system
		redirect(`/?error=${encodeURIComponent('الدرس غير موجود')}`);
	}
}
