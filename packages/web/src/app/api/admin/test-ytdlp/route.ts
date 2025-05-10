import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
	try {
		// Test if yt-dlp is installed
		const { stdout } = await execAsync('yt-dlp --version');

		return NextResponse.json({
			status: 'success',
			message: 'yt-dlp is installed',
			version: stdout.trim(),
		});
	} catch (error) {
		console.error('Error checking for yt-dlp:', error);
		return NextResponse.json(
			{
				status: 'error',
				message:
					'yt-dlp is not installed or not accessible. Please install yt-dlp first.',
				error: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}
