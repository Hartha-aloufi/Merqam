'use server';

export async function downloadTranscription(url: string): Promise<string> {
	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(
				`Failed to download transcription: ${response.statusText}`
			);
		}

		return await response.text();
	} catch (error) {
		console.error('Error downloading transcription:', error);
		return 'عذراً، حدث خطأ أثناء تحميل محتوى الدرس';
	}
}
