// src/server/db/migrations/002_add_highlights_constraint.ts
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	// Add unique constraint for highlights
	await db.schema
		.alterTable('highlights')
		.addUniqueConstraint('highlights_user_topic_lesson_unique', [
			'user_id',
			'topic_id',
			'lesson_id',
		])
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema
		.alterTable('highlights')
		.dropConstraint('highlights_user_topic_lesson_unique')
		.execute();
}
