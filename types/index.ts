// Data types for Folio application

export interface Topic {
  id: string;
  title: string;
  description: string;
  order: number;
  subtopics?: Subtopic[];
  createdAt: string;
  updatedAt: string;
}

export interface Subtopic {
  id: string;
  topicId: string;
  title: string;
  content: string;
  order: number;
}

export interface Flashcard {
  id: string;
  topicId: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  nextReviewDate: string;
  reviewCount: number;
  correctCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TestQuestion {
  id: string;
  topicId: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Test {
  id: string;
  title: string;
  questions: string[]; // question IDs
  duration?: number; // in minutes
  createdAt: string;
}

export interface TestAttempt {
  id: string;
  testId: string;
  answers: { questionId: string; selectedAnswer: number }[];
  score: number;
  totalQuestions: number;
  completedAt: string;
}

export interface Comment {
  id: string;
  entityType: 'topic' | 'flashcard' | 'question';
  entityId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Statistics {
  totalTopics: number;
  totalFlashcards: number;
  totalQuestions: number;
  totalTestAttempts: number;
  averageTestScore: number;
  studyStreak: number;
  lastStudyDate: string;
  flashcardsReviewedToday: number;
  questionsAnsweredToday: number;
  topicProgress: {
    [topicId: string]: {
      flashcardsReviewed: number;
      totalFlashcards: number;
      questionsAnswered: number;
      totalQuestions: number;
      averageScore: number;
    };
  };
}

export interface StudySession {
  id: string;
  date: string;
  flashcardsReviewed: number;
  questionsAnswered: number;
  timeSpent: number; // in minutes
  topics: string[];
}
