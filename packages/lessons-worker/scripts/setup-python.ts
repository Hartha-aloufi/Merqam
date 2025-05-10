import { execSync } from 'child_process';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pythonProjectPath = path.join(
	__dirname,
	'..',
	'src',
	'lib',
	'generate-youtube-srt'
);

// Get the user's home directory and construct the path to pyinstaller
const userScriptsPath = path.join(
	os.homedir(),
	'AppData',
	'Roaming',
	'Python',
	'Python313',
	'Scripts'
);
const pyinstallerPath = path.join(userScriptsPath, 'pyinstaller.exe');

try {
	console.log('Installing Python dependencies...');
	execSync(`cd "${pythonProjectPath}" && pip install -r requirements.txt`, {
		stdio: 'inherit',
	});

	console.log('Building Python binary...');
	execSync(
		`cd "${pythonProjectPath}" && "${pyinstallerPath}" --onefile main.py --distpath ./dist --workpath ./build --specpath ./build`,
		{ stdio: 'inherit' }
	);

	console.log('Python setup completed successfully!');
} catch (error) {
	console.error('Error during Python setup:', error);
	process.exit(1);
}
