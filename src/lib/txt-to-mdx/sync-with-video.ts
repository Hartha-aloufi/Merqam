// src/lib/txt-to-mdx/sync-with-video.ts
import fs from "fs/promises";

interface SyncConfig {
  // Matching settings
  MAX_SEGMENTS_TO_COMBINE: number;
  SIMILARITY_THRESHOLD: number;
  START_SIMILARITY_THRESHOLD: number;
  WINDOW_SIZE: number;

  // Output formatting 
  ADD_BLANK_LINES: boolean;
  INDENT_SPACES: number;

  // Debug settings
  VERBOSE: boolean;
  LOG_PROGRESS: boolean;

  // Text processing
  MIN_PARAGRAPH_LENGTH: number;
  MAX_LOOK_BACK_SEGMENTS: number;
}

interface SrtSegment {
  startTime: number;
  endTime: number;
  text: string;
  normalizedText: string;
}

interface MatchResult {
  startTime: number | null;
  endTime: number | null;
  score: number;
  startIndex: number;
}

interface ProcessResult {
  processedParagraphs: number;
  outputPath: string;
}

// Default configuration
const DEFAULT_CONFIG: SyncConfig = {
  MAX_SEGMENTS_TO_COMBINE: 5,
  SIMILARITY_THRESHOLD: 0.4,
  START_SIMILARITY_THRESHOLD: 0.5,
  WINDOW_SIZE: 18,
  ADD_BLANK_LINES: true,
  INDENT_SPACES: 2,
  VERBOSE: false,
  LOG_PROGRESS: true,
  MIN_PARAGRAPH_LENGTH: 10,
  MAX_LOOK_BACK_SEGMENTS: 2,
};

// Parse SRT timestamps
function parseTimestamp(timestamp: string): number {
  const [time, ms] = timestamp.split(".");
  const [hours, minutes, seconds] = time.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds + (parseInt(ms) || 0) / 1000;
}

// Normalize Arabic text for comparison
function normalizeArabicText(text: string): string {
  return text
    .replace(/[^\u0600-\u06FF\s]/g, "")
    .replace(/\s+/g, " ")
    .replace(/[،.؟!:]/g, "")
    .replace(/آ/g, "ا")
    .replace(/[ًٌٍَُِّْ]/g, "")
    .replace(/ة/g, "ه")
    .replace(/إ|أ/g, "ا")
    .replace(/[ىي]/g, "ي")
    .trim();
}

// Parse SRT content
function parseSRT(content: string): SrtSegment[] {
  const segments = content
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\n\n+/)
    .filter((segment) => segment.includes("-->"));

  return segments
    .map((segment) => {
      const lines = segment.split("\n").filter((line) => line.trim());
      if (lines.length < 2) return null;

      const [startTime, endTime] = lines[0].split("-->").map((t) => t.trim());
      const text = lines.slice(1).join(" ").trim();

      return {
        startTime: parseTimestamp(startTime),
        endTime: parseTimestamp(endTime),
        text,
        normalizedText: normalizeArabicText(text),
      };
    })
    .filter((segment): segment is SrtSegment => segment !== null);
}

// Calculate similarity between two texts
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.split(" ");
  const words2 = text2.split(" ");
  const commonWords = words1.filter((word) => words2.includes(word)).length;
  return (2.0 * commonWords) / (words1.length + words2.length);
}

// Find best start time by checking previous segments
function findBestStartTime(
  paragraph: string,
  segments: SrtSegment[],
  mainSegmentIndex: number,
  config: SyncConfig
): number | null {
  const paragraphStart = normalizeArabicText(paragraph)
    .split(" ")
    .slice(0, config.WINDOW_SIZE)
    .join(" ");

  for (
    let i = Math.max(0, mainSegmentIndex - config.MAX_LOOK_BACK_SEGMENTS);
    i < mainSegmentIndex;
    i++
  ) {
    const segmentEnd = segments[i].normalizedText
      .split(" ")
      .slice(-config.WINDOW_SIZE)
      .join(" ");

    const similarity = calculateSimilarity(paragraphStart, segmentEnd);
    if (similarity >= config.START_SIMILARITY_THRESHOLD) {
      const segmentDuration = segments[i].endTime - segments[i].startTime;
      return segments[i].startTime + segmentDuration * 0.7;
    }
  }

  return null;
}

