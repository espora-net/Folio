'use client';

import { useEffect, useState } from 'react';
import { Calendar, CreditCard, FileText } from 'lucide-react';
import Link from 'next/link';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  nextReviewDate: string;
}

export default function EstudiarHoyPage() {
  const [flashcardsToReview, setFlashcardsToReview] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayContent();
  }, []);

  const fetchTodayContent = async () => {
    try {
      const response = await fetch('/api/flashcards');
      const allFlashcards: Flashcard[] = await response.json();
      
      // Filter flashcards due for review today
      const today = new Date();
      const dueFlashcards = allFlashcards.filter(fc => {
        const reviewDate = new Date(fc.nextReviewDate);
        return reviewDate <= today;
      });
      
      setFlashcardsToReview(dueFlashcards);
    } catch (error) {
      console.error('Error fetching today\'s content:', error);
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold">Estudiar hoy</h1>
        </div>
        <p className="text-zinc-400">
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Flashcards due today */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold">Tarjetas para repasar</h2>
            </div>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
              {flashcardsToReview.length}
            </span>
          </div>
          
          {flashcardsToReview.length > 0 ? (
            <div className="space-y-3">
              {flashcardsToReview.slice(0, 5).map((flashcard) => (
                <div 
                  key={flashcard.id}
                  className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
                >
                  <p className="text-sm text-zinc-300">{flashcard.question}</p>
                </div>
              ))}
              <Link
                href="/tarjetas"
                className="block mt-4 text-center py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-all"
              >
                Comenzar repaso
              </Link>
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-500">
              No hay tarjetas programadas para hoy. ¡Buen trabajo!
            </div>
          )}
        </div>

        {/* Quick access to tests */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-orange-400" />
            <h2 className="text-xl font-semibold">Práctica de test</h2>
          </div>
          
          <p className="text-zinc-400 mb-4">
            Realiza un test rápido para evaluar tu progreso
          </p>
          
          <Link
            href="/test"
            className="block text-center py-3 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-all"
          >
            Hacer un test
          </Link>
        </div>

        {/* Study tips */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-lg font-semibold mb-3">💡 Consejo del día</h3>
          <p className="text-zinc-400 text-sm">
            Dedica al menos 30 minutos al día a repasar tarjetas. La constancia 
            es más importante que la cantidad. El repaso espaciado te ayudará a 
            retener mejor la información a largo plazo.
          </p>
        </div>
      </div>
    </div>
  );
}
