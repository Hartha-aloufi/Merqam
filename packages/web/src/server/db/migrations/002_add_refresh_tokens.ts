// src/server/db/migrations/002_add_refresh_tokens.ts
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('refresh_tokens')
		.addColumn('id', 'uuid', (col) =>
			col.primaryKey().defaultTo(sql`gen_random_uuid()`)
		)
		.addColumn('user_id', 'uuid', (col) =>
			col.references('users.id').onDelete('cascade').notNull()
		)
		.addColumn('token', 'varchar(255)', (col) => col.notNull().unique())
		.addColumn('expires_at', 'timestamptz', (col) => col.notNull())
		.addColumn('created_at', 'timestamptz', (col) =>
			col.notNull().defaultTo(sql`NOW()`)
		)
		.execute();

	// Add index for faster lookups and cleanup
	await db.schema
		.createIndex('refresh_tokens_user_id_index')
		.on('refresh_tokens')
		.column('user_id')
		.execute();

	await db.schema
		.createIndex('refresh_tokens_expires_at_index')
		.on('refresh_tokens')
		.column('expires_at')
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('refresh_tokens').execute();
}
