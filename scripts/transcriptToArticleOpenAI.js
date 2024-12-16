const fs = require('fs/promises');
const path = require('path');
const OpenAI = require('openai');
const winston = require('winston');
const { initConfig } = require('./config');

// Import the processing function from syncWithVideo.js
const { processArabicMDX } = require('./syncWithVideo');

// Configure logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transFile({ filename: 'error.log', level: 'error' }),
        new winston.transFile({ filename: 'conversion.log' }),
        new winston.transConsole({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

class ContentProcessor {
    constructor() {
        // Initialize configuration
        const config = initConfig();

        // Initialize OpenAI client
        this.openai = new OpenAI({
            apiKey: config.openai.apiKey
        });

        // Store OpenAI configuration
        this.openaiConfig = config.openai;
    }

    async processContent(inputPath, videoTitle) {
        try {
            const txtPath = inputPath;
            const srtPath = inputPath.replace('.txt', '.srt');

            logger.info('Starting content processing', {
                txtPath,
                srtPath,
                videoTitle
            });

            // Step 1: Convert TXT to initial MDX
            const initialMdx = await this.convertToMdx(txtPath, videoTitle);
            const tempMdxPath = path.join(
                path.dirname(txtPath),
                `${path.basename(txtPath, '.txt')}_temp.mdx`
            );

            await fs.writeFile(tempMdxPath, initialMdx);
            logger.info('Created initial MDX file', { path: tempMdxPath });

            // Step 2: Sync with video using SRT
            const finalMdxPath = path.join(
                path.dirname(txtPath),
                `${path.basename(txtPath, '.txt')}.mdx`
            );

            await processArabicMDX(tempMdxPath, srtPath, finalMdxPath);
            logger.info('Created final MDX with timestamps', { path: finalMdxPath });

            // Cleanup temp file
            await fs.unlink(tempMdxPath);
            logger.info('Cleaned up temporary files');

            return finalMdxPath;

        } catch (error) {
            logger.error('Error processing content', { error: error.message });
            throw error;
        }
    }

    async convertToMdx(txtPath, videoTitle) {
        try {
            logger.info(`Converting TXT to MDX: ${txtPath}`);

            // Read input file
            const content = await fs.readFile(txtPath, 'utf8');
            logger.info(`File read successfully, size: ${content.length} bytes`);

            // Process chunks if content is large
            const chunks = this.splitIntoChunks(content, 12000);
            logger.info(`Split content into ${chunks.length} chunks`);

            let processedContent = '';
            for (let i = 0; i < chunks.length; i++) {
                logger.info(`Processing chunk ${i + 1}/${chunks.length}`);
                const processedChunk = await this.processChunk(chunks[i]);
                processedContent += processedChunk + '\n\n';
            }

            // Add MDX structure with video title
            const mdxContent = this.createBasicMdxStructure(processedContent, videoTitle);
            return mdxContent;

        } catch (error) {
            logger.error('Error converting to MDX', { error: error.message });
            throw error;
        }
    }

    splitIntoChunks(text, maxLength) {
        const chunks = [];
        const sentences = text.split(/[.!?]\s+/);
        let currentChunk = '';

        for (const sentence of sentences) {
            if (currentChunk.length + sentence.length > maxLength) {
                chunks.push(currentChunk);
                currentChunk = '';
            }
            currentChunk += sentence + '. ';
        }

        if (currentChunk) {
            chunks.push(currentChunk);
        }

        return chunks;
    }

    async processChunk(text) {
        const completion = await this.openai.chat.completions.create({
            model: this.openaiConfig.model,
            messages: [
                {
                    role: "system",
                    content: "قم بتدقيق النص العربي المأخوذ من مقاطع اليوتيوب وذلك بإصلاح الأخطاء الإملائية، إضافة الحركات على الأحرف عند اللزوم فقط، وإضافة علامات الترقيم. وتقسيم النص الى فقرات حتى يسهل قرائته. من المهم جدًا الحفاظ على النص الأصلي دون تغيير في المحتوى أو الأسلوب."
                },
                {
                    role: "user",
                    content: text
                }
            ],
            temperature: this.openaiConfig.temperature,
            max_tokens: this.openaiConfig.maxTokens,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        });

        return completion.choices[0].message.content;
    }

    createBasicMdxStructure(content, videoTitle) {
        // Add title and wrap paragraphs properly
        return `# ${videoTitle}\n\n${content}`;
    }
}

// CLI interface
if (require.main === module) {
    const [, , inputPath, videoTitle] = process.argv;

    if (!inputPath || !videoTitle) {
        logger.error('Please provide input file path and video title');
        console.log('Usage: node txt-to-mdx-with-sync.js <input-file> "<video-title>"');
        process.exit(1);
    }

    const processor = new ContentProcessor();
    processor.processContent(inputPath, videoTitle)
        .then(outputPath => {
            logger.info('Content processing completed successfully', { outputPath });
        })
        .catch(error => {
            logger.error('Content processing failed', { error: error.message });
            process.exit(1);
        });
}

module.exports = ContentProcessor;