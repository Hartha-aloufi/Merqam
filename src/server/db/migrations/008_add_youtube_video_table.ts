import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	console.log('Starting YouTube video table migration...');

	// Create youtube_videos table
	await db.schema
		.createTable('youtube_videos')
		.addColumn('youtube_video_id', 'varchar(255)', (col) =>
			col.primaryKey()
		)
		.addColumn('playlist_id', 'uuid', (col) =>
			col.references('playlists.id').onDelete('set null')
		)
		.addColumn('speaker_id', 'uuid', (col) =>
			col.references('speakers.id').onDelete('set null')
		)
		.addColumn('audio_backup_key', 'varchar(255)')
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`NOW()`)
		)
		.addColumn('updated_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`NOW()`)
		)
		.execute();

	// Add foreign key from lessons to youtube_videos
	await db.schema
		.alterTable('lessons')
		.dropColumn('youtube_video_id')
		.addColumn('youtube_video_id', 'varchar(255)', (col) =>
			col
				.references('youtube_videos.youtube_video_id')
				.onDelete('set null')
		)
		.execute();

  await db.schema
    .createIndex('idx_lesson_youtube_video')
    .on('lessons')
    .column('youtube_video_id')
    .execute();
  
	console.log('YouTube video table migration completed successfully');
}

export async function down(db: Kysely<any>): Promise<void> {
	console.log('Starting YouTube video table rollback...');

	// Remove foreign key from lessons
	await db.schema
		.alterTable('lessons')
		.dropColumn('youtube_video_id')
		.addColumn('youtube_video_id', 'varchar(255)')
		.execute();

	// Drop youtube_videos table
	await db.schema.dropTable('youtube_videos').execute();

	console.log('YouTube video table rollback completed successfully');
}
