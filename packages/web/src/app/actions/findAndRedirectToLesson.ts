'use server';

import {
	BahethService,
	type BahethMedium,
} from '@/server/services/baheth.service';
import { ContentService } from '@/server/services/content.service';
import { extractYoutubeId } from '../admin/jobs/lessons-queue/actions';

interface FindLessonResult {
	redirectUrl?: string;
	error?: string;
	notFound?: boolean;
	bahethAvailable?: boolean;
	videoId?: string;
	bahethMedium?: BahethMedium;
}

export async function findAndRedirectToLesson(
	formData: FormData
): Promise<FindLessonResult> {
	const youtubeUrl = formData.get('youtubeUrl') as string;

	// Extract video ID from the URL
	const videoId = await extractYoutubeId(youtubeUrl);
	if (!videoId) {
		return { error: 'رابط غير صحيح' };
	}

	try {
		// First, check if the lesson exists in Merqam
		const contentService = new ContentService();
		const lesson = await contentService.getLessonIdByYoutubeId(videoId);

		if (lesson) {
			// Lesson found in Merqam, return redirect URL
			return {
				redirectUrl: `/playlists/${lesson.playlist_id}/lessons/${lesson.id}`,
			};
		} else {
			// Lesson not found in Merqam, check Baheth
			const bahethService = new BahethService();
			const bahethMedium = await bahethService.getMediumByYoutubeId(
				videoId
			);

			if (bahethMedium) {
				// Lesson exists in Baheth
				return {
					notFound: true,
					bahethAvailable: true,
					videoId,
					bahethMedium,
				};
			} else {
				// Lesson not found in either system
				return {
					notFound: true,
					bahethAvailable: false,
					videoId,
				};
			}
		}
	} catch (error) {
		console.error('Error finding lesson:', error);
		return { error: 'حدث خطأ أثناء البحث عن الدرس' };
	}
}

