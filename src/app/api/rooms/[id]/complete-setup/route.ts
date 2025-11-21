import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { createId } from '@paralleldrive/cuid2';
import {
  findRoomById,
  updateRoom,
  insertRoomQuestion,
} from '@/lib/db/supabase';
import {
  errorResponse,
  successResponse
} from '@/lib/api/helpers';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: roomId } = await context.params;
    const body = await request.json();
    const { questionIds = [], customQuestions = [] } = body;

    // Get authenticated user from NextAuth session
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Not authenticated', 401);
    }

    const userId = session.user.id;

    // Find the room in Supabase
    const room = await findRoomById(roomId);
    if (!room) {
      return errorResponse('Room not found', 404);
    }

    // Verify user is the owner
    if (room.ownerId !== userId) {
      return errorResponse('Only the room owner can complete setup', 403);
    }

    // Validate at least one question is selected
    const totalQuestions = questionIds.length + customQuestions.length;
    if (totalQuestions < 1) {
      return errorResponse('At least 1 question must be selected', 400);
    }

    // Insert custom questions into room_questions table
    for (let i = 0; i < customQuestions.length; i++) {
      const q = customQuestions[i];
      await insertRoomQuestion({
        id: q.id || createId(),
        roomId,
        questionId: null, // Custom question, not from curated list
        question: q.question,
        category: q.category || 'Custom',
        suggestedLevel: q.spiciness || q.suggestedLevel || 3,
        difficulty: q.difficulty || 'medium',
        questionType: q.type || q.questionType || 'text',
        answerConfig: q.type === 'slider' ? q.slider : q.type === 'multipleChoice' ? q.multipleChoice : q.answerConfig || null,
        allowAnonymous: false,
        createdBy: userId,
        displayOrder: questionIds.length + i,
      });
    }

    // Insert selected curated questions into room_questions table
    for (let i = 0; i < questionIds.length; i++) {
      await insertRoomQuestion({
        id: createId(),
        roomId,
        questionId: questionIds[i], // Reference to curated question
        question: null, // Will be resolved from questionId
        category: null,
        suggestedLevel: null,
        difficulty: null,
        questionType: 'text',
        answerConfig: null,
        allowAnonymous: false,
        createdBy: null, // Curated question, no specific creator
        displayOrder: i,
      });
    }

    // Update room: exit setup mode
    await updateRoom(roomId, {
      setupMode: false,
    });

    console.log(`✅ Room ${roomId} setup completed with ${totalQuestions} questions`);

    return successResponse({
      success: true,
      questionCount: totalQuestions
    });
  } catch (error) {
    console.error('Failed to complete room setup:', error);
    return errorResponse('Failed to complete setup', 500);
  }
}
