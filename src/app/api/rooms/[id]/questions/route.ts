import { NextRequest } from 'next/server';
import { createId } from '@paralleldrive/cuid2';
import { mockDb } from '@/lib/db/mock';
import { getCurrentUserId } from '@/lib/api/helpers';
import { successResponse, errorResponse } from '@/lib/api/helpers';

// POST /api/rooms/[id]/questions - Add a custom question to a room
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const userId = await getCurrentUserId();

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    // Get request body
    const body = await request.json();
    const { question, category, suggestedLevel, difficulty } = body;

    // Validation
    if (!question || typeof question !== 'string') {
      return errorResponse('Question text is required', 400);
    }

    if (!category || typeof category !== 'string') {
      return errorResponse('Category is required', 400);
    }

    if (typeof suggestedLevel !== 'number' || suggestedLevel < 1 || suggestedLevel > 5) {
      return errorResponse('Spiciness level must be between 1 and 5', 400);
    }

    const wordCount = question.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
    if (wordCount < 5 || wordCount > 50) {
      return errorResponse('Question must be between 5 and 50 words', 400);
    }

    if (question.length > 200) {
      return errorResponse('Question must be 200 characters or less', 400);
    }

    // Get the room
    const room = await mockDb.findRoomById(roomId);
    if (!room) {
      return errorResponse('Room not found', 404);
    }

    // Check if user is a member of the room
    const isMember = await mockDb.findRoomMember(roomId, userId);
    if (!isMember) {
      return errorResponse('You must be a member of this room to add questions', 403);
    }

    // Create the custom question
    const customQuestion = {
      id: createId(),
      roomId,
      question: question.trim(),
      category,
      suggestedLevel,
      difficulty: difficulty || 'medium',
      createdBy: userId,
      createdAt: new Date()
    };

    // Add to room's custom questions
    const currentCustomQuestions = room.customQuestions || [];
    const updatedCustomQuestions = [...currentCustomQuestions, customQuestion];

    // Update the room
    await mockDb.updateRoom(roomId, {
      customQuestions: updatedCustomQuestions
    });

    console.log(`✅ Added custom question to room ${roomId}:`, customQuestion.id);

    return successResponse({
      message: 'Custom question added successfully',
      question: customQuestion
    }, 201);
  } catch (error) {
    console.error('Failed to add custom question:', error);
    return errorResponse('Failed to add custom question', 500);
  }
}
