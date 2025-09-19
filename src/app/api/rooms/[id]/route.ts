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
  { params }: { params: { id: string } }
) {
  try {
    const roomId = (await params).id;
    const userId = await getCurrentUserId();

    if (!userId) {
      return errorResponse('Authentication required', 401);
    }

    // Get room details
    const room = await mockDb.findRoomById(roomId);

    if (!room) {
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
        isMember: true,
      },
    });
  } catch (error) {
    console.error('Failed to get room:', error);
    return errorResponse('Failed to get room', 500);
  }
}