// src/server/config/db.ts
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { DB } from '@/types/db';
import { env } from './env';

const dialect = new PostgresDialect({
	pool: new Pool({
		database: env.POSTGRES_DB,
		host: env.POSTGRES_HOST,
		user: env.POSTGRES_USER,
		password: env.POSTGRES_PASSWORD,
		port: env.POSTGRES_PORT,
		max: 10,
	}),
});

export const db = new Kysely<DB>({
	dialect,
});

console.log('Database connected', process.env.POSTGRES_HOST);

// Type-safe query builder helper
export type Database = typeof db;
