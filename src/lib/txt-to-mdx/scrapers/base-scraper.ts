// src/lib/txt-to-mdx/scrapers/base-scraper.ts
import puppeteer, { Page } from "puppeteer";
import { TranscriptResult } from "../types";
import { logger } from "./logger";
import path from "path";
import fs from "fs/promises";

export interface TranscriptScraper {
  scrape(
    url: string,
    outputBasePath: string,
    page?: Page
  ): Promise<TranscriptResult>;
  extractVideoInfo(
    page: Page
  ): Promise<{ videoId: string | null; title: string }>;
  downloadTranscripts(
    page: Page,
    outputDir: string,
    videoId: string
  ): Promise<{ txt: string; srt: string }>;
}

export abstract class BaseScraper implements TranscriptScraper {
  abstract extractVideoInfo(
    page: Page
  ): Promise<{ videoId: string | null; title: string }>;
  abstract downloadTranscripts(
    page: Page,
    outputDir: string,
    videoId: string
  ): Promise<{ txt: string; srt: string }>;

  protected async setupDownloadListener(
    page: Page,
    outputPath: string
  ): Promise<void> {
    logger.info(
      `Setting up download listener for: ${outputPath} on ${path.dirname(
        outputPath
      )}`
    );
    const client = await page.target().createCDPSession();
    await client.send("Page.setDownloadBehavior", {
    behavior: "allow",
      downloadPath: outputPath,
    });
  }

  protected async checkAndRenameFile(
    outputDir: string,
    videoId: string,
    format: "txt" | "srt"
  ): Promise<string> {
    const files = await fs.readdir(outputDir);
    const downloadedFile = files.find((f) =>
      f.toLowerCase().endsWith(`.${format.toLowerCase()}`)
    );

    if (!downloadedFile) {
      throw new Error(
        `Downloaded ${format.toUpperCase()} file not found in ${outputDir}`
      );
    }

    const oldPath = path.join(outputDir, downloadedFile);
    const newPath = path.join(outputDir, `${videoId}.${format}`);

    try {
      await fs.rename(oldPath, newPath);
      logger.info(`Renamed ${format} file to ${path.basename(newPath)}`);
      return newPath;
    } catch (error) {
      logger.error(`Error renaming ${format} file:`, error);
      throw error;
    }
  }

  async scrape(url: string, outputBasePath: string): Promise<TranscriptResult> {
    logger.info(`Starting transcript scrape for URL: ${url}`);
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();

      // Configure longer timeouts for slow connections
      page.setDefaultTimeout(60000); // 60 seconds
      page.setDefaultNavigationTimeout(60000);

      logger.info("Navigating to page");
      await page.goto(url, {
        waitUntil: "networkidle0",
        timeout: 60000,
      });

      // Extract video information
      const { videoId, title } = await this.extractVideoInfo(page);
      if (!videoId) {
        throw new Error("Could not extract YouTube video ID");
      }

      // Create output directory
      const outputDir = path.join(outputBasePath, videoId);
      await fs.mkdir(outputDir, { recursive: true });
      logger.debug(`Created output directory: ${outputDir}`);

      // Download transcript files
      const { txt: txtPath, srt: srtPath } = await this.downloadTranscripts(
        page,
        outputDir,
        videoId
      );

      await browser.close();
      logger.info("Scraping completed successfully");

      return {
        videoId,
        title,
        files: {
          txt: txtPath,
          srt: srtPath,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Scraping failed", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      await browser.close();

      // Rethrow with more context if needed
      if (error instanceof Error) {
        throw new Error(`Scraping failed: ${error.message}`);
      }
      throw error;
    }
  }

  protected async waitForDownload(
    outputDir: string,
    format: string,
    timeout: number = 30000
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const files = await fs.readdir(outputDir);
      if (
        files.some((f) => f.toLowerCase().endsWith(`.${format.toLowerCase()}`))
      ) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    throw new Error(`Download timeout for ${format} file after ${timeout}ms`);
  }

  protected async ensureDirectoryExists(dir: string): Promise<void> {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }
}
