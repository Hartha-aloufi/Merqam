// src/worker.ts
/**
 * Enhanced standalone worker script for processing lesson generation jobs
 * with comprehensive file logging
 *
 * This script can be run separately from the Next.js application
 * using `npx tsx --watch src/worker.ts`
 */
import './load-env';
import { initializeEnhancedWorker } from '../server/queue/lesson-generation-worker';
import { workerLogger } from '../server/lib/logging/file-logger';
import path from 'path';
import fs from 'fs';
import { formatErrorForLogging } from '../server/lib/logging/error-utils';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir, { recursive: true });
	console.log(`Created logs directory at ${logsDir}`);
}

// log env variables
console.log(process.env.REDIS_HOST, process.env.REDIS_PORT);
// Handle graceful shutdown
let shuttingDown = false;
let worker: any = null;

// Log startup information
workerLogger.info('Worker process starting', {
	processId: process.pid,
	nodeVersion: process.version,
	platform: process.platform,
	arch: process.arch,
	workingDirectory: process.cwd(),
});

/**
 * Graceful shutdown handler
 */
async function shutdown(signal?: string) {
	if (shuttingDown) return;
	shuttingDown = true;

	workerLogger.info(
		`Shutting down worker gracefully (${signal || 'manual'})...`
	);

	if (worker) {
		try {
			await worker.close();
			workerLogger.info('Worker closed successfully');
		} catch (error) {
			workerLogger.error('Error closing worker:', error);
		}
	}

	workerLogger.info('Worker shutdown complete');

	// Allow logs to be written before exiting
	setTimeout(() => {
		process.exit(0);
	}, 500);
}

// Handle termination signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGHUP', () => shutdown('SIGHUP'));

// Handle uncaught exceptions with enhanced stack trace logging
process.on('uncaughtException', (error) => {
	workerLogger.error('Uncaught exception:', {
		error: formatErrorForLogging(error),
		processInfo: {
			pid: process.pid,
			memoryUsage: process.memoryUsage(),
			uptime: process.uptime(),
		},
	});

	// Create a crash dump file with detailed error information
	try {
		const dumpFile = path.join(
			process.cwd(),
			'logs',
			`crash-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
		);

		fs.writeFileSync(
			dumpFile,
			JSON.stringify(
				{
					timestamp: new Date().toISOString(),
					type: 'uncaughtException',
					error: formatErrorForLogging(error),
					process: {
						pid: process.pid,
						ppid: process.ppid,
						title: process.title,
						arch: process.arch,
						platform: process.platform,
						version: process.version,
						versions: process.versions,
						memoryUsage: process.memoryUsage(),
						uptime: process.uptime(),
						env: {
							NODE_ENV: process.env.NODE_ENV,
						},
					},
				},
				null,
				2
			)
		);

		console.error(`Crash dump written to ${dumpFile}`);
	} catch (dumpError) {
		console.error('Failed to write crash dump:', dumpError);
	}

	shutdown('uncaughtException');
});

// Handle unhandled promise rejections with enhanced stack trace logging
process.on('unhandledRejection', (reason) => {
	// Get stack trace of the promise
	const promiseStack = new Error('Promise stack trace').stack;

	workerLogger.error('Unhandled promise rejection:', {
		reason:
			reason instanceof Error
				? formatErrorForLogging(reason)
				: { message: String(reason), value: reason },
		promiseStack: promiseStack
			?.split('\n')
			.slice(1)
			.map((line) => line.trim()),
		processInfo: {
			pid: process.pid,
			memoryUsage: process.memoryUsage(),
			uptime: process.uptime(),
		},
	});

	shutdown('unhandledRejection');
});

// Initialize and start the worker
try {
	workerLogger.info('Starting enhanced lesson generation worker...');
	worker = initializeEnhancedWorker();
	workerLogger.info('Worker started successfully', {
		timestamp: new Date().toISOString(),
	});

	// Log periodic statistics
	setInterval(() => {
		const memoryUsage = process.memoryUsage();
		workerLogger.info('Worker status', {
			memoryUsage: {
				rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
				heapTotal: `${Math.round(
					memoryUsage.heapTotal / 1024 / 1024
				)} MB`,
				heapUsed: `${Math.round(
					memoryUsage.heapUsed / 1024 / 1024
				)} MB`,
				external: `${Math.round(
					memoryUsage.external / 1024 / 1024
				)} MB`,
			},
			uptime: `${Math.round(process.uptime())} seconds`,
		});
	}, 5 * 60 * 1000); // Log every 5 minutes
} catch (error) {
	workerLogger.error('Failed to start worker:', error);
	process.exit(1);
}
