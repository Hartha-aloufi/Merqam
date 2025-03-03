/**
 * worker script for processing lesson generation jobs
 * with comprehensive file logging
 *
 * This script can be run separately from the Next.js application
 * using `npx tsx --watch src/worker.ts`
 */
import { workerLogger } from './server/lib/logging/file-logger';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import { initializeEnhancedWorker } from './server/queue/lesson-generation-worker';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir, { recursive: true });
	console.log(`Created logs directory at ${logsDir}`);
}

// Load environment variables
config();

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

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
	workerLogger.error('Uncaught exception:', error);
	shutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
	workerLogger.error('Unhandled promise rejection:', { reason, promise });
	shutdown('unhandledRejection');
});

// Initialize and start the worker
try {
	workerLogger.info('Starting enhanced lesson generation worker...');
	worker = initializeEnhancedWorker();
	workerLogger.info('Worker started successfully', {
		timestamp: new Date().toISOString(),
	});


} catch (error) {
	workerLogger.error('Failed to start worker:', error);
	process.exit(1);
}
