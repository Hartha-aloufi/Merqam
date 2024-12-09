// src/lib/txt-to-mdx/download-transcripts.ts
import puppeteer, { Page } from "puppeteer";
import fs from "fs/promises";
import path from "path";
import winston from "winston";
import { TranscriptResult } from "./types";


export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});


async function extractVideoInfo(
  page: Page
): Promise<{ videoId: string | null; title: string }> {
  logger.info("Attempting to extract video info");
  return page
    .evaluate(() => {
      const videoFrame =
        document.querySelector('iframe[src*="youtube-nocookie.com"]') ||
        document.querySelector('iframe[src*="youtube.com"]');

      if (!videoFrame) return { videoId: null, title: "" };

      const srcUrl = (videoFrame as HTMLIFrameElement).src;
      const title = (videoFrame as HTMLIFrameElement).title || "";
      const match = srcUrl.match(/(?:embed|v|vi|youtu\.be)\/([^?&"'>]+)/);

      return {
        videoId: match ? match[1] : null,
        title: title.replace("YouTube video player", "").trim(),
      };
    })
    .then(({ videoId, title }) => {
      if (videoId) {
        logger.info("Video info extracted:", { videoId, title });
      } else {
        logger.warn("Failed to extract video info");
      }
      return { videoId, title };
    });
}

async function setupDownloadListener(
  page: Page,
  outputPath: string
): Promise<void> {
  logger.debug(`Setting up download listener for: ${outputPath}`);
  const client = await page.target().createCDPSession();
  await client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: path.dirname(outputPath),
  });
}

async function checkAndRenameFile(
  outputDir: string,
  videoId: string,
  format: "txt" | "srt"
): Promise<string> {
  const files = await fs.readdir(outputDir);
  const downloadedFile = files.find((f) => f.endsWith(`.${format}`));

  if (!downloadedFile) {
    throw new Error(`Downloaded ${format} file not found in ${outputDir}`);
  }

  const oldPath = path.join(outputDir, downloadedFile);
  const newPath = path.join(outputDir, `${videoId}.${format}`);

  // Rename file to our desired format
  await fs.rename(oldPath, newPath);
  logger.info(`Renamed ${format} file to ${path.basename(newPath)}`);

  return newPath;
}

async function downloadTranscript(
  page: Page,
  format: "txt" | "srt",
  outputDir: string,
  videoId: string
): Promise<string> {
  logger.info(`Downloading ${format} transcript to ${outputDir}`);
  try {
    // Setup download behavior
    await setupDownloadListener(page, path.resolve(outputDir, videoId));

    // Click the download link
    await page.evaluate((format) => {
      const link = document.querySelector(
        `a[href*="download_transcription_in_${format}"]`
      ) as HTMLAnchorElement;
      if (link) link.click();
    }, format);

    // Wait for download
    await new Promise((r) => setTimeout(r, 3000));

    // Find and rename the downloaded file
    const filePath = await checkAndRenameFile(outputDir, videoId, format);
    logger.info(`Successfully downloaded ${format} transcript to ${filePath}`);

    return filePath;
  } catch (error) {
    logger.error(`Failed to download ${format} transcript`, {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function scrapeTranscript(
  url: string,
  outputBasePath: string
): Promise<TranscriptResult> {
  logger.info(`Starting transcript scrape for URL: ${url}`);
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    logger.debug("Browser launched successfully");
    const page = await browser.newPage();

    logger.info("Navigating to page");
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    const { videoId, title } = await extractVideoInfo(page);
    if (!videoId) {
      throw new Error("Could not find YouTube video ID");
    }

    const outputDir = path.join(outputBasePath, videoId);
    await fs.mkdir(outputDir, { recursive: true });
    logger.debug(`Created output directory: ${outputDir}`);

    // Download and rename files
    const txtPath = await downloadTranscript(page, "txt", outputDir, videoId);
    const srtPath = await downloadTranscript(page, "srt", outputDir, videoId);

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
    throw error;
  }
}
