// src/lib/db/config.ts
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { DB } from './types'; // Will be generated later

// Database connection configuration
const dialect = new PostgresDialect({
	pool: new Pool({
		database: process.env.POSTGRES_DB,
		host: process.env.POSTGRES_HOST,
		user: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
		port: Number(process.env.POSTGRES_PORT),
		max: 10, // Maximum pool size
	}),
});

// Export the database instance
export const db = new Kysely<DB>({
	dialect,
});

// Type-safe query builder helper
export type Database = typeof db;
