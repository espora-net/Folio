'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Play, CheckCircle, XCircle, Trophy, RotateCcw, Clock, Maximize, Minimize, AlertTriangle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TestQuestion, Topic, getQuestions, getTopics } from '@/lib/storage';
import { getConvocatoriaDescriptors, getTopicIdsInConvocatoria, type ConvocatoriaDescriptor } from '@/lib/data-api';
import { selectProportionalQuestions } from '@/lib/question-selector';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { type ExamConfig } from '@/lib/data-types';

type ExamPhase = 'setup' | 'running' | 'review' | 'results';

interface ExamAnswer {
  questionIndex: number;
  selectedAnswer: number | null; // null = en blanco
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const SimulatedExam = () => {
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [allConvocatorias, setAllConvocatorias] = useState<ConvocatoriaDescriptor[]>([]);
  const [selectedConvocatoria, setSelectedConvocatoria] = useState<ConvocatoriaDescriptor | null>(null);
  const [examPhase, setExamPhase] = useState<ExamPhase>('setup');
  const [examQuestions, setExamQuestions] = useState<TestQuestion[]>([]);
  const [answers, setAnswers] = useState<ExamAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [displayMode, setDisplayMode] = useState<'fullscreen' | 'window'>('window');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Cargar datos
  useEffect(() => {
    const loadData = () => {
      setQuestions(getQuestions());
      setTopics(getTopics());
      const convocatorias = getConvocatoriaDescriptors();
      // Solo mostrar convocatorias con examConfig
      setAllConvocatorias(convocatorias.filter(c => c.examConfig));
    };
    loadData();
    window.addEventListener('folio-data-updated', loadData);
    return () => window.removeEventListener('folio-data-updated', loadData);
  }, []);

  // Auto-select first convocatoria with exam config
  useEffect(() => {
    if (allConvocatorias.length > 0 && !selectedConvocatoria) {
      setSelectedConvocatoria(allConvocatorias[0]);
    }
  }, [allConvocatorias, selectedConvocatoria]);

  const examConfig: ExamConfig | undefined = selectedConvocatoria?.examConfig;

  // Get filtered questions for the selected convocatoria
  const availableQuestions = useMemo(() => {
    if (!selectedConvocatoria) return [];
    const topicIds = getTopicIdsInConvocatoria(topics, selectedConvocatoria.id);
    if (!topicIds || topicIds.length === 0) return questions;
    const topicIdSet = new Set(topicIds);
    return questions.filter(q => topicIdSet.has(q.topicId));
  }, [questions, topics, selectedConvocatoria]);

  const finishExam = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setExamPhase('results');
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const finishExamRef = useRef(finishExam);
  finishExamRef.current = finishExam;

  // Timer
  useEffect(() => {
    if (examPhase === 'running' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            finishExamRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // Only re-run when exam phase changes (not on every tick)
  }, [examPhase]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo activar pantalla completa.', variant: 'destructive' });
    }
  }, [toast]);

  const startExam = () => {
    if (!examConfig || !selectedConvocatoria) {
      toast({ title: 'Sin configuración', description: 'Selecciona una convocatoria con configuración de examen.', variant: 'destructive' });
      return;
    }

    const numQuestions = examConfig.numQuestions + (examConfig.numReserve || 0);

    if (availableQuestions.length < numQuestions) {
      toast({
        title: 'Preguntas insuficientes',
        description: `Se necesitan ${numQuestions} preguntas pero solo hay ${availableQuestions.length} disponibles. Se usarán todas las disponibles.`,
      });
    }

    const count = Math.min(numQuestions, availableQuestions.length);
    const selected = selectProportionalQuestions(availableQuestions, count);

    setExamQuestions(selected);
    setAnswers(selected.map((_, i) => ({ questionIndex: i, selectedAnswer: null })));
    setCurrentIndex(0);
    setTimeRemaining(examConfig.durationMinutes * 60);
    setExamPhase('running');

    if (displayMode === 'fullscreen') {
      setTimeout(() => toggleFullscreen(), 100);
    }
  };

  const goToReview = () => {
    setExamPhase('review');
  };

  const backToResults = () => {
    setExamPhase('results');
  };

  const resetExam = () => {
    setExamPhase('setup');
    setExamQuestions([]);
    setAnswers([]);
    setCurrentIndex(0);
    setTimeRemaining(0);
  };

