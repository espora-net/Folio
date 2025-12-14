import baseData from '../../data/db.json';
import { type Database } from './data-types';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const DUPLICATE_SLASHES = /\/{2,}/g;
const buildDataEndpoint = (path: string) => {
  const trimmed = path.replace(/\/+$/, '');
  const endpoint = `${trimmed}/api/db.json`.replace(DUPLICATE_SLASHES, '/');
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
};
const DATA_ENDPOINT = buildDataEndpoint(basePath);

let cachedDatabase: Database = baseData as Database;

const isTopic = (topic: unknown): topic is Database['topics'][number] => {
  if (!topic || typeof topic !== 'object') return false;
  const data = topic as Record<string, unknown>;
  const parentId = 'parentId' in data ? data.parentId : null;
  return (
    typeof data.id === 'string' &&
    typeof data.title === 'string' &&
    typeof data.description === 'string' &&
    (parentId === null || typeof parentId === 'string' || typeof parentId === 'undefined') &&
    typeof data.order === 'number' &&
    typeof data.completed === 'boolean'
  );
};

const isFlashcard = (card: unknown): card is Database['flashcards'][number] => {
  if (!card || typeof card !== 'object') return false;
  const data = card as Record<string, unknown>;
  return (
    typeof data.id === 'string' &&
    typeof data.topicId === 'string' &&
    typeof data.question === 'string' &&
    typeof data.answer === 'string' &&
    typeof data.nextReview === 'string' &&
    typeof data.interval === 'number' &&
    typeof data.easeFactor === 'number'
  );
};

const isTestQuestion = (question: unknown): question is Database['questions'][number] => {
  if (!question || typeof question !== 'object') return false;
  const data = question as Record<string, unknown>;
  return (
    typeof data.id === 'string' &&
    typeof data.topicId === 'string' &&
    typeof data.question === 'string' &&
    Array.isArray(data.options) &&
    data.options.every(option => typeof option === 'string') &&
    typeof data.correctIndex === 'number' &&
    typeof data.explanation === 'string'
  );
};

const isValidDatabase = (data: Partial<Database>): data is Database => {
  const stats = data?.stats as Database['stats'] | undefined;
  const statsValid =
    !!stats &&
    typeof stats.totalStudyTime === 'number' &&
    typeof stats.cardsReviewed === 'number' &&
    typeof stats.testsCompleted === 'number' &&
    typeof stats.correctAnswers === 'number' &&
    typeof stats.streak === 'number' &&
    (typeof stats.lastStudyDate === 'string' || stats.lastStudyDate === null);

  return Boolean(
    data &&
    Array.isArray(data.topics) &&
    data.topics.every(isTopic) &&
    Array.isArray(data.flashcards) &&
    data.flashcards.every(isFlashcard) &&
    Array.isArray(data.questions) &&
    data.questions.every(isTestQuestion) &&
    statsValid
  );
};

export const getCachedDatabase = (): Database => cachedDatabase;

export const fetchDatabaseFromApi = async (): Promise<Database> => {
  if (typeof window === 'undefined') {
    return cachedDatabase;
  }

  try {
    const response = await fetch(DATA_ENDPOINT);
    if (!response.ok) {
      throw new Error(`Unexpected response: ${response.status}`);
    }

    const payload = (await response.json()) as Partial<Database>;
    if (isValidDatabase(payload)) {
      cachedDatabase = payload;
    } else {
      throw new Error('Missing sections in the dataset');
    }
  } catch (error) {
    console.warn('Falling back to bundled data after static API failure', error);
  }

  return cachedDatabase;
};
