import { Kysely, sql } from 'kysely';
import fs from 'fs/promises';
import path from 'path';

const ROOT_PATH = path.join(process.cwd(), 'src');
const DATA_DIR = 'data'
const DATA_PATH = path.join(ROOT_PATH, DATA_DIR);

interface MetaJson {
	title: string;
	description: string;
	speaker?: string;
	lessons: {
		[key: string]: {
			title: string;
			youtubeUrl: string;
		};
	};
}

async function readMetaFile(dirPath: string): Promise<MetaJson> {
	const metaPath = path.join(dirPath, 'meta.json');
	const content = await fs.readFile(metaPath, 'utf-8');
	return JSON.parse(content);
}

async function extractYoutubeId(url: string): Promise<string> {
	const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
	const match = url.match(regex);
	return match?.[1] ?? '';
}

async function getOrCreateSpeaker(db: Kysely<any>, name: string) {
	// Try to find existing speaker
	const existingSpeaker = await db
		.selectFrom('speakers')
		.where('name', '=', name)
		.select(['id'])
		.executeTakeFirst();

	if (existingSpeaker) {
		console.log(`Found existing speaker: ${name}`);
		return existingSpeaker;
	}

	// Create new speaker if not found
	console.log(`Creating new speaker: ${name}`);
	const [speaker] = await db
		.insertInto('speakers')
		.values({
			name: name,
			en_name: name.replace(/[\u0600-\u06FF]/g, '').trim() || name, // Remove Arabic chars for en_name
		})
		.returning('id')
		.execute();

	return speaker;
}

async function extractSpeakerFromTitle(title: string): Promise<string> {
	const parts = title.split('|');
	return parts[parts.length - 1]?.trim() || 'Unknown Speaker';
}

export async function up(db: Kysely<any>): Promise<void> {
	console.log('Starting data seed...');

	try {
		// Create default admin user
		const [adminUser] = await db
			.insertInto('users')
			.values({
				email: 'admin@example.com',
				password_hash:
					'$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu9My', // "password"
				name: 'Admin',
			})
			.returning('id')
			.execute();

		// Read all directories in the data folder
		const dirs = await fs.readdir(DATA_PATH);

		// Track created speakers to avoid duplicates
		const speakerCache = new Map<string, { id: string }>();

		// Process each directory (playlist)
		for (const dir of dirs) {
			const dirPath = path.join(DATA_PATH, dir);
			const stats = await fs.stat(dirPath);

			if (!stats.isDirectory()) continue;

			try {
				const meta = await readMetaFile(dirPath);
				console.log(`Processing playlist: ${meta.title}`);

				// Determine speaker - either from meta.json or from first lesson title
				let speakerName = 'Unknown Speaker';
				if (meta.speaker) {
					speakerName = meta.speaker;
				} else {
					const firstLessonId = Object.keys(meta.lessons)[0];
					if (firstLessonId) {
						speakerName = await extractSpeakerFromTitle(
							meta.lessons[firstLessonId].title
						);
					}
				}

				// Get or create speaker
				let speaker = speakerCache.get(speakerName);
				if (!speaker) {
					speaker = await getOrCreateSpeaker(db, speakerName);
					speakerCache.set(speakerName, speaker);
				}

				// Create playlist
				const [playlist] = await db
					.insertInto('playlists')
					.values({
						title: meta.title,
						description: meta.description || null,
						speaker_id: speaker.id,
						youtube_playlist_id: dir,
					})
					.returning('youtube_playlist_id')
					.execute();

				// Process each lesson
				for (const [lessonId, lessonMeta] of Object.entries(
					meta.lessons
				)) {
					console.log(`Processing lesson: ${lessonMeta.title}`);

					// Create youtube_video entry if URL exists
					let youtubeVideoId: string | null = null;
					if (lessonMeta.youtubeUrl) {
						youtubeVideoId = await extractYoutubeId(
							lessonMeta.youtubeUrl
						);
						if (youtubeVideoId) {
							await db
								.insertInto('youtube_videos')
								.values({
									youtube_video_id: youtubeVideoId,
									playlist_id: playlist.youtube_playlist_id,
									speaker_id: speaker.id,
								})
								.onConflict((oc) =>
									oc.column('youtube_video_id').doNothing()
								)
								.execute();
						}
					}

					// Create lesson
					await db
						.insertInto('lessons')
						.values({
							title: lessonMeta.title,
							content_key: path.join(DATA_DIR, dir, `${lessonId}.mdx`),
							speaker_id: speaker.id,
							playlist_id: playlist.youtube_playlist_id,
							youtube_video_id: youtubeVideoId,
							user_id: adminUser.id,
							tags: sql`'[]'::jsonb`,
							views_count: 0,
						})
						.execute();
				}
			} catch (error) {
				console.error(`Error processing directory ${dir}:`, error);
				continue;
			}
		}

		console.log('Data seed completed successfully');
	} catch (error) {
		console.error('Error during data seed:', error);
		throw error;
	}
}

export async function down(db: Kysely<any>): Promise<void> {
	console.log('Rolling back data seed...');

	// Clear all data in reverse order of dependencies
	await db.deleteFrom('lessons').execute();
	await db.deleteFrom('youtube_videos').execute();
	await db.deleteFrom('playlists').execute();
	await db.deleteFrom('speakers').execute();
	await db.deleteFrom('users').execute();

	console.log('Data seed rollback completed');
}
