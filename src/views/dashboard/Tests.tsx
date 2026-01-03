'use client';

import { useState, useEffect, useMemo } from 'react';
import { Play, CheckCircle, XCircle, Filter, Trophy, RotateCcw, ChevronDown, ChevronRight, LayoutGrid, List, BookOpen, ExternalLink, Sparkles, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { TestQuestion, Topic, getQuestions, getTopics, getStats, saveStats, getStudyFilters, saveStudyFilters } from '@/lib/storage';
import { getActiveConvocatoria, getCachedConvocatoria, getTopicIdsInConvocatoria, type ConvocatoriaDescriptor } from '@/lib/data-api';
import { useToast } from '@/hooks/use-toast';

type TopicGroup = {
  parent: Topic;
  subtopics: Topic[];
  totalQuestions: number;
};

type ViewMode = 'cards' | 'list';
type OriginFilter = 'all' | 'generated' | 'published' | 'ia';

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
  const [convocatoriaFilter, setConvocatoriaFilter] = useState<boolean>(false);
  const [activeConvocatoria, setActiveConvocatoria] = useState<ConvocatoriaDescriptor | null>(null);
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [testing, setTesting] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [sourceDialogOpen, setSourceDialogOpen] = useState(false);
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const { toast } = useToast();

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
        setConvocatoriaFilter(savedFilters.convocatoriaFilter);
        setSelectedTopics(savedFilters.selectedTopicIds);
        setOriginFilter(savedFilters.originFilter);
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
      convocatoriaFilter,
      selectedTopicIds: selectedTopics,
      originFilter,
    });
  }, [convocatoriaFilter, selectedTopics, originFilter, filtersLoaded]);

  // Calcular los topic IDs que entran en la convocatoria activa
  const convocatoriaTopicIds = useMemo(() => {
    if (!activeConvocatoria || !convocatoriaFilter) return null;
    return getTopicIdsInConvocatoria(topics, activeConvocatoria.id);
  }, [topics, activeConvocatoria, convocatoriaFilter]);

  // Set para lookup rápido de temas en convocatoria
  const convocatoriaTopicSet = useMemo(() => {
    return new Set(convocatoriaTopicIds ?? []);
  }, [convocatoriaTopicIds]);

  // Función para seleccionar solo temas de la convocatoria
  const selectConvocatoriaTopics = () => {
    if (convocatoriaTopicIds) {
      setSelectedTopics(convocatoriaTopicIds);
    }
  };

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
  }, [questions, selectedTopics, originFilter]);

  const getTopicById = (topicId: string) => topics.find(t => t.id === topicId);

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const selectAllTopics = () => {
    setSelectedTopics(topics.map(t => t.id));
  };

  const clearAllTopics = () => {
    setSelectedTopics([]);
  };

  // Agrupar topics por padre/subtopics
  const topicGroups = useMemo((): TopicGroup[] => {
    const parentTopics = topics.filter(t => !t.parentId);
    return parentTopics.map(parent => {
      const subtopics = topics.filter(t => t.parentId === parent.id);
      const allIds = [parent.id, ...subtopics.map(s => s.id)];
      const totalQuestions = questions.filter(q => allIds.includes(q.topicId)).length;
      return { parent, subtopics, totalQuestions };
    });
  }, [topics, questions]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const toggleGroupSelection = (group: TopicGroup) => {
    const allIds = [group.parent.id, ...group.subtopics.map(s => s.id)];
    const allSelected = allIds.every(id => selectedTopics.includes(id));
    
    if (allSelected) {
      setSelectedTopics(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      setSelectedTopics(prev => [...new Set([...prev, ...allIds])]);
    }
  };

  const shuffleDeck = <T,>(items: T[]): T[] => {
    const deck = [...items];
    for (let i = deck.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  };

  const startTest = () => {
    if (filteredQuestions.length === 0) {
      toast({ title: 'Sin preguntas', description: 'No hay preguntas para los temas seleccionados.', variant: 'destructive' });
      return;
    }

    const shuffled = shuffleDeck(filteredQuestions);
    setTestQuestions(shuffled);
    setTesting(true);
    setShowFinalResults(false);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setTotalQuestions(shuffled.length);
  };

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
              </p>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="h-3 rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${(score / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={startTest} className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                Repetir test
              </Button>
              <Button variant="outline" onClick={closeResults} className="w-full">
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tests</h1>
          <p className="text-muted-foreground">Practica con preguntas tipo test</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={startTest}>
            <Play className="h-4 w-4 mr-2" />
            Empezar test ({filteredQuestions.length})
          </Button>
        </div>
      </div>

      {testing && currentQuestion ? (
        <div className="max-w-2xl mx-auto">
          <div className="mb-4 flex justify-between items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Pregunta {currentIndex + 1} de {filteredQuestions.length}</span>
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
            <div className="flex items-center gap-4">
              <span>Aciertos: {score}</span>
              <Button variant="ghost" size="sm" onClick={() => setTesting(false)}>
                Terminar test
              </Button>
            </div>
          </div>
          <Card className="border-border">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-foreground mb-6">
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
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
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
                    <Label htmlFor={`option-${i}`} className="flex-1 cursor-pointer">
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

                  {/* Explicación */}
                  {currentQuestion.explanation && (
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm font-medium text-foreground mb-1">Explicación:</p>
                      <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                    </div>
                  )}

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
                              window.open(`/dashboard/temario?file=${encodeURIComponent(filename)}`, '_blank');
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

              <div className="mt-6 flex justify-end gap-2">
                {!showResult ? (
                  <Button onClick={handleAnswer} disabled={selectedAnswer === null}>
                    Comprobar
                  </Button>
                ) : (
                  <Button onClick={nextQuestion}>
                    {currentIndex < filteredQuestions.length - 1 ? 'Siguiente' : 'Finalizar'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Filtro por convocatoria */}
          {activeConvocatoria && (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span>Convocatoria:</span>
              </div>
              <Button
                variant={convocatoriaFilter ? 'default' : 'outline'}
                size="sm"
                className="h-8 px-3 text-xs gap-1.5"
                onClick={() => setConvocatoriaFilter(!convocatoriaFilter)}
              >
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: activeConvocatoria.color || '#6b7280' }}
                />
                {activeConvocatoria.shortTitle}
                {convocatoriaFilter && (
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">
                    Solo lo que entra
                  </Badge>
                )}
              </Button>
              {convocatoriaFilter && convocatoriaTopicIds && (
                <>
                  <span className="text-xs text-muted-foreground">
                    {convocatoriaTopicIds.length} temas · {filteredQuestions.length} preguntas
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={selectConvocatoriaTopics}
                  >
                    Seleccionar estos
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Filtros jerárquicos por tema */}
          {topicGroups.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>Filtrar por tema:</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={selectAllTopics}
                  >
                    Todos
                  </Button>
                  <span className="text-muted-foreground">·</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={clearAllTopics}
                  >
                    Limpiar
                  </Button>
                </div>
              </div>
              
              {/* Topics principales con subtopics desplegables */}
              <div className="space-y-2">
                {topicGroups.map((group) => {
                  const isExpanded = expandedGroups.includes(group.parent.id);
                  const allIds = [group.parent.id, ...group.subtopics.map(s => s.id)];
                  const selectedCount = allIds.filter(id => selectedTopics.includes(id)).length;
                  const allSelected = selectedCount === allIds.length;
                  const someSelected = selectedCount > 0 && !allSelected;
                  
                  return (
                    <div key={group.parent.id} className="border border-border rounded-lg overflow-hidden">
                      {/* Topic principal */}
                      <div 
                        className={`flex items-center gap-2 p-3 bg-card hover:bg-muted/50 transition-colors ${
                          allSelected ? 'bg-primary/5' : someSelected ? 'bg-primary/3' : ''
                        }`}
                      >
                        {group.subtopics.length > 0 && (
                          <button
                            onClick={() => toggleGroup(group.parent.id)}
                            className="p-0.5 hover:bg-muted rounded"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => toggleGroupSelection(group)}
                          className={`flex-1 flex items-center gap-2 text-left ${
                            allSelected ? 'text-primary font-medium' : 'text-foreground'
                          }`}
                        >
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: group.parent.color || '#6b7280' }}
                          />
                          <span className="text-sm">{group.parent.title}</span>
                          <Badge variant="secondary" className="ml-auto text-[10px] px-1.5">
                            {group.totalQuestions}
                          </Badge>
                        </button>
                      </div>
                      
                      {/* Subtopics */}
                      {isExpanded && group.subtopics.length > 0 && (
                        <div className="border-t border-border bg-muted/30">
                          {group.subtopics.map((subtopic) => {
                            const isSelected = selectedTopics.includes(subtopic.id);
                            const questionCount = questions.filter(q => q.topicId === subtopic.id).length;
                            const inConvocatoria = convocatoriaFilter && convocatoriaTopicSet.has(subtopic.id);
                            const notInConvocatoria = convocatoriaFilter && !convocatoriaTopicSet.has(subtopic.id);
                            
                            return (
                              <button
                                key={subtopic.id}
                                onClick={() => toggleTopic(subtopic.id)}
                                className={`w-full flex items-center gap-2 px-3 py-2 pl-10 text-left hover:bg-muted/50 transition-colors ${
                                  isSelected ? 'bg-primary/5 text-primary' : 'text-muted-foreground'
                                } ${notInConvocatoria ? 'opacity-40' : ''}`}
                              >
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  isSelected ? 'bg-primary' : 'bg-muted-foreground/30'
                                }`} />
                                <span className="text-xs flex-1 truncate">{subtopic.title}</span>
                                {inConvocatoria && (
                                  <Badge 
                                    variant="outline" 
                                    className="text-[9px] px-1 py-0 h-4 border-green-400 text-green-600 dark:border-green-600 dark:text-green-400"
                                  >
                                    ✓ Entra
                                  </Badge>
                                )}
                                <span className="text-[10px] text-muted-foreground">{questionCount}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filtro por origen (dinámico) */}
          <TooltipProvider>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Origen:</span>
              <div className="flex gap-1 flex-wrap">
                <Button
                  variant={originFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() => setOriginFilter('all')}
                >
                  Todas
                </Button>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={originFilter === 'generated' ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 px-3 text-xs gap-1.5"
                      onClick={() => setOriginFilter('generated')}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Generadas
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Preguntas generadas (incluye IA)</p>
                  </TooltipContent>
                </Tooltip>

                {/* dynamic origins from questions */}
                {Array.from(new Set(questions.map(q => (q.origin || 'generated')))).map(origin => {
                  if (origin === 'generated') return null; // already have 'Generadas'
                  // represent 'ia' specifically
                  const label = origin === 'ia' ? 'IA' : origin === 'oficial' ? 'Oficial' : origin;
                  return (
                    <Tooltip key={origin}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={originFilter === origin ? 'default' : 'outline'}
                          size="sm"
                          className="h-8 px-3 text-xs gap-1.5"
                          onClick={() => setOriginFilter(origin)}
                        >
                          {label}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Origen: {origin}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </TooltipProvider>

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
                  <ToggleGroupItem value="cards" aria-label="Vista tarjetas" className="px-3">
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Tarjetas
                  </ToggleGroupItem>
                  <ToggleGroupItem value="list" aria-label="Vista lista" className="px-3">
                    <List className="h-4 w-4 mr-2" />
                    Lista
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {viewMode === 'cards' ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredQuestions.map((q) => {
                    const topic = getTopicById(q.topicId);
                    const tag = getOriginTag(q.origin);
                    const TagIcon = tag.icon;
                    return (
                      <Card key={q.id} className="border-border">
                        <CardContent className="p-4 flex flex-col h-full">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-xs text-muted-foreground">Pregunta</p>
                          </div>
                          <p className="font-medium text-foreground mb-3 line-clamp-3">
                            {q.question}
                          </p>
                          <p className="text-xs text-muted-foreground">Respuesta correcta</p>
                          <p className="text-sm text-primary line-clamp-2 flex-1">
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
