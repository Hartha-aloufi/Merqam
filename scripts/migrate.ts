// scripts/migrate.ts
import { Kysely, Migrator, PostgresDialect, MigrationResult } from 'kysely';
import { config } from 'dotenv';
import pg from 'pg';
import { TypeScriptFileMigrationProvider } from '@/server/db/migrator';
import { DB } from '@/types/db';

async function migrateToLatest() {
	// Load environment variables
	if (process.env.NODE_ENV !== 'production') {
		config({ path: './.env.local' });
	} else {
		config();
	}

	const db = new Kysely<DB>({
		dialect: new PostgresDialect({
			pool: new pg.Pool({
				host: process.env.POSTGRES_HOST,
				database: process.env.POSTGRES_DB,
				user: process.env.POSTGRES_USER,
				password: process.env.POSTGRES_PASSWORD,
				port: Number(process.env.POSTGRES_PORT),
			}),
		}),
	});

	const migrator = new Migrator({
		db,
		provider: new TypeScriptFileMigrationProvider(
			'./src/server/db/migrations'
		),
	});

	const { error, results } = await migrator.migrateToLatest();

	results?.forEach((result: MigrationResult) => {
		if (result.status === 'Success') {
			console.log(
				`Migration "${result.migrationName}" was executed successfully`
			);
		} else if (result.status === 'Error') {
			console.error(
				`Failed to execute migration "${result.migrationName}"`
			);
		}
	});

	if (error) {
		console.error('Failed to migrate');
		console.error(error);
		process.exit(1);
	}

	await db.destroy();
}

migrateToLatest().catch((error) => {
	console.error('Migration failed:', error);
	process.exit(1);
});
