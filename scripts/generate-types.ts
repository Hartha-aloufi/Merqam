// scripts/generate-types.ts
import { promises as fs } from 'fs';
import { Pool } from 'pg';
import { generate } from 'kysely-codegen';

async function generateDatabaseTypes() {
	const db = new Pool({
		database: process.env.POSTGRES_DB,
		host: process.env.POSTGRES_HOST,
		user: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
		port: Number(process.env.POSTGRES_PORT),
	});

	const types = await generate({
		camelCase: true, // Convert snake_case to camelCase
		dialect: {
			type: 'postgres',
			pool: db,
		},
	});

	await fs.writeFile('./src/lib/db/types.ts', types);

	await db.end();
	console.log('Database types generated successfully!');
}

generateDatabaseTypes().catch(console.error);
