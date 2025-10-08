import { NextRequest } from 'next/server';
import { mockDb } from '@/lib/db/mock';
import {
  getCurrentUserId,
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
    const userId = await getCurrentUserId();

    if (!userId) {
      return errorResponse('Authentication required', 401);
    }

    // Get room details
    console.log(`🔍 Looking for room: ${roomId}`);
    const room = await mockDb.findRoomById(roomId);
    console.log(`🏠 Found room:`, room ? 'YES' : 'NO');

    if (!room) {
      console.log(`❌ Room ${roomId} not found in database`);
      return errorResponse('Room not found', 404);
    }

    // Check if user is a member
    const membership = await mockDb.findRoomMember(roomId, userId);

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

    // Get room member count
    const memberCount = await mockDb.countRoomMembers(roomId);

    return successResponse({
      room: {
        id: room.id,
        name: room.name,
        memberCount,
        inviteCode: room.inviteCode,
        ownerId: room.ownerId,
        questionIds: room.questionIds || [],
        customQuestions: room.customQuestions || [],
        isMember: true,
      },
    });
  } catch (error) {
    console.error('Failed to get room:', error);
    return errorResponse('Failed to get room', 500);
  }
}