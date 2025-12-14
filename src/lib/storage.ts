import { fetchDatabaseFromApi, getCachedDatabase } from './data-api';
import { type Database, type Flashcard, type StudyStats, type TestQuestion, type Topic } from './data-types';

export { type Database, type Flashcard, type StudyStats, type TestQuestion, type Topic } from './data-types';

// Local storage utilities for study data

const STORAGE_KEYS = {
  TOPICS: 'folio_topics',
  FLASHCARDS: 'folio_flashcards',
  QUESTIONS: 'folio_questions',
  STATS: 'folio_stats',
};

export const getTopics = (): Topic[] => {
  if (typeof window === 'undefined') return getCachedDatabase().topics;
  const data = localStorage.getItem(STORAGE_KEYS.TOPICS);
  return data ? JSON.parse(data) : getCachedDatabase().topics;
};

export const saveTopics = (topics: Topic[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics));
  window.dispatchEvent(new Event('folio-data-updated'));
};

export const getFlashcards = (): Flashcard[] => {
  if (typeof window === 'undefined') return getCachedDatabase().flashcards;
  const data = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
  return data ? JSON.parse(data) : getCachedDatabase().flashcards;
};

export const saveFlashcards = (flashcards: Flashcard[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(flashcards));
};

export const getQuestions = (): TestQuestion[] => {
  if (typeof window === 'undefined') return getCachedDatabase().questions;
  const data = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
  return data ? JSON.parse(data) : getCachedDatabase().questions;
};

export const saveQuestions = (questions: TestQuestion[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
};

export const getStats = (): StudyStats => {
  if (typeof window === 'undefined') return getCachedDatabase().stats;
  const data = localStorage.getItem(STORAGE_KEYS.STATS);
  return data ? JSON.parse(data) : getCachedDatabase().stats;
};

export const saveStats = (stats: StudyStats) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
};

export const updateStreak = () => {
  const stats = getStats();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (stats.lastStudyDate === today) {
    return stats.streak;
  } else if (stats.lastStudyDate === yesterday) {
    stats.streak += 1;
  } else {
    stats.streak = 1;
  }
  
  stats.lastStudyDate = today;
  saveStats(stats);
  return stats.streak;
};

// Bridge API data with localStorage without overwriting existing progress
export const hydrateFromApi = async () => {
  const database = await fetchDatabaseFromApi();

  if (typeof window === 'undefined') return database;

  const stored = {
    topics: localStorage.getItem(STORAGE_KEYS.TOPICS),
    flashcards: localStorage.getItem(STORAGE_KEYS.FLASHCARDS),
    questions: localStorage.getItem(STORAGE_KEYS.QUESTIONS),
    stats: localStorage.getItem(STORAGE_KEYS.STATS),
  };

  // Siempre actualizar topics para obtener tags y colores nuevos,
  // pero preservar el estado 'completed' del usuario
  if (stored.topics) {
    const localTopics: Topic[] = JSON.parse(stored.topics);
    const mergedTopics = database.topics.map(apiTopic => {
      const localTopic = localTopics.find(t => t.id === apiTopic.id);
      return {
        ...apiTopic,
        completed: localTopic?.completed ?? apiTopic.completed,
      };
    });
    saveTopics(mergedTopics);
  } else {
    saveTopics(database.topics);
  }

  if (!stored.flashcards) saveFlashcards(database.flashcards);
  if (!stored.questions) saveQuestions(database.questions);
  if (!stored.stats) saveStats(database.stats);

  return database;
};
