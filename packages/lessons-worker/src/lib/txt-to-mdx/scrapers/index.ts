import { YoutubeTranscriptService } from './youtube-transcript.service';
import { TranscriptScraper } from './base-scraper';
import { YtDlpWrapper } from '../../../utils/download-subtitle';

export class ScraperFactory {
	static getScraper(url: string): TranscriptScraper {
		const domain = new URL(url).hostname;

		switch (domain) {
			case 'www.youtube.com':
			case 'youtu.be':
				return new YoutubeTranscriptService(new YtDlpWrapper());
			default:
				throw new Error(`No scraper available for domain: ${domain}`);
		}
	}
}
