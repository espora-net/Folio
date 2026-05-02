import { fetchDatabaseFromApi, getCachedDatabase, getTopicIdsInConvocatoria } from './data-api';
import { type Database, type Flashcard, type StudyStats, type TestQuestion, type Topic } from './data-types';

export { type Database, type Flashcard, type StudyStats, type TestQuestion, type Topic } from './data-types';

// Local storage utilities for study data

const STORAGE_KEYS = {
  TOPICS: 'folio_topics',
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
  const sanitized = trimmed ? trimmed.replace(/[^\w-]/g, '') : '';
  const fallbackId =
    trimmed && !sanitized
      ? `u-${Array.from(trimmed).reduce((acc, char) => acc + char.charCodeAt(0), 0).toString(16)}`
      : 'guest';
  const safeId = sanitized || fallbackId;
  localStorage.setItem(ACTIVE_USER_KEY, safeId);
};

const getActiveQuestionScope = (database = getCachedDatabase()) => {
  const studyType = getStudyType();
  const studyTypeEntry = database.studyTypes?.find(entry => entry.id === studyType);
  const activeConvocatoria =
    (studyTypeEntry?.convocatoriaId
      ? database.convocatorias?.find(convocatoria => convocatoria.id === studyTypeEntry.convocatoriaId)
      : undefined) ??
    database.convocatorias?.find(convocatoria => convocatoria.activa && convocatoria.studyType === studyType);
  const datasetIds = activeConvocatoria?.questionDatasetIds?.length
    ? activeConvocatoria.questionDatasetIds
    : studyTypeEntry?.questionDatasetIds ?? [];
  const topicIds = activeConvocatoria
    ? getTopicIdsInConvocatoria(database.topics, activeConvocatoria.id, database)
    : [];
  return {
    datasetIds: new Set(datasetIds),
    topicIds: topicIds.length ? new Set(topicIds) : null,
  };
};

const getActiveQuestionDatasetIds = (database = getCachedDatabase()): Set<string> => {
  return getActiveQuestionScope(database).datasetIds;
};

const filterTopicsByActiveDatasets = (topics: Topic[], database = getCachedDatabase()): Topic[] => {
  const { datasetIds, topicIds } = getActiveQuestionScope(database);
  if (datasetIds.size === 0) return topics;
  return topics.filter(topic => {
    if (!topic.sourceDatasetId || !datasetIds.has(topic.sourceDatasetId)) return false;
    if (!topicIds) return true;
    return topicIds.has(topic.id);
  });
};

const filterQuestionsByActiveDatasets = (questions: TestQuestion[], database = getCachedDatabase()): TestQuestion[] => {
  const { datasetIds, topicIds } = getActiveQuestionScope(database);
  if (datasetIds.size === 0) return questions;
  return questions.filter(question => {
    if (!question.sourceDatasetId || !datasetIds.has(question.sourceDatasetId)) return false;
    if (!topicIds) return true;
    return topicIds.has(question.topicId);
  });
};

const filterFlashcardsByActiveDatasets = (flashcards: Flashcard[], database = getCachedDatabase()): Flashcard[] => {
  const { datasetIds, topicIds } = getActiveQuestionScope(database);
  if (datasetIds.size === 0) return flashcards;
  return flashcards.filter(card => {
    if (!card.sourceDatasetId || !datasetIds.has(card.sourceDatasetId)) return false;
    if (!topicIds) return true;
    return topicIds.has(card.topicId);
  });
};

export const getTopics = (): Topic[] => {
  const database = getCachedDatabase();
  const apiTopics = filterTopicsByActiveDatasets(database.topics, database);
  if (typeof window === 'undefined') return apiTopics;
  
  const stored = readFromStorage<Topic[]>('TOPICS', []);
  if (!stored || stored.length === 0) return apiTopics;
  
  // Merge: usar datos de la API (incluye syllabusCoverageIds, etc.) 
  // pero preservar estado del usuario (completed)
  return apiTopics.map(apiTopic => {
    const storedTopic = stored.find(t => t.id === apiTopic.id);
    return {
      ...apiTopic,
      completed: storedTopic?.completed ?? apiTopic.completed,
    };
  });
};

