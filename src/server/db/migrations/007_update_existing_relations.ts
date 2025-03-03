import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	console.log('Starting relations update migration...');

	// Update reading_progress table
	await db.schema
		.alterTable('reading_progress')
		.dropConstraint('reading_progress_unique_user_topic_lesson')
		.execute();

	// Drop the old columns and add new one for reading_progress
	await db.schema
		.alterTable('reading_progress')
		.dropColumn('topic_id')
		.dropColumn('lesson_id')
		.addColumn('lesson_id', 'uuid', (col) =>
			col.references('lessons.id').onDelete('cascade')
		)
		.execute();

	await db.schema
		.alterTable('reading_progress')
		.addUniqueConstraint('reading_progress_unique_user_lesson', [
			'user_id',
			'lesson_id',
		])
		.execute();

	// Update highlights table
	await db.schema
		.alterTable('highlights')
		.dropConstraint('highlights_user_topic_lesson_unique')
		.execute();

	// Drop the old columns and add new one for highlights
	await db.schema
		.alterTable('highlights')
		.dropColumn('topic_id')
		.dropColumn('lesson_id')
		.addColumn('lesson_id', 'uuid', (col) =>
			col.references('lessons.id').notNull().onDelete('cascade')
		)
		.execute();

	await db.schema
		.alterTable('highlights')
		.addUniqueConstraint('highlights_user_lesson_unique', [
			'user_id',
			'lesson_id',
		])
		.execute();


  // remove all data from notes table
  await db.deleteFrom('notes').execute();
  
	// Update notes table
	await db.schema
		.alterTable('notes')
		.dropColumn('topic_id')
		.dropColumn('lesson_id')
		.addColumn('lesson_id', 'uuid', (col) =>
			col.references('lessons.id').onDelete('cascade').notNull()
		)
		.execute();

	console.log('Relations update migration completed successfully');
}

export async function down(db: Kysely<any>): Promise<void> {
	console.log('Starting relations rollback...');

	// Rollback notes table
	await db.schema
		.alterTable('notes')
		.dropColumn('lesson_id')
		.addColumn('topic_id', 'varchar(255)', (col) => col.notNull())
		.addColumn('lesson_id', 'varchar(255)', (col) => col.notNull())
		.execute();

	// Rollback highlights table
	await db.schema
		.alterTable('highlights')
		.dropConstraint('highlights_user_lesson_unique')
		.execute();

	await db.schema
		.alterTable('highlights')
		.dropColumn('lesson_id')
		.addColumn('topic_id', 'varchar(255)', (col) => col.notNull())
		.addColumn('lesson_id', 'varchar(255)', (col) => col.notNull())
		.execute();

	await db.schema
		.alterTable('highlights')
		.addUniqueConstraint('highlights_user_topic_lesson_unique', [
			'user_id',
			'topic_id',
			'lesson_id',
		])
		.execute();

	// Rollback reading_progress table
	await db.schema
		.alterTable('reading_progress')
		.dropConstraint('reading_progress_unique_user_lesson')
		.execute();

	await db.schema
		.alterTable('reading_progress')
		.dropColumn('lesson_id')
		.addColumn('topic_id', 'varchar(255)', (col) => col.notNull())
		.addColumn('lesson_id', 'varchar(255)', (col) => col.notNull())
		.execute();

	await db.schema
		.alterTable('reading_progress')
		.addUniqueConstraint('reading_progress_unique_user_topic_lesson', [
			'user_id',
			'topic_id',
			'lesson_id',
		])
		.execute();

	console.log('Relations rollback completed successfully');
}
