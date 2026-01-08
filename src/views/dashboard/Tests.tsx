'use client';

import { useState, useEffect, useMemo } from 'react';
import { Play, CheckCircle, XCircle, Trophy, RotateCcw, LayoutGrid, List, BookOpen, ExternalLink, Sparkles, FileCheck, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TestQuestion, Topic, getQuestions, getTopics, getStats, saveStats, getStudyFilters, saveStudyFilters, type FilterMode } from '@/lib/storage';
import { getActiveConvocatoria, getTopicIdsInConvocatoria, type ConvocatoriaDescriptor } from '@/lib/data-api';
import { selectProportionalQuestions } from '@/lib/question-selector';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import StudyFiltersPopover from '@/components/dashboard/StudyFiltersPopover';
import QuestionCountSelector from '@/components/dashboard/QuestionCountSelector';

type ViewMode = 'cards' | 'list';

const normalizeOrigin = (origin?: string) => {
  const o = (origin ?? 'generated').trim();
  return o || 'generated';
};

const getOriginTag = (origin?: string) => {
  const o = normalizeOrigin(origin);

  if (o === 'oficial') {
    return {
      label: 'Oficial',
      icon: FileCheck,
      className: 'border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400',
      tooltip: 'Pregunta de examen oficial',
    };
  }

  if (o === 'ia') {
    return {
      label: 'IA',
      icon: Sparkles,
      className: 'border-violet-300 text-violet-600 dark:border-violet-700 dark:text-violet-400',
      tooltip: 'Pregunta generada por IA',
    };
  }

  if (o === 'generated') {
    return {
      label: 'Generada',
      icon: Sparkles,
      className: 'border-violet-300 text-violet-600 dark:border-violet-700 dark:text-violet-400',
      tooltip: 'Pregunta generada (incluye IA)',
    };
  }

  return {
    label: o,
    icon: ExternalLink,
    className: 'border-sky-300 text-sky-700 dark:border-sky-700 dark:text-sky-400',
    tooltip: `Origen: ${o}`,
  };
};

