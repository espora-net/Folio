import fs from 'fs';
import path from 'path';
import type {
  Topic,
  Flashcard,
  TestQuestion,
  Comment,
  Statistics,
  StudySession,
} from '@/types';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export interface Database {
  topics: Topic[];
  flashcards: Flashcard[];
  questions: TestQuestion[];
  comments: Comment[];
  statistics: Statistics;
  studySessions: StudySession[];
}

// Ensure data directory exists
function ensureDataDirectory(): void {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Read database
export function readDatabase(): Database {
  try {
    ensureDataDirectory();
    
    // Check if database file exists
    if (!fs.existsSync(DB_PATH)) {
      // Create default database if it doesn't exist
      const defaultDb: Database = {
        topics: [],
        flashcards: [],
        questions: [],
        comments: [],
        statistics: {
          totalTopics: 0,
          totalFlashcards: 0,
          totalQuestions: 0,
          totalTestAttempts: 0,
          averageTestScore: 0,
          studyStreak: 0,
          lastStudyDate: '',
          flashcardsReviewedToday: 0,
          questionsAnsweredToday: 0,
          topicProgress: {},
        },
        studySessions: [],
      };
      writeDatabase(defaultDb);
      return defaultDb;
    }
    
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return {
      topics: [],
      flashcards: [],
      questions: [],
      comments: [],
      statistics: {
        totalTopics: 0,
        totalFlashcards: 0,
        totalQuestions: 0,
        totalTestAttempts: 0,
        averageTestScore: 0,
        studyStreak: 0,
        lastStudyDate: '',
        flashcardsReviewedToday: 0,
        questionsAnsweredToday: 0,
        topicProgress: {},
      },
      studySessions: [],
    };
  }
}

// Write database
export function writeDatabase(data: Database): void {
  try {
    ensureDataDirectory();
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing database:', error);
    throw error;
  }
}

// Generate unique ID
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// Get current date in ISO format
export function getCurrentDate(): string {
  return new Date().toISOString();
}

// Check if date is today
export function isToday(date: string): boolean {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
}
