// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs").promises;

// Configuration object
const CONFIG = {
  // Matching settings
  MAX_SEGMENTS_TO_COMBINE: 5, // Maximum number of SRT segments to combine
  SIMILARITY_THRESHOLD: 0.4, // Main threshold for paragraph matching
  START_SIMILARITY_THRESHOLD: 0.5, // Threshold for start time detection
  WINDOW_SIZE: 18, // Number of words to check for start/end matching

  // Output formatting
  ADD_BLANK_LINES: true, // Add blank lines around VideoTimeAt components
  INDENT_SPACES: 2, // Number of spaces for component indentation

  // Debug settings
  VERBOSE: false, // Show detailed matching information
  LOG_PROGRESS: true, // Show progress during processing

  // Text processing
  MIN_PARAGRAPH_LENGTH: 10, // Minimum length of text to be considered a paragraph
  MAX_LOOK_BACK_SEGMENTS: 2, // Number of segments to look back for better start times
};

// Parse SRT timestamps
function parseTimestamp(timestamp) {
  const [time, ms] = timestamp.split(".");
  const [hours, minutes, seconds] = time.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds + (parseInt(ms) || 0) / 1000;
}

// Normalize Arabic text for comparison
function normalizeArabicText(text) {
  return text
    .replace(/[^\u0600-\u06FF\s]/g, "") // Keep only Arabic characters and spaces
    .replace(/\s+/g, " ") // Normalize spaces
    .replace(/[،.؟!:]/g, "") // Remove punctuation
    .replace(/آ/g, "ا") // Normalize alef variations
    .replace(/[ًٌٍَُِّْ]/g, "") // Remove tashkeel
    .replace(/ة/g, "ه") // Normalize taa marbuta
    .replace(/إ|أ/g, "ا") // Normalize hamza variations
    .replace(/[ىي]/g, "ي") // Normalize ya variations
    .trim();
}

// Parse SRT content
function parseSRT(content) {
  const segments = content
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\n\n+/)
    .filter((segment) => segment.includes("-->"));

  return segments
    .map((segment) => {
      const lines = segment.split("\n").filter((line) => line.trim());
      if (lines.length < 2) return null;

      const timestampLine = lines[0];
      const [startTime, endTime] = timestampLine
        .split("-->")
        .map((t) => t.trim());
      const text = lines.slice(1).join(" ").trim();

      return {
        startTime: parseTimestamp(startTime),
        endTime: parseTimestamp(endTime),
        text,
        normalizedText: normalizeArabicText(text),
      };
    })
    .filter((segment) => segment !== null);
}

// Find best start time by checking previous segments
function findBestStartTime(paragraph, segments, mainSegmentIndex) {
  const paragraphStart = normalizeArabicText(paragraph)
    .split(" ")
    .slice(0, CONFIG.WINDOW_SIZE)
    .join(" ");

  // Look in previous segments
  for (
    let i = Math.max(0, mainSegmentIndex - CONFIG.MAX_LOOK_BACK_SEGMENTS);
    i < mainSegmentIndex;
    i++
  ) {
    const segmentEnd = segments[i].normalizedText
      .split(" ")
      .slice(-CONFIG.WINDOW_SIZE)
      .join(" ");

    const similarity = calculateSimilarity(paragraphStart, segmentEnd);

    if (similarity >= CONFIG.START_SIMILARITY_THRESHOLD) {
      const segmentDuration = segments[i].endTime - segments[i].startTime;
      return segments[i].startTime + segmentDuration * 0.7;
    }
  }

  return null;
}

// Calculate similarity between two texts
function calculateSimilarity(text1, text2) {
  const words1 = text1.split(" ");
  const words2 = text2.split(" ");

  const commonWords = words1.filter((word) => words2.includes(word)).length;

  return (2.0 * commonWords) / (words1.length + words2.length);
}

