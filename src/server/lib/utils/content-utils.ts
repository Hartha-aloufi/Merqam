import path from "path";
import fs from 'fs/promises';

export const getRemoteLessonUrl = (contentKey: string) => {
	// read BLOB_URL from env
	return (
		process.env.STORAGE_ROOT_URL +
		'/' +
		contentKey.replaceAll('\\', '/')
	);
};

export const getLocalLessonUrl = (contentKey: string) => {
	if (typeof process.env.STORAGE_ROOT_URL !== 'string') {
		throw new Error('STORAGE_ROOT_URL is not defined');
	}

	return path.join(process.env.STORAGE_ROOT_URL, contentKey);
}

export const getLessonContent = async (contentKey: string) => {
	// read from local file if we are in the dev environment
	if (process.env.NODE_ENV === 'development') {
		const filePath = getLocalLessonUrl(contentKey);
		return fs.readFile(filePath, 'utf-8');
	}
	else {
		// download content from downloadUrl
		const response = await fetch(getRemoteLessonUrl(contentKey));
		return response.text();
	}
}