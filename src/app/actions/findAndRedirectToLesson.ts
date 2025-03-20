'use server';

import { extractYoutubeId } from '@/app/admin/jobs/utils';
import { ContentService } from '@/server/services/content.service';

export async function findAndRedirectToLesson(formData: FormData) {
	const url = formData.get('youtubeUrl') as string;
	const contentService = new ContentService();

	try {
		console.info('Searching for lesson by YouTube URL', { url });

		const videoId = await extractYoutubeId(url);
		if (!videoId) {
			console.warn('Invalid YouTube URL format', { url });
			return { success: false, error: 'رابط يوتيوب غير صالح' };
		}

		const result = await contentService.getLessonIdByYoutubeId(videoId);
		if (result) {
			console.info('Lesson found for YouTube ID', {
				videoId,
				lessonId: result.id,
				playlistId: result.playlist_id,
			});

			// Return the lesson URL to the client
			return {
				success: true,
				redirectUrl: `/playlists/${result.playlist_id}/lessons/${result.id}`,
			};
		} else {
			return {
				success: false,
				error: 'لم يتم العثور على درس مرتبط بهذا الفيديو',
			};
		}
	} catch (error) {
		console.log('Error in findAndRedirectToLesson', { error, url });
		return { success: false, error: 'حدث خطأ أثناء البحث' };
	}
}
