import { DB } from '@/types/db';
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<DB>): Promise<void> {
	console.log('Starting generation_jobs table migration...');

	// Create enum type for job status
	await db.schema
		.createType('job_status')
		.asEnum(['pending', 'processing', 'completed', 'failed', 'cancelled'])
		.execute();

	// Create generation_jobs table
	await db.schema
		.createTable('generation_jobs')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(sql`gen_random_uuid()`)
		)
		.addColumn('user_id', 'uuid', (col) =>
			col.references('users.id').onDelete('cascade').notNull()
		)
		.addColumn('url', 'varchar(255)', (col) => col.notNull())
		.addColumn('playlist_id', 'varchar(255)', (col) =>
			col.references('playlists.youtube_playlist_id').onDelete('set null')
		)
		.addColumn('new_playlist_id', 'varchar(255)')
		.addColumn('new_playlist_title', 'varchar(255)')
		.addColumn('speaker_id', 'uuid', (col) =>
			col.references('speakers.id').onDelete('set null')
		)
		.addColumn('new_speaker_name', 'varchar(255)')
		.addColumn('status', sql`job_status`, (col) =>
			col.notNull().defaultTo('pending')
		)
		.addColumn('progress', 'integer', (col) => col.notNull().defaultTo(0))
		.addColumn('error', 'text')
		.addColumn('result', 'jsonb')
		.addColumn('ai_service', 'varchar(50)', (col) =>
			col.notNull().defaultTo('gemini')
		)
		.addColumn('priority', 'integer', (col) => col.notNull().defaultTo(0))
		.addColumn('started_at', 'timestamptz')
		.addColumn('completed_at', 'timestamptz')
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`NOW()`)
		)
		.addColumn('updated_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`NOW()`)
		)
		.execute();

	// Add indexes for efficient querying
	await db.schema
		.createIndex('idx_generation_jobs_user_id')
		.on('generation_jobs')
		.column('user_id')
		.execute();

	await db.schema
		.createIndex('idx_generation_jobs_status')
		.on('generation_jobs')
		.column('status')
		.execute();

	await db.schema
		.createIndex('idx_generation_jobs_created_at')
		.on('generation_jobs')
		.column('created_at')
		.execute();

	console.log('Generation jobs table migration completed successfully');
}

export async function down(db: Kysely<DB>): Promise<void> {
	console.log('Rolling back generation_jobs table...');

	// Drop table
	await db.schema.dropTable('generation_jobs').execute();

	// Drop enum type
	await db.schema.dropType('job_status').execute();

	console.log('Generation jobs table rollback completed');
}
