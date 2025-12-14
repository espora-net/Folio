'use client';

import { useState, useEffect } from 'react';
import { Flame, Brain, ClipboardCheck, Target, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import StatsCard from '@/components/dashboard/StatsCard';
import { getStats, getTopics, getFlashcards, getQuestions } from '@/lib/storage';

const Progreso = () => {
  const [stats, setStats] = useState(getStats());
  const [topicsCount, setTopicsCount] = useState(0);
  const [completedTopics, setCompletedTopics] = useState(0);
  const [flashcardsCount, setFlashcardsCount] = useState(0);
  const [questionsCount, setQuestionsCount] = useState(0);

  useEffect(() => {
    setStats(getStats());
    const topics = getTopics();
    setTopicsCount(topics.length);
    setCompletedTopics(topics.filter(t => t.completed).length);
    setFlashcardsCount(getFlashcards().length);
    setQuestionsCount(getQuestions().length);
  }, []);

  const topicsProgress = topicsCount > 0 ? Math.round((completedTopics / topicsCount) * 100) : 0;
  const accuracy = stats.cardsReviewed > 0 
    ? Math.round((stats.correctAnswers / stats.cardsReviewed) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Progreso</h1>
        <p className="text-muted-foreground">Estadísticas de tu aprendizaje</p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Racha actual"
          value={`${stats.streak} días`}
          icon={Flame}
          trend={stats.streak >= 7 ? '¡Increíble!' : stats.streak >= 3 ? '¡Sigue así!' : '¡Tú puedes!'}
        />
        <StatsCard
          title="Precisión"
          value={`${accuracy}%`}
          icon={Target}
        />
        <StatsCard
          title="Tarjetas repasadas"
          value={stats.cardsReviewed}
          icon={Brain}
        />
        <StatsCard
          title="Tests completados"
          value={stats.testsCompleted}
          icon={ClipboardCheck}
        />
      </div>

      {/* Progress Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Progreso del temario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Temas completados</span>
                <span className="font-medium text-foreground">{completedTopics}/{topicsCount}</span>
              </div>
              <Progress value={topicsProgress} className="h-3" />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{topicsCount}</p>
                <p className="text-xs text-muted-foreground">Temas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{flashcardsCount}</p>
                <p className="text-xs text-muted-foreground">Flashcards</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{questionsCount}</p>
                <p className="text-xs text-muted-foreground">Preguntas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Tiempo de estudio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-4">
              <p className="text-5xl font-bold text-primary">
                {Math.round(stats.totalStudyTime / 60)}
              </p>
              <p className="text-muted-foreground mt-2">horas totales</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xl font-bold text-foreground">
                  {stats.cardsReviewed}
                </p>
                <p className="text-xs text-muted-foreground">Repasos totales</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xl font-bold text-foreground">
                  {stats.correctAnswers}
                </p>
                <p className="text-xs text-muted-foreground">Respuestas correctas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Motivation Card */}
      <Card className="border-border bg-primary/5">
        <CardContent className="p-6 text-center">
          <p className="text-lg text-foreground">
            {stats.streak >= 7
              ? '🔥 ¡Increíble racha! Tu constancia te llevará al éxito.'
              : stats.streak >= 3
              ? '💪 ¡Vas muy bien! Mantén el ritmo.'
              : '🚀 ¡Cada día cuenta! Estudia hoy para mantener tu racha.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Progreso;
