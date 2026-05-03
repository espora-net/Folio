#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SCHEMA_VERSION = '1';
const ROOT_DIR = path.resolve(import.meta.dirname, '..');
const API_DIR = path.join(ROOT_DIR, 'public', 'api');
const OPTIMIZED_DIR = path.join(API_DIR, 'optimized');
const SCHEMA_FILE = path.join(ROOT_DIR, 'schemas', 'folio-data.fbs');
const GENERATED_DIR = path.join(ROOT_DIR, 'src', 'lib', 'flatbuffers', 'generated');
const DB_INDEX_FILE = path.join(API_DIR, 'db.json');
const HTTP_URL = /^https?:\/\//i;

const readJson = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`No se pudo leer JSON válido en ${path.relative(ROOT_DIR, filePath)}: ${error.message}`);
  }
};

const writeJson = (filePath, value) => {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
};

const hashBuffer = (buffer) => createHash('sha256').update(buffer).digest('hex');

const normalizeString = (value) => (typeof value === 'string' ? value : '');

const normalizeStringArray = (value) =>
  Array.isArray(value) ? value.filter((entry) => typeof entry === 'string') : [];

const ensureFlatc = () => {
  const result = spawnSync('flatc', ['--version'], { encoding: 'utf8' });
  if (result.error || result.status !== 0) {
    throw new Error(
      'No se encontró flatc. Instálalo antes de generar datos optimizados (macOS: brew install flatbuffers; Ubuntu/Actions: apt-get install flatbuffers-compiler).'
    );
  }
  return result.stdout.trim();
};

