// src/server/services/ai/gemini-key-manager.ts
import { logger } from '@/client/lib/txt-to-mdx/scrapers/logger';

export class GeminiKeyManager {
	private keys: string[];
	private currentKeyIndex: number = 0;
	private failedKeys: Set<number> = new Set();

	constructor(apiKeys: string[]) {
		if (!apiKeys.length) {
			throw new Error('No Gemini API keys provided');
		}
		this.keys = apiKeys;
		logger.info(
			`Initialized GeminiKeyManager with ${this.keys.length} keys`
		);
	}

	getCurrentKey(): string {
		return this.keys[this.currentKeyIndex];
	}

	markCurrentKeyFailed(): boolean {
		logger.warn(`Marking Gemini key ${this.currentKeyIndex + 1} as failed`);
		this.failedKeys.add(this.currentKeyIndex);

		// Try to find next available key
		const nextKeyIndex = this.findNextAvailableKeyIndex();
		if (nextKeyIndex === -1) {
			logger.error('All Gemini API keys have failed');
			return false;
		}

		this.currentKeyIndex = nextKeyIndex;
		logger.info(`Switched to Gemini key ${this.currentKeyIndex + 1}`);
		return true;
	}

	private findNextAvailableKeyIndex(): number {
		for (let i = 0; i < this.keys.length; i++) {
			if (!this.failedKeys.has(i)) {
				return i;
			}
		}
		return -1;
	}

	resetFailedKeys(): void {
		this.failedKeys.clear();
		this.currentKeyIndex = 0;
		logger.info('Reset all Gemini API keys status');
	}

	get failedKeysCount(): number {
		return this.failedKeys.size;
	}

	get totalKeys(): number {
		return this.keys.length;
	}

	get remainingKeys(): number {
		return this.totalKeys - this.failedKeys.size;
	}
}
