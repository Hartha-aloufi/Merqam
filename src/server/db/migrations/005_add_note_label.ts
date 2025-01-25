import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	// Add label_color column to notes table
	await db.schema
		.alterTable('notes')
		.addColumn(
			'label_color',
			sql`varchar(10) CHECK (
            label_color IN ('yellow', 'green', 'blue', 'purple')
        )`
		)
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.alterTable('notes').dropColumn('label_color').execute();
}
