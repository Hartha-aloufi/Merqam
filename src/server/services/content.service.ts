import { db } from '../config/db';
import { getLessonContent } from '../lib/utils/content-utils';

export class ContentService {
	/**
	 * Retrieves all playlists with their speaker information and lesson count
	 */
	async getPlaylists({limit}: {limit?: number} = {}) {
		let q = db
			.selectFrom('playlists')
			.innerJoin('speakers', 'speakers.id', 'playlists.speaker_id')
			.leftJoin(
				'lessons',
				'lessons.playlist_id',
				'playlists.youtube_playlist_id'
			)
			.select([
				'playlists.title',
				'playlists.description',
				'playlists.youtube_playlist_id',
				'speakers.name as speaker_name',
				db.fn.count('lessons.id').as('lessonCount'),
			])
			.groupBy([
				'playlists.title',
				'playlists.description',
				'playlists.youtube_playlist_id',
				'speakers.name',
			]);

		if (limit != undefined) {
			q = q.limit(3)
		}

		const res = await q.execute();

		return res.map((playlist) => ({
			...playlist,
			lessonCount: Number(playlist.lessonCount || 0),
		}));
	}

	/**
	 * Retrieves a specific playlist with its lessons
	 */
	async getPlaylist(playlistId: string) {
		// Get playlist details
		const playlist = await db
			.selectFrom('playlists')
			.innerJoin('speakers', 'speakers.id', 'playlists.speaker_id')
			.where('playlists.youtube_playlist_id', '=', playlistId)
			.select([
				'playlists.title',
				'playlists.description',
				'playlists.youtube_playlist_id',
				'speakers.name as speaker_name',
			])
			.executeTakeFirst();

		if (!playlist) return null;

		// Get playlist lessons
		const lessons = await db
			.selectFrom('lessons')
			.leftJoin(
				'youtube_videos',
				'youtube_videos.youtube_video_id',
				'lessons.youtube_video_id'
			)
			.where('lessons.playlist_id', '=', playlistId)
			.select([
				'lessons.id',
				'lessons.title',
				'lessons.content_key',
				'lessons.views_count',
				'youtube_videos.youtube_video_id',
			])
			.orderBy('lessons.created_at')
			.execute();

		return {
			...playlist,
			lessons: lessons.map((lesson) => ({
				...lesson,
				youtubeUrl: lesson.youtube_video_id
					? `https://www.youtube.com/watch?v=${lesson.youtube_video_id}`
					: null,
			})),
		};
	}

	/**
	 * Retrieves a specific lesson with its content
	 */
	async getLesson(lessonId: string) {
		// Get lesson details
		const lesson = await db
			.selectFrom('lessons')
			.leftJoin(
				'youtube_videos',
				'youtube_videos.youtube_video_id',
				'lessons.youtube_video_id'
			)
			.where('lessons.id', '=', lessonId)
			.select([
				'lessons.id',
				'lessons.title',
				'lessons.content_key',
				'lessons.views_count',
				'youtube_videos.youtube_video_id',
			])
			.executeTakeFirst();

		if (!lesson) return null;

		// Read content from file from storage
		const content = await getLessonContent(lesson.content_key);
			console.log('sssssssssssssssssss', content)
		return {
			...lesson,
			content,
			youtubeUrl: lesson.youtube_video_id
				? `https://www.youtube.com/watch?v=${lesson.youtube_video_id}`
				: null,
		};
	}

	/**
	 * Increments the view count for a lesson
	 */
	async incrementLessonViews(lessonId: string) {
		await db
			.updateTable('lessons')
			.set((eb) => ({
				views_count: eb('views_count', '+', 1),
			}))
			.where('id', '=', lessonId)
			.execute();
	}
}
