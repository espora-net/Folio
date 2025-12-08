import { NextResponse } from 'next/server';
import { readDatabase, writeDatabase, isToday } from '@/lib/db';

// GET statistics
export async function GET() {
  try {
    const db = readDatabase();
    
    // Update statistics based on current data
    db.statistics.totalTopics = db.topics.length;
    db.statistics.totalFlashcards = db.flashcards.length;
    db.statistics.totalQuestions = db.questions.length;
    
    // Count today's activities
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = db.studySessions.filter(s => 
      s.date.startsWith(today)
    );
    
    db.statistics.flashcardsReviewedToday = todaySessions.reduce(
      (sum, s) => sum + s.flashcardsReviewed, 0
    );
    db.statistics.questionsAnsweredToday = todaySessions.reduce(
      (sum, s) => sum + s.questionsAnswered, 0
    );
    
    // Calculate study streak
    let streak = 0;
    const sortedSessions = [...db.studySessions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    if (sortedSessions.length > 0) {
      const uniqueDates = [...new Set(sortedSessions.map(s => s.date.split('T')[0]))];
      const today = new Date();
      
      for (let i = 0; i < uniqueDates.length; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const checkDateStr = checkDate.toISOString().split('T')[0];
        
        if (uniqueDates.includes(checkDateStr)) {
          streak++;
        } else {
          break;
        }
      }
    }
    
    db.statistics.studyStreak = streak;
    db.statistics.lastStudyDate = sortedSessions[0]?.date || '';
    
    // Calculate topic progress
    db.statistics.topicProgress = {};
    for (const topic of db.topics) {
      const topicFlashcards = db.flashcards.filter(f => f.topicId === topic.id);
      const topicQuestions = db.questions.filter(q => q.topicId === topic.id);
      
      db.statistics.topicProgress[topic.id] = {
        flashcardsReviewed: topicFlashcards.filter(f => f.reviewCount > 0).length,
        totalFlashcards: topicFlashcards.length,
        questionsAnswered: 0, // This would need test attempt data
        totalQuestions: topicQuestions.length,
        averageScore: 0, // This would need test attempt data
      };
    }
    
    writeDatabase(db);
    
    return NextResponse.json(db.statistics);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
