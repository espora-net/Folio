import baseIndex from '../../data/db.json';
import constitucionDataset from '../../data/db-constitucion.json';
import { type Database, type DatasetDescriptor, type Flashcard, type StudyStats, type TestQuestion, type Topic } from './data-types';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const DUPLICATE_SLASHES = /\/{2,}/g;
const buildDataEndpoint = (path: string) => {
  const trimmed = path.replace(/\/+$/, '');
  const endpoint = `${trimmed}/api/db.json`.replace(DUPLICATE_SLASHES, '/');
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
};
const DATA_ENDPOINT = buildDataEndpoint(basePath);
const DATASET_BASE_ENDPOINT = DATA_ENDPOINT.replace(/db\.json$/, '');

type RawDataset = Record<string, unknown>;
type DatasetPayload = { descriptor: DatasetDescriptor; data: RawDataset };
type DatabaseIndex = Database;

const FALLBACK_DATASETS: Record<string, RawDataset> = {
  'db-constitucion.json': constitucionDataset as RawDataset,
};

const defaultStats = (): StudyStats => ({
  totalStudyTime: 0,
  cardsReviewed: 0,
  testsCompleted: 0,
  correctAnswers: 0,
  streak: 0,
  lastStudyDate: null,
});

let cachedDatabase: Database = {
  topics: [],
  flashcards: [],
  questions: [],
  stats: defaultStats(),
};

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

const isValidStudyStats = (stats: unknown): stats is StudyStats => {
  if (!stats || typeof stats !== 'object') return false;
  const data = stats as Record<string, unknown>;
  return (
    typeof data.totalStudyTime === 'number' &&
    typeof data.cardsReviewed === 'number' &&
    typeof data.testsCompleted === 'number' &&
    typeof data.correctAnswers === 'number' &&
    typeof data.streak === 'number' &&
    (typeof data.lastStudyDate === 'string' || data.lastStudyDate === null)
  );
};

