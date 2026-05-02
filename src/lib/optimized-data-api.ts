import * as flatbuffers from 'flatbuffers';
import { OptimizedBundle } from './flatbuffers/generated/folio/flat-data/optimized-bundle';
import { OptimizedIndex as FlatOptimizedIndex } from './flatbuffers/generated/folio/flat-data/optimized-index';
import { OptimizedDataset as FlatOptimizedDataset } from './flatbuffers/generated/folio/flat-data/optimized-dataset';
import { OptimizedConvocatoria as FlatOptimizedConvocatoria } from './flatbuffers/generated/folio/flat-data/optimized-convocatoria';
import { DatabaseMeta as FlatDatabaseMeta } from './flatbuffers/generated/folio/flat-data/database-meta';
import { DatasetDescriptor as FlatDatasetDescriptor } from './flatbuffers/generated/folio/flat-data/dataset-descriptor';
import { ResourceDescriptor as FlatResourceDescriptor } from './flatbuffers/generated/folio/flat-data/resource-descriptor';
import { StudyTypeRegistryEntry as FlatStudyTypeRegistryEntry } from './flatbuffers/generated/folio/flat-data/study-type-registry-entry';
import { ConvocatoriaDescriptor as FlatConvocatoriaDescriptor } from './flatbuffers/generated/folio/flat-data/convocatoria-descriptor';
import { ExamConfig as FlatExamConfig } from './flatbuffers/generated/folio/flat-data/exam-config';
import { OptimizedTopic as FlatOptimizedTopic } from './flatbuffers/generated/folio/flat-data/optimized-topic';
import { OptimizedFlashcard as FlatOptimizedFlashcard } from './flatbuffers/generated/folio/flat-data/optimized-flashcard';
import { OptimizedQuestion as FlatOptimizedQuestion } from './flatbuffers/generated/folio/flat-data/optimized-question';
import { QuestionSource as FlatQuestionSource } from './flatbuffers/generated/folio/flat-data/question-source';
import { ConvocatoriaHeader as FlatConvocatoriaHeader } from './flatbuffers/generated/folio/flat-data/convocatoria-header';
import { TemaConvocatoria as FlatTemaConvocatoria } from './flatbuffers/generated/folio/flat-data/tema-convocatoria';
import { TemaRecurso as FlatTemaRecurso } from './flatbuffers/generated/folio/flat-data/tema-recurso';
import { TemaMaterialComplementario as FlatTemaMaterialComplementario } from './flatbuffers/generated/folio/flat-data/tema-material-complementario';
import { GuiaApoyo as FlatGuiaApoyo } from './flatbuffers/generated/folio/flat-data/guia-apoyo';
import {
  type ConvocatoriaData,
  type ConvocatoriaDescriptor,
  type Database,
  type DatabaseMeta,
  type DatasetDescriptor,
  type ExamConfig,
  type Flashcard,
  type QuestionSource,
  type StudyStats,
  type StudyType,
  type StudyTypeRegistryEntry,
  type TemaConvocatoria,
  type TemaMaterialComplementario,
  type TemaRecurso,
  type TemarioTemplateId,
  type TestQuestion,
  type Topic,
} from './data-types';

type OptimizedArtifact = {
  id?: string;
  path: string;
  hash: string;
  bytes: number;
};

type OptimizedManifest = {
  format: 'flatbuffers';
  schemaVersion: string;
  generatedAt: string;
  index: OptimizedArtifact;
  datasets: Array<OptimizedArtifact & { id: string }>;
  convocatorias: Array<OptimizedArtifact & { id: string }>;
};

export type OptimizedLoadResult = {
  database: Database;
  convocatorias: Map<string, ConvocatoriaData>;
  manifest: OptimizedManifest;
};

const DEFAULT_STATS: StudyStats = {
  totalStudyTime: 0,
  cardsReviewed: 0,
  testsCompleted: 0,
  correctAnswers: 0,
  streak: 0,
  lastStudyDate: null,
};

