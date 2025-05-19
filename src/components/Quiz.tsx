import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { QuizQuestion } from '@/types/financial';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
  onClose: () => void;
}

const Quiz = ({ questions, onComplete, onClose }: QuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setShowExplanation(true);
    
    if (answer === questions[currentQuestion].answer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsComplete(true);
      const finalScore = ((score / questions.length) * 100);
      onComplete(finalScore);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-y-auto"
    >
      <div className="container max-w-2xl mx-auto p-4">
        <Card className="relative">
          <CardHeader>
            <CardTitle>Quiz</CardTitle>
            <CardDescription>
              Question {currentQuestion + 1} of {questions.length}
            </CardDescription>
            <Progress value={progress} className="mt-2" />
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              {!isComplete ? (
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-medium">
                    {questions[currentQuestion].question}
                  </h3>

                  <div className="space-y-3">
                    {questions[currentQuestion].options.map((option, index) => (
                      <Button
                        key={index}
                        variant={selectedAnswer === option ? "default" : "outline"}
                        className={`w-full justify-start ${
                          showExplanation
                            ? option === questions[currentQuestion].answer
                              ? "bg-green-500/20 border-green-500"
                              : selectedAnswer === option
                              ? "bg-red-500/20 border-red-500"
                              : ""
                            : ""
                        }`}
                        onClick={() => !showExplanation && handleAnswerSelect(option)}
                        disabled={showExplanation}
                      >
                        {showExplanation && option === questions[currentQuestion].answer && (
                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        )}
                        {showExplanation && selectedAnswer === option && option !== questions[currentQuestion].answer && (
                          <XCircle className="mr-2 h-4 w-4 text-red-500" />
                        )}
                        {option}
                      </Button>
                    ))}
                  </div>

                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 p-4 bg-muted rounded-lg"
                    >
                      <p className="text-sm">{questions[currentQuestion].explanation}</p>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <h3 className="text-2xl font-bold mb-4">Quiz Complete!</h3>
                  <p className="text-lg mb-6">
                    Your Score: {((score / questions.length) * 100).toFixed(0)}%
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={onClose}>
                      Close
                    </Button>
                    <Button onClick={() => {
                      setCurrentQuestion(0);
                      setSelectedAnswer(null);
                      setShowExplanation(false);
                      setScore(0);
                      setIsComplete(false);
                    }}>
                      Retry Quiz
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          {!isComplete && showExplanation && (
            <CardFooter>
              <Button className="w-full" onClick={handleNext}>
                {currentQuestion < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </motion.div>
  );
};

export default Quiz; 