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
const ACTIVE_USER_KEY = 'folio_active_user_id';

const getActiveUserId = () => {
  if (typeof window === 'undefined') return 'guest';
  const stored = localStorage.getItem(ACTIVE_USER_KEY);
  return stored && stored.trim() ? stored : 'guest';
};

const scopedKey = (key: string) => `${key}::${getActiveUserId()}`;

const safeParse = <T>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const readFromStorage = <T>(key: keyof typeof STORAGE_KEYS, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  const scoped = safeParse<T>(localStorage.getItem(scopedKey(STORAGE_KEYS[key])));
  if (scoped) return scoped;
  const legacy = safeParse<T>(localStorage.getItem(STORAGE_KEYS[key]));
  return legacy ?? fallback;
};

const writeToStorage = <T>(key: keyof typeof STORAGE_KEYS, value: T) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(scopedKey(STORAGE_KEYS[key]), JSON.stringify(value));
};

const hasStoredValue = (key: keyof typeof STORAGE_KEYS) => {
  if (typeof window === 'undefined') return false;
  return Boolean(
    localStorage.getItem(scopedKey(STORAGE_KEYS[key])) ??
    localStorage.getItem(STORAGE_KEYS[key])
  );
};

export const setActiveUserId = (userId?: string | null) => {
  if (typeof window === 'undefined') return;
  const trimmed = userId?.trim();
  const sanitized = trimmed ? trimmed.replace(/[^\w-]/g, '') || 'guest' : 'guest';
  localStorage.setItem(ACTIVE_USER_KEY, sanitized);
};

export const getTopics = (): Topic[] => {
  if (typeof window === 'undefined') return getCachedDatabase().topics;
  return readFromStorage('TOPICS', getCachedDatabase().topics);
};

export const saveTopics = (topics: Topic[]) => {
  if (typeof window === 'undefined') return;
  writeToStorage('TOPICS', topics);
  window.dispatchEvent(new Event('folio-data-updated'));
};

export const getFlashcards = (): Flashcard[] => {
  if (typeof window === 'undefined') return getCachedDatabase().flashcards;
  return readFromStorage('FLASHCARDS', getCachedDatabase().flashcards);
};

export const saveFlashcards = (flashcards: Flashcard[]) => {
  if (typeof window === 'undefined') return;
  writeToStorage('FLASHCARDS', flashcards);
};

export const getQuestions = (): TestQuestion[] => {
  if (typeof window === 'undefined') return getCachedDatabase().questions;
  return readFromStorage('QUESTIONS', getCachedDatabase().questions);
};

export const saveQuestions = (questions: TestQuestion[]) => {
  if (typeof window === 'undefined') return;
  writeToStorage('QUESTIONS', questions);
};

export const getStats = (): StudyStats => {
  if (typeof window === 'undefined') return getCachedDatabase().stats;
  return readFromStorage('STATS', getCachedDatabase().stats);
};

export const saveStats = (stats: StudyStats) => {
  if (typeof window === 'undefined') return;
  writeToStorage('STATS', stats);
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
    topics: hasStoredValue('TOPICS'),
    flashcards: hasStoredValue('FLASHCARDS'),
    questions: hasStoredValue('QUESTIONS'),
    stats: hasStoredValue('STATS'),
  };

  // Siempre actualizar topics para obtener tags y colores nuevos,
  // pero preservar el estado 'completed' del usuario
  const localTopics: Topic[] = stored.topics ? getTopics() : [];
  const mergedTopics = database.topics.map(apiTopic => {
    const localTopic = localTopics.find(t => t.id === apiTopic.id);
    return {
      ...apiTopic,
      completed: localTopic?.completed ?? apiTopic.completed,
    };
  });
  saveTopics(mergedTopics);

  if (!stored.flashcards) saveFlashcards(database.flashcards);
  if (!stored.questions) saveQuestions(database.questions);
  if (!stored.stats) saveStats(database.stats);

  return database;
};
