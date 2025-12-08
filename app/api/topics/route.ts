import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, writeDatabase, generateId, getCurrentDate } from '@/lib/db';

// GET all topics
export async function GET() {
  try {
    const db = readDatabase();
    return NextResponse.json(db.topics);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}

// POST new topic
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = readDatabase();
    
    const newTopic = {
      id: generateId('topic'),
      title: body.title,
      description: body.description,
      order: body.order || db.topics.length + 1,
      subtopics: body.subtopics || [],
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate(),
    };
    
    db.topics.push(newTopic);
    db.statistics.totalTopics = db.topics.length;
    
    writeDatabase(db);
    
    return NextResponse.json(newTopic, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    );
  }
}
