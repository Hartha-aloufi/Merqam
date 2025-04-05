// src/components/exercise/ExerciseForm.tsx
'use client';

import { useState } from 'react';
import { Exercise, UserAnswers, QuizResults } from '@/types/exercise';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExerciseFormProps {
  exercise: Exercise;
}

export default function ExerciseForm({ exercise }: ExerciseFormProps) {
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({
    multiple_choice_answers: Array(exercise.multiple_choice_questions.length).fill(''),
    true_false_answers: Array(exercise.true_false_questions.length).fill(false),
    detailed_answers: Array(exercise.detailed_questions.length).fill(''),
  });

  const [results, setResults] = useState<QuizResults | null>(null);
  const [submitted, setSubmitted] = useState(false);


  const handleMultipleChoiceAnswer = (index: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      multiple_choice_answers: prev.multiple_choice_answers.map((a, i) =>
        i === index ? answer : a
      ),
    }));
  };

  const handleTrueFalseAnswer = (index: number, answer: boolean) => {
    setUserAnswers(prev => ({
      ...prev,
      true_false_answers: prev.true_false_answers.map((a, i) =>
        i === index ? answer : a
      ),
    }));
  };

  const handleDetailedAnswer = (index: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      detailed_answers: prev.detailed_answers.map((a, i) =>
        i === index ? answer : a
      ),
    }));
  };

  const calculateResults = () => {
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

    const totalQuestions = exercise.multiple_choice_questions.length + 
                         exercise.true_false_questions.length;
    
    return {
      multipleChoiceScore: mcScore,
      trueFalseScore: tfScore,
      totalScore: ((mcScore + tfScore) / totalQuestions) * 100,
      incorrectAnswers: {
        multipleChoice: incorrectMC,
        trueFalse: incorrectTF,
      },
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quizResults = calculateResults();
    setResults(quizResults);
    setSubmitted(true);
    };
    
  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {/* Multiple Choice Questions */}
      {exercise.multiple_choice_questions.length > 0 && (
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">أسئلة الاختيار من متعدد</h2>
            <p className="text-muted-foreground">
              اختر الإجابة الصحيحة لكل سؤال
            </p>
          </div>
          <Separator className="my-4" />
          <div className="space-y-8">
            {exercise.multiple_choice_questions.map((q, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="font-bold text-lg text-muted-foreground min-w-[1.5rem]">
                    {index + 1}.
                  </span>
                  <div className="flex-1 space-y-4">
                    <p className="text-lg font-medium">{q.question}</p>
                    <RadioGroup
                      value={userAnswers.multiple_choice_answers[index]}
                      onValueChange={(value) => handleMultipleChoiceAnswer(index, value)}
                      className="space-y-3"
                    >
                      {q.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-3">
                          <RadioGroupItem
                            value={option}
                            id={`q${index}-option${optionIndex}`}
                            disabled={submitted}
                          />
                          <Label 
                            htmlFor={`q${index}-option${optionIndex}`}
                            className="text-base"
                          >
                            {option}
                          </Label>
                          {submitted && option === q.correct_answer && (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-auto" />
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* True/False Questions */}
      {exercise.true_false_questions.length > 0 && (
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">أسئلة صح وخطأ</h2>
            <p className="text-muted-foreground">
              حدد ما إذا كانت العبارة صحيحة أم خاطئة
            </p>
          </div>
          <Separator className="my-4" />
          <div className="space-y-8">
            {exercise.true_false_questions.map((q, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="font-bold text-lg text-muted-foreground min-w-[1.5rem]">
                    {index + 1}.
                  </span>
                  <div className="flex-1 space-y-4">
                    <p className="text-lg font-medium">{q.statement}</p>
                    <RadioGroup
                      value={userAnswers.true_false_answers[index].toString()}
                      onValueChange={(value) => handleTrueFalseAnswer(index, value === 'true')}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem
                          value="true"
                          id={`tf${index}-true`}
                          disabled={submitted}
                        />
                        <Label htmlFor={`tf${index}-true`} className="text-base">صح</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem
                          value="false"
                          id={`tf${index}-false`}
                          disabled={submitted}
                        />
                        <Label htmlFor={`tf${index}-false`} className="text-base">خطأ</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Detailed Questions */}
      {exercise.detailed_questions.length > 0 && (
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">أسئلة تفصيلية</h2>
            <p className="text-muted-foreground">
              أجب على الأسئلة التالية بالتفصيل
            </p>
          </div>
          <Separator className="my-4" />
          <div className="space-y-8">
            {exercise.detailed_questions.map((q, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="font-bold text-lg text-muted-foreground min-w-[1.5rem]">
                    {index + 1}.
                  </span>
                  <div className="flex-1 space-y-4">
                    <p className="text-lg font-medium">{q.question}</p>
                    <Textarea
                      value={userAnswers.detailed_answers[index]}
                      onChange={(e) => handleDetailedAnswer(index, e.target.value)}
                      placeholder="اكتب إجابتك هنا..."
                      className="min-h-[100px] text-base"
                      disabled={submitted}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Results */}
      {results && (
        <section className="rounded-lg bg-muted p-6 space-y-4">
          <h2 className="text-2xl font-semibold">النتائج</h2>
          <div className="space-y-2">
            <p className="text-lg">النتيجة النهائية: {results.totalScore.toFixed(1)}%</p>
            <p>أسئلة الاختيار من متعدد: {results.multipleChoiceScore} من {exercise.multiple_choice_questions.length}</p>
            <p>أسئلة صح وخطأ: {results.trueFalseScore} من {exercise.true_false_questions.length}</p>
          </div>
        </section>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full text-lg py-6"
        disabled={submitted}
      >
        {submitted ? 'تم التسليم' : 'تسليم الإجابات'}
      </Button>
    </form>
  );
}