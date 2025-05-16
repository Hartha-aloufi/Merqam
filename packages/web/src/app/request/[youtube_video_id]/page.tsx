import { findAndRedirectToLesson } from '@/app/actions/findAndRedirectToLesson';
import { redirect } from 'next/navigation';

export default async function RequestPage({
	params,
}: {
	params: { youtube_video_id: string };
}) {
	const formData = new FormData();
	formData.set(
		'youtubeUrl',
		`https://www.youtube.com/watch?v=${params.youtube_video_id}`
	);

	const result = await findAndRedirectToLesson(formData);

	if (result?.error) {
		// If there's an error, redirect back to home with error message
		redirect(`/?error=${encodeURIComponent(result.error)}`);
	} else if (result?.redirectUrl) {
		redirect(result.redirectUrl);
	} else {
		redirect('/?error=حدث خطأ أثناء البحث');
	}
}
