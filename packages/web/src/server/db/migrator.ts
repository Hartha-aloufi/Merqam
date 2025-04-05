import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Migration, MigrationProvider } from 'kysely';
import ts from 'ts-node';

ts.register({
	transpileOnly: true,
});

export class TypeScriptFileMigrationProvider implements MigrationProvider {
	private normalizedPath: string;

	constructor(relativePath: string) {
		const projectRoot = process.cwd();
		this.normalizedPath = path.resolve(projectRoot, relativePath);
		console.info('Initializing migrations from:', relativePath);
	}

	async getMigrations(): Promise<Record<string, Migration>> {
		const migrations: Record<string, Migration> = {};

		try {
			const files = await fs.readdir(this.normalizedPath);
			console.info(
				`Found ${
					files.filter((f) => f.endsWith('.ts')).length
				} migration files`
			);

			for (const fileName of files) {
				if (!fileName.endsWith('.ts')) {
					continue;
				}

				const fullPath = path.join(this.normalizedPath, fileName);
				const fileUrl = new URL(
					`file://${fullPath.replaceAll('\\', '/')}`
				);

				const { up, down } = await import(fileUrl.href);
				const migrationKey = fileName.substring(
					0,
					fileName.lastIndexOf('.')
				);

				migrations[migrationKey] = { up, down };
				console.info(`Loaded migration: ${migrationKey}`);
			}

			return migrations;
		} catch (error) {
			console.error(
				`Failed to read migrations from: ${this.normalizedPath}`
			);
			throw error;
		}
	}
}
