'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Play, Trash2, CheckCircle, XCircle, Filter, Trophy, RotateCcw, ChevronDown, ChevronRight, LayoutGrid, List, BookOpen, ExternalLink, Sparkles, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TestQuestion, Topic, getQuestions, saveQuestions, getTopics, getStats, saveStats } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

type TopicGroup = {
  parent: Topic;
  subtopics: Topic[];
  totalQuestions: number;
};

type ViewMode = 'cards' | 'list';
type OriginFilter = 'all' | 'generated' | 'published' | 'ia';

const Tests = () => {
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [originFilter, setOriginFilter] = useState<OriginFilter>('all');
  const [testing, setTesting] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sourceDialogOpen, setSourceDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [newExplanation, setNewExplanation] = useState('');
  const [newTopicId, setNewTopicId] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const loadData = () => {
      setQuestions(getQuestions());
      setTopics(getTopics());
    };
    
    loadData();
    
    // Escuchar actualizaciones de datos
    window.addEventListener('folio-data-updated', loadData);
    return () => window.removeEventListener('folio-data-updated', loadData);
  }, []);

  // Filtrar por tema y origen
  const filteredQuestions = useMemo(() => {
    let result = questions;
    
    if (selectedTopics.length > 0) {
      result = result.filter(q => selectedTopics.includes(q.topicId));
    }
    
    if (originFilter !== 'all') {
      if (originFilter === 'generated') {
        // 'generated' should include IA-generated questions as well
        result = result.filter(q => {
          const o = (q.origin || 'generated');
          return o === 'generated' || o === 'ia';
        });
      } else {
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

  const handleAddQuestion = () => {
    if (!newQuestion.trim() || newOptions.some(o => !o.trim())) {
      toast({ title: 'Completa todos los campos', variant: 'destructive' });
      return;
    }

    const question: TestQuestion = {
      id: crypto.randomUUID(),
      topicId: newTopicId,
      question: newQuestion.trim(),
      options: newOptions.map(o => o.trim()),
      correctIndex,
      explanation: newExplanation.trim(),
    };

    const updated = [...questions, question];
    setQuestions(updated);
    saveQuestions(updated);
    setNewQuestion('');
    setNewOptions(['', '', '', '']);
    setCorrectIndex(0);
    setNewExplanation('');
    setNewTopicId('');
    setDialogOpen(false);
    toast({ title: 'Pregunta añadida' });
  };

  const handleDelete = (id: string) => {
    const updated = questions.filter(q => q.id !== id);
    setQuestions(updated);
    saveQuestions(updated);
    toast({ title: 'Pregunta eliminada' });
  };

  const startTest = () => {
    if (filteredQuestions.length === 0) {
      toast({ title: 'Sin preguntas', description: 'No hay preguntas para los temas seleccionados.', variant: 'destructive' });
      return;
    }
    setTesting(true);
    setShowFinalResults(false);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setTotalQuestions(filteredQuestions.length);
  };

  const handleAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === filteredQuestions[currentIndex].correctIndex;
    if (isCorrect) setScore(prev => prev + 1);

    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentIndex < filteredQuestions.length - 1) {
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
  };

  const getResultIcon = () => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage >= 80) return { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    if (percentage >= 50) return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' };
    return { icon: XCircle, color: 'text-orange-500', bg: 'bg-orange-500/10' };
  };

  const currentQuestion = filteredQuestions[currentIndex];

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
                Añadir a flashcards para repasar →
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva pregunta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nueva pregunta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <select
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
                  <Label>
                    Pregunta <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    placeholder="Escribe la pregunta..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    required
                  />
                </div>
                {newOptions.map((option, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>
                        Opción {i + 1} <span className="text-destructive">*</span>
                      </Label>
                      {i === correctIndex && (
                        <span className="text-xs text-primary">(Correcta)</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder={`Opción ${i + 1}`}
                        value={option}
                        onChange={(e) => {
                          const updated = [...newOptions];
                          updated[i] = e.target.value;
                          setNewOptions(updated);
                        }}
                      />
                      <Button
                        variant={correctIndex === i ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setCorrectIndex(i)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="space-y-2">
                  <Label>Explicación (opcional)</Label>
                  <Textarea
                    placeholder="Explica por qué es correcta..."
                    value={newExplanation}
                    onChange={(e) => setNewExplanation(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddQuestion}>
                    Añadir pregunta
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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

          {/* Filtro por origen */}
          <TooltipProvider>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Origen:</span>
              <div className="flex gap-1">
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
                    <p>Creadas por IA a partir del temario</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={originFilter === 'published' ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 px-3 text-xs gap-1.5"
                      onClick={() => setOriginFilter('published')}
                    >
                      <FileCheck className="h-3.5 w-3.5" />
                      Publicadas
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>De exámenes oficiales de oposiciones</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={originFilter === 'ia' ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 px-3 text-xs gap-1.5"
                      onClick={() => setOriginFilter('ia')}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      IA
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Preguntas generadas por IA</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </TooltipProvider>

          {filteredQuestions.length === 0 ? (
            <Card className="border-border border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  {selectedTopics.length > 0 || originFilter !== 'all'
                    ? 'No hay preguntas para los filtros seleccionados.'
                    : 'No tienes preguntas creadas todavía.'}
                </p>
                <Button variant="outline" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear tu primera pregunta
                </Button>
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
                    return (
                      <Card key={q.id} className="border-border">
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
                                  <AlertDialogTitle>¿Eliminar pregunta?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. La pregunta será eliminada permanentemente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(q.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
                                    className={`text-[10px] px-2 py-0.5 gap-1 ${
                                      (q.origin || 'generated') === 'generated' 
                                        ? 'border-violet-300 text-violet-600 dark:border-violet-700 dark:text-violet-400' 
                                        : 'border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400'
                                    }`}
                                  >
                                    {(q.origin || 'generated') === 'generated' ? (
                                      <><Sparkles className="h-3 w-3" /> IA</>
                                    ) : (
                                      <><FileCheck className="h-3 w-3" /> Oficial</>
                                    )}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  {(q.origin || 'generated') === 'generated' 
                                    ? 'Pregunta generada por IA' 
                                    : 'Pregunta de examen oficial'}
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
                                      className={`text-[10px] px-2 py-0.5 gap-1 ${
                                        (q.origin || 'generated') === 'generated' 
                                          ? 'border-violet-300 text-violet-600 dark:border-violet-700 dark:text-violet-400' 
                                          : 'border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400'
                                      }`}
                                    >
                                      {(q.origin || 'generated') === 'generated' ? (
                                        <><Sparkles className="h-3 w-3" /> IA</>
                                      ) : (
                                        <><FileCheck className="h-3 w-3" /> Oficial</>
                                      )}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    {(q.origin || 'generated') === 'generated' 
                                      ? 'Pregunta generada por IA' 
                                      : 'Pregunta de examen oficial'}
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <p className="text-foreground font-medium">{q.question}</p>
                              <p className="text-sm text-primary mt-1">
                                Respuesta correcta: {q.options[q.correctIndex]}
                              </p>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar pregunta?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. La pregunta será eliminada permanentemente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(q.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
