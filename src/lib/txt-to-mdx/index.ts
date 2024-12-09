// src/lib/txt-to-mdx/index.ts
import OpenAI from "openai";
import { syncWithVideo } from "./sync-with-video";
import { scrapeTranscript } from "./download-transcripts";
import path from "path";
import fs from "fs/promises";
import { createDir } from "@/lib/utils/fs";
import { logger } from "./download-transcripts";

export interface ConversionResult {
  mdxPath: string;
  videoId: string;
  title: string;
}

export class TxtToMdxConverter {
  private openai: OpenAI;
  private dataPath: string;

  constructor(
    apiKey: string,
    dataPath: string = path.join(process.cwd(), "src/data")
  ) {
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
    this.dataPath = dataPath;
  }

  async processContent(
    bahethUrl: string,
    topicId: string
  ): Promise<ConversionResult> {
    try {
      // Create topic directory if it doesn't exist
      const topicPath = path.join(this.dataPath, topicId);
      await createDir(topicPath);

      // Create temp directory for downloads
      const tempDir = path.join(process.cwd(), "temp");
      await createDir(tempDir);

      // Download transcripts and get video info
      logger.info("Starting transcript download...");
      const {
        videoId,
        title,
        files: { txt: txtPath, srt: srtPath },
      } = await scrapeTranscript(bahethUrl, tempDir);
      logger.info("Transcript download complete", { txtPath, srtPath, title });

      // Verify files exist
      try {
        await fs.access(txtPath);
        await fs.access(srtPath);
        logger.info("Verified files exist", { txtPath, srtPath });
      } catch (error) {
        throw new Error(`Downloaded files not found: ${error.message}`);
      }

      // Read and process content with OpenAI
      logger.info("Reading TXT file...");
      const txtContent = await fs.readFile(txtPath, "utf-8");
      logger.info("Processing with OpenAI...");
      const processedContent = await this.processWithOpenAI(txtContent, title);

      // Create temporary MDX
      const tempMdxPath = path.join(tempDir, `${videoId}_temp.mdx`);
      await fs.writeFile(tempMdxPath, processedContent);
      logger.info("Created temp MDX file", { tempMdxPath });

      // Sync with video timestamps
      const finalMdxPath = path.join(topicPath, `${videoId}.mdx`);
      await syncWithVideo(tempMdxPath, srtPath, finalMdxPath);
      logger.info("Created final MDX with timestamps", { finalMdxPath });

      // Cleanup temp files
      try {
        await fs.unlink(tempMdxPath);
        await fs.unlink(txtPath);
        await fs.unlink(srtPath);
        logger.info("Cleaned up temp files");
      } catch (error) {
        logger.warn("Error cleaning up temp files:", error);
      }

      return {
        mdxPath: finalMdxPath,
        videoId,
        title,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error("Process content error", { error: errorMessage });
      throw new Error(`Failed to process content: ${errorMessage}`);
    }
  }

  private async processWithOpenAI(
    content: string,
    title: string
  ): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "قم بتدقيق النص العربي المأخوذ من مقاطع اليوتيوب وذلك بإصلاح الأخطاء الإملائية، إضافة الحركات على الأحرف عند اللزوم فقط، وإضافة علامات الترقيم. وتقسيم النص الى فقرات حتى يسهل قرائته. من المهم جدًا الحفاظ على النص الأصلي دون تغيير في المحتوى أو الأسلوب.",
        },
        {
          role: "user",
          content: content,
        },
      ],
      temperature: 0.84,
      max_tokens: 16383,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const processedContent = completion.choices[0].message.content;
    return `# ${title}\n\n${processedContent}`;
  }
}