const runFlatc = (args) => {
  const result = spawnSync('flatc', args, {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    throw new Error(`flatc falló con argumentos ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  }
};

const generateTypeScriptBindings = () => {
  fs.rmSync(GENERATED_DIR, { recursive: true, force: true });
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
  runFlatc(['--no-warnings', '--ts', '-o', GENERATED_DIR, SCHEMA_FILE]);
  rewriteGeneratedImports(GENERATED_DIR);
};

const rewriteGeneratedImports = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      rewriteGeneratedImports(entryPath);
      continue;
    }

    if (!entry.name.endsWith('.ts')) continue;

    const original = fs.readFileSync(entryPath, 'utf8');
    const rewritten = original
      .replace(/from '\.\.\/\.\.\/folio\/flat-data\/([^']+)\.js'/g, "from './$1'")
      .replace(/from '\.\/flat-data\/([^']+)\.js'/g, "from './flat-data/$1'");

    if (rewritten !== original) {
      fs.writeFileSync(entryPath, rewritten);
    }
  }
};

const compileBundle = (name, bundle) => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'folio-flatbuffers-'));
  const jsonFile = path.join(tmpDir, `${name}.json`);
  const binFile = path.join(tmpDir, `${name}.bin`);
  const outputName = `${name}.fb.bin`;
  const outputPath = path.join(OPTIMIZED_DIR, outputName);

  try {
    writeJson(jsonFile, bundle);
    runFlatc(['--no-warnings', '-b', '-o', tmpDir, SCHEMA_FILE, jsonFile]);

    if (!fs.existsSync(binFile)) {
      throw new Error(`flatc no generó ${binFile}`);
    }

    const buffer = fs.readFileSync(binFile);
    fs.writeFileSync(outputPath, buffer);
    return {
      path: outputName,
      hash: hashBuffer(buffer),
      bytes: buffer.byteLength,
    };
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
};

const isAbsoluteUrl = (value) => HTTP_URL.test(value);

const fetchJson = async (url) => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} al descargar ${url}`);
  }
  return response.json();
};

const loadDatasetSource = async (descriptor) => {
  if (descriptor.url && isAbsoluteUrl(descriptor.url)) {
    return fetchJson(descriptor.url);
  }

  const filePath = path.join(API_DIR, descriptor.file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Dataset no encontrado: ${path.relative(ROOT_DIR, filePath)} (${descriptor.id})`);
  }
  return readJson(filePath);
};

const normalizeResourceDescriptor = (resource) => ({
  type: normalizeString(resource?.type),
  title: normalizeString(resource?.title),
  path: normalizeString(resource?.path),
});

const normalizeDatasetDescriptor = (descriptor) => ({
  id: normalizeString(descriptor.id),
  title: normalizeString(descriptor.title),
  description: normalizeString(descriptor.description),
  file: normalizeString(descriptor.file),
  url: normalizeString(descriptor.url),
  tag: normalizeString(descriptor.tag),
  color: normalizeString(descriptor.color),
  officialUrl: normalizeString(descriptor.officialUrl),
  resources: Array.isArray(descriptor.resources)
    ? descriptor.resources.map(normalizeResourceDescriptor)
    : [],
});

const normalizeExamConfig = (config) => {
  if (!config || typeof config !== 'object') return undefined;
  const hasPassingScore = typeof config.passingScore === 'number';
  return {
    numQuestions: typeof config.numQuestions === 'number' ? config.numQuestions : 0,
    numReserve: typeof config.numReserve === 'number' ? config.numReserve : 0,
    durationMinutes: typeof config.durationMinutes === 'number' ? config.durationMinutes : 0,
    pointsCorrect: typeof config.pointsCorrect === 'number' ? config.pointsCorrect : 0,
    pointsIncorrect: typeof config.pointsIncorrect === 'number' ? config.pointsIncorrect : 0,
    pointsBlank: typeof config.pointsBlank === 'number' ? config.pointsBlank : 0,
    passingScore: hasPassingScore ? config.passingScore : 0,
    hasPassingScore,
    description: normalizeString(config.description),
    examParts: Array.isArray(config.examParts)
      ? config.examParts.map(part => ({
          label: normalizeString(part.label),
          numQuestions: typeof part.numQuestions === 'number' ? part.numQuestions : 0,
          numReserve: typeof part.numReserve === 'number' ? part.numReserve : 0,
          temaNumbers: Array.isArray(part.temaNumbers) ? part.temaNumbers.filter(n => typeof n === 'number') : [],
        }))
      : [],
  };
};

const normalizeConvocatoriaDescriptor = (convocatoria) => ({
  id: normalizeString(convocatoria.id),
  title: normalizeString(convocatoria.title),
  shortTitle: normalizeString(convocatoria.shortTitle),
  institucion: normalizeString(convocatoria.institucion),
  cuerpo: normalizeString(convocatoria.cuerpo),
  year: typeof convocatoria.año === 'number' ? convocatoria.año : 0,
  file: normalizeString(convocatoria.file),
  color: normalizeString(convocatoria.color),
  activa: Boolean(convocatoria.activa),
  hidden: Boolean(convocatoria.hidden),
  studyType: normalizeString(convocatoria.studyType),
  questionDatasetIds: normalizeStringArray(convocatoria.questionDatasetIds),
  examConfig: normalizeExamConfig(convocatoria.examConfig),
});

const normalizeStudyType = (entry) => ({
  id: normalizeString(entry.id),
  label: normalizeString(entry.label),
  temarioTemplate: normalizeString(entry.temarioTemplate),
  questionDatasetIds: normalizeStringArray(entry.questionDatasetIds),
  convocatoriaId: normalizeString(entry.convocatoriaId),
});

const normalizeMeta = (meta = {}) => ({
  title: normalizeString(meta.title),
  description: normalizeString(meta.description),
  version: normalizeString(meta.version),
  updatedAt: normalizeString(meta.updatedAt),
});

const normalizeIndex = (db) => ({
  meta: normalizeMeta(db.meta),
  studyTypes: Array.isArray(db.studyTypes) ? db.studyTypes.map(normalizeStudyType) : [],
  convocatorias: Array.isArray(db.convocatorias) ? db.convocatorias.map(normalizeConvocatoriaDescriptor) : [],
  datasets: Array.isArray(db.datasets) ? db.datasets.map(normalizeDatasetDescriptor) : [],
});

const normalizeTopics = (dataset, descriptor) => {
  const rawTopics = Array.isArray(dataset.topics) ? dataset.topics : [];
  const tag = normalizeString(descriptor.tag || descriptor.title);
  const color = normalizeString(descriptor.color);

  return rawTopics.flatMap((rawTopic) => {
    if (!rawTopic || typeof rawTopic !== 'object') return [];

    const parentId = normalizeString(rawTopic.id);
    const parentTopic = {
      id: parentId,
      title: normalizeString(rawTopic.title),
      description: normalizeString(rawTopic.description),
      parentId: '',
      order: typeof rawTopic.order === 'number' ? rawTopic.order : 0,
      completed: false,
      tag,
      color,
      syllabusCoverageIds: [],
    };

    const subtopics = Array.isArray(rawTopic.subtopics)
      ? rawTopic.subtopics
          .map((subtopic) => ({
            id: normalizeString(subtopic?.id),
            title: normalizeString(subtopic?.title),
            description: normalizeString(subtopic?.content),
            parentId,
            order: typeof subtopic?.order === 'number' ? subtopic.order : 0,
            completed: false,
            tag,
            color,
            syllabusCoverageIds: normalizeStringArray(subtopic?.syllabusCoverageIds),
          }))
          .filter((subtopic) => subtopic.id && subtopic.title)
      : [];

    return parentTopic.id && parentTopic.title ? [parentTopic, ...subtopics] : subtopics;
  });
};

const pickCorrectIndex = (question) => {
  if (typeof question.correctIndex === 'number') return question.correctIndex;
  if (typeof question.correctAnswer === 'number') return question.correctAnswer;
  return 0;
};

const normalizeQuestionSource = (source) => {
  if (!source || typeof source !== 'object' || !normalizeString(source.highlightText)) {
    return undefined;
  }
  return {
    materialId: normalizeString(source.materialId),
    path: normalizeString(source.path),
    highlightText: normalizeString(source.highlightText),
  };
};

const normalizeQuestions = (dataset) => {
  const rawQuestions = Array.isArray(dataset.questions) ? dataset.questions : [];
  return rawQuestions
    .map((question) => {
      if (!question || typeof question !== 'object') return null;
      const options = Array.isArray(question.options)
        ? question.options.filter((option) => typeof option === 'string')
        : [];
      const normalized = {
        id: normalizeString(question.id),
        topicId: normalizeString(question.topicId),
        question: normalizeString(question.question),
        options,
        correctIndex: pickCorrectIndex(question),
        explanation: normalizeString(question.explanation),
        origin: normalizeString(question.origin) || 'generated',
        source: normalizeQuestionSource(question.source),
      };
      return normalized.id && normalized.topicId && normalized.question && normalized.options.length ? normalized : null;
    })
    .filter(Boolean);
};

const normalizeFlashcards = (dataset) => {
  const rawCards = Array.isArray(dataset.flashcards) ? dataset.flashcards : [];
  return rawCards
    .map((card) => {
      if (!card || typeof card !== 'object') return null;
      const normalized = {
        id: normalizeString(card.id),
        topicId: normalizeString(card.topicId),
        question: normalizeString(card.question),
        answer: normalizeString(card.answer),
        origin: normalizeString(card.origin) || 'generated',
      };
      return normalized.id && normalized.topicId && normalized.question && normalized.answer ? normalized : null;
    })
    .filter(Boolean);
};

const countBy = (items, getKey) => {
  const counts = new Map();
  for (const item of items) {
    const key = getKey(item);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts, ([key, count]) => ({ key, count }));
};

const normalizeDataset = (descriptor, rawDataset) => {
  const topics = normalizeTopics(rawDataset, descriptor);
  const flashcards = normalizeFlashcards(rawDataset);
  const questions = normalizeQuestions(rawDataset);

  return {
    id: normalizeString(descriptor.id),
    title: normalizeString(descriptor.title),
    description: normalizeString(descriptor.description),
    tag: normalizeString(descriptor.tag),
    color: normalizeString(descriptor.color),
    officialUrl: normalizeString(descriptor.officialUrl),
    topics,
    flashcards,
    questions,
    counts: {
      totalTopics: topics.length,
      totalFlashcards: flashcards.length,
      totalQuestions: questions.length,
      originCounts: countBy(questions, (question) => question.origin).map(({ key, count }) => ({
        origin: key,
        count,
      })),
      topicCounts: countBy(questions, (question) => question.topicId).map(({ key, count }) => ({
        topicId: key,
        count,
      })),
    },
  };
};

const normalizeTemaRecurso = (recurso) => ({
  tipo: normalizeString(recurso?.tipo),
  nombre: normalizeString(recurso?.nombre),
  archivo: normalizeString(recurso?.archivo),
});

const normalizeTemaMaterialComplementario = (material) => ({
  id: normalizeString(material?.id),
  titulo: normalizeString(material?.titulo),
  archivo: normalizeString(material?.archivo),
  coberturaConvocatoria: normalizeStringArray(material?.cobertura_convocatoria),
});

const normalizeTemaConvocatoria = (tema) => ({
  id: normalizeString(tema.id),
  numero: typeof tema.numero === 'number' ? tema.numero : 0,
  titulo: normalizeString(tema.titulo),
  bloque: normalizeString(tema.bloque),
  descripcion: normalizeString(tema.descripcion),
  contenidoEspecifico: normalizeString(tema.contenido_especifico),
  temasRelacionados: normalizeStringArray(tema.temas_relacionados),
  relevancia: normalizeString(tema.relevancia),
  fechaActualizacion: normalizeString(tema.fecha_actualizacion),
  coberturaConvocatoria: normalizeStringArray(tema.cobertura_convocatoria),
  recursos: Array.isArray(tema.recursos) ? tema.recursos.map(normalizeTemaRecurso) : [],
  materialesComplementarios: Array.isArray(tema.materiales_complementarios)
    ? tema.materiales_complementarios.map(normalizeTemaMaterialComplementario)
    : [],
});

const normalizeGuiaApoyo = (guia) => ({
  id: normalizeString(guia?.id),
  titulo: normalizeString(guia?.titulo),
  descripcion: normalizeString(guia?.descripcion),
  archivo: normalizeString(guia?.archivo),
  relevancia: normalizeString(guia?.relevancia),
});

const normalizeConvocatoria = (data) => ({
  meta: normalizeMeta(data.meta),
  descripcion: normalizeString(data.descripcion),
  convocatoria: {
    id: normalizeString(data.convocatoria?.id),
    institucion: normalizeString(data.convocatoria?.institucion),
    cuerpo: normalizeString(data.convocatoria?.cuerpo),
    year: typeof data.convocatoria?.año === 'number' ? data.convocatoria.año : 0,
    fuenteOficial: normalizeString(data.convocatoria?.fuente_oficial),
    enlacePublicacion: normalizeString(data.convocatoria?.enlace_publicacion),
    proposito: normalizeString(data.convocatoria?.proposito),
  },
  totalTemas: typeof data.total_temas === 'number' ? data.total_temas : 0,
  temas: Array.isArray(data.temas) ? data.temas.map(normalizeTemaConvocatoria) : [],
  guiasApoyo: Array.isArray(data.guias_apoyo) ? data.guias_apoyo.map(normalizeGuiaApoyo) : [],
});

const main = async () => {
  const flatcVersion = ensureFlatc();
  const db = readJson(DB_INDEX_FILE);
  const generatedAt = normalizeString(db.meta?.updatedAt) || new Date().toISOString();

  fs.rmSync(OPTIMIZED_DIR, { recursive: true, force: true });
  fs.mkdirSync(OPTIMIZED_DIR, { recursive: true });
  generateTypeScriptBindings();

  const indexBundle = {
    schemaVersion: SCHEMA_VERSION,
    generatedAt,
    index: normalizeIndex(db),
  };
  const indexArtifact = compileBundle('index', indexBundle);

  const datasetArtifacts = [];
  for (const descriptor of db.datasets ?? []) {
    const rawDataset = await loadDatasetSource(descriptor);
    const dataset = normalizeDataset(descriptor, rawDataset);
    const artifact = compileBundle(`dataset-${descriptor.id}`, {
      schemaVersion: SCHEMA_VERSION,
      generatedAt,
      dataset,
    });
    datasetArtifacts.push({
      id: descriptor.id,
      title: normalizeString(descriptor.title),
      sourceFile: normalizeString(descriptor.file),
      sourceUrl: normalizeString(descriptor.url),
      ...artifact,
      counts: dataset.counts,
    });
  }

  const convocatoriaArtifacts = [];
  for (const descriptor of db.convocatorias ?? []) {
    const convocatoriaFile = path.join(API_DIR, descriptor.file);
    if (!fs.existsSync(convocatoriaFile)) {
      throw new Error(`Convocatoria no encontrada: ${path.relative(ROOT_DIR, convocatoriaFile)} (${descriptor.id})`);
    }
    const convocatoria = normalizeConvocatoria(readJson(convocatoriaFile));
    const artifact = compileBundle(`convocatoria-${descriptor.id}`, {
      schemaVersion: SCHEMA_VERSION,
      generatedAt,
      convocatoria,
    });
    convocatoriaArtifacts.push({
      id: descriptor.id,
      title: normalizeString(descriptor.title),
      sourceFile: normalizeString(descriptor.file),
      ...artifact,
      totalTemas: convocatoria.totalTemas,
    });
  }

  const manifest = {
    format: 'flatbuffers',
    schemaVersion: SCHEMA_VERSION,
    generatedAt,
    flatcVersion,
    index: indexArtifact,
    datasets: datasetArtifacts,
    convocatorias: convocatoriaArtifacts,
  };
  writeJson(path.join(OPTIMIZED_DIR, 'manifest.json'), manifest);

  console.log(
    JSON.stringify(
      {
        index: manifest.index,
        datasets: manifest.datasets.length,
        convocatorias: manifest.convocatorias.length,
        bytes: {
          datasets: manifest.datasets.reduce((sum, dataset) => sum + dataset.bytes, 0),
          convocatorias: manifest.convocatorias.reduce((sum, convocatoria) => sum + convocatoria.bytes, 0),
        },
      },
      null,
      2
    )
  );
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