  const selectAnswer = (answerIndex: number) => {
    setAnswers(prev => {
      const updated = [...prev];
      // Toggle: si ya está seleccionada, deseleccionar (dejar en blanco)
      if (updated[currentIndex].selectedAnswer === answerIndex) {
        updated[currentIndex] = { ...updated[currentIndex], selectedAnswer: null };
      } else {
        updated[currentIndex] = { ...updated[currentIndex], selectedAnswer: answerIndex };
      }
      return updated;
    });
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
  };

  // Scoring calculation
  const calculateScore = useCallback(() => {
    if (!examConfig || examQuestions.length === 0) return { correct: 0, incorrect: 0, blank: 0, totalPoints: 0, maxPoints: 0 };

    let correct = 0;
    let incorrect = 0;
    let blank = 0;
    const scoredQuestionCount = Math.min(examConfig.numQuestions, examQuestions.length);

    answers.slice(0, scoredQuestionCount).forEach((answer, i) => {
      if (answer.selectedAnswer === null) {
        blank++;
      } else if (answer.selectedAnswer === examQuestions[i].correctIndex) {
        correct++;
      } else {
        incorrect++;
      }
    });

    const totalPoints = (correct * examConfig.pointsCorrect) + (incorrect * examConfig.pointsIncorrect) + (blank * examConfig.pointsBlank);
    const maxPoints = scoredQuestionCount * examConfig.pointsCorrect;

    return { correct, incorrect, blank, totalPoints: Math.round(totalPoints * 100) / 100, maxPoints };
  }, [answers, examQuestions, examConfig]);

  const getTopicById = (topicId: string) => topics.find(t => t.id === topicId);

  const currentQuestion = examQuestions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const scoredQuestionCount = examConfig ? Math.min(examConfig.numQuestions, examQuestions.length) : examQuestions.length;
  const reserveQuestionCount = Math.max(0, examQuestions.length - scoredQuestionCount);
  const currentQuestionIsReserve = currentIndex >= scoredQuestionCount;

  // Timer warning color
  const timerColor = timeRemaining < 300 ? 'text-red-500' : timeRemaining < 600 ? 'text-orange-500' : 'text-foreground';

  // ============ SETUP PHASE ============
  if (examPhase === 'setup') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Simulacro de examen</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Simula las condiciones reales del examen oficial</p>
        </div>

