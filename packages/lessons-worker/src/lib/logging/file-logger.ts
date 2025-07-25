// src/server/lib/logging/file-logger.ts
import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { env } from '../../lib/env';
import { formatErrorForLogging } from './error-utils';

// Ensure log directory exists
const LOG_DIR = path.join(process.cwd(), 'logs');
if (!fs.existsSync(LOG_DIR)) {
	fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Define log levels
const levels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	debug: 4,
};

// Define log level colors for console
const colors = {
	error: 'red',
	warn: 'yellow',
	info: 'green',
	http: 'magenta',
	debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Determine the log level based on environment
const level = () => {
	return env.LOG_LEVEL || (env.NODE_ENV === 'production' ? 'info' : 'debug');
};

// Log level emojis for better visual identification
const levelEmojis = {
	error: '❌',
	warn: '⚠️',
	info: 'ℹ️',
	http: '🌐',
	debug: '🔍',
};

// Format for console output with emojis and better readability
const consoleFormat = winston.format.combine(
	winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
	winston.format.colorize({ all: true }),
	winston.format.printf((info) => {
		const emoji = levelEmojis[info.level.replace(/\u001b\[[0-9;]*m/g, '') as keyof typeof levelEmojis] || '';
		const metadata = info.metadata ? ` ${JSON.stringify(info.metadata, null, 2)}` : '';
		return `${info.timestamp} ${emoji} ${info.level}: ${info.message}${metadata}`;
	})
);

// JSON format for file output
const fileFormat = winston.format.combine(
	winston.format.timestamp(),
	winston.format.json()
);

// Create a Winston logger instance
export const createLogger = (name: string) => {
	// Create job-specific log file path
	const logFilePath = path.join(LOG_DIR, `${name}.log`);

	const transports = [
		// File transports (always enabled)
		new winston.transports.File({
			filename: path.join(LOG_DIR, 'error.log'),
			level: 'error',
			format: fileFormat,
		}),
		new winston.transports.File({
			filename: logFilePath,
			format: fileFormat,
		}),
	];

	// Conditionally add console transport based on environment
	if (env.LOG_TO_CONSOLE) {
		transports.unshift(new winston.transports.Console({
			format: consoleFormat,
		}));
	}

	return winston.createLogger({
		level: level(),
		levels,
		transports,
	});
};

/**
 * Job-specific logger that saves all logs to dedicated files
 */
export class JobLogger {
	private logger: winston.Logger;
	private jobId: string;
	private context: string;

	constructor(jobId: string, context: string = 'job') {
		this.jobId = jobId;
		this.context = context;
		this.logger = createLogger(`job-${jobId}`);

		// Log logger initialization
		this.info(`Job logger initialized for job ${jobId}`);
	}

	/**
	 * Format message with context
	 */
	private formatMessage(message: string): string {
		return `[${this.context}:${this.jobId}] ${message}`;
	}

	/**
	 * Log info level message
	 */
	info(message: string, metadata: Record<string, any> = {}): void {
		this.logger.info(this.formatMessage(message), {
			metadata: { jobId: this.jobId, ...metadata },
		});
	}

	/**
	 * Log debug level message
	 */
	debug(message: string, metadata: Record<string, any> = {}): void {
		this.logger.debug(this.formatMessage(message), {
			metadata: { jobId: this.jobId, ...metadata },
		});
	}

	/**
	 * Log warning level message
	 */
	warn(message: string, metadata: Record<string, any> = {}): void {
		this.logger.warn(this.formatMessage(message), {
			metadata: { jobId: this.jobId, ...metadata },
		});
	}

	/**
	 * Log error level message with enhanced stack trace information
	 */
	error(
		message: string,
		error?: any,
		metadata: Record<string, any> = {}
	): void {
		this.logger.error(this.formatMessage(message), {
			metadata: {
				jobId: this.jobId,
				...metadata,
				error: error ? formatErrorForLogging(error) : undefined,
			},
		});
	}

	/**
	 * Log performance metrics
	 */
	metric(
		name: string,
		value: number,
		unit: 'ms' | 'bytes' | 'count' | 'percent' = 'ms',
		metadata: Record<string, any> = {}
	): void {
		this.logger.info(this.formatMessage(`METRIC.${name}`), {
			metadata: {
				jobId: this.jobId,
				...metadata,
				metric: {
					name,
					value,
					unit,
				},
			},
		});
	}

	/**
	 * Start a timer and return a function to end it and log the duration
	 */
	startTimer(name: string): () => void {
		const start = process.hrtime();

		return (metadata: Record<string, any> = {}) => {
			const diff = process.hrtime(start);
			const duration = diff[0] * 1000 + diff[1] / 1000000; // Convert to milliseconds

			this.metric(name, duration, 'ms', metadata);
		};
	}

	/**
	 * Log job start
	 */
	logJobStart(metadata: Record<string, any> = {}): void {
		this.info(`Job ${this.jobId} started processing`, metadata);
	}

	/**
	 * Log job completion
	 */
	logJobCompletion(result: any): void {
		this.info(`Job ${this.jobId} completed successfully`, { result });
	}

	/**
	 * Log job failure with enhanced error details
	 */
	logJobFailure(
		error: Error | string,
		metadata: Record<string, any> = {}
	): void {
		// Capture current stack trace to show where the failure was logged from
		const currentStack = new Error().stack;

		this.error(`Job ${this.jobId} failed`, error, {
			failureLocation: currentStack
				?.split('\n')
				.slice(1, 4)
				.map((line) => line.trim()),
			failureTimestamp: new Date().toISOString(),
			...metadata,
		});
	}

	/**
	 * Log progress update
	 */
	logProgress(progress: number, message: string): void {
		this.info(`Progress: ${progress}% - ${message}`);
	}
}

// Create a global logger
export const appLogger = createLogger('app');
export const workerLogger = createLogger('worker');
