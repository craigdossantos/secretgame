import { NextRequest } from 'next/server';
import { mockDb } from '@/lib/db/mock';
import { createId } from '@paralleldrive/cuid2';
import {
  getCurrentUserId,
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

    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return errorResponse('Not authenticated', 401);
    }

    // Find the room
    const room = await mockDb.findRoomById(roomId);
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

    // Process custom questions
    const processedCustomQuestions = customQuestions.map((q: {
      id?: string;
      question: string;
      category: string;
      spiciness: number;
      difficulty: 'easy' | 'medium' | 'hard';
      type?: string;
      slider?: unknown;
      multipleChoice?: unknown;
      allowImageUpload?: boolean;
    }) => ({
      id: q.id || createId(),
      roomId,
      question: q.question,
      category: q.category,
      suggestedLevel: q.spiciness,
      difficulty: q.difficulty,
      createdBy: userId,
      createdAt: new Date(),
      questionType: q.type,
      answerConfig: q.type === 'slider' ? q.slider : q.type === 'multipleChoice' ? q.multipleChoice : undefined,
      allowImageUpload: q.allowImageUpload || false,
    }));

    // Update room: exit setup mode and set questions
    await mockDb.updateRoom(roomId, {
      setupMode: false,
      questionIds,
      customQuestions: processedCustomQuestions,
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
