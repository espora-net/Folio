'use client';

import { useEffect, useState } from 'react';
import { FileText, CheckCircle2, XCircle } from 'lucide-react';
import { DocumentReferenceCard } from '@/components/DocumentReference';
import type { TestQuestion } from '@/types';

interface Answer {
  questionId: string;
  selectedAnswer: number;
}

export default function TestPage() {
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/tests');
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (optionIndex: number) => {
    setSelectedAnswer(optionIndex);
  };

  const handleConfirmAnswer = () => {
    if (selectedAnswer === null) return;

    const newAnswer: Answer = {
      questionId: questions[currentQuestionIndex].id,
      selectedAnswer,
    };

    setAnswers([...answers, newAnswer]);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setTestCompleted(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer) => {
      const question = questions.find((q) => q.id === answer.questionId);
      if (question && answer.selectedAnswer === question.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const restartTest = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setTestCompleted(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Cargando...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-orange-400" />
            <h1 className="text-3xl font-bold">Test</h1>
          </div>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
          <p className="text-zinc-500">No hay preguntas disponibles</p>
        </div>
      </div>
    );
  }

  if (testCompleted) {
    const score = calculateScore();
    const percentage = (score / questions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-orange-400" />
            <h1 className="text-3xl font-bold">Test Completado</h1>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center mb-6">
          <div className="text-6xl font-bold mb-4">
            {percentage.toFixed(0)}%
          </div>
          <p className="text-xl text-zinc-400 mb-2">
            {score} de {questions.length} correctas
          </p>
          <p className="text-zinc-500">
            {percentage >= 80 ? '¡Excelente trabajo! 🎉' :
             percentage >= 60 ? '¡Bien hecho! 👍' :
             'Sigue practicando 💪'}
          </p>
        </div>

        <button
          onClick={restartTest}
          className="w-full py-4 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-xl transition-all font-medium"
        >
          Hacer otro test
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = showResult && selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-orange-400" />
          <h1 className="text-3xl font-bold">Test</h1>
        </div>
        <p className="text-zinc-400">
          Pregunta {currentQuestionIndex + 1} de {questions.length}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-orange-500 transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 mb-6">
        <h2 className="text-xl font-medium mb-6">{currentQuestion.question}</h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !showResult && handleSelectAnswer(index)}
              disabled={showResult}
              className={`w-full p-4 text-left rounded-lg border transition-all ${
                showResult
                  ? index === currentQuestion.correctAnswer
                    ? 'bg-green-500/10 border-green-500 text-green-400'
                    : index === selectedAnswer
                    ? 'bg-red-500/10 border-red-500 text-red-400'
                    : 'bg-zinc-800/30 border-zinc-800 text-zinc-500'
                  : selectedAnswer === index
                  ? 'bg-orange-500/10 border-orange-500 text-white'
                  : 'bg-zinc-800/30 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-sm font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
                {showResult && index === currentQuestion.correctAnswer && (
                  <CheckCircle2 className="w-5 h-5 ml-auto" />
                )}
                {showResult && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                  <XCircle className="w-5 h-5 ml-auto" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Explanation */}
      {showResult && currentQuestion.explanation && (
        <div className={`p-4 rounded-lg mb-6 ${
          isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
        }`}>
          <div className="text-sm font-medium mb-2">
            {isCorrect ? '✓ Correcto' : '✗ Incorrecto'}
          </div>
          <p className="text-sm text-zinc-300">{currentQuestion.explanation}</p>
        </div>
      )}

      {/* Document reference */}
      {showResult && currentQuestion.source && (
        <DocumentReferenceCard reference={currentQuestion.source} />
      )}

      {/* Action buttons */}
      <div className="flex gap-4">
        {!showResult ? (
          <button
            onClick={handleConfirmAnswer}
            disabled={selectedAnswer === null}
            className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl transition-all font-medium"
          >
            Confirmar respuesta
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all font-medium"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Siguiente pregunta' : 'Ver resultados'}
          </button>
        )}
      </div>
    </div>
  );
}
