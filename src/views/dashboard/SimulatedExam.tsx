'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Play, CheckCircle, XCircle, Trophy, RotateCcw, Clock, Maximize, Minimize, AlertTriangle, BookOpen, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TestQuestion, Topic, getQuestions, getTopics, getStats, saveStats, recordTopicResults } from '@/lib/storage';
import { getCachedConvocatoria, getCachedDatabase, getConvocatoriaDescriptors, getTopicIdsInConvocatoria, type ConvocatoriaDescriptor } from '@/lib/data-api';
import { selectProportionalQuestions, selectEqualQuestions } from '@/lib/question-selector';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { type ExamConfig, type TemaConvocatoria } from '@/lib/data-types';
import { getOriginFilterValue, getOriginTag, matchesOriginFilter, sortOriginFilters } from '@/lib/question-origin';
import QuestionIdBadge from '@/components/dashboard/QuestionIdBadge';

type ExamPhase = 'setup' | 'running' | 'review' | 'results';

interface ExamAnswer {
  questionIndex: number;
  selectedAnswer: number | null; // null = en blanco
}

interface ExamThemeBucket {
  id: string;
  label: string;
  shortLabel: string;
  order: number;
  questions: TestQuestion[];
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const shuffleQuestions = (items: TestQuestion[]) => [...items].sort(() => Math.random() - 0.5);

const coverageMatches = (topicCoverage: string[], temaCoverage: string[]) => {
  if (topicCoverage.length === 0 || temaCoverage.length === 0) return false;
  return topicCoverage.some(topicId =>
    temaCoverage.some(temaId =>
      topicId === temaId ||
      topicId.startsWith(`${temaId}/`) ||
      topicId.startsWith(`${temaId}#`) ||
      temaId.startsWith(`${topicId}/`) ||
      temaId.startsWith(`${topicId}#`)
    )
  );
};

const selectWeightedQuestions = (
  buckets: ExamThemeBucket[],
  count: number,
  weights: Record<string, number>
) => {
  const availableCount = buckets.reduce((sum, bucket) => sum + bucket.questions.length, 0);
  const targetCount = Math.min(count, availableCount);
  if (targetCount <= 0) return [];

  const weightedBuckets = buckets.map(bucket => {
    const weight = weights[bucket.id] ?? 1;
    return {
      ...bucket,
      shuffled: shuffleQuestions(bucket.questions),
      weight,
      weightedSize: Math.max(0, weight) * bucket.questions.length,
      quota: 0,
      remainder: 0,
    };
  });

  const activeBuckets = weightedBuckets.filter(bucket => bucket.weightedSize > 0);
  if (activeBuckets.length === 0) {
    return [];
  }

  const totalWeightedSize = activeBuckets.reduce((sum, bucket) => sum + bucket.weightedSize, 0);
  let assigned = 0;
  for (const bucket of activeBuckets) {
    const rawQuota = (bucket.weightedSize / totalWeightedSize) * targetCount;
    bucket.quota = Math.min(bucket.questions.length, Math.floor(rawQuota));
    bucket.remainder = rawQuota - bucket.quota;
    assigned += bucket.quota;
  }

  let remaining = targetCount - assigned;
  const byRemainder = [...activeBuckets].sort((a, b) => b.remainder - a.remainder);
  while (remaining > 0) {
    let progressed = false;
    for (const bucket of byRemainder) {
      if (bucket.quota >= bucket.questions.length) continue;
      bucket.quota++;
      remaining--;
      progressed = true;
      if (remaining === 0) break;
    }
    if (!progressed) break;
  }

  const selected = activeBuckets.flatMap(bucket => bucket.shuffled.slice(0, bucket.quota));
  if (selected.length < targetCount) {
    const selectedIds = new Set(selected.map(question => question.id));
    const fallback = shuffleQuestions(
      weightedBuckets.flatMap(bucket => bucket.questions).filter(question => !selectedIds.has(question.id))
    );
    selected.push(...fallback.slice(0, targetCount - selected.length));
  }

  return shuffleQuestions(selected).slice(0, targetCount);
};

const OriginBadge = ({ origin, className = '' }: { origin?: string; className?: string }) => {
  const tag = getOriginTag(origin);
  const Icon = tag.icon;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 gap-1 ${tag.className} ${className}`}>
            <Icon className="h-3 w-3" />
            {tag.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tag.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
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
  const [distributionMode, setDistributionMode] = useState<'proportional' | 'equal'>('proportional');
  const [questionsPerTopic, setQuestionsPerTopic] = useState<number>(5);
  const [originFilter, setOriginFilter] = useState('all');
  const [themeWeights, setThemeWeights] = useState<Record<string, number>>({});
  const [showThemeWeights, setShowThemeWeights] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
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

  const topicById = useMemo(() => new Map(topics.map(topic => [topic.id, topic])), [topics]);

  // Get questions for the selected convocatoria before optional origin/theme tuning
  const convocatoriaQuestions = useMemo(() => {
    if (!selectedConvocatoria) return [];
    const topicIds = getTopicIdsInConvocatoria(topics, selectedConvocatoria.id);
    if (!topicIds || topicIds.length === 0) return questions;
    const topicIdSet = new Set(topicIds);
    return questions.filter(q => topicIdSet.has(q.topicId));
  }, [questions, topics, selectedConvocatoria]);

  const availableOriginFilters = useMemo(() => {
    const origins = new Set<string>();
    convocatoriaQuestions.forEach(question => origins.add(getOriginFilterValue(question.origin)));
    return Array.from(origins).sort(sortOriginFilters);
  }, [convocatoriaQuestions]);

  useEffect(() => {
    if (originFilter !== 'all' && !availableOriginFilters.includes(originFilter)) {
      setOriginFilter('all');
    }
  }, [availableOriginFilters, originFilter]);

  const originFilterCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const filter of availableOriginFilters) counts.set(filter, 0);
    for (const question of convocatoriaQuestions) {
      const filter = getOriginFilterValue(question.origin);
      counts.set(filter, (counts.get(filter) ?? 0) + 1);
    }
    return counts;
  }, [availableOriginFilters, convocatoriaQuestions]);

  const availableQuestions = useMemo(() => {
    if (originFilter === 'all') return convocatoriaQuestions;
    return convocatoriaQuestions.filter(question => matchesOriginFilter(question.origin, originFilter));
  }, [convocatoriaQuestions, originFilter]);

  const themeBuckets = useMemo((): ExamThemeBucket[] => {
    if (!selectedConvocatoria || availableQuestions.length === 0) return [];

    const convocatoria = getCachedConvocatoria(selectedConvocatoria.id);
    const database = getCachedDatabase();
    const datasetIdByFile = new Map((database.datasets ?? []).map(dataset => [dataset.file, dataset.id]));
    const temasByDataset = new Map<string, TemaConvocatoria[]>();

    for (const tema of convocatoria?.temas ?? []) {
      for (const recurso of tema.recursos ?? []) {
        if (recurso.tipo !== 'db') continue;
        const datasetId = datasetIdByFile.get(recurso.archivo);
        if (!datasetId) continue;
        const current = temasByDataset.get(datasetId) ?? [];
        current.push(tema);
        temasByDataset.set(datasetId, current);
      }
    }

    const findTemaForQuestion = (question: TestQuestion): TemaConvocatoria | undefined => {
      const topic = topicById.get(question.topicId);
      const coverage = topic?.syllabusCoverageIds ?? [];
      const candidates = temasByDataset.get(question.sourceDatasetId ?? '') ?? [];
      if (candidates.length === 1) return candidates[0];
      return candidates.find(tema => coverageMatches(coverage, tema.cobertura_convocatoria ?? []));
    };

    const buckets = new Map<string, ExamThemeBucket>();
    for (const question of availableQuestions) {
      const tema = findTemaForQuestion(question);
      const fallbackTopic = topicById.get(question.topicId);
      const id = tema?.id ?? fallbackTopic?.parentId ?? question.topicId;
      const label = tema ? `Tema ${tema.numero}. ${tema.titulo}` : fallbackTopic?.title ?? question.topicId;
      const shortLabel = tema ? `Tema ${tema.numero}` : fallbackTopic?.tag ?? fallbackTopic?.title ?? question.topicId;
      const order = tema?.numero ?? fallbackTopic?.order ?? 999;
      const bucket = buckets.get(id) ?? { id, label, shortLabel, order, questions: [] };
      bucket.questions.push(question);
      buckets.set(id, bucket);
    }

    return Array.from(buckets.values()).sort((a, b) => a.order - b.order || a.label.localeCompare(b.label, 'es'));
  }, [availableQuestions, selectedConvocatoria, topicById]);

  const allThemeWeightsZero = themeBuckets.length > 0 &&
    themeBuckets.every(bucket => (themeWeights[bucket.id] ?? 1) === 0);

  useEffect(() => {
    setThemeWeights({});
    setShowThemeWeights(false);
  }, [selectedConvocatoria?.id]);

  const finishExam = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    // Calculate results inline (same logic as calculateScore)
    let correct = 0;
    let incorrect = 0;
    answers.forEach((answer, i) => {
      if (answer.selectedAnswer === null) return;
      if (answer.selectedAnswer === examQuestions[i]?.correctIndex) {
        correct++;
      } else {
        incorrect++;
      }
    });

    // Save stats for the simulacro
    const stats = getStats();
    stats.simulacrosCompleted = (stats.simulacrosCompleted ?? 0) + 1;
    stats.testsCompleted += 1;
    stats.correctAnswers += correct;
    stats.questionsAnswered = (stats.questionsAnswered ?? 0) + correct + incorrect;
    saveStats(stats);

    // Track per-topic performance
    const topicResults: Record<string, { correct: number; incorrect: number }> = {};
    answers.forEach((answer, i) => {
      if (answer.selectedAnswer === null) return;
      const question = examQuestions[i];
      if (!question?.topicId) return;
      if (!topicResults[question.topicId]) {
        topicResults[question.topicId] = { correct: 0, incorrect: 0 };
      }
      if (answer.selectedAnswer === question.correctIndex) {
        topicResults[question.topicId].correct += 1;
      } else {
        topicResults[question.topicId].incorrect += 1;
      }
    });
    const results = Object.entries(topicResults).map(([topicId, data]) => ({
      topicId,
      correct: data.correct,
      incorrect: data.incorrect,
    }));
    if (results.length > 0) {
      recordTopicResults(results);
    }

    setShowFinishConfirm(false);
    setExamPhase('results');
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [answers, examQuestions]);

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

    let selected: TestQuestion[];

    if (distributionMode === 'equal') {
      selected = selectEqualQuestions(availableQuestions, questionsPerTopic);
      if (selected.length === 0) {
        toast({ title: 'Sin preguntas', description: 'No se pudieron seleccionar preguntas con la configuración actual.', variant: 'destructive' });
        return;
      }
    } else if (examConfig.examParts && examConfig.examParts.length > 0 && themeBuckets.length > 0) {
      // Distribución por partes del examen: cada parte filtra sus temas y selecciona
      // su número de preguntas de forma proporcional dentro de esos temas.
      if (allThemeWeightsZero) {
        toast({
          title: 'Mezcla sin preguntas',
          description: 'Sube al menos un tema por encima de 0 para comenzar el simulacro.',
          variant: 'destructive',
        });
        return;
      }

      const usedQuestionIds = new Set<string>();
      selected = [];

      for (const part of examConfig.examParts) {
        const partCount = part.numQuestions + (part.numReserve || 0);
        const partTemaNumbers = part.temaNumbers;
        // Filter buckets for this part's tema numbers
        const partBuckets = (partTemaNumbers && partTemaNumbers.length > 0
          ? themeBuckets.filter(bucket => partTemaNumbers.includes(bucket.order))
          : themeBuckets
        )
          .map(bucket => ({
            ...bucket,
            // Exclude questions already selected in previous parts
            questions: bucket.questions.filter(q => !usedQuestionIds.has(q.id)),
          }))
          .filter(bucket => bucket.questions.length > 0);

        const partSelected = selectWeightedQuestions(partBuckets, partCount, themeWeights);
        for (const q of partSelected) usedQuestionIds.add(q.id);
        selected.push(...partSelected);
      }

      if (selected.length === 0) {
        toast({ title: 'Sin preguntas', description: 'No se pudieron seleccionar preguntas con la configuración de partes actual.', variant: 'destructive' });
        return;
      }
    } else {
      const numQuestions = examConfig.numQuestions + (examConfig.numReserve || 0);

      if (availableQuestions.length < numQuestions) {
        toast({
          title: 'Preguntas insuficientes',
          description: `Se necesitan ${numQuestions} preguntas pero solo hay ${availableQuestions.length} disponibles. Se usarán todas las disponibles.`,
        });
      }

      const count = Math.min(numQuestions, availableQuestions.length);
      if (allThemeWeightsZero) {
        toast({
          title: 'Mezcla sin preguntas',
          description: 'Sube al menos un tema por encima de 0 para comenzar el simulacro.',
          variant: 'destructive',
        });
        return;
      }

      selected = themeBuckets.length > 0
        ? selectWeightedQuestions(themeBuckets, count, themeWeights)
        : selectProportionalQuestions(availableQuestions, count);
    }

    setExamQuestions(selected);
    setAnswers(selected.map((_, i) => ({ questionIndex: i, selectedAnswer: null })));
    setCurrentIndex(0);
    setTimeRemaining(examConfig.durationMinutes * 60);
    setShowFinishConfirm(false);
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
    setShowFinishConfirm(false);
  };

  const requestFinishExam = () => {
    setShowFinishConfirm(true);
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

  const getTopicById = (topicId: string) => topicById.get(topicId);

  const currentQuestion = examQuestions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const scoredQuestionCount = examConfig ? Math.min(examConfig.numQuestions, examQuestions.length) : examQuestions.length;
  const reserveQuestionCount = Math.max(0, examQuestions.length - scoredQuestionCount);
  const currentQuestionIsReserve = currentIndex >= scoredQuestionCount;
  const unansweredCount = answers.filter(answer => answer.selectedAnswer === null).length;

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
                  {examConfig.examParts && examConfig.examParts.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {examConfig.examParts.map((part, i) => (
                        <p key={i} className="text-xs text-muted-foreground">
                          <span className="font-medium">{part.label}:</span>{' '}
                          {part.numQuestions} preguntas{part.numReserve ? ` + ${part.numReserve} reserva` : ''}
                          {part.temaNumbers && part.temaNumbers.length > 0 ? ` · Temas ${part.temaNumbers[0]}–${part.temaNumbers[part.temaNumbers.length - 1]}` : ' · Todos los temas'}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preguntas disponibles */}
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{availableQuestions.length} preguntas disponibles</Badge>
                  {originFilter !== 'all' && (
                    <Badge variant="secondary">Origen filtrado</Badge>
                  )}
                  {availableQuestions.length < examConfig.numQuestions && (
                    <span className="text-orange-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Insuficientes para simulacro completo
                    </span>
                  )}
                </div>

                {availableOriginFilters.length > 1 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Origen de preguntas</Label>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant={originFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={() => setOriginFilter('all')}
                      >
                        Todos
                      </Button>
                      {availableOriginFilters.map(origin => {
                        const tag = getOriginTag(origin);
                        const Icon = tag.icon;
                        return (
                          <Button
                            key={origin}
                            variant={originFilter === origin ? 'default' : 'outline'}
                            size="sm"
                            className="h-8 px-3 text-xs gap-1"
                            onClick={() => setOriginFilter(origin)}
                          >
                            <Icon className="h-3 w-3" />
                            {tag.label}
                            <span className="text-[10px] opacity-70">{originFilterCounts.get(origin) ?? 0}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {themeBuckets.length > 1 && (
                  <Collapsible open={showThemeWeights} onOpenChange={setShowThemeWeights} className="rounded-lg border border-border">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between px-4">
                        <span className="flex items-center gap-2">
                          <SlidersHorizontal className="h-4 w-4" />
                          Ajustar mezcla por temas
                        </span>
                        <Badge variant="outline">{themeBuckets.length} temas</Badge>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4 space-y-3">
                      <p className="text-xs text-muted-foreground">
                        Peso 1 mantiene la proporción del banco. Sube o baja temas para practicar más o menos sin cambiar las condiciones del simulacro.
                      </p>
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {themeBuckets.map(bucket => {
                          const weight = themeWeights[bucket.id] ?? 1;
                          return (
                            <div key={bucket.id} className="space-y-2 rounded-md bg-muted/40 p-3">
                              <div className="flex items-center justify-between gap-3 text-xs">
                                <span className="font-medium truncate" title={bucket.label}>{bucket.shortLabel}</span>
                                <span className="text-muted-foreground whitespace-nowrap">
                                  {bucket.questions.length} preg. · {weight.toFixed(1)}x
                                </span>
                              </div>
                              <Slider
                                min={0}
                                max={3}
                                step={0.5}
                                value={[weight]}
                                onValueChange={([value]) => setThemeWeights(prev => ({ ...prev, [bucket.id]: value }))}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setThemeWeights({})}>
                        Restablecer pesos
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>
                )}

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

                {/* Modo de distribución de preguntas */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Distribución de preguntas</Label>
                  <div className="flex gap-3">
                    <Button
                      variant={distributionMode === 'proportional' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDistributionMode('proportional')}
                    >
                      Proporcional
                    </Button>
                    <Button
                      variant={distributionMode === 'equal' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDistributionMode('equal')}
                    >
                      Igual por tema
                    </Button>
                  </div>
                  {distributionMode === 'equal' && (
                    <div className="space-y-2 pl-1">
                      <Label className="text-xs text-muted-foreground">
                        Preguntas por tema (se redistribuyen si un tema tiene menos)
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        value={questionsPerTopic}
                        onChange={(e) => setQuestionsPerTopic(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-24"
                      />
                      <p className="text-xs text-muted-foreground">
                        {(() => {
                          const topicGroups = new Map<string, number>();
                          for (const q of availableQuestions) {
                            topicGroups.set(q.topicId, (topicGroups.get(q.topicId) || 0) + 1);
                          }
                          const numTopics = topicGroups.size;
                          const totalEstimated = Math.min(
                            availableQuestions.length,
                            numTopics * questionsPerTopic
                          );
                          return `${numTopics} temas disponibles · ~${totalEstimated} preguntas totales estimadas`;
                        })()}
                      </p>
                    </div>
                  )}
                  {distributionMode === 'proportional' && (
                    <p className="text-xs text-muted-foreground pl-1">
                      {examConfig.examParts && examConfig.examParts.length > 0
                        ? `Se seleccionan preguntas por partes: ${examConfig.examParts.map(p => `${p.numQuestions}${p.numReserve ? `+${p.numReserve}` : ''}`).join(' + ')} proporcionalmente según disponibilidad por tema.`
                        : `Se seleccionan ${examConfig.numQuestions}${examConfig.numReserve ? ` + ${examConfig.numReserve} reserva` : ''} preguntas proporcionalmente según disponibilidad por tema.`
                      }
                    </p>
                  )}
                </div>

                {/* Botón empezar */}
                <Button
                  onClick={startExam}
                  size="lg"
                  className="w-full"
                  disabled={availableQuestions.length === 0 || (distributionMode === 'proportional' && allThemeWeightsZero)}
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
    const currentTopic = getTopicById(currentQuestion.topicId);

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
            {currentTopic && (
              <Badge
                className="text-[10px] px-2 py-0.5"
                style={{ backgroundColor: currentTopic.color || '#6b7280' }}
              >
                {currentTopic.tag || currentTopic.title}
              </Badge>
            )}
            <OriginBadge origin={currentQuestion.origin} />
            <QuestionIdBadge questionId={currentQuestion.id} />
            <div className={`flex items-center gap-1 font-mono text-lg font-bold ${timerColor}`}>
              <Clock className="h-4 w-4" />
              {formatTime(timeRemaining)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            <Button variant="destructive" size="sm" onClick={requestFinishExam}>Finalizar</Button>
          </div>
        </div>

        {showFinishConfirm && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">¿Finalizar simulacro?</p>
                <p className="text-sm text-muted-foreground">
                  Se calcularán los resultados con las respuestas dadas hasta ahora.
                  {unansweredCount > 0 && ` Tienes ${unansweredCount} preguntas sin responder.`}
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowFinishConfirm(false)}>Cancelar</Button>
                <Button variant="destructive" size="sm" onClick={finishExam}>Sí, finalizar</Button>
              </div>
            </CardContent>
          </Card>
        )}

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
                    <RadioGroupItem value={i.toString()} id={`option-${i}`} className="pointer-events-none" />
                    <Label htmlFor={`option-${i}`} className="flex-1 text-sm sm:text-base pointer-events-none">
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
                  <Button variant="destructive" onClick={requestFinishExam}>
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
                      <OriginBadge origin={q.origin} />
                      {isReserve && (
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          Reserva
                        </Badge>
                      )}
                      <QuestionIdBadge questionId={q.id} />
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
