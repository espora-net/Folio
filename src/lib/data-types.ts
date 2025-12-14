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

export interface TestQuestion {
  id: string;
  topicId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
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

export type Database = {
  topics: Topic[];
  flashcards: Flashcard[];
  questions: TestQuestion[];
  stats: StudyStats;
  meta?: DatabaseMeta;
  datasets?: DatasetDescriptor[];
};
