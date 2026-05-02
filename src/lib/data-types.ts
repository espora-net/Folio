export interface Topic {
  id: string;
  title: string;
  description: string;
  parentId: string | null;
  order: number;
  completed: boolean;
  tag?: string;
  color?: string;
  // IDs de cobertura de convocatoria (para filtrar qué entra en cada convocatoria)
  syllabusCoverageIds?: string[];
}

export interface Flashcard {
  id: string;
  topicId: string;
  question: string;
  answer: string;
  nextReview: string;
  interval: number;
  easeFactor: number;
  // Origen del contenido (p. ej. 'generated', 'ia', 'oposito.es').
  // Opcional para compatibilidad con localStorage antiguo.
  origin?: QuestionOrigin;
}

export type QuestionOrigin = string;

export interface QuestionSource {
  materialId: string;
  path: string;
  highlightText: string;
}

export interface TestQuestion {
  id: string;
  topicId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  origin?: QuestionOrigin;
  source?: QuestionSource;
}

export interface StudyStats {
  totalStudyTime: number;
  cardsReviewed: number;
  testsCompleted: number;
  correctAnswers: number;
  streak: number;
  lastStudyDate: string | null;
}

export interface DatabaseMeta {
  title?: string;
  description?: string;
  version?: string;
  updatedAt?: string;
}

export interface DatasetDescriptor {
  id: string;
  title: string;
  description?: string;
  file: string;
  // URL absoluta opcional cuando el dataset está alojado fuera de /public/api.
  url?: string;
  tag?: string;
  color?: string;
  officialUrl?: string;
}

// Configuración del examen oficial de una convocatoria
export interface ExamConfig {
  // Número de preguntas del examen
  numQuestions: number;
  // Número de preguntas de reserva
  numReserve?: number;
  // Duración en minutos
  durationMinutes: number;
  // Puntos por respuesta correcta
  pointsCorrect: number;
  // Penalización por respuesta incorrecta (valor negativo)
  pointsIncorrect: number;
  // Puntos por pregunta en blanco
  pointsBlank: number;
  // Nota mínima para aprobar (sobre el total de puntos posibles)
  passingScore?: number;
  // Descripción del formato del examen
  description?: string;
}

// Tipos para convocatorias y temas del temario
export interface ConvocatoriaDescriptor {
  id: string;
  title: string;
  shortTitle: string;
  institucion: string;
  cuerpo: string;
  año: number;
  file: string;
  color: string;
  activa: boolean;
  // Si true, la convocatoria no se muestra en la UI (deshabilitada/oculta).
  hidden?: boolean;
  // Para enlazar datasets (p. ej. preguntas) con el temario.
  // Opcional para compatibilidad con db.json antiguos.
  studyType?: StudyType;
  questionDatasetIds?: string[];
  // Configuración del examen oficial (nº preguntas, duración, puntuación)
  examConfig?: ExamConfig;
}

export type TemarioTemplateId = 'oposiciones' | 'placeholder';

// Registro de tipos de estudio declarados en db.json.
// Permite asociar datasets por tipo y elegir la plantilla de Temario.
export interface StudyTypeRegistryEntry {
  id: StudyType;
  label: string;
  temarioTemplate: TemarioTemplateId;
  // Datasets con preguntas/tests asociados a este tipo.
  questionDatasetIds?: string[];
  // Convocatoria activa (solo aplica a 'oposiciones' en el diseño actual).
  convocatoriaId?: string;
}

export interface TemaRecurso {
  tipo: 'md' | 'pdf' | 'mp3' | 'db';
  nombre: string;
  archivo: string;
}

export interface TemaMaterialComplementario {
  id: string;
  titulo: string;
  archivo: string;
  cobertura_convocatoria?: string[];
}