const STUDY_TYPES = new Set<StudyType>(['oposiciones', 'conducir', 'secundaria', 'universidad', 'idiomas', 'otro']);
const TEMARIO_TEMPLATES = new Set<TemarioTemplateId>(['oposiciones', 'placeholder']);
const RELEVANCIAS = new Set<TemaConvocatoria['relevancia']>(['alta', 'media', 'baja']);
const RESOURCE_TYPES = new Set<TemaRecurso['tipo']>(['md', 'pdf', 'mp3', 'db']);
const DUPLICATE_SLASHES = /\/{2,}/g;

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const text = (value: string | Uint8Array | null): string => (typeof value === 'string' ? value : '');

const toStudyType = (value: string): StudyType => (STUDY_TYPES.has(value as StudyType) ? (value as StudyType) : 'otro');

const toTemarioTemplate = (value: string): TemarioTemplateId =>
  TEMARIO_TEMPLATES.has(value as TemarioTemplateId) ? (value as TemarioTemplateId) : 'placeholder';

const toRelevancia = (value: string): TemaConvocatoria['relevancia'] =>
  RELEVANCIAS.has(value as TemaConvocatoria['relevancia']) ? (value as TemaConvocatoria['relevancia']) : 'media';

const toResourceType = (value: string): TemaRecurso['tipo'] =>
  RESOURCE_TYPES.has(value as TemaRecurso['tipo']) ? (value as TemaRecurso['tipo']) : 'md';

const collect = <T>(length: number, getItem: (index: number) => T | null | undefined): T[] => {
  const items: T[] = [];
  for (let index = 0; index < length; index += 1) {
    const item = getItem(index);
    if (item !== null && item !== undefined) items.push(item);
  }
  return items;
};

const collectStrings = (length: number, getItem: (index: number) => string | Uint8Array | null): string[] =>
  collect(length, (index) => {
    const value = text(getItem(index));
    return value ? value : null;
  });