        <Card className="border-border">
          <CardContent className="p-6 space-y-6">
            {/* Selector de convocatoria */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Convocatoria</Label>
              {allConvocatorias.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay convocatorias con configuración de examen disponible.</p>
              ) : (
                <Select
                  value={selectedConvocatoria?.id || ''}
                  onValueChange={(val) => {
                    const conv = allConvocatorias.find(c => c.id === val);
                    setSelectedConvocatoria(conv || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una convocatoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {allConvocatorias.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.shortTitle} — {c.cuerpo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Configuración del examen */}
            {examConfig && (
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <h3 className="font-medium text-foreground">Condiciones del examen</h3>
                  {examConfig.description && (
                    <p className="text-sm text-muted-foreground">{examConfig.description}</p>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-background rounded-lg border border-border">
                      <div className="text-2xl font-bold text-foreground">{examConfig.numQuestions}</div>
                      <div className="text-xs text-muted-foreground">Preguntas</div>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg border border-border">
                      <div className="text-2xl font-bold text-foreground">{examConfig.durationMinutes} min</div>
                      <div className="text-xs text-muted-foreground">Duración</div>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg border border-border">
                      <div className="text-2xl font-bold text-green-600">+{examConfig.pointsCorrect}</div>
                      <div className="text-xs text-muted-foreground">Correcta</div>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg border border-border">
                      <div className="text-2xl font-bold text-red-600">{examConfig.pointsIncorrect}</div>
                      <div className="text-xs text-muted-foreground">Incorrecta</div>
                    </div>
                  </div>
                  {examConfig.numReserve && (
                    <p className="text-xs text-muted-foreground">+ {examConfig.numReserve} preguntas de reserva</p>
                  )}
                </div>

                {/* Preguntas disponibles */}
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{availableQuestions.length} preguntas disponibles</Badge>
                  {availableQuestions.length < examConfig.numQuestions && (
                    <span className="text-orange-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Insuficientes para simulacro completo
                    </span>
                  )}
                </div>

                {/* Modo de pantalla */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Modo de visualización</Label>
                  <div className="flex gap-3">
                    <Button
                      variant={displayMode === 'window' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDisplayMode('window')}
                    >
                      <Minimize className="h-4 w-4 mr-2" />
                      Ventana
                    </Button>
                    <Button
                      variant={displayMode === 'fullscreen' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDisplayMode('fullscreen')}
                    >
                      <Maximize className="h-4 w-4 mr-2" />
                      Pantalla completa
                    </Button>
                  </div>
                </div>

                {/* Botón empezar */}
                <Button
                  onClick={startExam}
                  size="lg"
                  className="w-full"
                  disabled={availableQuestions.length === 0}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Comenzar simulacro
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============ RUNNING PHASE ============
  if (examPhase === 'running' && currentQuestion) {
    return (
      <div ref={containerRef} className={`space-y-4 ${isFullscreen ? 'bg-background p-6 overflow-auto h-screen' : ''}`}>
        {/* Header con timer y controles */}
        <div className="flex items-center justify-between gap-2 flex-wrap sticky top-0 bg-background z-10 py-2 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Pregunta {currentIndex + 1} de {examQuestions.length}
            </span>
            {currentQuestionIsReserve && (
              <Badge variant="outline" className="text-xs">
                Reserva no puntuable
              </Badge>
            )}
            <div className={`flex items-center gap-1 font-mono text-lg font-bold ${timerColor}`}>
              <Clock className="h-4 w-4" />
              {formatTime(timeRemaining)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">Finalizar</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>¿Finalizar simulacro?</DialogTitle>
                  <DialogDescription>
                    Se calcularán los resultados con las respuestas dadas hasta ahora.
                    {answers.filter(a => a.selectedAnswer === null).length > 0 && (
                      <span className="block mt-2 text-orange-500">
                        Tienes {answers.filter(a => a.selectedAnswer === null).length} preguntas sin responder.
                      </span>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-3 justify-end">
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button variant="destructive" onClick={finishExam}>Sí, finalizar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="max-w-3xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-4">
          {/* Question area */}
          <Card className="border-border">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium text-foreground mb-4 sm:mb-6">
                {currentQuestion.question}
              </h3>
              <RadioGroup
                key={currentIndex}
                value={currentAnswer?.selectedAnswer !== null ? currentAnswer.selectedAnswer.toString() : ''}
                onValueChange={(val) => selectAnswer(parseInt(val))}
              >
                {currentQuestion.options.map((option, i) => (
                  <div
                    key={i}
                    className={`flex items-center space-x-3 p-2 sm:p-3 rounded-lg border transition-colors cursor-pointer ${
                      currentAnswer?.selectedAnswer === i
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => selectAnswer(i)}
                  >
                    <RadioGroupItem value={i.toString()} id={`option-${i}`} />
                    <Label htmlFor={`option-${i}`} className="flex-1 cursor-pointer text-sm sm:text-base">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {/* Navigation */}
              <div className="mt-6 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => goToQuestion(currentIndex - 1)}
                  disabled={currentIndex === 0}
                >
                  Anterior
                </Button>
                {currentIndex < examQuestions.length - 1 ? (
                  <Button onClick={() => goToQuestion(currentIndex + 1)}>
                    Siguiente
                  </Button>
                ) : (
                  <Button variant="destructive" onClick={finishExam}>
                    Finalizar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Question navigator (desktop) */}
          {!isMobile && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Navegación</p>
              <div className="grid grid-cols-5 gap-1">
                {examQuestions.map((_, i) => {
                  const isReserve = i >= scoredQuestionCount;
                  return (
                    <button
                      key={i}
                      onClick={() => goToQuestion(i)}
                      className={`w-8 h-8 text-xs rounded border transition-colors ${
                        i === currentIndex
                          ? 'bg-primary text-primary-foreground border-primary'
                          : answers[i]?.selectedAnswer !== null
                          ? 'bg-primary/20 border-primary/40 text-foreground'
                          : 'bg-background border-border text-muted-foreground hover:bg-muted'
                      } ${isReserve ? 'border-dashed border-orange-400' : ''}`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <div className="text-xs text-muted-foreground space-y-1 mt-3">
                {reserveQuestionCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded border border-dashed border-orange-400" />
                    Reserva
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-primary/20 border border-primary/40" />
                  Respondida
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-background border border-border" />
                  Sin responder
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile question navigator */}
        {isMobile && (
          <div className="flex gap-1 overflow-x-auto pb-2">
            {examQuestions.map((_, i) => {
              const isReserve = i >= scoredQuestionCount;
              return (
                <button
                  key={i}
                  onClick={() => goToQuestion(i)}
                  className={`min-w-[28px] h-7 text-xs rounded border transition-colors shrink-0 ${
                    i === currentIndex
                      ? 'bg-primary text-primary-foreground border-primary'
                      : answers[i]?.selectedAnswer !== null
                      ? 'bg-primary/20 border-primary/40 text-foreground'
                      : 'bg-background border-border text-muted-foreground'
                  } ${isReserve ? 'border-dashed border-orange-400' : ''}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ============ RESULTS PHASE ============
  if (examPhase === 'results') {
    const { correct, incorrect, blank, totalPoints, maxPoints } = calculateScore();
    const percentage = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;
    const passed = examConfig?.passingScore ? totalPoints >= examConfig.passingScore : percentage >= 50;

    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className={`mx-auto w-24 h-24 rounded-full ${passed ? 'bg-green-500/10' : 'bg-red-500/10'} flex items-center justify-center`}>
            {passed ? (
              <Trophy className="h-12 w-12 text-green-500" />
            ) : (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
          </div>

          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {passed ? '¡Aprobado!' : 'No aprobado'}
            </h2>
            <p className="text-muted-foreground">
              {selectedConvocatoria?.shortTitle} — Simulacro completado
            </p>
          </div>

          {/* Score card */}
          <Card className="max-w-md mx-auto border-border">
            <CardContent className="p-6 space-y-4">
              <div className="text-5xl font-bold text-foreground">
                {totalPoints} <span className="text-lg text-muted-foreground">/ {maxPoints} pts</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${passed ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
                />
              </div>
              {examConfig?.passingScore && (
                <p className="text-xs text-muted-foreground">
                  Nota de corte: {examConfig.passingScore} puntos
                </p>
              )}
              {reserveQuestionCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {reserveQuestionCount} preguntas de reserva excluidas de la puntuación.
                </p>
              )}

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">{correct}</div>
                  <div className="text-xs text-muted-foreground">Correctas</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-red-600">{incorrect}</div>
                  <div className="text-xs text-muted-foreground">Incorrectas</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-500">{blank}</div>
                  <div className="text-xs text-muted-foreground">En blanco</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="max-w-md mx-auto space-y-3">
            <Button onClick={goToReview} className="w-full">
              <BookOpen className="h-4 w-4 mr-2" />
              Revisar preguntas
            </Button>
            <Button variant="outline" onClick={resetExam} className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Nuevo simulacro
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ============ REVIEW PHASE ============
  if (examPhase === 'review') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Revisión del examen</h2>
            <p className="text-sm text-muted-foreground">Revisa todas las preguntas y respuestas</p>
          </div>
          <Button variant="outline" onClick={backToResults}>
            Volver a resultados
          </Button>
        </div>

        <div className="space-y-4">
          {examQuestions.map((q, i) => {
            const answer = answers[i];
            const isCorrect = answer.selectedAnswer === q.correctIndex;
            const isBlank = answer.selectedAnswer === null;
            const topic = getTopicById(q.topicId);
            const isReserve = i >= scoredQuestionCount;

            return (
              <Card key={q.id} className={`border-l-4 ${isReserve ? 'border-l-orange-400' : isBlank ? 'border-l-gray-400' : isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">#{i + 1}</span>
                      {topic && (
                        <Badge
                          className="text-[10px] px-2 py-0.5"
                          style={{ backgroundColor: topic.color || '#6b7280' }}
                        >
                          {topic.tag || topic.title}
                        </Badge>
                      )}
                      {isReserve && (
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          Reserva
                        </Badge>
                      )}
                    </div>
                    <div>
                      {isBlank ? (
                        <Badge variant="outline" className="text-gray-500">En blanco</Badge>
                      ) : isCorrect ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" /> Correcta
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" /> Incorrecta
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="font-medium text-foreground">{q.question}</p>

                  <div className="space-y-1">
                    {q.options.map((option, optIdx) => (
                      <div
                        key={optIdx}
                        className={`text-sm p-2 rounded ${
                          optIdx === q.correctIndex
                            ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 font-medium'
                            : answer.selectedAnswer === optIdx && optIdx !== q.correctIndex
                            ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 line-through'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {optIdx === q.correctIndex && '✓ '}
                        {answer.selectedAnswer === optIdx && optIdx !== q.correctIndex && '✗ '}
                        {option}
                      </div>
                    ))}
                  </div>

                  {q.explanation && (
                    <div className="p-3 rounded-lg bg-muted text-sm">
                      <span className="font-medium">Explicación: </span>{q.explanation}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button variant="outline" onClick={backToResults}>
            Volver a resultados
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default SimulatedExam;
