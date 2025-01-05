import { BahethScraper } from "./baheth-scraper";
import { DownsubScraper } from "./downsub-scraper";
import { TranscriptScraper } from "./base-scraper";

export class ScraperFactory {
  static getScraper(url: string): TranscriptScraper {
    const domain = new URL(url).hostname;

    switch (domain) {
      case "baheth.ieasybooks.com":
        return new BahethScraper();
      case "downsub.com":
      case "www.youtube.com":
        return new DownsubScraper();
      default:
        throw new Error(`No scraper available for domain: ${domain}`);
    }
  }
}