const noCacheUrl = (url: string): string => {
  const cacheBuster = Math.floor(Date.now() / 60000);
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_v=${cacheBuster}`;
};

const optimizedEndpoint = (filePath: string) => {
  const trimmed = String(basePath).replace(/\/+$/, '');
  const endpoint = `${trimmed}/api/optimized/${filePath}`.replace(DUPLICATE_SLASHES, '/');
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
};

const fetchJson = async <T>(filePath: string): Promise<T> => {
  const response = await fetch(noCacheUrl(optimizedEndpoint(filePath)), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${filePath}: HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
};

const fetchBundle = async (artifact: OptimizedArtifact): Promise<OptimizedBundle> => {
  const response = await fetch(noCacheUrl(optimizedEndpoint(artifact.path)), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${artifact.path}: HTTP ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const byteBuffer = new flatbuffers.ByteBuffer(new Uint8Array(buffer));
  if (!OptimizedBundle.bufferHasIdentifier(byteBuffer)) {
    throw new Error(`Artefacto FlatBuffers inválido: ${artifact.path}`);
  }
  return OptimizedBundle.getRootAsOptimizedBundle(byteBuffer);
};

const decodeMeta = (meta: FlatDatabaseMeta | null): DatabaseMeta => ({
  title: text(meta?.title() ?? null),
  description: text(meta?.description() ?? null),
  version: text(meta?.version() ?? null),
  updatedAt: text(meta?.updatedAt() ?? null),
});

const decodeResourceDescriptor = (resource: FlatResourceDescriptor | null) => {
  if (!resource) return null;
  return {
    type: text(resource.type()),
    title: text(resource.title()),
    path: text(resource.path()),
  };
};

const decodeDatasetDescriptor = (descriptor: FlatDatasetDescriptor | null): DatasetDescriptor | null => {
  if (!descriptor) return null;
  return {
    id: text(descriptor.id()),
    title: text(descriptor.title()),
    description: text(descriptor.description()),
    file: text(descriptor.file()),
    url: text(descriptor.url()) || undefined,
    tag: text(descriptor.tag()) || undefined,
    color: text(descriptor.color()) || undefined,
    officialUrl: text(descriptor.officialUrl()) || undefined,
    resources: collect(descriptor.resourcesLength(), (index) => decodeResourceDescriptor(descriptor.resources(index))),
  };
};

const decodeStudyType = (entry: FlatStudyTypeRegistryEntry | null): StudyTypeRegistryEntry | null => {
  if (!entry) return null;
  const convocatoriaId = text(entry.convocatoriaId());
  return {
    id: toStudyType(text(entry.id())),
    label: text(entry.label()),
    temarioTemplate: toTemarioTemplate(text(entry.temarioTemplate())),
    questionDatasetIds: collectStrings(entry.questionDatasetIdsLength(), (index) => entry.questionDatasetIds(index)),
    convocatoriaId: convocatoriaId || undefined,
  };
};

const decodeExamConfig = (config: FlatExamConfig | null): ExamConfig | undefined => {
  if (!config) return undefined;
  return {
    numQuestions: config.numQuestions(),
    numReserve: config.numReserve() || undefined,
    durationMinutes: config.durationMinutes(),
    pointsCorrect: config.pointsCorrect(),
    pointsIncorrect: config.pointsIncorrect(),
    pointsBlank: config.pointsBlank(),
    passingScore: config.hasPassingScore() ? config.passingScore() : undefined,
    description: text(config.description()) || undefined,
  };
};

const decodeConvocatoriaDescriptor = (descriptor: FlatConvocatoriaDescriptor | null): ConvocatoriaDescriptor | null => {
  if (!descriptor) return null;
  const studyType = text(descriptor.studyType());
  return {
    id: text(descriptor.id()),
    title: text(descriptor.title()),
    shortTitle: text(descriptor.shortTitle()),
    institucion: text(descriptor.institucion()),
    cuerpo: text(descriptor.cuerpo()),
    año: descriptor.year(),
    file: text(descriptor.file()),
    color: text(descriptor.color()),
    activa: descriptor.activa(),
    hidden: descriptor.hidden() || undefined,
    studyType: studyType ? toStudyType(studyType) : undefined,
    questionDatasetIds: collectStrings(descriptor.questionDatasetIdsLength(), (index) => descriptor.questionDatasetIds(index)),
    examConfig: decodeExamConfig(descriptor.examConfig()),
  };
};

const decodeIndex = (index: FlatOptimizedIndex): Pick<Database, 'meta' | 'studyTypes' | 'convocatorias' | 'datasets'> => ({
  meta: decodeMeta(index.meta()),
  studyTypes: collect(index.studyTypesLength(), (itemIndex) => decodeStudyType(index.studyTypes(itemIndex))),
  convocatorias: collect(index.convocatoriasLength(), (itemIndex) => decodeConvocatoriaDescriptor(index.convocatorias(itemIndex))),
  datasets: collect(index.datasetsLength(), (itemIndex) => decodeDatasetDescriptor(index.datasets(itemIndex))),
});

const decodeTopic = (topic: FlatOptimizedTopic | null, sourceDatasetId: string): Topic | null => {
  if (!topic) return null;
  const parentId = text(topic.parentId());
  const tag = text(topic.tag());
  const color = text(topic.color());
  const syllabusCoverageIds = collectStrings(topic.syllabusCoverageIdsLength(), (index) => topic.syllabusCoverageIds(index));

  return {
    id: text(topic.id()),
    title: text(topic.title()),
    description: text(topic.description()),
    parentId: parentId || null,
    order: topic.order(),
    completed: topic.completed(),
    tag: tag || undefined,
    color: color || undefined,
    sourceDatasetId,
    syllabusCoverageIds: syllabusCoverageIds.length ? syllabusCoverageIds : undefined,
  };
};

const decodeFlashcard = (card: FlatOptimizedFlashcard | null, sourceDatasetId: string): Flashcard | null => {
  if (!card) return null;
  const origin = text(card.origin());
  return {
    id: text(card.id()),
    topicId: text(card.topicId()),
    question: text(card.question()),
    answer: text(card.answer()),
    nextReview: '',
    interval: 0,
    easeFactor: 2.5,
    origin: origin || undefined,
    sourceDatasetId,
  };
};

const decodeQuestionSource = (source: FlatQuestionSource | null): QuestionSource | undefined => {
  if (!source) return undefined;
  const highlightText = text(source.highlightText());
  if (!highlightText) return undefined;
  return {
    materialId: text(source.materialId()),
    path: text(source.path()),
    highlightText,
  };
};

const decodeQuestion = (question: FlatOptimizedQuestion | null, sourceDatasetId: string): TestQuestion | null => {
  if (!question) return null;
  const source = decodeQuestionSource(question.source());
  const origin = text(question.origin());
  return {
    id: text(question.id()),
    topicId: text(question.topicId()),
    question: text(question.question()),
    options: collectStrings(question.optionsLength(), (index) => question.options(index)),
    correctIndex: question.correctIndex(),
    explanation: text(question.explanation()),
    origin: origin || undefined,
    source,
    sourceDatasetId,
  };
};

const decodeDataset = (dataset: FlatOptimizedDataset): Pick<Database, 'topics' | 'flashcards' | 'questions'> => {
  const sourceDatasetId = text(dataset.id());
  return {
    topics: collect(dataset.topicsLength(), (index) => decodeTopic(dataset.topics(index), sourceDatasetId)),
    flashcards: collect(dataset.flashcardsLength(), (index) => decodeFlashcard(dataset.flashcards(index), sourceDatasetId)),
    questions: collect(dataset.questionsLength(), (index) => decodeQuestion(dataset.questions(index), sourceDatasetId)),
  };
};

const decodeHeader = (header: FlatConvocatoriaHeader | null): ConvocatoriaData['convocatoria'] => ({
  id: text(header?.id() ?? null),
  institucion: text(header?.institucion() ?? null),
  cuerpo: text(header?.cuerpo() ?? null),
  año: header?.year() ?? 0,
  fuente_oficial: text(header?.fuenteOficial() ?? null),
  enlace_publicacion: text(header?.enlacePublicacion() ?? null),
  proposito: text(header?.proposito() ?? null),
});

const decodeTemaRecurso = (recurso: FlatTemaRecurso | null): TemaRecurso | null => {
  if (!recurso) return null;
  return {
    tipo: toResourceType(text(recurso.tipo())),
    nombre: text(recurso.nombre()),
    archivo: text(recurso.archivo()),
  };
};

const decodeTemaMaterial = (material: FlatTemaMaterialComplementario | null): TemaMaterialComplementario | null => {
  if (!material) return null;
  return {
    id: text(material.id()),
    titulo: text(material.titulo()),
    archivo: text(material.archivo()),
    cobertura_convocatoria: collectStrings(
      material.coberturaConvocatoriaLength(),
      (index) => material.coberturaConvocatoria(index)
    ),
  };
};

const decodeTema = (tema: FlatTemaConvocatoria | null): TemaConvocatoria | null => {
  if (!tema) return null;
  const materiales = collect(tema.materialesComplementariosLength(), (index) =>
    decodeTemaMaterial(tema.materialesComplementarios(index))
  );

  return {
    id: text(tema.id()),
    numero: tema.numero(),
    titulo: text(tema.titulo()),
    bloque: text(tema.bloque()),
    descripcion: text(tema.descripcion()),
    contenido_especifico: text(tema.contenidoEspecifico()) || undefined,
    temas_relacionados: collectStrings(tema.temasRelacionadosLength(), (index) => tema.temasRelacionados(index)),
    relevancia: toRelevancia(text(tema.relevancia())),
    fecha_actualizacion: text(tema.fechaActualizacion()),
    cobertura_convocatoria: collectStrings(tema.coberturaConvocatoriaLength(), (index) =>
      tema.coberturaConvocatoria(index)
    ),
    recursos: collect(tema.recursosLength(), (index) => decodeTemaRecurso(tema.recursos(index))),
    materiales_complementarios: materiales.length ? materiales : undefined,
  };
};

const decodeGuiaApoyo = (guia: FlatGuiaApoyo | null) => {
  if (!guia) return null;
  return {
    id: text(guia.id()),
    titulo: text(guia.titulo()),
    descripcion: text(guia.descripcion()),
    archivo: text(guia.archivo()),
    relevancia: text(guia.relevancia()),
  };
};

const decodeConvocatoria = (convocatoria: FlatOptimizedConvocatoria): ConvocatoriaData => ({
  meta: {
    version: text(convocatoria.meta()?.version() ?? null),
    updatedAt: text(convocatoria.meta()?.updatedAt() ?? null),
  },
  descripcion: text(convocatoria.descripcion()),
  convocatoria: decodeHeader(convocatoria.convocatoria()),
  total_temas: convocatoria.totalTemas(),
  temas: collect(convocatoria.temasLength(), (index) => decodeTema(convocatoria.temas(index))),
  guias_apoyo: collect(convocatoria.guiasApoyoLength(), (index) => decodeGuiaApoyo(convocatoria.guiasApoyo(index))),
});

const requireIndex = (bundle: OptimizedBundle, path: string): FlatOptimizedIndex => {
  const index = bundle.index();
  if (!index) throw new Error(`El artefacto ${path} no contiene índice optimizado`);
  return index;
};

const requireDataset = (bundle: OptimizedBundle, path: string): FlatOptimizedDataset => {
  const dataset = bundle.dataset();
  if (!dataset) throw new Error(`El artefacto ${path} no contiene dataset optimizado`);
  return dataset;
};

const requireConvocatoria = (bundle: OptimizedBundle, path: string): FlatOptimizedConvocatoria => {
  const convocatoria = bundle.convocatoria();
  if (!convocatoria) throw new Error(`El artefacto ${path} no contiene convocatoria optimizada`);
  return convocatoria;
};

export const fetchOptimizedData = async (): Promise<OptimizedLoadResult> => {
  const manifest = await fetchJson<OptimizedManifest>('manifest.json');
  if (manifest.format !== 'flatbuffers') {
    throw new Error(`Formato de datos optimizados no soportado: ${manifest.format}`);
  }

  const indexBundle = await fetchBundle(manifest.index);
  const index = decodeIndex(requireIndex(indexBundle, manifest.index.path));

  const [datasetBundles, convocatoriaBundles] = await Promise.all([
    Promise.all(manifest.datasets.map(async (artifact) => ({ artifact, bundle: await fetchBundle(artifact) }))),
    Promise.all(manifest.convocatorias.map(async (artifact) => ({ artifact, bundle: await fetchBundle(artifact) }))),
  ]);

  const datasets = datasetBundles.map(({ artifact, bundle }) => decodeDataset(requireDataset(bundle, artifact.path)));
  const convocatorias = new Map<string, ConvocatoriaData>();
  for (const { artifact, bundle } of convocatoriaBundles) {
    convocatorias.set(artifact.id, decodeConvocatoria(requireConvocatoria(bundle, artifact.path)));
  }

  return {
    manifest,
    convocatorias,
    database: {
      topics: datasets.flatMap((dataset) => dataset.topics),
      flashcards: datasets.flatMap((dataset) => dataset.flashcards),
      questions: datasets.flatMap((dataset) => dataset.questions),
      stats: DEFAULT_STATS,
      meta: index.meta,
      datasets: index.datasets,
      convocatorias: index.convocatorias,
      studyTypes: index.studyTypes,
    },
  };
};

export const fetchOptimizedConvocatoria = async (id: string): Promise<ConvocatoriaData | null> => {
  const manifest = await fetchJson<OptimizedManifest>('manifest.json');
  const artifact = manifest.convocatorias.find((entry) => entry.id === id);
  if (!artifact) return null;

  const bundle = await fetchBundle(artifact);
  return decodeConvocatoria(requireConvocatoria(bundle, artifact.path));
};
