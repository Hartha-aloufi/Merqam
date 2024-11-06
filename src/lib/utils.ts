// src/lib/utils.ts (client-side utilities)
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Exercise, UserAnswers, QuizResults } from '@/types/exercise';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateExerciseScore(userAnswers: string[], correctAnswers: string[]): number {
  return userAnswers.reduce((score, answer, index) =>
    answer === correctAnswers[index] ? score + 1 : score, 0);
}

export function formatScore(score: number, total: number): string {
  return `${((score / total) * 100).toFixed(1)}%`;
}


export function calculateExerciseResults(exercise: Exercise, userAnswers: UserAnswers): QuizResults {
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

  const totalScore = totalQuestions > 0
    ? ((mcScore + tfScore) / totalQuestions) * 100
    : 100;

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
    }
  };
}

export function calculateReadingTime(text: string): number {
  // Average reading speed (words per minute) - can be adjusted
  const WORDS_PER_MINUTE = 200;

  // Count words considering Arabic text
  const wordCount = text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;

  // Calculate reading time in minutes
  const readingTime = Math.ceil(wordCount / WORDS_PER_MINUTE);

  // Return at least 1 minute
  return Math.max(1, readingTime);
}

const debounce = (fn: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

const lessonProgressKey = "lesson-progress";

export const setLessonProgress = (topicId: string, lessonId: string, progressInfo: { paragraphIndex: number, date: string }) => {
  const data = localStorage.getItem(lessonProgressKey);
  const progress = data ? JSON.parse(data) : {};
  const lessonKey = `${topicId}:${lessonId}`;
  progress[lessonKey] = progressInfo;

  localStorage.setItem(lessonProgressKey, JSON.stringify(progress));
}

export const getLessonProgress = (topicId: string, lessonId: string): number => {
  const data = localStorage.getItem(lessonProgressKey);
  const progress = data ? JSON.parse(data) : {};
  const lessonKey = `${topicId}:${lessonId}`;

  return progress[lessonKey]?.paragraphIndex ?? 0;
}

export function convertToSeconds(timeStr: string, floor = true) {
  const [hours, minutes, secondsMillis] = timeStr.split(':');
  const [seconds, millis] = secondsMillis.split(',');

  const totalSeconds =
    parseInt(hours, 10) * 3600 +
    parseInt(minutes, 10) * 60 +
    parseInt(seconds, 10) +
    parseInt(millis, 10) / 1000;

  if (floor) {
    return Math.floor(totalSeconds);
  }
  return Math.ceil(totalSeconds);
}