// src/lib/utils.ts (client-side utilities)
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Exercise, UserAnswers, QuizResults } from '@/types/exercise';
import { Tajawal } from 'next/font/google';
import { Noto_Naskh_Arabic } from 'next/font/google';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Format time in MM:SS format
 */
export const formatTime = (seconds: number): string => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export function calculateExerciseResults(
	exercise: Exercise,
	userAnswers: UserAnswers
): QuizResults {
	const incorrectMC: number[] = [];
	const incorrectTF: number[] = [];

	let mcScore = 0;
	exercise.multiple_choice_questions.forEach((q, i) => {
		if (q.correct_answer === userAnswers.multiple_choice_answers[i]) {
			mcScore++;
		} else {
			incorrectMC.push(i);
		}
	});

	let tfScore = 0;
	exercise.true_false_questions.forEach((q, i) => {
		if (q.answer === userAnswers.true_false_answers[i]) {
			tfScore++;
		} else {
			incorrectTF.push(i);
		}
	});

	const mcTotal = exercise.multiple_choice_questions.length;
	const tfTotal = exercise.true_false_questions.length;
	const totalQuestions = mcTotal + tfTotal;

	const totalScore =
		totalQuestions > 0 ? ((mcScore + tfScore) / totalQuestions) * 100 : 100;

	return {
		multipleChoiceScore: mcScore,
		trueFalseScore: tfScore,
		totalScore,
		incorrectAnswers: {
			multipleChoice: incorrectMC,
			trueFalse: incorrectTF,
		},
		detail: {
			total: totalQuestions,
			correct: mcScore + tfScore,
			mcTotal,
			mcCorrect: mcScore,
			tfTotal,
			tfCorrect: tfScore,
		},
	};
}

export function calculateReadingTime(text: string): number {
	// Average reading speed (words per minute) - can be adjusted
	const WORDS_PER_MINUTE = 200;

	// Count words considering Arabic text
	const wordCount = text
		.trim()
		.split(/\s+/)
		.filter((word) => word.length > 0).length;

	// Calculate reading time in minutes
	const readingTime = Math.ceil(wordCount / WORDS_PER_MINUTE);

	// Return at least 1 minute
	return Math.max(1, readingTime);
}

const lessonProgressKey = 'lesson-progress';

export const setLessonProgress = (
	lessonId: string,
	progressInfo: { paragraphIndex: number; date: string }
) => {
	const data = localStorage.getItem(lessonProgressKey);
	const progress = data ? JSON.parse(data) : {};
	const lessonKey = `${lessonId}`;
	progress[lessonKey] = progressInfo;

	localStorage.setItem(lessonProgressKey, JSON.stringify(progress));
};

export const getLessonProgress = (lessonId: string): number => {
	const data = localStorage.getItem(lessonProgressKey);
	const progress = data ? JSON.parse(data) : {};
	const lessonKey = `${lessonId}`;

	return progress[lessonKey]?.paragraphIndex ?? 0;
};


export const tajawal = Tajawal({
	subsets: ['arabic'],
	weight: ['200', '300', '400', '500', '700', '800', '900'],
});

// For user entered Arabic text
export const NotoNaskhArabic = Noto_Naskh_Arabic({
	subsets: ['arabic'],
	weight: ['400', '500'],
});
