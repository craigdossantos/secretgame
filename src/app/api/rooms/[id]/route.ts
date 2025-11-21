import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import {
  findRoomById,
  findRoomMember,
  countRoomMembers,
  findRoomQuestions,
} from '@/lib/db/supabase';
import {
  errorResponse,
  successResponse
} from '@/lib/api/helpers';

// GET /api/rooms/[id] - Get room details and secrets
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const roomId = (await params).id;

    // Get authenticated user from NextAuth session
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }

    const userId = session.user.id;

    // Get room details from Supabase
    console.log(`🔍 Looking for room: ${roomId}`);
    const room = await findRoomById(roomId);
    console.log(`🏠 Found room:`, room ? 'YES' : 'NO');

    if (!room) {
      console.log(`❌ Room ${roomId} not found in database`);
      return errorResponse('Room not found', 404);
    }

    // Check if user is a member
    const membership = await findRoomMember(roomId, userId);

    if (!membership) {
      // Return limited info for non-members
      return successResponse({
        room: {
          id: room.id,
          name: room.name,
          isMember: false,
        },
      });
    }

    // Get room member count and questions
    const memberCount = await countRoomMembers(roomId);
    const roomQuestions = await findRoomQuestions(roomId);

    // Separate curated questions (have questionId) from custom questions
    const questionIds = roomQuestions
      .filter(q => q.questionId)
      .map(q => q.questionId!);

    const customQuestions = roomQuestions
      .filter(q => !q.questionId)
      .map(q => ({
        id: q.id,
        question: q.question!,
        category: q.category,
        suggestedLevel: q.suggestedLevel,
        difficulty: q.difficulty,
        questionType: q.questionType,
        answerConfig: q.answerConfig,
        allowAnonymous: q.allowAnonymous,
      }));

    return successResponse({
      room: {
        id: room.id,
        name: room.name,
        memberCount,
        inviteCode: room.inviteCode,
        ownerId: room.ownerId,
        questionIds,
        customQuestions,
        setupMode: room.setupMode,
        isMember: true,
      },
    });
  } catch (error) {
    console.error('Failed to get room:', error);
    return errorResponse('Failed to get room', 500);
  }
}