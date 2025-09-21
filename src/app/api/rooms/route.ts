import { NextRequest } from 'next/server';
import { mockDb } from '@/lib/db/mock';
import { createId } from '@paralleldrive/cuid2';
import {
  generateInviteCode,
  getCurrentUserId,
  setUserId,
  createTempUser,
  errorResponse,
  successResponse
} from '@/lib/api/helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name = 'Secret Room', userName } = body;

    if (!userName || userName.trim().length === 0) {
      return errorResponse('User name is required');
    }

    // Get or create user
    let userId = await getCurrentUserId();
    let user;

    if (!userId) {
      // Create temporary user
      user = await createTempUser(userName);
      await mockDb.insertUser(user);
      await setUserId(user.id);
      userId = user.id;
    } else {
      // Get existing user
      user = await mockDb.findUserById(userId);
      if (!user) {
        user = await createTempUser(userName);
        await mockDb.insertUser(user);
        await setUserId(user.id);
        userId = user.id;
      }
    }

    // Create room
    const roomId = createId();
    const inviteCode = generateInviteCode();

    const newRoom = {
      id: roomId,
      name,
      ownerId: userId,
      inviteCode,
      maxMembers: 20,
      createdAt: new Date(),
    };

    await mockDb.insertRoom(newRoom);

    // Add owner as first member
    await mockDb.insertRoomMember({
      roomId,
      userId,
      joinedAt: new Date(),
    });

    const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${inviteCode}`;

    return successResponse({
      roomId,
      inviteCode,
      inviteUrl,
      name,
    });
  } catch (error) {
    console.error('Failed to create room:', error);
    return errorResponse('Failed to create room', 500);
  }
}

// GET /api/rooms - Get user's rooms
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return successResponse({ rooms: [] });
    }

    // Get rooms where user is a member (mock implementation)
    const userRooms: unknown[] = [];

    return successResponse({ rooms: userRooms });
  } catch (error) {
    console.error('Failed to get rooms:', error);
    return errorResponse('Failed to get rooms', 500);
  }
}