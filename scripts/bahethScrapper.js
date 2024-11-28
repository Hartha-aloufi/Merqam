const puppeteer = require('puppeteer');
const fs = require('fs/promises');
const path = require('path');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

async function extractVideoId(page) {
    logger.info('Attempting to extract video ID');
    return page.evaluate(() => {
        const videoFrame = document.querySelector('iframe[src*="youtube-nocookie.com"]') ||
            document.querySelector('iframe[src*="youtube.com"]');
        if (!videoFrame) return null;

        const srcUrl = videoFrame.src;
        const match = srcUrl.match(/(?:embed|v|vi|youtu\.be)\/([^?&"'>]+)/);
        return match ? match[1] : null;
    }).then(videoId => {
        if (videoId) {
            logger.info(`Video ID extracted: ${videoId}`);
        } else {
            logger.warn('Failed to extract video ID');
        }
        return videoId;
    });
}

async function setupDownloadListener(page, outputPath) {
    logger.debug(`Setting up download listener for: ${outputPath}`);
    await page._client().send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: path.dirname(outputPath)
    });
}

async function downloadTranscript(page, format, outputPath) {
    logger.info(`Downloading ${format} transcript to ${outputPath}`);
    try {
        await setupDownloadListener(page, outputPath);

        await page.evaluate((format) => {
            const link = document.querySelector(`a[href*="download_transcription_in_${format}"]`);
            if (link) link.click();
        }, format);

        await new Promise(r => setTimeout(r, 3000));
        logger.info(`Successfully downloaded ${format} transcript`);
    } catch (error) {
        logger.error(`Failed to download ${format} transcript`, { error: error.message });
        throw error;
    }
}

async function scrapeTranscript(url) {
    logger.info(`Starting transcript scrape for URL: ${url}`);
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        logger.debug('Browser launched successfully');
        const page = await browser.newPage();

        logger.info('Navigating to page');
        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        const videoId = await extractVideoId(page);
        if (!videoId) {
            throw new Error('Could not find YouTube video ID');
        }

        const outputDir = path.join(__dirname, 'downloads', videoId);
        await fs.mkdir(outputDir, { recursive: true });
        logger.debug(`Created output directory: ${outputDir}`);

        const txtPath = path.join(outputDir, `${videoId}.txt`);
        const srtPath = path.join(outputDir, `${videoId}.srt`);

        await downloadTranscript(page, 'txt', txtPath);
        await downloadTranscript(page, 'srt', srtPath);

        await browser.close();
        logger.info('Scraping completed successfully');

        return {
            videoId,
            files: {
                txt: txtPath,
                srt: srtPath
            },
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        logger.error('Scraping failed', {
            error: error.message,
            stack: error.stack
        });
        await browser.close();
        throw error;
    }
}

// CLI interface
if (require.main === module) {
    const url = process.argv[2];
    if (!url) {
        logger.error('No URL provided');
        process.exit(1);
    }

    scrapeTranscript(url)
        .then(result => {
            logger.info('Script completed successfully', { result });
            console.log(JSON.stringify(result, null, 2));
        })
        .catch(error => {
            logger.error('Script failed', { error: error.message });
            process.exit(1);
        });
}

module.exports = scrapeTranscript;