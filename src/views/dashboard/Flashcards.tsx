'use client';

import { useState, useEffect, useMemo } from 'react';
import { RotateCcw, Check, Bookmark, Trophy, X, LayoutGrid, List, Sparkles, ExternalLink, FileCheck, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Flashcard, Topic, getFlashcards, getTopics, getStats, saveStats, getStudyFilters, saveStudyFilters, type FilterMode } from '@/lib/storage';
import { getActiveConvocatoria, getTopicIdsInConvocatoria, type ConvocatoriaDescriptor } from '@/lib/data-api';
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
      tooltip: 'Contenido oficial',
    };
  }

  if (o === 'ia') {
    return {
      label: 'IA',
      icon: Sparkles,
      className: 'border-violet-300 text-violet-600 dark:border-violet-700 dark:text-violet-400',
      tooltip: 'Contenido generado por IA',
    };
  }

  if (o === 'generated') {
    return {
      label: 'Generada',
      icon: Sparkles,
      className: 'border-violet-300 text-violet-600 dark:border-violet-700 dark:text-violet-400',
      tooltip: 'Contenido generado (incluye IA)',
    };
  }

  return {
    label: o,
    icon: ExternalLink,
    className: 'border-sky-300 text-sky-700 dark:border-sky-700 dark:text-sky-400',
    tooltip: `Origen: ${o}`,
  };
};

const getOriginLabel = (origin?: string) => {
  const normalized = (origin || 'generated').trim();
  if (normalized === 'generated') return 'Generadas';
  if (normalized === 'ia') return 'IA';
  return normalized;
};

