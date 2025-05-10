import path from 'path';
import fs from 'fs/promises';
import os from 'os';
const platform = os.platform();

export const getRemoteLessonUrl = (contentKey: string) => {
	// read BLOB_URL from env
	return (
		process.env.STORAGE_ROOT_URL + '/' + contentKey.replaceAll('\\', '/')
	);
};

export const getLocalLessonUrl = (contentKey: string) => {
	if (typeof process.env.STORAGE_ROOT_URL !== 'string') {
		throw new Error('STORAGE_ROOT_URL is not defined');
	}

	return path.join(process.env.STORAGE_ROOT_URL, contentKey);
};

export const getLessonContent = async (contentKey: string) => {
	let fixedContentKey = contentKey;
	if (platform !== 'win32') {
		fixedContentKey = contentKey.replaceAll('\\', '/');
	}

	// read from local file if we are in the dev environment
	if (!process.env.STORAGE_ROOT_URL?.includes("https")) {
		try {
			const filePath = getLocalLessonUrl(fixedContentKey);
			console.log("Reading from local file", filePath);
			return await fs.readFile(filePath, 'utf-8');
		} catch (error) {
			console.error(
				`Error reading local lesson content for ${contentKey}:`,
				error
			);
			throw error;
		}
	} else {
		// download content from downloadUrl
		try {
			console.log("Downloading content from remote URL", getRemoteLessonUrl(contentKey));
			const response = await fetch(getRemoteLessonUrl(contentKey));
			if (!response.ok) {
				throw new Error(
					`Failed to fetch content: ${response.status} ${response.statusText}`
				);
			}
			return response.text();
		} catch (error) {
			console.error(
				`Error fetching lesson content for ${contentKey}:`,
				error
			);
			throw error;
		}
	}
};