const isValidDatabase = (data: Partial<Database>): data is Database => {
  const stats = data?.stats as Database['stats'] | undefined;
  const statsValid =
    !!stats && isValidStudyStats(stats);

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

const normalizeStats = (stats?: Partial<StudyStats>): StudyStats => ({
  totalStudyTime: typeof stats?.totalStudyTime === 'number' ? stats.totalStudyTime : 0,
  cardsReviewed: typeof stats?.cardsReviewed === 'number' ? stats.cardsReviewed : 0,
  testsCompleted: typeof stats?.testsCompleted === 'number' ? stats.testsCompleted : 0,
  correctAnswers: typeof stats?.correctAnswers === 'number' ? stats.correctAnswers : 0,
  streak: typeof stats?.streak === 'number' ? stats.streak : 0,
  lastStudyDate:
    typeof stats?.lastStudyDate === 'string' || stats?.lastStudyDate === null
      ? stats?.lastStudyDate ?? null
      : null,
});

const normalizeDatasetTopics = (dataset: RawDataset, descriptor?: DatasetDescriptor): Topic[] => {
  const rawTopics = Array.isArray(dataset.topics) ? dataset.topics : [];
  const tag = descriptor?.tag ?? descriptor?.title;
  return rawTopics.flatMap(raw => {
    if (!raw || typeof raw !== 'object') return [];
    const topicData = raw as Record<string, unknown>;
    const baseTopic: Topic = {
      id: typeof topicData.id === 'string' ? topicData.id : '',
      title: typeof topicData.title === 'string' ? topicData.title : '',
      description: typeof topicData.description === 'string' ? topicData.description : '',
      parentId: null,
      order: typeof topicData.order === 'number' ? topicData.order : 0,
      completed: false,
      tag,
      color: descriptor?.color,
    };

    const subtopics = Array.isArray(topicData.subtopics)
      ? topicData.subtopics
          .map(sub => {
            if (!sub || typeof sub !== 'object') return null;
            const data = sub as Record<string, unknown>;
            return {
              id: typeof data.id === 'string' ? data.id : '',
              title: typeof data.title === 'string' ? data.title : '',
              description: typeof data.content === 'string' ? data.content : '',
              parentId: baseTopic.id,
              order: typeof data.order === 'number' ? data.order : 0,
              completed: false,
              tag,
              color: descriptor?.color,
            } as Topic;
          })
          .filter((entry): entry is Topic => Boolean(entry?.id && entry.title))
      : [];

    return baseTopic.id && baseTopic.title ? [baseTopic, ...subtopics] : subtopics;
  });
};

const normalizeDatasetFlashcards = (dataset: RawDataset): Flashcard[] => {
  const rawCards = Array.isArray(dataset.flashcards) ? dataset.flashcards : [];
  return rawCards
    .map(card => {
      if (!card || typeof card !== 'object') return null;
      const data = card as Record<string, unknown>;
      const id = typeof data.id === 'string' ? data.id : '';
      const topicId = typeof data.topicId === 'string' ? data.topicId : '';
      const question = typeof data.question === 'string' ? data.question : '';
      const answer = typeof data.answer === 'string' ? data.answer : '';
      if (!id || !topicId || !question || !answer) return null;

      const nextReviewValue =
        typeof data.nextReview === 'string'
          ? data.nextReview
          : typeof data.nextReviewDate === 'string'
            ? data.nextReviewDate
            : undefined;

      const nextReview = nextReviewValue ?? new Date().toISOString();
      const interval = typeof data.interval === 'number' ? data.interval : 1;
      const easeFactor = typeof data.easeFactor === 'number' ? data.easeFactor : 2.5;

      return {
        id,
        topicId,
        question,
        answer,
        nextReview,
        interval,
        easeFactor,
      } satisfies Flashcard;
    })
    .filter((entry): entry is Flashcard => Boolean(entry));
};

const normalizeDatasetQuestions = (dataset: RawDataset): TestQuestion[] => {
  const rawQuestions = Array.isArray(dataset.questions) ? dataset.questions : [];
  return rawQuestions
    .map(question => {
      if (!question || typeof question !== 'object') return null;
      const data = question as Record<string, unknown>;
      const id = typeof data.id === 'string' ? data.id : '';
      const topicId = typeof data.topicId === 'string' ? data.topicId : '';
      const prompt = typeof data.question === 'string' ? data.question : '';
      const options = Array.isArray(data.options)
        ? data.options.filter((option): option is string => typeof option === 'string')
        : [];
      if (!id || !topicId || !prompt || options.length === 0) return null;

      const correctIndex =
        typeof data.correctIndex === 'number'
          ? data.correctIndex
          : typeof data.correctAnswer === 'number'
            ? data.correctAnswer
            : 0;

      return {
        id,
        topicId,
        question: prompt,
        options,
        correctIndex,
        explanation: typeof data.explanation === 'string' ? data.explanation : '',
      } satisfies TestQuestion;
    })
    .filter((entry): entry is TestQuestion => Boolean(entry));
};

const mergeDatabaseIndex = (index: DatabaseIndex, datasets: DatasetPayload[]): Database => {
  const normalizedStats = normalizeStats(index.stats);

  const datasetTopics = datasets.flatMap(dataset => normalizeDatasetTopics(dataset.data, dataset.descriptor));
  const datasetFlashcards = datasets.flatMap(dataset => normalizeDatasetFlashcards(dataset.data));
  const datasetQuestions = datasets.flatMap(dataset => normalizeDatasetQuestions(dataset.data));

  const topics = [
    ...(Array.isArray(index.topics) ? index.topics : []),
    ...datasetTopics,
  ];
  const flashcards = [
    ...(Array.isArray(index.flashcards) ? index.flashcards : []),
    ...datasetFlashcards,
  ];
  const questions = [
    ...(Array.isArray(index.questions) ? index.questions : []),
    ...datasetQuestions,
  ];

  return {
    topics,
    flashcards,
    questions,
    stats: normalizedStats,
    meta: index.meta,
    datasets: index.datasets,
  };
};

const buildFallbackDatabase = (index: DatabaseIndex): Database => {
  const availableDatasets: DatasetPayload[] = (index.datasets ?? [])
    .map(descriptor => {
      const data = FALLBACK_DATASETS[descriptor.file];
      if (!data) return null;
      return { descriptor, data };
    })
    .filter((entry): entry is DatasetPayload => Boolean(entry));

  const merged = mergeDatabaseIndex(index, availableDatasets);
  return {
    ...merged,
    stats: merged.stats ?? defaultStats(),
  };
};

cachedDatabase = buildFallbackDatabase(baseIndex as DatabaseIndex);

const buildDatasetEndpoint = (file: string) =>
  `${DATASET_BASE_ENDPOINT}${file}`.replace(DUPLICATE_SLASHES, '/');

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

    const payload = (await response.json()) as DatabaseIndex;
    const datasetDescriptors = Array.isArray(payload.datasets) ? payload.datasets : [];
    const datasetPayloads: DatasetPayload[] = [];

    for (const descriptor of datasetDescriptors) {
      try {
        const datasetResponse = await fetch(buildDatasetEndpoint(descriptor.file));
        if (!datasetResponse.ok) throw new Error(`Unexpected dataset response: ${datasetResponse.status}`);
        const data = (await datasetResponse.json()) as RawDataset;
        datasetPayloads.push({ descriptor, data });
      } catch (error) {
        const fallback = FALLBACK_DATASETS[descriptor.file];
        if (fallback) {
          datasetPayloads.push({ descriptor, data: fallback });
        } else {
          console.warn(`Dataset ${descriptor.file} could not be loaded`, error);
        }
      }
    }

    const mergedDatabase = mergeDatabaseIndex(payload, datasetPayloads);
    if (isValidDatabase(mergedDatabase)) {
      cachedDatabase = mergedDatabase;
    } else {
      throw new Error('Missing sections in the dataset');
    }
  } catch (error) {
    console.warn('Falling back to bundled data after static API failure', error);
  }

  return cachedDatabase;
};
