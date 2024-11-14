// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs").promises;

// Parse SRT timestamps
function parseTimestamp(timestamp) {
  const [time, ms] = timestamp.split(".");
  const [hours, minutes, seconds] = time.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds + (parseInt(ms) || 0) / 1000;
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

// Find best start time by checking previous segments
function findBestStartTime(paragraph, segments, mainSegmentIndex) {
  const WINDOW_SIZE = 18;
  const paragraphStart = normalizeArabicText(paragraph)
    .split(" ")
    .slice(0, WINDOW_SIZE)
    .join(" ");

  // Look in previous segments
  for (let i = Math.max(0, mainSegmentIndex - 2); i < mainSegmentIndex; i++) {
    const segmentEnd = segments[i].normalizedText
      .split(" ")
      .slice(-WINDOW_SIZE)
      .join(" ");
    const similarity = calculateSimilarity(paragraphStart, segmentEnd);

    if (similarity >= 0.5) {
      // Calculate a position 70% through the segment
      const segmentDuration = segments[i].endTime - segments[i].startTime;
      console.log(
        `Found better start for paragraph: ${paragraph.slice(0, 30)}...`
      );
      return (
        segments[i].startTime +
        segmentDuration *
          (1 - WINDOW_SIZE / segments[i].normalizedText.split(" ").length)
      );
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
  let bestMatch = {
    startTime: null,
    endTime: null,
    score: 0,
    startIndex: -1,
  };

  // Try combining up to 5 segments
  for (let i = 0; i < srtSegments.length; i++) {
    let combinedText = "";
    let j = i;
    const endIndex = Math.min(i + 5, srtSegments.length);

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

  if (bestMatch.score > 0.4) {
    // Check for better start time
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
    console.log(`Parsed ${srtSegments.length} SRT segments`);

    // Process MDX content
    const lines = mdxContent.split("\n");
    const outputLines = [];
    let currentParagraph = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Handle headers and empty lines
      if (line.startsWith("#") || line === "") {
        // Process any accumulated paragraph
        if (currentParagraph.length > 0) {
          const paragraphText = currentParagraph.join("\n");
          const match = findMatchingSegments(paragraphText, srtSegments);

          if (match && match.score > 0.4) {
            outputLines.push("");
            outputLines.push(
              `<VideoTimeAt startTime={${Math.floor(
                match.startTime
              )}} endTime={${Math.ceil(match.endTime)}}>`
            );
            outputLines.push(paragraphText);
            outputLines.push("</VideoTimeAt>");
            outputLines.push("");
            // console.log(`Matched paragraph with score ${match.score.toFixed(2)}`);
          } else {
            outputLines.push(paragraphText);
          }
          currentParagraph = [];
        }
        outputLines.push(lines[i]); // Keep original line with spacing
      } else {
        currentParagraph.push(lines[i]);
      }
    }

    // Handle final paragraph if exists
    if (currentParagraph.length > 0) {
      const paragraphText = currentParagraph.join("\n");
      const match = findMatchingSegments(paragraphText, srtSegments);

      if (match && match.score > 0.4) {
        outputLines.push("");
        outputLines.push(
          `<VideoTimeAt startTime={${Math.floor(
            match.startTime
          )}} endTime={${Math.ceil(match.endTime)}}>`
        );
        outputLines.push(paragraphText);
        outputLines.push("</VideoTimeAt>");
        outputLines.push("");
      } else {
        outputLines.push(paragraphText);
      }
    }

    // Write output
    await fs.writeFile(outputPath, outputLines.join("\n"));
    console.log(
      `Successfully processed MDX file. Output written to ${outputPath}`
    );
  } catch (error) {
    console.error("Error processing files:", error);
    throw error;
  }
}

// Get command line arguments
const [, , mdxFile, srtFile, outputFile] = process.argv;

if (!mdxFile || !srtFile || !outputFile) {
  console.log("Usage: node script.js <mdx-file> <srt-file> <output-file>");
  console.log(
    "Example: node script.js input.mdx.ini original.srt.ini output.mdx"
  );
  process.exit(1);
}

// Run the script
processArabicMDX(mdxFile, srtFile, outputFile).catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});