const Tests = () => {
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [originFilter, setOriginFilter] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<FilterMode>('none');
  const [questionLimit, setQuestionLimit] = useState<number>(0); // 0 = all
  const [activeConvocatoria, setActiveConvocatoria] = useState<ConvocatoriaDescriptor | null>(null);
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [testing, setTesting] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [sourceDialogOpen, setSourceDialogOpen] = useState(false);
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  // Cargar datos y filtros guardados
  useEffect(() => {
    const loadData = () => {
      setQuestions(getQuestions());
      setTopics(getTopics());
      // Cargar convocatoria activa
      const convocatoria = getActiveConvocatoria();
      setActiveConvocatoria(convocatoria ?? null);
      
      // Cargar filtros guardados (solo la primera vez)
      if (!filtersLoaded) {
        const savedFilters = getStudyFilters();
        setFilterMode(savedFilters.filterMode ?? 'none');
        setSelectedTopics(savedFilters.selectedTopicIds);
        setOriginFilter(savedFilters.originFilter);
        setQuestionLimit(savedFilters.questionLimit ?? 0);
        setFiltersLoaded(true);
      }
    };
    
    loadData();
    
    // Escuchar actualizaciones de datos
    window.addEventListener('folio-data-updated', loadData);
    return () => window.removeEventListener('folio-data-updated', loadData);
  }, [filtersLoaded]);

  // Guardar filtros cuando cambien
  useEffect(() => {
    if (!filtersLoaded) return; // No guardar hasta que se hayan cargado
    saveStudyFilters({
      filterMode,
      convocatoriaFilter: filterMode === 'convocatoria',
      selectedTopicIds: selectedTopics,
      originFilter,
      questionLimit,
    });
  }, [filterMode, selectedTopics, originFilter, questionLimit, filtersLoaded]);

  // Calcular los topic IDs que entran en la convocatoria activa
  const convocatoriaTopicIds = useMemo(() => {
    if (!activeConvocatoria || filterMode !== 'convocatoria') return null;
    return getTopicIdsInConvocatoria(topics, activeConvocatoria.id);
  }, [topics, activeConvocatoria, filterMode]);

  // Set para lookup rápido de temas en convocatoria (ya no se usa directamente)
  // const convocatoriaTopicSet = useMemo(() => {
  //   return new Set(convocatoriaTopicIds ?? []);
  // }, [convocatoriaTopicIds]);

  // Filtrar por convocatoria, tema y origen
  const filteredQuestions = useMemo(() => {
    let result = questions;

    // Primero filtrar por convocatoria si está activo
    if (convocatoriaTopicIds && convocatoriaTopicIds.length > 0) {
      result = result.filter(q => convocatoriaTopicIds.includes(q.topicId));
    }

    if (selectedTopics.length > 0) {
      result = result.filter(q => selectedTopics.includes(q.topicId));
    }

    if (originFilter !== 'all') {
      if (originFilter === 'generated') {
        // 'generated' incluye preguntas con origin === 'generated' y origin === 'ia'
        result = result.filter(q => {
          const o = (q.origin || 'generated');
          return o === 'generated' || o === 'ia';
        });
      } else if (originFilter === 'ia') {
        result = result.filter(q => (q.origin || '') === 'ia');
      } else {
        // Filtrar por origen literal (p. ej. 'oposito.es')
        result = result.filter(q => (q.origin || 'generated') === originFilter);
      }
    }

    return result;
  }, [questions, selectedTopics, originFilter, convocatoriaTopicIds]);

  const getTopicById = (topicId: string) => topics.find(t => t.id === topicId);

  const startTest = () => {
    if (filteredQuestions.length === 0) {
      toast({ title: 'Sin preguntas', description: 'No hay preguntas para los temas seleccionados.', variant: 'destructive' });
      return;
    }

    // Aplicar límite de preguntas con selección proporcional
    const limit = questionLimit > 0 && questionLimit < filteredQuestions.length 
      ? questionLimit 
      : filteredQuestions.length;

    // Seleccionar preguntas de forma proporcional a los temas disponibles
    const selected = selectProportionalQuestions(filteredQuestions, limit);
    setTestQuestions(selected);
    setTesting(true);
    setShowFinalResults(false);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setSkippedCount(0);
    setTotalQuestions(selected.length);
  };

  // Repetir el mismo test con las mismas preguntas
  const repeatSameTest = () => {
    if (testQuestions.length === 0) return;
    setTesting(true);
    setShowFinalResults(false);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setSkippedCount(0);
    // testQuestions ya contiene las preguntas del test anterior
  };

  // Pasar pregunta sin responder
  const skipQuestion = () => {
    // Se contabiliza como no acertada, pero se muestra la respuesta correcta
    // y se deja el botón de acción como "Siguiente"/"Finalizar".
    setSkippedCount(prev => prev + 1);
    setSelectedAnswer(null);
    setShowResult(true);
  };

  // Calcular el número efectivo de preguntas a estudiar
  const effectiveQuestionCount = useMemo(() => {
    if (questionLimit <= 0 || questionLimit >= filteredQuestions.length) {
      return filteredQuestions.length;
    }
    return questionLimit;
  }, [questionLimit, filteredQuestions.length]);

  const handleAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === testQuestions[currentIndex].correctIndex;
    if (isCorrect) setScore(prev => prev + 1);

    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentIndex < testQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      const stats = getStats();
      stats.testsCompleted += 1;
      stats.correctAnswers += score;
      saveStats(stats);

      setTesting(false);
      setShowFinalResults(true);
    }
  };

  const closeResults = () => {
    setShowFinalResults(false);
    setTestQuestions([]);
  };

  const getResultIcon = () => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage >= 80) return { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    if (percentage >= 50) return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' };
    return { icon: XCircle, color: 'text-orange-500', bg: 'bg-orange-500/10' };
  };

  const currentQuestion = testQuestions[currentIndex];

  return (
    <div className="space-y-6">
      {/* Pantalla de resultados */}
      {showFinalResults && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
          <div className="max-w-md w-full mx-4 text-center space-y-6">
            <div className={`mx-auto w-24 h-24 rounded-full ${getResultIcon().bg} flex items-center justify-center`}>
              {(() => {
                const IconComponent = getResultIcon().icon;
                return <IconComponent className={`h-12 w-12 ${getResultIcon().color}`} />;
              })()}
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">¡Test completado!</h2>
              <p className="text-muted-foreground">Has terminado todas las preguntas</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="text-5xl font-bold text-foreground">
                {Math.round((score / totalQuestions) * 100)}%
              </div>
              <p className="text-muted-foreground">
                Has acertado <span className="font-semibold text-foreground">{score}</span> de <span className="font-semibold text-foreground">{totalQuestions}</span> preguntas
                {skippedCount > 0 && (
                  <span className="block text-sm text-orange-500 mt-1">
                    ({skippedCount} {skippedCount === 1 ? 'pasada' : 'pasadas'} sin responder)
                  </span>
                )}
              </p>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="h-3 rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${(score / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={repeatSameTest} className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                Repetir mismo test
              </Button>
              <Button variant="outline" onClick={startTest} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Nuevo test aleatorio
              </Button>
              <Button variant="ghost" onClick={closeResults} className="w-full">
                Ver todas las preguntas
              </Button>
              <a 
                href="/dashboard/flashcards" 
                className="block text-sm text-primary hover:underline"
              >
                Ir a flashcards para repasar →
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Tests</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Practica con preguntas tipo test</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <StudyFiltersPopover
            topics={topics}
            items={questions}
            activeConvocatoria={activeConvocatoria}
            filterMode={filterMode}
            selectedTopicIds={selectedTopics}
            originFilter={originFilter}
            expandedGroups={expandedGroups}
            onFilterModeChange={setFilterMode}
            onSelectedTopicsChange={setSelectedTopics}
            onOriginFilterChange={setOriginFilter}
            onExpandedGroupsChange={setExpandedGroups}
            filteredCount={filteredQuestions.length}
          />
          <QuestionCountSelector
            totalAvailable={filteredQuestions.length}
            selectedCount={effectiveQuestionCount}
            onCountChange={setQuestionLimit}
          />
          {isMobile ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={startTest} size="icon" className="shrink-0">
                  <Play className="h-4 w-4" />
                  <span className="sr-only">Empezar test ({effectiveQuestionCount})</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Empezar test ({effectiveQuestionCount})</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button onClick={startTest}>
              <Play className="h-4 w-4 mr-2" />
              Empezar test ({effectiveQuestionCount})
            </Button>
          )}
        </div>
      </div>

      {testing && currentQuestion ? (
        <div className="max-w-2xl mx-auto">
          <div className="mb-4 text-sm text-muted-foreground space-y-2">
            {/* Primera línea: Estado del test */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 sm:gap-3">
                <span className="whitespace-nowrap">Pregunta {currentIndex + 1} de {testQuestions.length}</span>
                <span className="whitespace-nowrap">Aciertos: {score}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setTesting(false)} className="shrink-0">
                Terminar test
              </Button>
            </div>
            
            {/* Segunda línea: Atributos de la pregunta */}
            <div className="flex items-center gap-2 flex-wrap">
              {currentQuestion.topicId && getTopicById(currentQuestion.topicId) && (
                <Badge
                  style={{ backgroundColor: getTopicById(currentQuestion.topicId)?.color || '#6b7280' }}
                >
                  {getTopicById(currentQuestion.topicId)?.tag || getTopicById(currentQuestion.topicId)?.title}
                </Badge>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  {(() => {
                    const tag = getOriginTag(currentQuestion.origin);
                    const Icon = tag.icon;
                    return (
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0.5 gap-1 ${tag.className}`}
                      >
                        <Icon className="h-3 w-3" /> {tag.label}
                      </Badge>
                    );
                  })()}
                </TooltipTrigger>
                <TooltipContent side="top">
                  {getOriginTag(currentQuestion.origin).tooltip}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <Card className="border-border">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium text-foreground mb-4 sm:mb-6">
                {currentQuestion.question}
              </h3>
              <RadioGroup
                key={currentIndex}
                value={selectedAnswer !== null ? selectedAnswer.toString() : ''}
                onValueChange={(val) => !showResult && setSelectedAnswer(parseInt(val))}
              >
                {currentQuestion.options.map((option, i) => (
                  <div
                    key={i}
                    className={`flex items-center space-x-3 p-2 sm:p-3 rounded-lg border transition-colors ${
                      showResult
                        ? i === currentQuestion.correctIndex
                          ? 'border-primary bg-primary/10'
                          : selectedAnswer === i
                          ? 'border-destructive bg-destructive/10'
                          : 'border-border'
                        : selectedAnswer === i
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <RadioGroupItem value={i.toString()} id={`option-${i}`} disabled={showResult} />
                    <Label htmlFor={`option-${i}`} className="flex-1 cursor-pointer text-sm sm:text-base">
                      {option}
                    </Label>
                    {showResult && i === currentQuestion.correctIndex && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                    {showResult && selectedAnswer === i && i !== currentQuestion.correctIndex && (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                ))}
              </RadioGroup>

              {showResult && (
                <div className="mt-6 space-y-4">
                  {/* Respuesta correcta resaltada */}
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm font-medium text-primary mb-1">✓ Respuesta correcta:</p>
                    <p className="text-base font-semibold text-foreground">
                      {currentQuestion.options[currentQuestion.correctIndex]}
                    </p>
                  </div>

                  {/* Botón ver fuente */}
                  {currentQuestion.source && (
                    <Dialog open={sourceDialogOpen} onOpenChange={setSourceDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <BookOpen className="h-4 w-4" />
                          Ver fuente de referencia
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            Fuente de referencia
                          </DialogTitle>
                          <DialogDescription>
                            Información de la fuente original de esta pregunta
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          {/* Explicación */}
                          {currentQuestion.explanation && (
                            <div className="p-4 rounded-lg bg-muted">
                              <p className="text-sm font-medium text-foreground mb-1">Explicación:</p>
                              <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                            </div>
                          )}

                          {/* Texto resaltado */}
                          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800">
                            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                              Texto literal:
                            </p>
                            <blockquote className="text-sm text-yellow-900 dark:text-yellow-100 italic border-l-4 border-yellow-400 pl-3">
                              "{currentQuestion.source.highlightText}"
                            </blockquote>
                          </div>

                          {/* Ruta del documento */}
                          <div className="p-3 rounded-lg bg-muted">
                            <p className="text-xs text-muted-foreground mb-1">Documento:</p>
                            <p className="text-sm font-mono text-foreground break-all">
                              {currentQuestion.source.path}
                            </p>
                          </div>

                          {/* Enlace para abrir */}
                          <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => {
                              // Extraer solo el nombre del archivo del path
                              const path = currentQuestion.source?.path || '';
                              const filename = path.split('/').pop()?.split('#')[0] || path;
                              // Include materialId as section param for deep-linking to TOC element
                              const materialId = currentQuestion.source?.materialId;
                              const sectionParam = materialId ? `&section=${encodeURIComponent(materialId)}` : '';
                              const trimmedBase = String(basePath).replace(/\/+$/, '');
                              const url = `${trimmedBase}/dashboard/temario?file=${encodeURIComponent(filename)}${sectionParam}`.replace(/\/{2,}/g, '/');
                              window.open(url, '_blank');
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                            Abrir en el temario
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-between gap-2">
                {isMobile ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={skipQuestion} className="text-muted-foreground" disabled={showResult}>
                        <SkipForward className="h-4 w-4" />
                        <span className="sr-only">Pasar</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Pasar</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Button variant="ghost" onClick={skipQuestion} className="text-muted-foreground" disabled={showResult}>
                    <SkipForward className="h-4 w-4 mr-2" />
                    Pasar
                  </Button>
                )}
                <div className="flex gap-2">
                  {!showResult ? (
                    isMobile ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" onClick={handleAnswer} disabled={selectedAnswer === null}>
                            <CheckCircle className="h-4 w-4" />
                            <span className="sr-only">Comprobar</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Comprobar</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Button onClick={handleAnswer} disabled={selectedAnswer === null}>
                        Comprobar
                      </Button>
                    )
                  ) : (
                    isMobile ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" onClick={nextQuestion}>
                            <Play className="h-4 w-4" />
                            <span className="sr-only">{currentIndex < testQuestions.length - 1 ? 'Siguiente' : 'Finalizar'}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{currentIndex < testQuestions.length - 1 ? 'Siguiente' : 'Finalizar'}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Button onClick={nextQuestion}>
                        {currentIndex < testQuestions.length - 1 ? 'Siguiente' : 'Finalizar'}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {filteredQuestions.length === 0 ? (
            <Card className="border-border border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No hay preguntas para los filtros seleccionados.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Toggle de vista */}
              <div className="flex justify-end mb-4">
                <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as ViewMode)}>
                  <ToggleGroupItem value="cards" aria-label="Vista tarjetas" className="px-2 sm:px-3">
                    <LayoutGrid className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Tarjetas</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="list" aria-label="Vista lista" className="px-2 sm:px-3">
                    <List className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Lista</span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {viewMode === 'cards' ? (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredQuestions.map((q) => {
                    const topic = getTopicById(q.topicId);
                    const tag = getOriginTag(q.origin);
                    const TagIcon = tag.icon;
                    return (
                      <Card key={q.id} className="border-border">
                        <CardContent className="p-3 sm:p-4 flex flex-col h-full">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-xs text-muted-foreground">Pregunta</p>
                          </div>
                          <p className="font-medium text-foreground mb-3 line-clamp-3 text-sm sm:text-base">
                            {q.question}
                          </p>
                          <p className="text-xs text-muted-foreground">Respuesta correcta</p>
                          <p className="text-xs sm:text-sm text-primary line-clamp-2 flex-1">
                            {q.options[q.correctIndex]}
                          </p>
                          {topic && (
                            <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 flex-wrap">
                              <Badge
                                className="text-[10px] px-2 py-0.5"
                                style={{ backgroundColor: topic.color || '#6b7280' }}
                              >
                                {topic.tag || topic.title}
                              </Badge>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-[10px] px-2 py-0.5 gap-1 ${tag.className}`}
                                  >
                                    <><TagIcon className="h-3 w-3" /> {tag.label}</>
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  {tag.tooltip}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredQuestions.map((q, index) => {
                    const topic = getTopicById(q.topicId);
                    const tag = getOriginTag(q.origin);
                    const TagIcon = tag.icon;
                    return (
                      <Card key={q.id} className="border-border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-sm text-muted-foreground">#{index + 1}</span>
                                {topic && (
                                  <Badge
                                    className="text-[10px] px-2 py-0.5"
                                    style={{ backgroundColor: topic.color || '#6b7280' }}
                                  >
                                    {topic.tag || topic.title}
                                  </Badge>
                                )}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-[10px] px-2 py-0.5 gap-1 ${tag.className}`}
                                    >
                                      <><TagIcon className="h-3 w-3" /> {tag.label}</>
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    {tag.tooltip}
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <p className="text-foreground font-medium">{q.question}</p>
                              <p className="text-sm text-primary mt-1">
                                Respuesta correcta: {q.options[q.correctIndex]}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Tests;
