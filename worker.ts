// src/worker.ts
/**
 * Standalone worker script for processing lesson generation jobs
 *
 * This script can be run separately from the Next.js application
 * using `ts-node` or compiled to JavaScript and run with Node.js
 */
import { initializeWorker } from './server/queue/lesson-generation-worker';
import { config } from 'dotenv';

// Load environment variables
config();

// Handle graceful shutdown
let shuttingDown = false;
let worker: any = null;

async function shutdown() {
	if (shuttingDown) return;
	shuttingDown = true;

	console.log('Shutting down worker gracefully...');

	if (worker) {
		try {
			await worker.close();
			console.log('Worker closed successfully');
		} catch (error) {
			console.error('Error closing worker:', error);
		}
	}

	console.log('Worker shutdown complete');
	process.exit(0);
}

// Handle termination signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', (error) => {
	console.error('Uncaught exception:', error);
	shutdown();
});

// Initialize and start the worker
try {
	console.log('Starting lesson generation worker...');
	worker = initializeWorker();
	console.log('Worker started successfully');
} catch (error) {
	console.error('Failed to start worker:', error);
	process.exit(1);
}
