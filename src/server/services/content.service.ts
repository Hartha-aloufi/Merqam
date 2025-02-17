import { db } from '../config/db';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/data');

export class ContentService {
	/**
	 * Retrieves all playlists with their speaker information
	 */
	async getPlaylists() {
		const playlists = await db
			.selectFrom('playlists')
			.innerJoin('speakers', 'speakers.id', 'playlists.speaker_id')
			.select([
				'playlists.id',
				'playlists.title',
				'playlists.description',
				'playlists.youtube_playlist_id',
				'speakers.name as speaker_name',
			])
			.execute();

		// Get lesson count for each playlist
		const playlistsWithCounts = await Promise.all(
			playlists.map(async (playlist) => {
				const count = await db
					.selectFrom('lessons')
					.where('playlist_id', '=', playlist.id)
					.select(db.fn.count('id').as('count'))
					.executeTakeFirst();

				return {
					...playlist,
					lessonCount: Number(count?.count || 0),
				};
			})
		);

		return playlistsWithCounts;
	}

	/**
	 * Retrieves a specific playlist with its lessons
	 */
	async getPlaylist(playlistId: string) {
		// Get playlist details
		const playlist = await db
			.selectFrom('playlists')
			.innerJoin('speakers', 'speakers.id', 'playlists.speaker_id')
			.where('playlists.id', '=', playlistId)
			.select([
				'playlists.id',
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

		// Read content from file system using content_key
		const [playlistId, fileName] = lesson.content_key.split('/');
		const content = await fs.readFile(
			path.join(DATA_DIR, playlistId, `${fileName}.mdx`),
			'utf-8'
		);

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
