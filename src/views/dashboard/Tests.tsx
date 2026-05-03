'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Play, CheckCircle, XCircle, Trophy, RotateCcw, BookOpen, ExternalLink, SkipForward } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TestQuestion, Topic, getQuestions, getTopics, getStats, saveStats, getStudyFilters, saveStudyFilters, type FilterMode, recordTopicResults } from '@/lib/storage';
import { getActiveConvocatoria, getConvocatoriaDescriptors, getTopicIdsInConvocatoria, type ConvocatoriaDescriptor } from '@/lib/data-api';
import { selectProportionalQuestions } from '@/lib/question-selector';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import StudyFiltersInline from '@/components/dashboard/StudyFiltersInline';
import QuestionCountSelector from '@/components/dashboard/QuestionCountSelector';
import QuestionIdBadge from '@/components/dashboard/QuestionIdBadge';
import { getOriginTag, matchesOriginFilter } from '@/lib/question-origin';

const Tests = () => {
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [originFilter, setOriginFilter] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<FilterMode>('none');
  const [questionLimit, setQuestionLimit] = useState<number>(0); // 0 = all
  const [allConvocatorias, setAllConvocatorias] = useState<ConvocatoriaDescriptor[]>([]);
  const [selectedConvocatoria, setSelectedConvocatoria] = useState<ConvocatoriaDescriptor | null>(null);
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [testing, setTesting] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const failedIndicesRef = useRef<Set<number>>(new Set());
  const skippedIndicesRef = useRef<Set<number>>(new Set());
  const topicResultsRef = useRef<Record<string, { correct: number; incorrect: number }>>({});
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
      // Cargar todas las convocatorias disponibles
      const convocatorias = getConvocatoriaDescriptors();
      setAllConvocatorias(convocatorias);
      
      // Cargar filtros guardados (solo la primera vez)
      if (!filtersLoaded) {
        const savedFilters = getStudyFilters();
        setFilterMode(savedFilters.filterMode ?? 'none');
        setSelectedTopics(savedFilters.selectedTopicIds);
        setOriginFilter(savedFilters.originFilter);
        setQuestionLimit(savedFilters.questionLimit ?? 0);
        // Restaurar la convocatoria seleccionada si había una guardada
        if (savedFilters.selectedConvocatoriaId) {
          const savedConvocatoria = convocatorias.find(c => c.id === savedFilters.selectedConvocatoriaId);
          setSelectedConvocatoria(savedConvocatoria ?? null);
        }
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
      selectedConvocatoriaId: selectedConvocatoria?.id,
    });
  }, [filterMode, selectedTopics, originFilter, questionLimit, selectedConvocatoria, filtersLoaded]);

  // Calcular los topic IDs que entran en la convocatoria seleccionada
  const convocatoriaTopicIds = useMemo(() => {
    if (!selectedConvocatoria || filterMode !== 'convocatoria') return null;
    return getTopicIdsInConvocatoria(topics, selectedConvocatoria.id);
  }, [topics, selectedConvocatoria, filterMode]);

  const convocatoriaTopicSet = useMemo(
    () => (convocatoriaTopicIds && convocatoriaTopicIds.length > 0 ? new Set(convocatoriaTopicIds) : null),
    [convocatoriaTopicIds]
  );

  const selectedTopicSet = useMemo(
    () => (selectedTopics.length > 0 ? new Set(selectedTopics) : null),
    [selectedTopics]
  );

  // Filtrar por convocatoria, tema y origen
  const filteredQuestions = useMemo(() => {
    if (!convocatoriaTopicSet && !selectedTopicSet && originFilter === 'all') return questions;

    return questions.filter(q => {
      if (convocatoriaTopicSet && !convocatoriaTopicSet.has(q.topicId)) return false;
      if (selectedTopicSet && !selectedTopicSet.has(q.topicId)) return false;
      if (originFilter === 'all') return true;

      return matchesOriginFilter(q.origin, originFilter);
    });
  }, [questions, selectedTopicSet, originFilter, convocatoriaTopicSet]);

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
    failedIndicesRef.current = new Set();
    skippedIndicesRef.current = new Set();
  };

  // Repetir solo las preguntas falladas y no contestadas
  const repeatFailedQuestions = () => {
    const failedAndSkipped = testQuestions.filter((_, i) =>
      failedIndicesRef.current.has(i) || skippedIndicesRef.current.has(i)
    );
    if (failedAndSkipped.length === 0) return;
    setTestQuestions(failedAndSkipped);
    setTesting(true);
    setShowFinalResults(false);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setSkippedCount(0);
    setTotalQuestions(failedAndSkipped.length);
    failedIndicesRef.current = new Set();
    skippedIndicesRef.current = new Set();
  };

  // Pasar pregunta sin responder
  const skipQuestion = () => {
    // Se contabiliza como no acertada, pero se muestra la respuesta correcta
    // y se deja el botón de acción como "Siguiente"/"Finalizar".
    setSkippedCount(prev => prev + 1);
    skippedIndicesRef.current.add(currentIndex);
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

    const question = testQuestions[currentIndex];
    const isCorrect = selectedAnswer === question.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    } else {
      failedIndicesRef.current.add(currentIndex);
    }

    // Track per-topic performance
    const topicId = question.topicId;
    if (topicId) {
      if (!topicResultsRef.current[topicId]) {
        topicResultsRef.current[topicId] = { correct: 0, incorrect: 0 };
      }
      if (isCorrect) {
        topicResultsRef.current[topicId].correct += 1;
      } else {
        topicResultsRef.current[topicId].incorrect += 1;
      }
    }

    setShowResult(true);
  };

  const saveTestResults = () => {
    const stats = getStats();
    stats.testsCompleted += 1;
    stats.correctAnswers += score;
    stats.questionsAnswered = (stats.questionsAnswered ?? 0) + testQuestions.length - skippedCount;
    saveStats(stats);

    // Save per-topic performance
    const results = Object.entries(topicResultsRef.current).map(([topicId, data]) => ({
      topicId,
      correct: data.correct,
      incorrect: data.incorrect,
    }));
    if (results.length > 0) {
      recordTopicResults(results);
    }
    topicResultsRef.current = {};
  };

  const finishTest = () => {
    saveTestResults();
    setTesting(false);
    setShowFinalResults(true);
  };

  const nextQuestion = () => {
    if (currentIndex < testQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      finishTest();
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
              {(() => {
                const failedAndSkippedCount = failedIndicesRef.current.size + skippedIndicesRef.current.size;
                return failedAndSkippedCount > 0 ? (
                  <Button onClick={repeatFailedQuestions} className="w-full">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Repetir preguntas falladas ({failedAndSkippedCount})
                  </Button>
                ) : null;
              })()}
              <Button variant="outline" onClick={startTest} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Nuevo test aleatorio
              </Button>
              <Button variant="ghost" onClick={closeResults} className="w-full">
                Volver a tests
              </Button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Tests</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Configura y lanza tu test</p>
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
              <Button variant="ghost" size="sm" onClick={finishTest} className="shrink-0">
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

              <QuestionIdBadge questionId={currentQuestion.id} />
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
                               Fragmento de referencia:
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
                               const sourcePath = (currentQuestion.source?.path || '').replace(/^\/+/, '');
                               const fileParam = sourcePath.split('#')[0] || sourcePath;
                               // Extract section ID from materialId (remove filename prefix if present)
                               // materialId can be like "file.md#section-id" or just "section-id"
                              const materialId = currentQuestion.source?.materialId;
                              let sectionId = materialId;
                              if (materialId?.includes('#')) {
                                // Extract only the hash part (e.g., "file.md#articulo-70" -> "articulo-70")
                                // Use lastIndexOf to handle potential multiple # characters
                                const hashIndex = materialId.lastIndexOf('#');
                                const extracted = materialId.substring(hashIndex + 1);
                                // Only use extracted value if it's non-empty
                                if (extracted) {
                                  sectionId = extracted;
                                }
                              }
                              const sectionParam = sectionId ? `&section=${encodeURIComponent(sectionId)}` : '';
                               // Add highlight parameter if highlightText is available
                               const highlightText = currentQuestion.source?.highlightText || '';
                               const highlightParam = highlightText ? `&highlight=${encodeURIComponent(highlightText)}` : '';
                               const trimmedBase = String(basePath).replace(/\/+$/, '');
                               const url = `${trimmedBase}/dashboard/temario?file=${encodeURIComponent(fileParam)}${sectionParam}${highlightParam}`.replace(/\/{2,}/g, '/');
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
        <Card className="border-border">
          <CardContent className="p-4 sm:p-6 space-y-6">
            <StudyFiltersInline
              topics={topics}
              items={questions}
              allConvocatorias={allConvocatorias}
              selectedConvocatoria={selectedConvocatoria}
              filterMode={filterMode}
              selectedTopicIds={selectedTopics}
              originFilter={originFilter}
              expandedGroups={expandedGroups}
              onFilterModeChange={setFilterMode}
              onSelectedTopicsChange={setSelectedTopics}
              onOriginFilterChange={setOriginFilter}
              onExpandedGroupsChange={setExpandedGroups}
              onConvocatoriaChange={setSelectedConvocatoria}
              filteredCount={filteredQuestions.length}
              actions={
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Preguntas:</span>
                    <QuestionCountSelector
                      totalAvailable={filteredQuestions.length}
                      selectedCount={effectiveQuestionCount}
                      onCountChange={setQuestionLimit}
                    />
                  </div>
                  <Button onClick={startTest} className="w-full sm:w-auto" disabled={filteredQuestions.length === 0}>
                    <Play className="h-4 w-4 mr-2" />
                    Empezar test ({effectiveQuestionCount})
                  </Button>
                </>
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Tests;