const Flashcards = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [originFilter, setOriginFilter] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<FilterMode>('none');
  const [questionLimit, setQuestionLimit] = useState<number>(0); // 0 = all
  const [activeConvocatoria, setActiveConvocatoria] = useState<ConvocatoriaDescriptor | null>(null);
  const [studyDeck, setStudyDeck] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [pendingNextIndex, setPendingNextIndex] = useState<number | null>(null);
  const [cardTextVisible, setCardTextVisible] = useState(true);
  const [studying, setStudying] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalReviewed, setTotalReviewed] = useState(0);
  const [markedForReview, setMarkedForReview] = useState<Flashcard[]>([]);
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Cargar datos y filtros guardados
  useEffect(() => {
    const loadData = () => {
      setFlashcards(getFlashcards());
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

  const filteredFlashcards = useMemo(() => {
    let result = flashcards;

    // Primero filtrar por convocatoria si está activo
    if (convocatoriaTopicIds && convocatoriaTopicIds.length > 0) {
      result = result.filter(f => convocatoriaTopicIds.includes(f.topicId));
    }

    if (selectedTopics.length > 0) {
      result = result.filter(f => selectedTopics.includes(f.topicId));
    }

    if (originFilter !== 'all') {
      if (originFilter === 'generated') {
        // 'generated' incluye origin === 'generated' y origin === 'ia'
        result = result.filter(f => {
          const o = (f.origin || 'generated');
          return o === 'generated' || o === 'ia';
        });
      } else {
        result = result.filter(f => (f.origin || 'generated') === originFilter);
      }
    }

    return result;
  }, [flashcards, selectedTopics, originFilter, convocatoriaTopicIds]);

  const getTopicById = (topicId: string) => topics.find(t => t.id === topicId);

  const shuffleDeck = <T,>(items: T[]): T[] => {
    const deck = [...items];
    for (let i = deck.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  };

  const activeDeck = studying ? studyDeck : filteredFlashcards;

  const handleReview = (markForReview: boolean) => {
    // Evitar dobles clicks mientras se está avanzando de tarjeta
    if (pendingNextIndex !== null) return;

    const stats = getStats();
    stats.cardsReviewed += 1;
    
    if (markForReview) {
      // Marcar para repasar
      setMarkedForReview(prev => [...prev, currentCard]);
    } else {
      // No marcada = correcta
      stats.correctAnswers += 1;
      setCorrectCount(prev => prev + 1);
    }
    saveStats(stats);

    // Importante: si estamos viendo la respuesta (carta girada), no debemos
    // cambiar los datos de la tarjeta en el mismo render, porque la animación
    // puede enseñar la cara trasera de la siguiente antes de leer la pregunta.
    // Primero giramos la tarjeta a "pregunta" y, al finalizar la transición,
    // avanzamos el índice.
    const hasNext = currentIndex < activeDeck.length - 1;
    if (!hasNext) {
      setShowAnswer(false);
      setStudying(false);
      setShowFinalResults(true);
      return;
    }

    const nextIndex = currentIndex + 1;
    setPendingNextIndex(nextIndex);
    setShowAnswer(false);

    // Transición suave DURANTE el giro:
    // 1) ocultar/difuminar el texto mientras la tarjeta empieza a girar
    // 2) cambiar de índice cuando está "de canto" (mitad de la animación)
    // 3) mostrar el texto nuevo al terminar el giro
    const FLIP_MS = 600;
    const SWAP_MS = 300;
    setCardTextVisible(false);
    window.setTimeout(() => {
      setCurrentIndex(nextIndex);
    }, SWAP_MS);
    window.setTimeout(() => {
      setCardTextVisible(true);
      setPendingNextIndex(null);
    }, FLIP_MS + 20);
  };

  const startStudying = () => {
    if (filteredFlashcards.length === 0) {
      toast({ title: 'Sin tarjetas', description: 'No hay tarjetas para estudiar con los filtros seleccionados.', variant: 'destructive' });
      return;
    }

    // Aplicar límite de preguntas
    const limit = questionLimit > 0 && questionLimit < filteredFlashcards.length 
      ? questionLimit 
      : filteredFlashcards.length;
    
    const shuffled = shuffleDeck(filteredFlashcards).slice(0, limit);
    setStudyDeck(shuffled);
    setStudying(true);
    setShowFinalResults(false);
    setCurrentIndex(0);
    setShowAnswer(false);
    setPendingNextIndex(null);
    setCardTextVisible(true);
    setCorrectCount(0);
    setTotalReviewed(shuffled.length);
    setMarkedForReview([]);
  };

  // Calcular el número efectivo de tarjetas a estudiar
  const effectiveCardCount = useMemo(() => {
    if (questionLimit <= 0 || questionLimit >= filteredFlashcards.length) {
      return filteredFlashcards.length;
    }
    return questionLimit;
  }, [questionLimit, filteredFlashcards.length]);

  const closeResults = () => {
    setShowFinalResults(false);
    setStudyDeck([]);
  };

  const getResultIcon = () => {
    const percentage = (correctCount / totalReviewed) * 100;
    if (percentage >= 80) return { color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    if (percentage >= 50) return { color: 'text-green-500', bg: 'bg-green-500/10' };
    return { color: 'text-orange-500', bg: 'bg-orange-500/10' };
  };

  const currentCard = activeDeck[currentIndex];

  return (
    <div className="space-y-6">
      {/* Pantalla de resultados */}
      {showFinalResults && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center overflow-y-auto py-8">
          <div className="max-w-2xl w-full mx-4 text-center space-y-6">
            <div className={`mx-auto w-24 h-24 rounded-full ${getResultIcon().bg} flex items-center justify-center`}>
              <Trophy className={`h-12 w-12 ${getResultIcon().color}`} />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">¡Sesión completada!</h2>
              <p className="text-muted-foreground">Has repasado todas las tarjetas</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="text-5xl font-bold text-foreground">
                {totalReviewed > 0 ? Math.round((correctCount / totalReviewed) * 100) : 0}%
              </div>
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">{correctCount}</span> de <span className="font-semibold text-foreground">{totalReviewed}</span> tarjetas sin necesidad de repaso
              </p>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="h-3 rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${totalReviewed > 0 ? (correctCount / totalReviewed) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Tarjetas marcadas para repasar */}
            {markedForReview.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6 space-y-4 text-left">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Bookmark className="h-5 w-5 text-orange-500" />
                  <span>Tarjetas para repasar ({markedForReview.length})</span>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {markedForReview.map((card, index) => (
                    <div key={card.id} className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {index + 1}
                        </span>
                        <div className="flex-1 space-y-2">
                          <p className="text-sm font-medium text-foreground">{card.question}</p>
                          <p className="text-sm text-muted-foreground">{card.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button onClick={startStudying} className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                Estudiar de nuevo
              </Button>
              <Button variant="outline" onClick={closeResults} className="w-full">
                Ver todas las tarjetas
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Flashcards</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Repasa con tarjetas de memoria</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <StudyFiltersPopover
            topics={topics}
            items={flashcards}
            activeConvocatoria={activeConvocatoria}
            filterMode={filterMode}
            selectedTopicIds={selectedTopics}
            originFilter={originFilter}
            expandedGroups={expandedGroups}
            onFilterModeChange={setFilterMode}
            onSelectedTopicsChange={setSelectedTopics}
            onOriginFilterChange={setOriginFilter}
            onExpandedGroupsChange={setExpandedGroups}
            filteredCount={filteredFlashcards.length}
          />
          <QuestionCountSelector
            totalAvailable={filteredFlashcards.length}
            selectedCount={effectiveCardCount}
            onCountChange={setQuestionLimit}
          />
          {isMobile ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={startStudying} size="icon" className="shrink-0">
                  <Play className="h-4 w-4" />
                  <span className="sr-only">Estudiar ({effectiveCardCount})</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Estudiar ({effectiveCardCount})</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button onClick={startStudying}>
              <Play className="h-4 w-4 mr-2" />
              Estudiar ({effectiveCardCount})
            </Button>
          )}
        </div>
      </div>

      {studying && currentCard ? (
        <div className="max-w-2xl mx-auto">
          {/* Botón terminar sesión arriba */}
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStudying(false);
                setStudyDeck([]);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Terminar sesión
            </Button>
          </div>
          
          <div className="mb-4 text-center text-sm text-muted-foreground">
            Tarjeta {currentIndex + 1} de {activeDeck.length}
            {markedForReview.length > 0 && (
              <span className="ml-2 text-orange-500">
                ({markedForReview.length} marcadas)
              </span>
            )}
            {currentCard.topicId && getTopicById(currentCard.topicId) && (
              <Badge
                className="ml-2"
                style={{ backgroundColor: getTopicById(currentCard.topicId)?.color || '#6b7280' }}
              >
                {getTopicById(currentCard.topicId)?.tag || getTopicById(currentCard.topicId)?.title}
              </Badge>
            )}

            <Badge variant="secondary" className="ml-2">
              {getOriginLabel(currentCard.origin)}
            </Badge>
          </div>
          
          {/* Contenedor con perspectiva 3D */}
          <div 
            className="relative min-h-[220px] sm:min-h-[300px] cursor-pointer"
            style={{ perspective: '1000px' }}
            onClick={() => {
              if (pendingNextIndex !== null) return;
              setShowAnswer(!showAnswer);
            }}
          >
            <div
              className="relative w-full h-full"
              style={{
                transformStyle: 'preserve-3d',
                transform: showAnswer ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
              }}
            >
              {/* Cara frontal - Pregunta */}
              <Card
                className="absolute inset-0 min-h-[220px] sm:min-h-[300px] border-border shadow-lg"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <CardContent className="p-4 sm:p-8 flex flex-col items-center justify-center min-h-[220px] sm:min-h-[300px]">
                  <div
                    className={`transition-all duration-300 ease-out ${
                      cardTextVisible ? 'opacity-100 blur-none' : 'opacity-0 blur-sm'
                    }`}
                  >
                    <p className="text-base sm:text-xl text-center text-foreground">
                      {currentCard.question}
                    </p>
                  </div>
                  {!showAnswer && pendingNextIndex === null && (
                    <p className="mt-4 text-xs text-muted-foreground text-center opacity-70">
                      Pulsa para ver la respuesta
                    </p>
                  )}
                </CardContent>
              </Card>
              
              {/* Cara trasera - Respuesta */}
              <Card
                className="absolute inset-0 min-h-[220px] sm:min-h-[300px] border-border shadow-lg"
                style={{ 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background: 'linear-gradient(135deg, white 0%, hsl(var(--primary) / 0.15) 100%)',
                }}
              >
                <CardContent className="p-4 sm:p-8 flex flex-col items-center justify-center min-h-[220px] sm:min-h-[300px]">
                  <div
                    className={`transition-all duration-300 ease-out ${
                      cardTextVisible ? 'opacity-100 blur-none' : 'opacity-0 blur-sm'
                    }`}
                  >
                    <p className="text-base sm:text-xl text-center text-foreground">
                      {currentCard.answer}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {showAnswer && (
            <div className="flex justify-center gap-2 sm:gap-4 mt-6">
              {isMobile ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="lg"
                        className="flex-1"
                        disabled={pendingNextIndex !== null}
                        onClick={() => handleReview(true)}
                      >
                        <Bookmark className="h-5 w-5 text-orange-500" />
                        <span className="sr-only">Marcar para repasar</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Marcar para repasar</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="lg"
                        className="flex-1"
                        disabled={pendingNextIndex !== null}
                        onClick={() => handleReview(false)}
                      >
                        <Check className="h-5 w-5" />
                        <span className="sr-only">Siguiente</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Siguiente</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 max-w-[200px]"
                    disabled={pendingNextIndex !== null}
                    onClick={() => handleReview(true)}
                  >
                    <Bookmark className="h-5 w-5 mr-2 text-orange-500" />
                    Marcar para repasar
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 max-w-[150px]"
                    disabled={pendingNextIndex !== null}
                    onClick={() => handleReview(false)}
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Siguiente
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          {filteredFlashcards.length === 0 ? (
            <Card className="border-border border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No hay tarjetas para los filtros seleccionados.
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
                  {filteredFlashcards.map((card) => {
                    const topic = getTopicById(card.topicId);
                    const tag = getOriginTag(card.origin);
                    const TagIcon = tag.icon;
                    return (
                      <Card key={card.id} className="border-border">
                        <CardContent className="p-3 sm:p-4 flex flex-col h-full">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-xs text-muted-foreground">Pregunta</p>
                          </div>
                          <p className="font-medium text-foreground mb-3 line-clamp-3 text-sm sm:text-base">
                            {card.question}
                          </p>
                          <p className="text-xs text-muted-foreground">Respuesta</p>
                          <p className="text-xs sm:text-sm text-primary line-clamp-2 flex-1">
                            {card.answer}
                          </p>
                          <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-2">
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
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFlashcards.map((card, index) => {
                    const topic = getTopicById(card.topicId);
                    const tag = getOriginTag(card.origin);
                    const TagIcon = tag.icon;
                    return (
                      <Card key={card.id} className="border-border">
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
                              <p className="text-foreground font-medium">{card.question}</p>
                              <p className="text-sm text-primary mt-1">Respuesta: {card.answer}</p>
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

export default Flashcards;
