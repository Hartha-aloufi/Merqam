// src/lib/txt-to-mdx/scrapers/baheth-scraper.ts
import { Page } from "puppeteer";
import { logger } from "./logger";
import { BaseScraper } from "./base-scraper";

export class BahethScraper extends BaseScraper {
  async extractVideoInfo(
    page: Page
  ): Promise<{ videoId: string | null; title: string }> {
    logger.info("Attempting to extract video info from Baheth");

    return page.evaluate(() => {
      const videoFrame =
        document.querySelector('iframe[src*="youtube-nocookie.com"]') ||
        document.querySelector('iframe[src*="youtube.com"]');

      if (!videoFrame) return { videoId: null, title: "" };

      const srcUrl = (videoFrame as HTMLIFrameElement).src;
      let title = (videoFrame as HTMLIFrameElement).title || "";

      if(!title) {
        title = document.querySelector('a[href*="youtube.com"]')?.previousSibling?.textContent || "";
      }

      const match = srcUrl.match(/(?:embed|v|vi|youtu\.be)\/([^?&"'>]+)/);

      return {
        videoId: match ? match[1] : null,
        title: title.replace("YouTube video player", "").trim(),
      };
    });
  }

  async downloadTranscripts(
    page: Page,
    outputDir: string,
    videoId: string
  ): Promise<{ txt: string; srt: string }> {
    logger.info("Starting transcript downloads from Baheth");
    await this.setupDownloadListener(page, outputDir);

    // Download TXT file
    logger.info(`Downloading TXT file at:${outputDir}`);
    await page.evaluate(() => {
      const txtLink = document.querySelector(
        'a[href*="download_transcription_in_txt"]'
      ) as HTMLAnchorElement;
      if (txtLink) {
        txtLink.click();
      } else {
        throw new Error("TXT download link not found");
      }
    });

    // Wait for download
    await new Promise((r) => setTimeout(r, 3000));

    await this.waitForDownload(outputDir, "txt");

    // Download SRT file
    logger.info("Downloading SRT file at:", outputDir);
    await page.evaluate(() => {
      const srtLink = document.querySelector(
        'a[href*="download_transcription_in_srt"]'
      ) as HTMLAnchorElement;
      if (srtLink) {
        srtLink.click();
      } else {
        throw new Error("SRT download link not found");
      }
    });
    await this.waitForDownload(outputDir, "srt");

    const txtPath = await this.checkAndRenameFile(outputDir, videoId, "txt");
    const srtPath = await this.checkAndRenameFile(outputDir, videoId, "srt");

    return { txt: txtPath, srt: srtPath };
  }
}
