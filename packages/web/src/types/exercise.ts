// src/types/exercise.ts
export interface MultipleChoiceQuestion {
    question: string;
    options: string[];
    correct_answer: string;
}

export interface TrueFalseQuestion {
    statement: string;
    answer: boolean;
}

export interface DetailedQuestion {
    question: string;
    answer: string;
}

export interface Exercise {
    multiple_choice_questions: MultipleChoiceQuestion[];
    true_false_questions: TrueFalseQuestion[];
    detailed_questions: DetailedQuestion[];
}

export interface UserAnswers {
    multiple_choice_answers: string[];
    true_false_answers: boolean[];
    detailed_answers: string[];
}

export interface QuizResults {
    multipleChoiceScore: number;
    trueFalseScore: number;
    totalScore: number;
    incorrectAnswers: {
        multipleChoice: number[];
        trueFalse: number[];
    };
    detail: {
        total: number;
        correct: number;
        mcTotal: number;
        mcCorrect: number;
        tfTotal: number;
        tfCorrect: number;
    };
}