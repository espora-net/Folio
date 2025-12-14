'use client';

import { useState, useEffect } from 'react';
import { Plus, RotateCcw, Check, Bookmark, Trash2, Filter, Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Flashcard, Topic, getFlashcards, saveFlashcards, getTopics, getStats, saveStats } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const Flashcards = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studying, setStudying] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalReviewed, setTotalReviewed] = useState(0);
  const [markedForReview, setMarkedForReview] = useState<Flashcard[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newTopicId, setNewTopicId] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const filteredFlashcards = selectedTopics.length > 0
    ? flashcards.filter(f => selectedTopics.includes(f.topicId))
    : flashcards;

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

  const handleAddFlashcard = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const flashcard: Flashcard = {
      id: crypto.randomUUID(),
      topicId: newTopicId,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      nextReview: new Date().toISOString(),
      interval: 1,
      easeFactor: 2.5,
    };

    const updated = [...flashcards, flashcard];
    setFlashcards(updated);
    saveFlashcards(updated);
    setNewQuestion('');
    setNewAnswer('');
    setNewTopicId('');
    setDialogOpen(false);
    toast({ title: 'Tarjeta creada' });
  };

  const handleDelete = (id: string) => {
    const updated = flashcards.filter(f => f.id !== id);
    setFlashcards(updated);
    saveFlashcards(updated);
    toast({ title: 'Tarjeta eliminada' });
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
              <button 
                onClick={() => { closeResults(); setDialogOpen(true); }}
                className="block w-full text-sm text-primary hover:underline"
              >
                Añadir nuevas tarjetas para repasar →
              </button>
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva tarjeta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva tarjeta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Tema</Label>
                  <select
                    id="topic"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={newTopicId}
                    onChange={(e) => setNewTopicId(e.target.value)}
                  >
                    <option value="">Sin tema</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.tag || topic.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="question">
                    Pregunta <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="question"
                    placeholder="Escribe la pregunta..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="answer">
                    Respuesta <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="answer"
                    placeholder="Escribe la respuesta..."
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddFlashcard}>
                    Crear tarjeta
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
        </div>
      ) : (
        <>
          {/* Filtros por tags */}
          {topics.length > 0 && (
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
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => {
                  const isSelected = selectedTopics.includes(topic.id);
                  const cardCount = flashcards.filter(f => f.topicId === topic.id).length;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => toggleTopic(topic.id)}
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                        isSelected
                          ? 'ring-2 ring-offset-2 ring-offset-background'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: topic.color || '#6b7280',
                        color: 'white',
                        '--tw-ring-color': topic.color || '#6b7280',
                      } as React.CSSProperties}
                    >
                      {topic.tag || topic.title}
                      <span className="bg-white/20 px-1 py-0.5 rounded-full text-[10px]">
                        {cardCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredFlashcards.length === 0 ? (
            <Card className="border-border border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  {selectedTopics.length > 0
                    ? 'No hay tarjetas para los temas seleccionados.'
                    : 'No tienes tarjetas creadas todavía.'}
                </p>
                <Button variant="outline" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear tu primera tarjeta
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredFlashcards.map((card) => {
                const topic = getTopicById(card.topicId);
                return (
                  <Card key={card.id} className="border-border">
                    <CardContent className="p-4 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs text-muted-foreground">Pregunta</p>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 -mt-1 -mr-1"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar tarjeta?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. La tarjeta será eliminada permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(card.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
          )}
        </>
      )}
    </div>
  );
};

export default Flashcards;
