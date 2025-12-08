import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, writeDatabase, generateId, getCurrentDate } from '@/lib/db';

// GET all comments
export async function GET(request: NextRequest) {
  try {
    const db = readDatabase();
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId');
    
    let comments = db.comments;
    
    if (entityId) {
      comments = comments.filter(c => c.entityId === entityId);
    }
    
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = readDatabase();
    
    const newComment = {
      id: generateId('comment'),
      entityType: body.entityType,
      entityId: body.entityId,
      content: body.content,
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate(),
    };
    
    db.comments.push(newComment);
    writeDatabase(db);
    
    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
