'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Award } from 'lucide-react';

interface Statistics {
  totalTopics: number;
  totalFlashcards: number;
  totalQuestions: number;
  totalTestAttempts: number;
  averageTestScore: number;
  studyStreak: number;
  lastStudyDate: string;
  flashcardsReviewedToday: number;
  questionsAnsweredToday: number;
  topicProgress: {
    [topicId: string]: {
      flashcardsReviewed: number;
      totalFlashcards: number;
      questionsAnswered: number;
      totalQuestions: number;
      averageScore: number;
    };
  };
}

interface Topic {
  id: string;
  title: string;
}

export default function EstadisticasPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsResponse, topicsResponse] = await Promise.all([
        fetch('/api/statistics'),
        fetch('/api/topics'),
      ]);

      const statsData = await statsResponse.json();
      const topicsData = await topicsResponse.json();

      setStatistics(statsData);
      setTopics(topicsData);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Cargando...</div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold">Estadísticas</h1>
          </div>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
          <p className="text-zinc-500">No hay estadísticas disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold">Estadísticas</h1>
        </div>
        <p className="text-zinc-400">
          Seguimiento de tu progreso y rendimiento
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <div className="text-sm text-zinc-400">Racha de estudio</div>
          </div>
          <div className="text-3xl font-bold">{statistics.studyStreak}</div>
          <div className="text-xs text-zinc-500 mt-1">días consecutivos</div>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <div className="text-sm text-zinc-400">Tarjetas hoy</div>
          </div>
          <div className="text-3xl font-bold text-green-400">
            {statistics.flashcardsReviewedToday}
          </div>
          <div className="text-xs text-zinc-500 mt-1">repasadas</div>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-5 h-5 text-purple-400" />
            <div className="text-sm text-zinc-400">Tests realizados</div>
          </div>
          <div className="text-3xl font-bold text-purple-400">
            {statistics.totalTestAttempts}
          </div>
          <div className="text-xs text-zinc-500 mt-1">completados</div>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-orange-400" />
            <div className="text-sm text-zinc-400">Promedio tests</div>
          </div>
          <div className="text-3xl font-bold text-orange-400">
            {statistics.averageTestScore.toFixed(0)}%
          </div>
          <div className="text-xs text-zinc-500 mt-1">puntuación media</div>
        </div>
      </div>

      {/* Overall progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <div className="text-sm text-zinc-400 mb-2">Total de temas</div>
          <div className="text-2xl font-bold">{statistics.totalTopics}</div>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <div className="text-sm text-zinc-400 mb-2">Total de tarjetas</div>
          <div className="text-2xl font-bold">{statistics.totalFlashcards}</div>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <div className="text-sm text-zinc-400 mb-2">Total de preguntas</div>
          <div className="text-2xl font-bold">{statistics.totalQuestions}</div>
        </div>
      </div>

      {/* Topic progress */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <h2 className="text-xl font-semibold mb-6">Progreso por tema</h2>
        <div className="space-y-4">
          {topics.map((topic) => {
            const progress = statistics.topicProgress[topic.id];
            if (!progress) return null;

            const flashcardProgress = progress.totalFlashcards > 0
              ? (progress.flashcardsReviewed / progress.totalFlashcards) * 100
              : 0;

            return (
              <div key={topic.id} className="bg-zinc-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{topic.title}</h3>
                  <span className="text-sm text-zinc-400">
                    {progress.flashcardsReviewed}/{progress.totalFlashcards} tarjetas
                  </span>
                </div>
                
                <div className="relative h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${flashcardProgress}%` }}
                  />
                </div>
                
                <div className="flex justify-between mt-2 text-xs text-zinc-500">
                  <span>{flashcardProgress.toFixed(0)}% completado</span>
                  <span>{progress.totalQuestions} preguntas disponibles</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivational message */}
      <div className="mt-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20 p-6">
        <h3 className="text-lg font-semibold mb-2">💪 ¡Sigue así!</h3>
        <p className="text-zinc-300 text-sm">
          {statistics.studyStreak > 0
            ? `Llevas ${statistics.studyStreak} ${statistics.studyStreak === 1 ? 'día' : 'días'} estudiando de forma consecutiva. ¡No rompas la racha!`
            : 'Comienza hoy tu racha de estudio. La constancia es la clave del éxito.'}
        </p>
      </div>
    </div>
  );
}
