// src/server/db/migrations/001_initial_schema.ts
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create users table
  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', (col) => 
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('email', 'varchar(255)', (col) => 
      col.notNull().unique()
    )
    .addColumn('password_hash', 'varchar(255)', (col) => 
      col.notNull()
    )
    .addColumn('name', 'varchar(255)')
    .addColumn('created_at', 'timestamptz', (col) => 
      col.notNull().defaultTo(sql`NOW()`)
    )
    .addColumn('updated_at', 'timestamptz', (col) => 
      col.notNull().defaultTo(sql`NOW()`)
    )
    .execute();

  // Create highlights table
  await db.schema
    .createTable('highlights')
    .addColumn('id', 'uuid', (col) => 
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('user_id', 'uuid', (col) => 
      col.references('users.id').onDelete('cascade').notNull()
    )
    .addColumn('topic_id', 'varchar(255)', (col) => col.notNull())
    .addColumn('lesson_id', 'varchar(255)', (col) => col.notNull())
    .addColumn('highlights', 'jsonb', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => 
      col.notNull().defaultTo(sql`NOW()`)
    )
    .addColumn('updated_at', 'timestamptz', (col) => 
      col.notNull().defaultTo(sql`NOW()`)
    )
    .execute();

  // Create reading_progress table
  await db.schema
    .createTable('reading_progress')
    .addColumn('id', 'uuid', (col) => 
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('user_id', 'uuid', (col) => 
      col.references('users.id').onDelete('cascade').notNull()
    )
    .addColumn('topic_id', 'varchar(255)', (col) => col.notNull())
    .addColumn('lesson_id', 'varchar(255)', (col) => col.notNull())
    .addColumn('last_read_paragraph', 'integer')
    .addColumn('latest_read_paragraph', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => 
      col.notNull().defaultTo(sql`NOW()`)
    )
    .addColumn('updated_at', 'timestamptz', (col) => 
      col.notNull().defaultTo(sql`NOW()`)
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('reading_progress').execute();
  await db.schema.dropTable('highlights').execute();
  await db.schema.dropTable('users').execute();
}