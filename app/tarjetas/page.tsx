'use client';

import { useEffect, useState } from 'react';
import { CreditCard, RotateCw, Check, X } from 'lucide-react';
import { DocumentReferenceCard } from '@/components/DocumentReference';
import type { Flashcard } from '@/types';

export default function TarjetasPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    try {
      const response = await fetch('/api/flashcards');
      const data = await response.json();
      setFlashcards(data);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = async (correct: boolean) => {
    const currentCard = flashcards[currentIndex];
    
    try {
      // Update flashcard review data
      await fetch('/api/flashcards', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentCard.id,
          correct,
        }),
      });
      
      // Move to next card
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      } else {
        // Finished all cards
        alert('¡Has completado todas las tarjetas!');
        setCurrentIndex(0);
        setIsFlipped(false);
        fetchFlashcards(); // Refresh to get updated data
      }
    } catch (error) {
      console.error('Error updating flashcard:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Cargando...</div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold">Tarjetas</h1>
          </div>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
          <p className="text-zinc-500">No hay tarjetas disponibles</p>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold">Tarjetas</h1>
        </div>
        <p className="text-zinc-400">
          Tarjeta {currentIndex + 1} de {flashcards.length}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-purple-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="mb-6">
        <div 
          className="relative bg-zinc-900 rounded-xl border border-zinc-800 p-8 min-h-[300px] flex flex-col justify-center items-center cursor-pointer hover:border-zinc-700 transition-all"
          onClick={handleFlip}
        >
          <div className="text-center">
            {!isFlipped ? (
              <>
                <div className="text-sm text-zinc-500 mb-4">Pregunta</div>
                <p className="text-2xl font-medium mb-6">{currentCard.question}</p>
                <div className="flex items-center justify-center gap-2 text-zinc-600">
                  <RotateCw className="w-4 h-4" />
                  <span className="text-sm">Haz clic para ver la respuesta</span>
                </div>
              </>
            ) : (
              <>
                <div className="text-sm text-zinc-500 mb-4">Respuesta</div>
                <p className="text-xl text-zinc-300 leading-relaxed">{currentCard.answer}</p>
              </>
            )}
          </div>

          {/* Difficulty badge */}
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              currentCard.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
              currentCard.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {currentCard.difficulty === 'easy' ? 'Fácil' : 
               currentCard.difficulty === 'medium' ? 'Media' : 'Difícil'}
            </span>
          </div>
        </div>
      </div>

      {isFlipped && currentCard.source && (
        <DocumentReferenceCard reference={currentCard.source} />
      )}

      {/* Answer buttons */}
      {isFlipped && (
        <div className="flex gap-4">
          <button
            onClick={() => handleAnswer(false)}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
            <span className="font-medium">No lo sabía</span>
          </button>
          <button
            onClick={() => handleAnswer(true)}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl transition-all"
          >
            <Check className="w-5 h-5" />
            <span className="font-medium">Lo sabía</span>
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
          <div className="text-sm text-zinc-500 mb-1">Repasos</div>
          <div className="text-2xl font-bold">{currentCard.reviewCount}</div>
        </div>
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
          <div className="text-sm text-zinc-500 mb-1">Aciertos</div>
          <div className="text-2xl font-bold text-green-400">{currentCard.correctCount}</div>
        </div>
      </div>
    </div>
  );
}
