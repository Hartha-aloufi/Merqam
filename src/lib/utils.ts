// src/lib/utils.ts (client-side utilities)
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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