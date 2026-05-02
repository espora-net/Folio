'use client';

import { useState, useEffect, useCallback } from 'react';
import { Flame, Brain, ClipboardCheck, Target, TrendingUp, Clock, ThumbsUp, ThumbsDown } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import StatsCard from '@/components/dashboard/StatsCard';
import { getStats, getTopics, getFlashcards, getQuestions, updateStreak, getStudyTypeConfig, getUserPreferences, getTopicPerformance } from '@/lib/storage';
import { useAuth } from '@/hooks/useAuth';

const Progreso = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(getStats());
  const [topicsCount, setTopicsCount] = useState(0);
  const [completedTopics, setCompletedTopics] = useState(0);
  const [flashcardsCount, setFlashcardsCount] = useState(0);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [studyTypeLabel, setStudyTypeLabel] = useState<string>('');
  const [topicPerformance, setTopicPerformance] = useState<Array<{ topicId: string; title: string; correct: number; incorrect: number; accuracy: number }>>([]);

  const userInfo = (user as { name?: string; email?: string } | null) || null;
  const username =
    userInfo?.name ||
    (userInfo?.email ? userInfo.email.split('@')[0] : 'estudiante');

  const refreshData = useCallback(() => {
    const currentStats = getStats();
    setStats(currentStats);
    const topics = getTopics();
    setTopicsCount(topics.length);
    setCompletedTopics(topics.filter(t => t.completed).length);
    setFlashcardsCount(getFlashcards().length);
    setQuestionsCount(getQuestions().length);

    // Build per-topic performance with topic titles
    const performance = getTopicPerformance();
    const topicMap = new Map(topics.map(t => [t.id, t.title]));
    const enriched = performance
      .filter(p => (p.correct + p.incorrect) > 0)
      .map(p => ({
        topicId: p.topicId,
        title: topicMap.get(p.topicId) || p.topicId,
        correct: p.correct,
        incorrect: p.incorrect,
        accuracy: Math.round((p.correct / (p.correct + p.incorrect)) * 100),
      }))
      .sort((a, b) => (b.correct + b.incorrect) - (a.correct + a.incorrect));
    setTopicPerformance(enriched);
  }, []);

  useEffect(() => {
    refreshData();
    updateStreak();

    const prefs = getUserPreferences();
    const config = getStudyTypeConfig();
    setStudyTypeLabel(prefs?.studyTypeLabel || config.label);

    const onPrefsUpdated = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      const cfg = getStudyTypeConfig();
      setStudyTypeLabel(detail?.studyTypeLabel || cfg.label);
    };
    window.addEventListener('folio-preferences-updated', onPrefsUpdated);
    window.addEventListener('folio-stats-updated', refreshData);
    window.addEventListener('folio-data-updated', refreshData);

    return () => {
      window.removeEventListener('folio-preferences-updated', onPrefsUpdated);
      window.removeEventListener('folio-stats-updated', refreshData);
      window.removeEventListener('folio-data-updated', refreshData);
    };
  }, [refreshData]);

  const topicsProgress = topicsCount > 0 ? Math.round((completedTopics / topicsCount) * 100) : 0;
  const totalAnswered = (stats.questionsAnswered ?? 0) + stats.cardsReviewed;
  const accuracy = totalAnswered > 0
    ? Math.round((stats.correctAnswers / totalAnswered) * 100)
    : 0;

  // Best and worst topics (top 3 each)
  const bestTopics = [...topicPerformance].sort((a, b) => b.accuracy - a.accuracy).slice(0, 3);
  const worstTopics = [...topicPerformance].sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            ¡Hola, {username}! 👋
          </h1>
          <p className="text-muted-foreground">
            Aquí tienes un resumen de tu progreso de estudio.
          </p>
        </div>
        {studyTypeLabel && (
          <Badge variant="secondary" className="text-sm">
            {studyTypeLabel}
          </Badge>
        )}
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
          title="Precisión global"
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
              Actividad de estudio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xl font-bold text-foreground">
                  {stats.simulacrosCompleted ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Simulacros</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xl font-bold text-foreground">
                  {totalAnswered}
                </p>
                <p className="text-xs text-muted-foreground">Preguntas respondidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topic Performance Section */}
      {topicPerformance.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Best Topics */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-green-500" />
                Temas más acertados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bestTopics.map(topic => (
                <Link
                  key={topic.topicId}
                  href="/dashboard/tests"
                  className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 hover:bg-green-500/10 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground truncate mr-2">
                    {topic.title}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-green-600">{topic.accuracy}%</span>
                    <span className="text-xs text-muted-foreground">
                      ({topic.correct}/{topic.correct + topic.incorrect})
                    </span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Worst Topics */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsDown className="h-5 w-5 text-red-500" />
                Temas a reforzar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {worstTopics.map(topic => (
                <Link
                  key={topic.topicId}
                  href="/dashboard/tests"
                  className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 hover:bg-red-500/10 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground truncate mr-2">
                    {topic.title}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-red-600">{topic.accuracy}%</span>
                    <span className="text-xs text-muted-foreground">
                      ({topic.correct}/{topic.correct + topic.incorrect})
                    </span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

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
