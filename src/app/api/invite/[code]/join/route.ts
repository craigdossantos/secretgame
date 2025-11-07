import { NextRequest } from 'next/server';
import { mockDb } from '@/lib/db/mock';
import {
  getUserIdFromCookies,
  createUserCookie,
  createTempUser,
  errorResponse,
  successResponse
} from '@/lib/api/helpers';

// POST /api/invite/[code]/join - Join a room via invite code
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const body = await request.json();
    const { userName } = body;

    console.log(`👤 User attempting to join room with code: ${code}`);

    // Validate user name
    if (!userName || userName.trim().length === 0) {
      return errorResponse('Name is required', 400);
    }

    if (userName.trim().length > 50) {
      return errorResponse('Name must be 50 characters or less', 400);
    }

    // Find room by invite code
    const room = await mockDb.findRoomByInviteCode(code);

    if (!room) {
      console.log(`❌ Invalid invite code: ${code}`);
      return errorResponse('Invalid invite code', 404);
    }

    // Check room capacity
    const memberCount = await mockDb.countRoomMembers(room.id);
    if (memberCount >= room.maxMembers) {
      console.log(`❌ Room is full: ${room.name} (${memberCount}/${room.maxMembers})`);
      return errorResponse('This room is full', 403);
    }

    // Get or create user
    let userId = getUserIdFromCookies(request);
    let shouldSetCookie = false;

    if (!userId) {
      // Create new user
      const user = await createTempUser(userName.trim());
      await mockDb.insertUser(user);
      userId = user.id;
      shouldSetCookie = true;
      console.log(`✅ Created new user: ${user.name} (${userId})`);
    } else {
      // Check if user exists
      const existingUser = await mockDb.findUserById(userId);
      if (!existingUser) {
        // Cookie exists but user doesn't - create new user
        const user = await createTempUser(userName.trim());
        user.id = userId; // Keep the cookie's userId
        await mockDb.insertUser(user);
        console.log(`✅ Recreated user: ${user.name} (${userId})`);
      } else {
        // Update existing user's name
        existingUser.name = userName.trim();
        await mockDb.insertUser(existingUser);
        console.log(`✅ Updated user name: ${existingUser.name} (${userId})`);
      }
    }

    // Check if user is already a member
    const existingMember = await mockDb.findRoomMember(room.id, userId);
    if (!existingMember) {
      // Add user to room
      await mockDb.insertRoomMember({
        roomId: room.id,
        userId,
        joinedAt: new Date(),
      });
      console.log(`✅ Added user to room: ${room.name}`);
    } else {
      console.log(`ℹ️ User already in room: ${room.name}`);
    }

    const responseData = {
      roomId: room.id,
      roomName: room.name || 'Secret Room',
      userId,
    };

    // Set cookie if we created a new user
    if (shouldSetCookie) {
      const cookie = createUserCookie(userId);
      return successResponse(responseData, 200, cookie);
    }

    return successResponse(responseData);
  } catch (error) {
    console.error('Failed to join room:', error);
    return errorResponse('Failed to join room', 500);
  }
}
