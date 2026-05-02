import { fetchOptimizedConvocatoria, fetchOptimizedData } from './optimized-data-api';
import {
  type ConvocatoriaData,
  type ConvocatoriaDescriptor,
  type Database,
  type StudyStats,
  type StudyTypeRegistryEntry,
  type Topic,
} from './data-types';

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

const cachedConvocatorias: Map<string, ConvocatoriaData> = new Map();

let lastGeneratedAt: string | null = null;

export const getCachedDatabase = (): Database => cachedDatabase;

export const getLastGeneratedAt = (): string | null => lastGeneratedAt;

// Re-export types needed by components
export type { ConvocatoriaDescriptor, Topic } from './data-types';

export const getStudyTypeRegistry = (): StudyTypeRegistryEntry[] => cachedDatabase.studyTypes ?? [];

export const fetchDatabaseFromApi = async (): Promise<Database> => {
  if (typeof window === 'undefined') {
    return cachedDatabase;
  }

  const { database, convocatorias, manifest } = await fetchOptimizedData();
  cachedDatabase = database;
  lastGeneratedAt = manifest.generatedAt ?? null;
  cachedConvocatorias.clear();
  convocatorias.forEach((value, key) => cachedConvocatorias.set(key, value));
  return cachedDatabase;
};

// ============================================================================
// Convocatorias API
// ============================================================================

export const getConvocatoriaDescriptors = (): ConvocatoriaDescriptor[] => {
  const all = cachedDatabase.convocatorias ?? [];
  return all.filter((convocatoria) => !convocatoria.hidden);
};

export const getActiveConvocatoria = (): ConvocatoriaDescriptor | undefined => {
  const descriptors = getConvocatoriaDescriptors();
  return descriptors.find((convocatoria) => convocatoria.activa);
};

export const getCachedConvocatoria = (id: string): ConvocatoriaData | undefined => cachedConvocatorias.get(id);

export const fetchConvocatoria = async (id: string): Promise<ConvocatoriaData | null> => {
  const cached = cachedConvocatorias.get(id);
  if (cached) return cached;

  const descriptors = getConvocatoriaDescriptors();
  const descriptor = descriptors.find((convocatoria) => convocatoria.id === id);
  if (!descriptor) return null;

  const data = await fetchOptimizedConvocatoria(id);
  if (data) cachedConvocatorias.set(id, data);
  return data;
};

// ============================================================================
// Helpers para filtrar por cobertura de convocatoria
// ============================================================================

/**
 * Obtiene todos los IDs de cobertura declarados en una convocatoria.
 * Ej: ['#titulo-preliminar', '#titulo-i']
 */
export const getConvocatoriaCoverageIds = (convocatoriaId: string): string[] => {
  const convocatoria = cachedConvocatorias.get(convocatoriaId);
  if (!convocatoria) return [];

  const allCoverageIds = new Set<string>();
  for (const tema of convocatoria.temas) {
    if (Array.isArray(tema.cobertura_convocatoria)) {
      tema.cobertura_convocatoria.forEach((id) => allCoverageIds.add(id));
    }
  }
  return Array.from(allCoverageIds);
};

export const getConvocatoriaDatasetCoverageIds = (
  convocatoriaId: string,
  database = cachedDatabase
): Map<string, string[]> => {
  const convocatoria = cachedConvocatorias.get(convocatoriaId);
  if (!convocatoria) return new Map();

  const datasetIdByFile = new Map((database.datasets ?? []).map(dataset => [dataset.file, dataset.id]));
  const coverageByDataset = new Map<string, Set<string>>();

  for (const tema of convocatoria.temas) {
    const coverageIds = tema.cobertura_convocatoria ?? [];
    for (const recurso of tema.recursos ?? []) {
      if (recurso.tipo !== 'db') continue;
      const datasetId = datasetIdByFile.get(recurso.archivo);
      if (!datasetId) continue;

      const current = coverageByDataset.get(datasetId) ?? new Set<string>();
      coverageIds.forEach(id => current.add(id));
      coverageByDataset.set(datasetId, current);
    }
  }

  return new Map(
    Array.from(coverageByDataset, ([datasetId, coverageIds]) => [datasetId, Array.from(coverageIds)])
  );
};

/**
 * Comprueba si un ID de cobertura de un topic coincide con algún ID de cobertura
 * de la convocatoria, utilizando matching jerárquico.
 */
const matchesCoverage = (
  topicCoverageId: string,
  exactSet: Set<string>,
  convocatoriaCoverageIds: string[]
): boolean => {
  if (exactSet.has(topicCoverageId)) {
    return true;
  }

  for (const convocatoriaCoverageId of convocatoriaCoverageIds) {
    if (
      topicCoverageId.startsWith(`${convocatoriaCoverageId}-`) ||
      topicCoverageId.startsWith(`${convocatoriaCoverageId}_`)
    ) {
      return true;
    }
  }
  return false;
};

/**
 * Filtra los IDs de topics/subtopics que tienen syllabusCoverageIds
 * que coinciden con la cobertura de una convocatoria.
 */
export const getTopicIdsInConvocatoria = (
  topics: Topic[],
  convocatoriaId: string,
  database = cachedDatabase
): string[] => {
  const coverageIds = getConvocatoriaCoverageIds(convocatoriaId);
  if (coverageIds.length === 0) return [];

  const datasetCoverageIds = getConvocatoriaDatasetCoverageIds(convocatoriaId, database);
  const exactSet = new Set(coverageIds);
  const matchingTopicIds = new Set<string>();

  for (const topic of topics) {
    const datasetCoverage = topic.sourceDatasetId ? datasetCoverageIds.get(topic.sourceDatasetId) : undefined;
    const candidateCoverageIds = datasetCoverage?.length ? datasetCoverage : coverageIds;
    const candidateExactSet = datasetCoverage?.length ? new Set(datasetCoverage) : exactSet;

    if (topic.syllabusCoverageIds?.some((id) => matchesCoverage(id, candidateExactSet, candidateCoverageIds))) {
      matchingTopicIds.add(topic.id);
      if (topic.parentId) matchingTopicIds.add(topic.parentId);
    }
  }

  return Array.from(matchingTopicIds);
};
