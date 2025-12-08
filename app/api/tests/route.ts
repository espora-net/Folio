import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, writeDatabase, generateId, getCurrentDate } from '@/lib/db';

// GET all test questions
export async function GET(request: NextRequest) {
  try {
    const db = readDatabase();
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');
    
    let questions = db.questions;
    
    if (topicId) {
      questions = questions.filter(q => q.topicId === topicId);
    }
    
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

// POST new question
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = readDatabase();
    
    const newQuestion = {
      id: generateId('question'),
      topicId: body.topicId,
      question: body.question,
      options: body.options,
      correctAnswer: body.correctAnswer,
      explanation: body.explanation,
      difficulty: body.difficulty || 'medium',
      tags: body.tags || [],
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate(),
    };
    
    db.questions.push(newQuestion);
    db.statistics.totalQuestions = db.questions.length;
    
    writeDatabase(db);
    
    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}
