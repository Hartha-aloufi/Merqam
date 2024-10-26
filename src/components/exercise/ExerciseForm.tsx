// src/components/exercise/ExerciseForm.tsx
'use client';

import { useState } from 'react';
import { Exercise, UserAnswers, QuizResults } from '@/types/exercise';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { calculateExerciseResults } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { Textarea } from "@/components/ui/textarea";

// ... previous imports remain the same ...

export default function ExerciseForm({ exercise }: { exercise: Exercise }) {
 const [userAnswers, setUserAnswers] = useState<UserAnswers>({
    multiple_choice_answers: Array(exercise.multiple_choice_questions.length).fill(''),
    true_false_answers: Array(exercise.true_false_questions.length).fill(false),
    detailed_answers: Array(exercise.detailed_questions.length).fill(''),
  });
  const [results, setResults] = useState<QuizResults | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quizResults = calculateExerciseResults(exercise, userAnswers);
    setResults(quizResults);
    setSubmitted(true);

    if (quizResults.totalScore >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };
  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
{/* Results Summary */}
      {submitted && results && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border rounded-lg overflow-hidden"
        >
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-2">النتيجة النهائية</h3>
            <div className="text-4xl font-bold text-primary mb-4">
              {results.totalScore.toFixed(1)}%
            </div>
            <Progress value={results.totalScore} className="h-2" />
          </div>
        </motion.div>
      )}      
      {/* Multiple Choice Questions */}
      {exercise.multiple_choice_questions.length > 0 && (
        <div className="space-y-8">
          <h2 className="text-xl font-semibold">أسئلة الاختيار من متعدد</h2>
           {exercise.multiple_choice_questions.map((question, qIndex) => (
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: qIndex * 0.1 }}
            className={cn(
              "bg-card border rounded-lg overflow-hidden",
              submitted && "ring-2",
              submitted && userAnswers.multiple_choice_answers[qIndex] === question.correct_answer 
                ? "ring-green-500/30" 
                : submitted ? "ring-red-500/30" : "ring-transparent"
            )}
          >
            <div className="p-6">
              <h3 className="text-lg font-medium mb-6">
                {qIndex + 1}. {question.question}
              </h3>
              
              <div className="space-y-3">
                {question.options.map((option, oIndex) => {
                  const isSelected = userAnswers.multiple_choice_answers[qIndex] === option;
                  const isCorrect = option === question.correct_answer;

                  return (
                    <motion.div
                      key={oIndex}
                      whileHover={!submitted ? { x: 8 } : {}}
                      className="relative"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (!submitted) {
                            const newAnswers = [...userAnswers.multiple_choice_answers];
                            newAnswers[qIndex] = option;
                            setUserAnswers({ ...userAnswers, multiple_choice_answers: newAnswers });
                          }
                        }}
                        disabled={submitted}
                        className={cn(
                          "w-full text-right px-4 py-3 rounded-md transition-all",
                          "flex items-center justify-between group",
                          !submitted && "hover:bg-accent",
                          isSelected && !submitted && "bg-primary/10 text-primary",
                          submitted && isCorrect && "bg-green-500/10 text-green-600",
                          submitted && isSelected && !isCorrect && "bg-red-500/10 text-red-600",
                          submitted && !isSelected && "opacity-50"
                        )}
                      >
                        <span>{option}</span>
                        <AnimatePresence mode="wait">
                          {submitted && (isSelected || isCorrect) && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className={cn(
                                "flex items-center gap-2",
                                isCorrect ? "text-green-600" : "text-red-600"
                              )}
                            >
                              {isCorrect ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : (
                                <XCircle className="h-5 w-5" />
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>

                      {/* Feedback line */}
                      {submitted && (isSelected || isCorrect) && (
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          className={cn(
                            "absolute left-0 top-0 h-full w-1 origin-left",
                            isCorrect ? "bg-green-500" : "bg-red-500"
                          )}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Answer Feedback */}
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className={cn(
                    "mt-4 p-4 rounded-md",
                    userAnswers.multiple_choice_answers[qIndex] === question.correct_answer
                      ? "bg-green-500/10 text-green-600"
                      : "bg-red-500/10 text-red-600"
                  )}
                >
                  {userAnswers.multiple_choice_answers[qIndex] === question.correct_answer ? (
                    "إجابة صحيحة! أحسنت"
                  ) : (
                    `الإجابة الصحيحة هي: ${question.correct_answer}`
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
        </div>
      )}

      {/* True/False Questions */}
      {exercise.true_false_questions.length > 0 && (
        <div className="space-y-8">
          <h2 className="text-xl font-semibold">أسئلة صح وخطأ</h2>
          {exercise.true_false_questions.map((question, qIndex) => (
            <motion.div
              key={qIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qIndex * 0.1 }}
              className={cn(
                "bg-card border rounded-lg overflow-hidden",
                submitted && "ring-2",
                submitted && userAnswers.true_false_answers[qIndex] === question.answer
                  ? "ring-green-500/30"
                  : submitted ? "ring-red-500/30" : "ring-transparent"
              )}
            >
              <div className="p-6">
                <h3 className="text-lg font-medium mb-6">
                  {qIndex + 1}. {question.statement}
                </h3>

                <div className="space-y-3">
                  {[true, false].map((value) => {
                    const isSelected = userAnswers.true_false_answers[qIndex] === value;
                    const isCorrect = value === question.answer;

                    return (
                      <motion.div
                        key={value.toString()}
                        whileHover={!submitted ? { x: 8 } : {}}
                        className="relative"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (!submitted) {
                              const newAnswers = [...userAnswers.true_false_answers];
                              newAnswers[qIndex] = value;
                              setUserAnswers({ ...userAnswers, true_false_answers: newAnswers });
                            }
                          }}
                          disabled={submitted}
                          className={cn(
                            "w-full text-right px-4 py-3 rounded-md transition-all",
                            "flex items-center justify-between group",
                            !submitted && "hover:bg-accent",
                            isSelected && !submitted && "bg-primary/10 text-primary",
                            submitted && isCorrect && "bg-green-500/10 text-green-600",
                            submitted && isSelected && !isCorrect && "bg-red-500/10 text-red-600",
                            submitted && !isSelected && "opacity-50"
                          )}
                        >
                          <span>{value ? "صح" : "خطأ"}</span>
                          <AnimatePresence mode="wait">
                            {submitted && (isSelected || isCorrect) && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className={cn(
                                  "flex items-center gap-2",
                                  isCorrect ? "text-green-600" : "text-red-600"
                                )}
                              >
                                {isCorrect ? (
                                  <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                  <XCircle className="h-5 w-5" />
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </button>

                        {/* Feedback line */}
                        {submitted && (isSelected || isCorrect) && (
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            className={cn(
                              "absolute left-0 top-0 h-full w-1 origin-left",
                              isCorrect ? "bg-green-500" : "bg-red-500"
                            )}
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Answer Feedback */}
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className={cn(
                      "mt-4 p-4 rounded-md",
                      userAnswers.true_false_answers[qIndex] === question.answer
                        ? "bg-green-500/10 text-green-600"
                        : "bg-red-500/10 text-red-600"
                    )}
                  >
                    {userAnswers.true_false_answers[qIndex] === question.answer
                      ? "إجابة صحيحة! أحسنت"
                      : `الإجابة الصحيحة هي: ${question.answer ? "صح" : "خطأ"}`}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detailed Questions */}
      {exercise.detailed_questions.length > 0 && (
        <div className="space-y-8">
          <h2 className="text-xl font-semibold">أسئلة تفصيلية</h2>
          {exercise.detailed_questions.map((question, qIndex) => (
            <motion.div
              key={qIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qIndex * 0.1 }}
              className="bg-card border rounded-lg overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-lg font-medium mb-6">
                  {qIndex + 1}. {question.question}
                </h3>

                <Textarea
                  value={userAnswers.detailed_answers[qIndex]}
                  onChange={(e) => {
                    const newAnswers = [...userAnswers.detailed_answers];
                    newAnswers[qIndex] = e.target.value;
                    setUserAnswers({ ...userAnswers, detailed_answers: newAnswers });
                  }}
                  placeholder="اكتب إجابتك هنا..."
                  className="min-h-[120px] resize-y"
                  disabled={submitted}
                />

                {/* Show model answer after submission */}
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 p-4 rounded-md bg-blue-500/10 text-blue-600"
                  >
                    <h4 className="font-medium mb-2">الإجابة النموذجية:</h4>
                    <p>{question.answer}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Submit Button */}
      <motion.div layout>
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={submitted}
        >
          {submitted ? 'تم التسليم' : 'تسليم الإجابات'}
        </Button>
      </motion.div>
    </form>
  );
}