export interface TemaConvocatoria {
  id: string;
  numero: number;
  titulo: string;
  bloque: string;
  descripcion: string;
  contenido_especifico?: string;
  temas_relacionados: string[];
  relevancia: 'alta' | 'media' | 'baja';
  fecha_actualizacion: string;
  cobertura_convocatoria: string[];
  recursos: TemaRecurso[];
  materiales_complementarios?: TemaMaterialComplementario[];
}

export interface ConvocatoriaData {
  meta?: {
    version: string;
    updatedAt: string;
  };
  descripcion: string;
  convocatoria: {
    id: string;
    institucion: string;
    cuerpo: string;
    año: number;
    fuente_oficial: string;
    enlace_publicacion: string;
    proposito: string;
  };
  total_temas: number;
  temas: TemaConvocatoria[];
  guias_apoyo?: Array<{
    id: string;
    titulo: string;
    descripcion: string;
    archivo: string;
    relevancia: string;
  }>;
}

export type Database = {
  topics: Topic[];
  flashcards: Flashcard[];
  questions: TestQuestion[];
  stats: StudyStats;
  meta?: DatabaseMeta;
  datasets?: DatasetDescriptor[];
  convocatorias?: ConvocatoriaDescriptor[];
  studyTypes?: StudyTypeRegistryEntry[];
};

// Tipos de estudio disponibles en Folio
export type StudyType = 'oposiciones' | 'conducir' | 'secundaria' | 'universidad' | 'idiomas' | 'otro';

export interface StudyTypeConfig {
  id: StudyType;
  label: string;
  description: string;
  icon: string; // emoji para simplicidad
  examples: string[];
}

export const STUDY_TYPES: StudyTypeConfig[] = [
  {
    id: 'oposiciones',
    label: 'Oposiciones',
    description: 'Preparación de exámenes para acceso a empleo público',
    icon: '📋',
    examples: ['Auxiliar Administrativo', 'Técnico de Hacienda', 'Judicatura'],
  },
  {
    id: 'conducir',
    label: 'Carnet de conducir',
    description: 'Examen teórico de la DGT',
    icon: '🚗',
    examples: ['Permiso B', 'Permiso A2', 'CAP'],
  },
  {
    id: 'secundaria',
    label: 'Secundaria / Bachillerato',
    description: 'Estudios de educación secundaria',
    icon: '📚',
    examples: ['ESO', 'Bachillerato', 'Selectividad'],
  },
  {
    id: 'universidad',
    label: 'Universidad',
    description: 'Estudios universitarios y másters',
    icon: '🎓',
    examples: ['Grado', 'Máster', 'Doctorado'],
  },
  {
    id: 'idiomas',
    label: 'Idiomas',
    description: 'Certificaciones y aprendizaje de idiomas',
    icon: '🌍',
    examples: ['Cambridge', 'DELE', 'DELF'],
  },
  {
    id: 'otro',
    label: 'Otro',
    description: 'Cualquier otra materia de estudio',
    icon: '📖',
    examples: ['Certificaciones IT', 'Formación profesional'],
  },
];

export type FilterMode = 'none' | 'convocatoria' | 'tema';

export interface StudyFilters {
  convocatoriaFilter: boolean; // deprecated: use filterMode
  filterMode: FilterMode;
  selectedTopicIds: string[];
  originFilter: string;
  questionLimit: number; // 0 = all
  // ID de la convocatoria seleccionada para filtrar (puede diferir de la activa)
  selectedConvocatoriaId?: string;
}

export interface UserPreferences {
  studyType: StudyType;
  studyTypeLabel?: string; // Etiqueta personalizada opcional
  onboardingCompleted: boolean;
  // Filtros persistidos para Tests y Flashcards
  filters?: StudyFilters;
}

// Tipos para transcripciones de audio
export interface TranscriptSegment {
  start: number; // segundos
  end: number;   // segundos
  text: string;
}

export interface TranscriptData {
  language: string;
  duration: number; // segundos
  segments: TranscriptSegment[];
}
