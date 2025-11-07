import { NextRequest } from 'next/server';
import { mockDb } from '@/lib/db/mock';
import { errorResponse, successResponse } from '@/lib/api/helpers';

// GET /api/invite/[code] - Get room info by invite code
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;

    console.log(`🔍 Looking up invite code: ${code}`);

    // Find room by invite code
    const room = await mockDb.findRoomByInviteCode(code);

    if (!room) {
      console.log(`❌ Invalid invite code: ${code}`);
      return errorResponse('Invalid invite code', 404);
    }

    // Get member count
    const memberCount = await mockDb.countRoomMembers(room.id);

    console.log(`✅ Found room: ${room.name} (${memberCount}/${room.maxMembers} members)`);

    return successResponse({
      roomId: room.id,
      roomName: room.name || 'Secret Room',
      memberCount,
      maxMembers: room.maxMembers,
      isFull: memberCount >= room.maxMembers,
    });
  } catch (error) {
    console.error('Failed to get invite info:', error);
    return errorResponse('Failed to get invite info', 500);
  }
}
