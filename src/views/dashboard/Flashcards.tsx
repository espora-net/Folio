'use client';

import { useState, useEffect, useMemo } from 'react';
import { RotateCcw, Check, Bookmark, Filter, Trophy, X, ChevronDown, ChevronRight, LayoutGrid, List, Sparkles } from 'lucide-react';
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
import { Flashcard, Topic, getFlashcards, getTopics, getStats, saveStats } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

type TopicGroup = {
  parent: Topic;
  subtopics: Topic[];
  totalCards: number;
};

type ViewMode = 'cards' | 'list';
type OriginFilter = 'all' | 'generated' | 'oposito.es';

const Flashcards = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [originFilter, setOriginFilter] = useState<OriginFilter>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studying, setStudying] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalReviewed, setTotalReviewed] = useState(0);
  const [markedForReview, setMarkedForReview] = useState<Flashcard[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = () => {
      setFlashcards(getFlashcards());
      setTopics(getTopics());
    };
    
    loadData();
    
    // Escuchar actualizaciones de datos
    window.addEventListener('folio-data-updated', loadData);
    return () => window.removeEventListener('folio-data-updated', loadData);
  }, []);

  // Agrupar topics por jerarquía (padres y subtopics)
  const topicGroups = useMemo((): TopicGroup[] => {
    const parentTopics = topics.filter(t => !t.parentId);
    const groups: TopicGroup[] = [];

    parentTopics.forEach(parent => {
      const subtopics = topics.filter(t => t.parentId === parent.id);
      const allTopicIds = [parent.id, ...subtopics.map(s => s.id)];
      const totalCards = flashcards.filter(f => allTopicIds.includes(f.topicId)).length;
      
      groups.push({
        parent,
        subtopics,
        totalCards,
      });
    });
    
    return groups;
  }, [topics, flashcards]);

  const filteredFlashcards = useMemo(() => {
    let result = flashcards;

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
  }, [flashcards, selectedTopics, originFilter]);

  const getTopicById = (topicId: string) => topics.find(t => t.id === topicId);

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

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

  const selectAllTopics = () => {
    setSelectedTopics(topics.map(t => t.id));
  };

  const clearAllTopics = () => {
    setSelectedTopics([]);
  };

  const handleReview = (markForReview: boolean) => {
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

    setShowAnswer(false);
    if (currentIndex < filteredFlashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setStudying(false);
      setShowFinalResults(true);
    }
  };

  const startStudying = () => {
    if (filteredFlashcards.length === 0) {
      toast({ title: 'Sin tarjetas', description: 'No hay tarjetas para estudiar con los filtros seleccionados.', variant: 'destructive' });
      return;
    }
    setStudying(true);
    setShowFinalResults(false);
    setCurrentIndex(0);
    setShowAnswer(false);
    setCorrectCount(0);
    setTotalReviewed(filteredFlashcards.length);
    setMarkedForReview([]);
  };

  const closeResults = () => {
    setShowFinalResults(false);
  };

  const getResultIcon = () => {
    const percentage = (correctCount / totalReviewed) * 100;
    if (percentage >= 80) return { color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    if (percentage >= 50) return { color: 'text-green-500', bg: 'bg-green-500/10' };
    return { color: 'text-orange-500', bg: 'bg-orange-500/10' };
  };

  const currentCard = filteredFlashcards[currentIndex];

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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Flashcards</h1>
          <p className="text-muted-foreground">Repasa con tarjetas de memoria</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={startStudying}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Estudiar ({filteredFlashcards.length})
          </Button>
        </div>
      </div>

      {studying && currentCard ? (
        <div className="max-w-2xl mx-auto">
          {/* Botón terminar sesión arriba */}
          <div className="flex justify-end mb-4">
            <Button variant="ghost" size="sm" onClick={() => setStudying(false)}>
              <X className="h-4 w-4 mr-2" />
              Terminar sesión
            </Button>
          </div>
          
          <div className="mb-4 text-center text-sm text-muted-foreground">
            Tarjeta {currentIndex + 1} de {filteredFlashcards.length}
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
          </div>
          
          {/* Contenedor con perspectiva 3D */}
          <div 
            className="relative min-h-[300px] cursor-pointer"
            style={{ perspective: '1000px' }}
            onClick={() => setShowAnswer(!showAnswer)}
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
                className="absolute inset-0 min-h-[300px] border-border shadow-lg"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px]">
                  <p className="text-sm text-muted-foreground mb-4">Pregunta</p>
                  <p className="text-xl text-center text-foreground">
                    {currentCard.question}
                  </p>
                  <p className="text-sm text-muted-foreground mt-6">
                    Toca para ver la respuesta
                  </p>
                </CardContent>
              </Card>
              
              {/* Cara trasera - Respuesta */}
              <Card
                className="absolute inset-0 min-h-[300px] border-border shadow-lg"
                style={{ 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background: 'linear-gradient(135deg, white 0%, hsl(var(--primary) / 0.15) 100%)',
                }}
              >
                <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px]">
                  <p className="text-sm text-primary mb-4">Respuesta</p>
                  <p className="text-xl text-center text-foreground">
                    {currentCard.answer}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {showAnswer && (
            <div className="flex justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 max-w-[200px]"
                onClick={() => handleReview(true)}
              >
                <Bookmark className="h-5 w-5 mr-2 text-orange-500" />
                Marcar para repasar
              </Button>
              <Button
                size="lg"
                className="flex-1 max-w-[150px]"
                onClick={() => handleReview(false)}
              >
                <Check className="h-5 w-5 mr-2" />
                Siguiente
              </Button>
            </div>
          )}

          {/* Filtro por origen (como en Tests) */}
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
                    <p>Incluye origin 'generated' e 'ia'</p>
                  </TooltipContent>
                </Tooltip>

                <Button
                  variant={originFilter === 'oposito.es' ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() => setOriginFilter('oposito.es')}
                >
                  oposito.es
                </Button>
              </div>
            </div>
          </TooltipProvider>
        </div>
      ) : (
        <>
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
                            {group.totalCards}
                          </Badge>
                        </button>
                      </div>
                      
                      {/* Subtopics */}
                      {isExpanded && group.subtopics.length > 0 && (
                        <div className="border-t border-border bg-muted/30">
                          {group.subtopics.map((subtopic) => {
                            const isSelected = selectedTopics.includes(subtopic.id);
                            const cardCount = flashcards.filter(f => f.topicId === subtopic.id).length;
                            
                            return (
                              <button
                                key={subtopic.id}
                                onClick={() => toggleTopic(subtopic.id)}
                                className={`w-full flex items-center gap-2 px-3 py-2 pl-10 text-left hover:bg-muted/50 transition-colors ${
                                  isSelected ? 'bg-primary/5 text-primary' : 'text-muted-foreground'
                                }`}
                              >
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  isSelected ? 'bg-primary' : 'bg-muted-foreground/30'
                                }`} />
                                <span className="text-xs flex-1 truncate">{subtopic.title}</span>
                                <span className="text-[10px] text-muted-foreground">{cardCount}</span>
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
                  {filteredFlashcards.map((card) => {
                    const topic = getTopicById(card.topicId);
                    return (
                      <Card key={card.id} className="border-border">
                        <CardContent className="p-4 flex flex-col h-full">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-xs text-muted-foreground">Pregunta</p>
                          </div>
                          <p className="font-medium text-foreground mb-3 line-clamp-2">
                            {card.question}
                          </p>
                          <p className="text-xs text-muted-foreground">Respuesta</p>
                          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                            {card.answer}
                          </p>
                          {topic && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <Badge
                                className="text-[10px] px-2 py-0.5"
                                style={{ backgroundColor: topic.color || '#6b7280' }}
                              >
                                {topic.tag || topic.title}
                              </Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFlashcards.map((card, index) => {
                    const topic = getTopicById(card.topicId);
                    return (
                      <Card key={card.id} className="border-border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm text-muted-foreground">#{index + 1}</span>
                                {topic && (
                                  <Badge
                                    className="text-[10px] px-2 py-0.5"
                                    style={{ backgroundColor: topic.color || '#6b7280' }}
                                  >
                                    {topic.tag || topic.title}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-foreground font-medium">{card.question}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {card.answer}
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

export default Flashcards;
