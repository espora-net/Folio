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