// Find matching segments for a paragraph
function findMatchingSegments(
  paragraph: string,
  srtSegments: SrtSegment[],
  config: SyncConfig
): MatchResult | null {
  const normalizedParagraph = normalizeArabicText(paragraph);

  if (normalizedParagraph.length < config.MIN_PARAGRAPH_LENGTH) {
    return null;
  }

  let bestMatch: MatchResult = {
    startTime: null,
    endTime: null,
    score: 0,
    startIndex: -1,
  };

  for (let i = 0; i < srtSegments.length; i++) {
    let combinedText = "";
    let j = i;
    const endIndex = Math.min(
      i + config.MAX_SEGMENTS_TO_COMBINE,
      srtSegments.length
    );

    while (j < endIndex) {
      combinedText += " " + srtSegments[j].normalizedText;
      const similarity = calculateSimilarity(
        normalizedParagraph,
        normalizeArabicText(combinedText)
      );

      if (similarity > bestMatch.score) {
        bestMatch = {
          startTime: srtSegments[i].startTime,
          endTime: srtSegments[j].endTime,
          score: similarity,
          startIndex: i,
        };
      }
      j++;
    }
  }

  if (bestMatch.score > config.SIMILARITY_THRESHOLD) {
    const betterStart = findBestStartTime(
      paragraph,
      srtSegments,
      bestMatch.startIndex,
      config
    );
    if (betterStart !== null) {
      bestMatch.startTime = betterStart;
    }
    return bestMatch;
  }

  return null;
}

/**
 * Main function to process MDX and SRT files
 */
export async function syncWithVideo(
  mdxPath: string,
  srtPath: string,
  outputPath: string,
  customConfig: Partial<SyncConfig> = {}
): Promise<ProcessResult> {
  // Merge custom config with defaults
  const config: SyncConfig = { ...DEFAULT_CONFIG, ...customConfig };

  try {
    // Read files
    const mdxContent = await fs.readFile(mdxPath, "utf8");
    const srtContent = await fs.readFile(srtPath, "utf8");

    // Parse SRT
    const srtSegments = parseSRT(srtContent);
    if (config.LOG_PROGRESS) {
      console.log(`Parsed ${srtSegments.length} SRT segments`);
    }

    // Process MDX content
    const lines = mdxContent.split("\n");
    const outputLines: string[] = [];
    let currentParagraph: string[] = [];
    let processedParagraphs = 0;

    const indent = " ".repeat(config.INDENT_SPACES);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Handle headers and empty lines
      if (trimmedLine.startsWith("#") || trimmedLine === "") {
        // Process any accumulated paragraph
        if (currentParagraph.length > 0) {
          const paragraphText = currentParagraph.join("\n");
          const match = findMatchingSegments(
            paragraphText,
            srtSegments,
            config
          );

          if (
            match &&
            match.startTime !== null &&
            match.endTime !== null &&
            match.score > config.SIMILARITY_THRESHOLD
          ) {
            if (config.ADD_BLANK_LINES) outputLines.push("");
            outputLines.push(
              `${indent}<VideoTimeAt startTime={${Math.floor(
                match.startTime
              )}} endTime={${Math.ceil(match.endTime)}}>`
            );
            outputLines.push(paragraphText);
            outputLines.push(`${indent}</VideoTimeAt>`);
            if (config.ADD_BLANK_LINES) outputLines.push("");

            processedParagraphs++;
            if (config.VERBOSE) {
              console.log(
                `Matched paragraph ${processedParagraphs} with score ${match.score.toFixed(
                  2
                )}`
              );
            }
          } else {
            outputLines.push(paragraphText);
          }
          currentParagraph = [];
        }
        outputLines.push(line);
      } else {
        currentParagraph.push(line);
      }

      if (config.LOG_PROGRESS && i % 100 === 0) {
        console.log(`Processing line ${i + 1}/${lines.length}`);
      }
    }

    // Handle final paragraph if exists
    if (currentParagraph.length > 0) {
      const paragraphText = currentParagraph.join("\n");
      const match = findMatchingSegments(paragraphText, srtSegments, config);

      if (
        match &&
        match.startTime !== null &&
        match.endTime !== null &&
        match.score > config.SIMILARITY_THRESHOLD
      ) {
        if (config.ADD_BLANK_LINES) outputLines.push("");
        outputLines.push(
          `${indent}<VideoTimeAt startTime={${Math.floor(
            match.startTime
          )}} endTime={${Math.ceil(match.endTime)}}>`
        );
        outputLines.push(paragraphText);
        outputLines.push(`${indent}</VideoTimeAt>`);
        if (config.ADD_BLANK_LINES) outputLines.push("");
        processedParagraphs++;
      } else {
        outputLines.push(paragraphText);
      }
    }

    // Write output
    await fs.writeFile(outputPath, outputLines.join("\n"));

    if (config.LOG_PROGRESS) {
      console.log(`Successfully processed ${processedParagraphs} paragraphs`);
      console.log(`Output written to ${outputPath}`);
    }

    return {
      processedParagraphs,
      outputPath,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error processing files:", error.message);
      throw error;
    }
    throw new Error("Unknown error occurred");
  }
}

// Export types and config for external use
export type { SyncConfig, ProcessResult };
export { DEFAULT_CONFIG };
