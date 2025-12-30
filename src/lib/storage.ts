import { fetchDatabaseFromApi, getCachedDatabase } from './data-api';
import { type Database, type Flashcard, type StudyStats, type TestQuestion, type Topic } from './data-types';

export { type Database, type Flashcard, type StudyStats, type TestQuestion, type Topic } from './data-types';

// Local storage utilities for study data

const STORAGE_KEYS = {
  TOPICS: 'folio_topics',
  FLASHCARDS: 'folio_flashcards',
  QUESTIONS: 'folio_questions',
  HIDDEN_FLASHCARDS: 'folio_hidden_flashcards',
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

export const getHiddenFlashcards = (): string[] => {
  if (typeof window === 'undefined') return [];
  return readFromStorage('HIDDEN_FLASHCARDS', [] as string[]);
};

export const saveHiddenFlashcards = (ids: string[]) => {
  if (typeof window === 'undefined') return;
  writeToStorage('HIDDEN_FLASHCARDS', ids);
};

export const hideFlashcard = (id: string) => {
  if (typeof window === 'undefined') return;
  const ids = getHiddenFlashcards();
  if (!ids.includes(id)) {
    ids.push(id);
    saveHiddenFlashcards(ids);
    window.dispatchEvent(new Event('folio-data-updated'));
  }
};

export const setActiveUserId = (userId?: string | null) => {
  if (typeof window === 'undefined') return;
  const trimmed = userId?.trim();
  const sanitized = trimmed ? trimmed.replace(/[^\w-]/g, '') : '';
  const fallbackId =
    trimmed && !sanitized
      ? `u-${Array.from(trimmed).reduce((acc, char) => acc + char.charCodeAt(0), 0).toString(16)}`
      : 'guest';
  const safeId = sanitized || fallbackId;
  localStorage.setItem(ACTIVE_USER_KEY, safeId);
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
  // Derivar flashcards a partir de las preguntas para evitar duplicación de datos.
  const derive = (db: ReturnType<typeof getCachedDatabase>) => {
    const qs = db.questions || [];
    return qs.map(q => {
      // compatibilidad: algunos datasets usan 'correctAnswer' en lugar de 'correctIndex'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyQ: any = q as any;
      const correct = typeof anyQ.correctIndex === 'number' ? anyQ.correctIndex : anyQ.correctAnswer;
      const answer = Array.isArray(q.options) && typeof correct === 'number' ? q.options[correct] : '';
      return {
        id: q.id,
        topicId: q.topicId,
        question: q.question,
        answer,
        nextReview: '',
        interval: 0,
        easeFactor: 2.5,
      } as Flashcard;
    });
  };

  if (typeof window === 'undefined') return derive(getCachedDatabase());
  const all = readFromStorage('FLASHCARDS', derive(getCachedDatabase()));
  const hidden = readFromStorage('HIDDEN_FLASHCARDS', [] as string[]);
  return all.filter(f => !hidden.includes(f.id));
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

  // Siempre actualizar flashcards para obtener source y nuevos campos
  // Ahora derivamos las flashcards a partir de las preguntas de la base de datos
  // pero preservamos el estado de revisión local (nextReview, interval, easeFactor)
  const localFlashcards: Flashcard[] = stored.flashcards ? getFlashcards() : [];
  const derivedFromQuestions = (database.questions || []).map(q => {
    // compatibilidad con nombres de campo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyQ: any = q as any;
    const correct = typeof anyQ.correctIndex === 'number' ? anyQ.correctIndex : anyQ.correctAnswer;
    const answer = Array.isArray(q.options) && typeof correct === 'number' ? q.options[correct] : '';
    const base: Flashcard = {
      id: q.id,
      topicId: q.topicId,
      question: q.question,
      answer,
      nextReview: '',
      interval: 0,
      easeFactor: 2.5,
    };
    const local = localFlashcards.find(f => f.id === base.id);
    if (local) {
      base.nextReview = local.nextReview ?? base.nextReview;
      base.interval = local.interval ?? base.interval;
      base.easeFactor = local.easeFactor ?? base.easeFactor;
    }
    return base;
  });
  // Incluir flashcards locales creadas manualmente que no correspondan a preguntas
  const localOnlyFlashcards = localFlashcards.filter(
    local => !(database.questions || []).some(q => q.id === local.id)
  );
  saveFlashcards([...derivedFromQuestions, ...localOnlyFlashcards]);

  // Siempre actualizar questions para obtener source, origin y nuevos campos
  const localQuestions: TestQuestion[] = stored.questions ? getQuestions() : [];
  const mergedQuestions = database.questions.map(apiQuestion => {
    // Usar siempre la versión de la API (tiene source, origin, etc.)
    return apiQuestion;
  });
  // Incluir questions creadas localmente que no están en la API
  const localOnlyQuestions = localQuestions.filter(
    local => !database.questions.some(api => api.id === local.id)
  );
  saveQuestions([...mergedQuestions, ...localOnlyQuestions]);

  if (!stored.stats) saveStats(database.stats);

  return database;
};

// User preferences for study type
import { type StudyType, type UserPreferences, STUDY_TYPES } from './data-types';
export { type StudyType, type UserPreferences, STUDY_TYPES } from './data-types';

const PREFERENCES_KEY = 'folio_preferences';

const getPreferencesKey = () => `${PREFERENCES_KEY}::${getActiveUserId()}`;

export const getUserPreferences = (): UserPreferences | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(getPreferencesKey());
  if (!stored) return null;
  try {
    return JSON.parse(stored) as UserPreferences;
  } catch {
    return null;
  }
};

export const saveUserPreferences = (prefs: UserPreferences) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getPreferencesKey(), JSON.stringify(prefs));
  window.dispatchEvent(new CustomEvent('folio-preferences-updated', { detail: prefs }));
};

export const getStudyType = (): StudyType => {
  const prefs = getUserPreferences();
  return prefs?.studyType ?? 'oposiciones'; // Default para compatibilidad
};

export const getStudyTypeConfig = () => {
  const studyType = getStudyType();
  return STUDY_TYPES.find(s => s.id === studyType) ?? STUDY_TYPES[0];
};

export const isOnboardingCompleted = (): boolean => {
  const prefs = getUserPreferences();
  return prefs?.onboardingCompleted ?? false;
};

export const completeOnboarding = (studyType: StudyType, customLabel?: string) => {
  saveUserPreferences({
    studyType,
    studyTypeLabel: customLabel,
    onboardingCompleted: true,
  });
};
