import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test video ID from the YouTube URL
const videoId = 'yB1WtN6Kzqw';
const outputDir = path.join(__dirname, 'test-output');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir, { recursive: true });
}

// Path to the built binary
const binaryPath = path.join(
	__dirname,
	'dist',
	process.platform === 'win32' ? 'main.exe' : 'main'
);

try {
	console.log('Starting subtitle download test...');
	console.log('Video ID:', videoId);
	console.log('Output directory:', outputDir);
	console.log('Binary path:', binaryPath);

	// Execute the binary
	execSync(`"${binaryPath}" ${videoId} "${outputDir}"`, { stdio: 'inherit' });

	// Verify the output files
	const srtPath = path.join(outputDir, `${videoId}.srt`);
	const txtPath = path.join(outputDir, `${videoId}.txt`);

	if (fs.existsSync(srtPath) && fs.existsSync(txtPath)) {
		console.log('\nTest successful! Files created:');
		console.log('- SRT file:', srtPath);
		console.log('- TXT file:', txtPath);

		// Print first few lines of each file
		console.log('\nFirst few lines of SRT file:');
		console.log(
			fs.readFileSync(srtPath, 'utf8').split('\n').slice(0, 10).join('\n')
		);

		console.log('\nFirst few lines of TXT file:');
		console.log(
			fs.readFileSync(txtPath, 'utf8').split('\n').slice(0, 5).join('\n')
		);
	} else {
		throw new Error('Output files not found');
	}
} catch (error) {
	console.error('Test failed:', error);
	process.exit(1);
}