// Find matching segments for a paragraph
function findMatchingSegments(paragraph, srtSegments) {
  const normalizedParagraph = normalizeArabicText(paragraph);

  // Skip if paragraph is too short
  if (normalizedParagraph.length < CONFIG.MIN_PARAGRAPH_LENGTH) {
    return null;
  }

  let bestMatch = {
    startTime: null,
    endTime: null,
    score: 0,
    startIndex: -1,
  };

  for (let i = 0; i < srtSegments.length; i++) {
    let combinedText = "";
    let j = i;
    const endIndex = Math.min(
      i + CONFIG.MAX_SEGMENTS_TO_COMBINE,
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

  if (bestMatch.score > CONFIG.SIMILARITY_THRESHOLD) {
    const betterStart = findBestStartTime(
      paragraph,
      srtSegments,
      bestMatch.startIndex
    );
    if (betterStart !== null) {
      bestMatch.startTime = betterStart;
    }
    return bestMatch;
  }

  return null;
}

async function processArabicMDX(mdxPath, srtPath, outputPath) {
  try {
    // Read files
    const mdxContent = await fs.readFile(mdxPath, "utf8");
    const srtContent = await fs.readFile(srtPath, "utf8");

    // Parse SRT
    const srtSegments = parseSRT(srtContent);
    if (CONFIG.LOG_PROGRESS) {
      console.log(`Parsed ${srtSegments.length} SRT segments`);
    }

    // Process MDX content
    const lines = mdxContent.split("\n");
    const outputLines = [];
    let currentParagraph = [];
    let processedParagraphs = 0;

    const indent = " ".repeat(CONFIG.INDENT_SPACES);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Handle headers and empty lines
      if (trimmedLine.startsWith("#") || trimmedLine === "") {
        // Process any accumulated paragraph
        if (currentParagraph.length > 0) {
          const paragraphText = currentParagraph.join("\n");
          const match = findMatchingSegments(paragraphText, srtSegments);

          if (match && match.score > CONFIG.SIMILARITY_THRESHOLD) {
            if (CONFIG.ADD_BLANK_LINES) outputLines.push("");
            outputLines.push(
              `${indent}<VideoTimeAt startTime={${Math.floor(
                match.startTime
              )}} endTime={${Math.ceil(match.endTime)}}>`
            );
            outputLines.push(paragraphText);
            outputLines.push(`${indent}</VideoTimeAt>`);
            if (CONFIG.ADD_BLANK_LINES) outputLines.push("");

            processedParagraphs++;
            if (CONFIG.VERBOSE) {
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

      // Log progress
      if (CONFIG.LOG_PROGRESS && i % 100 === 0) {
        console.log(`Processing line ${i + 1}/${lines.length}`);
      }
    }

    // Handle final paragraph if exists
    if (currentParagraph.length > 0) {
      const paragraphText = currentParagraph.join("\n");
      const match = findMatchingSegments(paragraphText, srtSegments);

      if (match && match.score > CONFIG.SIMILARITY_THRESHOLD) {
        if (CONFIG.ADD_BLANK_LINES) outputLines.push("");
        outputLines.push(
          `${indent}<VideoTimeAt startTime={${Math.floor(
            match.startTime
          )}} endTime={${Math.ceil(match.endTime)}}>`
        );
        outputLines.push(paragraphText);
        outputLines.push(`${indent}</VideoTimeAt>`);
        if (CONFIG.ADD_BLANK_LINES) outputLines.push("");
        processedParagraphs++;
      } else {
        outputLines.push(paragraphText);
      }
    }

    // Write output
    await fs.writeFile(outputPath, outputLines.join("\n"));

    if (CONFIG.LOG_PROGRESS) {
      console.log(`Successfully processed ${processedParagraphs} paragraphs`);
      console.log(`Output written to ${outputPath}`);
    }
  } catch (error) {
    console.error("Error processing files:", error);
    throw error;
  }
}

// Command line arguments handling
const [, , mdxFile, srtFile, outputFile] = process.argv;

if (!mdxFile || !srtFile || !outputFile) {
  console.log("Usage: node mdx-wrapper.js <mdx-file> <srt-file> <output-file>");
  console.log(
    "Example: node mdx-wrapper.js input.mdx.ini subtitles.srt.ini output.mdx"
  );
  process.exit(1);
}

// Run the script
processArabicMDX(mdxFile, srtFile, outputFile).catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});
