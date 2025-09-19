import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { rooms, roomMembers, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import {
  getCurrentUserId,
  setUserId,
  createTempUser,
  errorResponse,
  successResponse
} from '@/lib/api/helpers';

// POST /api/rooms/[id]/join - Join a room
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id;
    const body = await request.json();
    const { userName, inviteCode } = body;

    if (!userName || userName.trim().length === 0) {
      return errorResponse('User name is required');
    }

    if (!inviteCode) {
      return errorResponse('Invite code is required');
    }

    // Verify room exists and invite code matches
    const room = await db
      .select()
      .from(rooms)
      .where(
        and(
          eq(rooms.id, roomId),
          eq(rooms.inviteCode, inviteCode)
        )
      )
      .limit(1);

    if (!room.length) {
      return errorResponse('Invalid room or invite code', 404);
    }

    // Get or create user
    let userId = await getCurrentUserId();
    let user;

    if (!userId) {
      // Create temporary user
      user = await createTempUser(userName);
      await db.insert(users).values(user);
      await setUserId(user.id);
      userId = user.id;
    } else {
      // Get existing user
      const existingUsers = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      user = existingUsers[0];
    }

    // Check if already a member
    const existingMembership = await db
      .select()
      .from(roomMembers)
      .where(
        and(
          eq(roomMembers.roomId, roomId),
          eq(roomMembers.userId, userId)
        )
      )
      .limit(1);

    if (existingMembership.length) {
      return successResponse({
        message: 'Already a member',
        roomId,
      });
    }

    // Check room capacity
    const memberCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(roomMembers)
      .where(eq(roomMembers.roomId, roomId));

    if (memberCount[0].count >= room[0].maxMembers) {
      return errorResponse('Room is full', 403);
    }

    // Add user to room
    await db.insert(roomMembers).values({
      roomId,
      userId,
      joinedAt: new Date(),
    });

    return successResponse({
      message: 'Successfully joined room',
      roomId,
      roomName: room[0].name,
    });
  } catch (error) {
    console.error('Failed to join room:', error);
    return errorResponse('Failed to join room', 500);
  }
}