export const saveTopics = (topics: Topic[]) => {
  if (typeof window === 'undefined') return;
  writeToStorage('TOPICS', topics);
  window.dispatchEvent(new Event('folio-data-updated'));
};

export const getFlashcards = (): Flashcard[] => {
  const withReviewDefaults = (card: Flashcard): Flashcard => ({
    ...card,
    nextReview: card.nextReview ?? '',
    interval: card.interval ?? 0,
    easeFactor: card.easeFactor ?? 2.5,
    origin: card.origin ?? 'generated',
  });

  const database = getCachedDatabase();
  const questions = typeof window === 'undefined'
    ? filterQuestionsByActiveDatasets(database.questions, database)
    : getQuestions();

  const questionFlashcards = questions.map(q => {
    const answer = q.options[q.correctIndex] ?? '';
    return {
      id: q.id,
      topicId: q.topicId,
      question: q.question,
      answer,
      nextReview: '',
      interval: 0,
      easeFactor: 2.5,
      origin: q.origin ?? 'generated',
      sourceDatasetId: q.sourceDatasetId,
    } as Flashcard;
  });

  const questionIds = new Set(questions.map(q => q.id));
  const questionTopicIds = new Set(questions.map(q => q.topicId));
  const questionDatasetIds = new Set(
    questions
      .map(q => q.sourceDatasetId)
      .filter((sourceDatasetId): sourceDatasetId is string => Boolean(sourceDatasetId))
  );

  const explicitFlashcards = filterFlashcardsByActiveDatasets(database.flashcards, database)
    .map(withReviewDefaults)
    .filter(card => {
      if (questionIds.has(card.id)) return false;
      if (questionTopicIds.has(card.topicId)) return false;
      if (card.sourceDatasetId && questionDatasetIds.has(card.sourceDatasetId)) return false;
      return true;
    });

  return [...questionFlashcards, ...explicitFlashcards];
};

export const getQuestions = (): TestQuestion[] => {
  // Las preguntas vienen del runtime optimizado; no se duplican en localStorage.
  const database = getCachedDatabase();
  return filterQuestionsByActiveDatasets(database.questions, database);
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
    stats: hasStoredValue('STATS'),
  };

  // Limpieza: dejar de usar preguntas persistidas en localStorage.
  // Mantenerlo aquí evita que datos antiguos "ganen" al dataset actual.
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('folio_questions');
      localStorage.removeItem(scopedKey('folio_questions'));
    } catch {
      // noop
    }
  }

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

  if (!stored.stats) saveStats(database.stats);

  return database;
};

// User preferences for study type
import { type StudyType, type UserPreferences, type StudyFilters, type FilterMode, STUDY_TYPES } from './data-types';
export { type StudyType, type UserPreferences, type StudyFilters, type FilterMode, STUDY_TYPES } from './data-types';

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

// Study filters (persisted per user)
const DEFAULT_FILTERS: StudyFilters = {
  convocatoriaFilter: false, // deprecated
  filterMode: 'none',
  selectedTopicIds: [],
  originFilter: 'all',
  questionLimit: 0, // 0 = all
};

export const getStudyFilters = (): StudyFilters => {
  const prefs = getUserPreferences();
  return prefs?.filters ?? DEFAULT_FILTERS;
};

export const saveStudyFilters = (filters: Partial<StudyFilters>) => {
  const prefs = getUserPreferences();
  const currentFilters = prefs?.filters ?? DEFAULT_FILTERS;
  const updatedFilters: StudyFilters = {
    ...currentFilters,
    ...filters,
  };
  saveUserPreferences({
    ...(prefs ?? { studyType: 'oposiciones', onboardingCompleted: false }),
    filters: updatedFilters,
  });
};
