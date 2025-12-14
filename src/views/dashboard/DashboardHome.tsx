'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Brain, ClipboardCheck, Flame, Clock, BookOpen, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import StatsCard from '@/components/dashboard/StatsCard';
import { getStats, getTopics, getFlashcards, updateStreak, type StudyStats, type Topic } from '@/lib/storage';
import { useAuth } from '@/hooks/useAuth';

const DashboardHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [flashcardsCount, setFlashcardsCount] = useState(0);
  const userInfo = (user as { name?: string; email?: string } | null) || null;
  const username =
    userInfo?.name ||
    (userInfo?.email ? userInfo.email.split('@')[0] : 'estudiante');

  useEffect(() => {
    const currentStats = getStats();
    setStats(currentStats);
    const topicsData = getTopics();
    setTopics(topicsData);
    setFlashcardsCount(getFlashcards().length);
    updateStreak();
  }, []);

  const completedTopics = topics.filter(t => t.completed).length;
  const progress = topics.length > 0 ? Math.round((completedTopics / topics.length) * 100) : 0;
  const safeStats: StudyStats = stats ?? {
    totalStudyTime: 0,
    cardsReviewed: 0,
    testsCompleted: 0,
    correctAnswers: 0,
    streak: 0,
    lastStudyDate: null,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          ¡Hola, {username}! 👋
        </h1>
        <p className="text-muted-foreground">
          Aquí tienes un resumen de tu progreso de estudio.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Racha actual"
          value={`${safeStats.streak} días`}
          icon={Flame}
          trend={safeStats.streak > 0 ? '¡Sigue así!' : '¡Comienza hoy!'}
        />
        <StatsCard
          title="Tarjetas repasadas"
          value={safeStats.cardsReviewed}
          icon={Brain}
        />
        <StatsCard
          title="Tests completados"
          value={safeStats.testsCompleted}
          icon={ClipboardCheck}
        />
        <StatsCard
          title="Tiempo de estudio"
          value={`${Math.round(safeStats.totalStudyTime / 60)}h`}
          icon={Clock}
        />
      </div>

      {/* Progress Card */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Progreso del temario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {completedTopics} de {topics.length} temas completados
              </span>
              <span className="text-sm font-medium text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Repasar Flashcards</h3>
                <p className="text-sm text-muted-foreground">
                  {flashcardsCount} tarjetas disponibles
                </p>
              </div>
              <Link href="/dashboard/flashcards">
                <Button size="icon" variant="ghost">
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Hacer un Test</h3>
                <p className="text-sm text-muted-foreground">
                  Pon a prueba tus conocimientos
                </p>
              </div>
              <Link href="/dashboard/tests">
                <Button size="icon" variant="ghost">
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Ver Temario</h3>
                <p className="text-sm text-muted-foreground">
                  {topics.length} temas registrados
                </p>
              </div>
              <Link href="/dashboard/temario">
                <Button size="icon" variant="ghost">
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
