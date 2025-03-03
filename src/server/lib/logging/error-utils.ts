// src/server/lib/logging/error-utils.ts
import { inspect } from 'util';

/**
 * Formats a stack trace into a readable format with source file information
 *
 * @param stack The stack trace string
 * @returns Formatted stack trace with source file information
 */
export function formatStackTrace(
	stack: string | undefined
): string[] | undefined {
	if (!stack) return undefined;

	return stack
		.split('\n')
		.slice(1) // Skip the error message line
		.map((line) => line.trim())
		.filter((line) => line.length > 0);
}

/**
 * Extracts source information from a stack trace line
 *
 * @param line A line from a stack trace
 * @returns Source file information
 */
export function extractSourceInfo(
	line: string
): Record<string, string> | undefined {
	// Look for common stack trace patterns
	const filePattern =
		/at\s+(?:(?:(?:(.+?)\s+\()?(.+?):(\d+)(?::(\d+))?\))|(?:(.+?):(\d+)(?::(\d+))?))$/;
	const match = line.match(filePattern);

	if (!match) return undefined;

	// Extract function, file, line, and column information
	const [, fnName, file1, line1, col1, file2, line2, col2] = match;
	const file = file1 || file2;
	const lineNumber = line1 || line2;
	const column = col1 || col2;

	return {
		function: fnName || 'anonymous',
		file: file || 'unknown',
		line: lineNumber || '0',
		column: column || '0',
	};
}

/**
 * Creates a detailed error object suitable for logging
 *
 * @param error The error to format
 * @returns A detailed error object with formatted stack trace
 */
export function formatErrorForLogging(error: any): Record<string, any> {
	// Handle non-Error objects
	if (!(error instanceof Error)) {
		return {
			message: String(error),
			type: typeof error,
			value: inspect(error, { depth: 2 }),
		};
	}

	// Format stack trace if available
	const stackTrace = formatStackTrace(error.stack);

	// Extract source info from the first few stack frames
	const sourceInfo = stackTrace
		?.slice(0, 3)
		.map((line) => extractSourceInfo(line))
		.filter(Boolean);

	// Create detailed error object
	return {
		message: error.message,
		name: error.name,
		stack: stackTrace,
		sourceInfo,
		code: error.code,
		cause: error.cause ? formatErrorForLogging(error.cause) : undefined,
		// Include additional properties that might be available on custom errors
		...(error.type && { type: error.type }),
		...(error.details && { details: error.details }),
		...(error.retry !== undefined && { retry: error.retry }),
		// Add serialized error for additional context
		raw: inspect(error, { depth: 3 }),
	};
}
