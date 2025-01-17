import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	// Create tags table
	await db.schema
		.createTable('note_tags')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(sql`gen_random_uuid()`)
		)
		.addColumn('name', 'varchar(50)', (col) => col.notNull())
		.addColumn('user_id', 'uuid', (col) =>
			col.references('users.id').onDelete('cascade').notNull()
		)
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`NOW()`)
		)
		.execute();

	// Add unique constraint for tag names per user
	await db.schema
		.alterTable('note_tags')
		.addUniqueConstraint('note_tags_name_user_unique', ['name', 'user_id'])
		.execute();

	// Create notes table
	await db.schema
		.createTable('notes')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(sql`gen_random_uuid()`)
		)
		.addColumn('user_id', 'uuid', (col) =>
			col.references('users.id').onDelete('cascade').notNull()
		)
		.addColumn('topic_id', 'varchar(255)', (col) => col.notNull())
		.addColumn('lesson_id', 'varchar(255)', (col) => col.notNull())
		.addColumn('highlight_id', 'uuid', (col) =>
			col.references('highlights.id').onDelete('set null')
		)
		.addColumn('content', 'text', (col) =>
			col.notNull().check(sql`LENGTH(content) <= 1000`)
		)
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`NOW()`)
		)
		.addColumn('updated_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`NOW()`)
		)
		.execute();

	// Create notes_tags junction table
	await db.schema
		.createTable('notes_tags')
		.addColumn('note_id', 'uuid', (col) =>
			col.references('notes.id').onDelete('cascade').notNull()
		)
		.addColumn('tag_id', 'uuid', (col) =>
			col.references('note_tags.id').onDelete('cascade').notNull()
		)
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`NOW()`)
		)
		.execute();

	// Add unique constraint for note-tag combinations
	await db.schema
		.alterTable('notes_tags')
		.addUniqueConstraint('notes_tags_unique', ['note_id', 'tag_id'])
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	// Drop in reverse order
	await db.schema.dropTable('notes_tags').execute();
	await db.schema.dropTable('notes').execute();
	await db.schema.dropTable('note_tags').execute();
}
