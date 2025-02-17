import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	// Create speakers table
	await db.schema
		.createTable('speakers')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(sql`gen_random_uuid()`)
		)
		.addColumn('name', 'varchar(255)', (col) => col.notNull())
		.addColumn('en_name', 'varchar(255)', (col) => col.notNull())
		.addColumn('bio', 'text')
		.addColumn('image_key', 'varchar(255)')
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`NOW()`)
		)
		.addColumn('updated_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`NOW()`)
		)
		.execute();

	// Add indexes for speaker search
	await db.schema
		.createIndex('idx_speaker_name')
		.on('speakers')
		.columns(['name', 'en_name'])
		.execute();

	// Create playlists table
	await db.schema
		.createTable('playlists')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(sql`gen_random_uuid()`)
		)
		.addColumn('youtube_playlist_id', 'varchar(255)', (col) =>
			col.notNull().unique()
		)
		.addColumn('speaker_id', 'uuid', (col) =>
			col.references('speakers.id').onDelete('cascade').notNull()
		)
		.addColumn('title', 'varchar(255)', (col) => col.notNull())
		.addColumn('description', 'text')
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`NOW()`)
		)
		.addColumn('updated_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`NOW()`)
		)
		.execute();

	// Create lessons table
	await db.schema
		.createTable('lessons')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(sql`gen_random_uuid()`)
		)
		.addColumn('user_id', 'uuid', (col) =>
			col.references('users.id').onDelete('cascade').notNull()
		)
		.addColumn('speaker_id', 'uuid', (col) =>
			col.references('speakers.id').onDelete('cascade').notNull()
		)
		.addColumn('playlist_id', 'uuid', (col) =>
			col.references('playlists.id').onDelete('set null')
		)
		.addColumn('title', 'varchar(255)', (col) => col.notNull())
		.addColumn('description', 'text')
		.addColumn('content_key', 'varchar(255)', (col) => col.notNull())
		.addColumn('tags', 'jsonb')
		.addColumn('views_count', 'integer', (col) =>
			col.notNull().defaultTo(0)
		)
		.addColumn('youtube_video_id', 'varchar(255)')
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`NOW()`)
		)
		.addColumn('updated_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`NOW()`)
		)
		.execute();

	// Add indexes for lessons
	await db.schema
		.createIndex('idx_lesson_content')
		.on('lessons')
		.column('content_key')
		.execute();

	await db.schema
		.createIndex('idx_lesson_playlist')
		.on('lessons')
		.columns(['playlist_id'])
		.execute();

	await db.schema
		.createIndex('idx_lesson_speaker')
		.on('lessons')
		.columns(['speaker_id'])
		.execute();

	// Log migration completion
	console.log('Content management tables migration completed successfully');
}

export async function down(db: Kysely<any>): Promise<void> {
	// Drop tables in reverse order
	await db.schema.dropTable('lessons').execute();
	await db.schema.dropTable('playlists').execute();
	await db.schema.dropTable('speakers').execute();

	console.log('Content management tables rollback completed successfully');
}
