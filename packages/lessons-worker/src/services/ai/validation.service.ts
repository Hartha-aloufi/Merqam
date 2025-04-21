import { logger } from '../../lib/txt-to-mdx/scrapers/logger';

const validationConfig = {
	minSimilarity: 0.6,
	minParagraphLength: 50,
	maxParagraphLength: 700,
	minResponseLengthRatio: 0.5,
} as const;

export const validateAIResponse = (content: string, response: string) => {
	return (
		validateResponseLength(content, response) &&
		validateParagraphsSize(response)
	);
	// validateResponsesCleanliness(content, response)
};

const validateResponseLength = (content: string, response: string) => {
	if (
		response.length <
		content.length * validationConfig.minResponseLengthRatio
	) {
		logger.warn(
			`Suspiciously short response: ${JSON.stringify({
				inputLength: content.length,
				outputLength: response?.length,
			})}`
		);
		return false;
	}
	return true;
};

/**
 * Validate the size of the paragraphs in the response.
 * Min size is 50 characters.
 * Max size is 500 characters.
 * @param response - The response from the AI
 * @returns true if the response is valid, false otherwise
 */
const validateParagraphsSize = (response: string) => {
	const paragraphs = response.split('\n\n');
	for (const paragraph of paragraphs) {
		if (
			paragraph.length < validationConfig.minParagraphLength ||
			paragraph.length > validationConfig.maxParagraphLength
		) {
			logger.warn(
				`Suspiciously short or long paragraph: ${JSON.stringify({
					paragraphLength: paragraph.length,
				})}`
			);
			return false;
		}
	}
	return true;
};

/**
 * the similarity of the first 500 and last 500 characters of the response
 * should be more than 60%
 * @param content
 * @param response
 */
const validateResponsesCleanliness = (content: string, response: string) => {
	const first500 = response.slice(0, 500);
	const last500 = response.slice(-500);
	const similarity = calculateSimilarity(first500, content);
	if (similarity < validationConfig.minSimilarity) {
		logger.warn(
			`Suspiciously low similarity between first  500 characters: ${JSON.stringify(
				{
					similarity,
				}
			)}`
		);
		return false;
	}

	const similarity2 = calculateSimilarity(last500, content);
	if (similarity2 < validationConfig.minSimilarity) {
		logger.warn(
			`Suspiciously low similarity between last 500 characters: ${JSON.stringify(
				{
					similarity: similarity2,
				}
			)}`
		);
		return false;
	}
	return true;
};

const calculateSimilarity = (text1: string, text2: string) => {
	const words1 = text1.split(' ');
	const words2 = text2.split(' ');
	const commonWords = words1.filter((word) => words2.includes(word));
	return commonWords.length / words1.length;
};
