export interface Topic {
  id: string;
  title: string;
  description: string;
  parentId: string | null;
  order: number;
  completed: boolean;
  tag?: string;
  color?: string;
}

export interface Flashcard {
  id: string;
  topicId: string;
  question: string;
  answer: string;
  nextReview: string;
  interval: number;
  easeFactor: number;
}

export type QuestionOrigin = 'generated' | 'published';

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
  tag?: string;
  color?: string;
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

export interface UserPreferences {
  studyType: StudyType;
  studyTypeLabel?: string; // Etiqueta personalizada opcional
  onboardingCompleted: boolean;
}
