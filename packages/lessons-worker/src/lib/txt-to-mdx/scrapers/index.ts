import { BahethScraper } from "./baheth-scraper";
import { DownsubScraper } from "./downsub-scraper";
import { YoutubeTranscriptService } from "./youtube-transcript.service";
import { TranscriptScraper } from "./base-scraper";
import { YtDlpWrapper } from "../../../utils/yt-dlp";

export class ScraperFactory {
  static getScraper(url: string): TranscriptScraper {
    const domain = new URL(url).hostname;

    switch (domain) {
      case "baheth.ieasybooks.com":
        return new BahethScraper();
      case "downsub.com":
        // TODO: Deprecate Downsub support
        return new DownsubScraper();
      case "www.youtube.com":
      case "youtu.be":
        return new YoutubeTranscriptService(new YtDlpWrapper());
      default:
        throw new Error(`No scraper available for domain: ${domain}`);
    }
  }
}
