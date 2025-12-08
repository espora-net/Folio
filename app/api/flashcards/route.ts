import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, writeDatabase, generateId, getCurrentDate } from '@/lib/db';

// GET all flashcards
export async function GET(request: NextRequest) {
  try {
    const db = readDatabase();
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');
    
    let flashcards = db.flashcards;
    
    if (topicId) {
      flashcards = flashcards.filter(f => f.topicId === topicId);
    }
    
    return NextResponse.json(flashcards);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch flashcards' },
      { status: 500 }
    );
  }
}

// POST new flashcard
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = readDatabase();
    
    const newFlashcard = {
      id: generateId('flashcard'),
      topicId: body.topicId,
      question: body.question,
      answer: body.answer,
      difficulty: body.difficulty || 'medium',
      tags: body.tags || [],
      nextReviewDate: body.nextReviewDate || getCurrentDate(),
      reviewCount: 0,
      correctCount: 0,
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate(),
      source: body.source,
    };
    
    db.flashcards.push(newFlashcard);
    db.statistics.totalFlashcards = db.flashcards.length;
    
    writeDatabase(db);
    
    return NextResponse.json(newFlashcard, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create flashcard' },
      { status: 500 }
    );
  }
}

// PATCH update flashcard (for review results)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    if (!body.id || typeof body.id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing flashcard id' },
        { status: 400 }
      );
    }
    
    if (typeof body.correct !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid or missing correct field (must be boolean)' },
        { status: 400 }
      );
    }
    
    const db = readDatabase();
    
    const flashcardIndex = db.flashcards.findIndex(f => f.id === body.id);
    
    if (flashcardIndex === -1) {
      return NextResponse.json(
        { error: 'Flashcard not found' },
        { status: 404 }
      );
    }
    
    const flashcard = db.flashcards[flashcardIndex];
    
    // Update review data
    flashcard.reviewCount = (flashcard.reviewCount || 0) + 1;
    if (body.correct) {
      flashcard.correctCount = (flashcard.correctCount || 0) + 1;
    }
    
    // Calculate next review date (simple spaced repetition)
    const daysToAdd = body.correct ? flashcard.reviewCount * 2 : 1;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    flashcard.nextReviewDate = nextDate.toISOString();
    flashcard.updatedAt = getCurrentDate();
    
    db.flashcards[flashcardIndex] = flashcard;
    writeDatabase(db);
    
    return NextResponse.json(flashcard);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update flashcard' },
      { status: 500 }
    );
  }
}
