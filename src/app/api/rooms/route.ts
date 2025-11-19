import { NextRequest } from 'next/server';
import { mockDb } from '@/lib/db/mock';
import { createId } from '@paralleldrive/cuid2';
import {
  generateInviteCode,
  getCurrentUserId,
  createUserCookie,
  createTempUser,
  errorResponse,
  successResponse
} from '@/lib/api/helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, userName, questionIds = [], customQuestions = [], setupMode = false } = body;

    // Get or create user
    let userId = await getCurrentUserId();
    let user;
    let shouldSetCookie = false;

    if (!userId) {
      // Create temporary user with default name if not provided
      const tempUserName = userName && userName.trim().length > 0 ? userName : 'Guest';
      user = await createTempUser(tempUserName);
      await mockDb.insertUser(user);
      userId = user.id;
      shouldSetCookie = true;
    } else {
      // Get existing user
      user = await mockDb.findUserById(userId);
      if (!user) {
        // Create user with the EXISTING userId from the cookie
        const tempUserName = userName && userName.trim().length > 0 ? userName : 'Guest';
        user = {
          id: userId,  // Use the existing userId from cookie!
          email: `${userId}@temp.com`,
          name: tempUserName,
          avatarUrl: undefined,
          createdAt: new Date(),
        };
        await mockDb.insertUser(user);
        // Don't overwrite userId - keep using the one from cookie
      }
    }

    // Create room
    const roomId = createId();
    const inviteCode = generateInviteCode();

    // Auto-generate room name if not provided
    const roomName = name || `Room ${inviteCode.slice(0, 6)}`;

    // Validate question selection only if NOT in setup mode
    if (!setupMode) {
      if (!userName || userName.trim().length === 0) {
        return errorResponse('User name is required');
      }

      const totalQuestions = questionIds.length + customQuestions.length;
      if (totalQuestions < 1) {
        return errorResponse('At least 1 question must be selected');
      }
    }

    // Process custom questions
    const processedCustomQuestions = customQuestions.map((q: {
      id?: string;
      question: string;
      category: string;
      suggestedLevel: number;
      difficulty: 'easy' | 'medium' | 'hard';
    }) => ({
      id: q.id || createId(),
      roomId,
      question: q.question,
      category: q.category,
      suggestedLevel: q.suggestedLevel,
      difficulty: q.difficulty,
      createdBy: userId,
      createdAt: new Date()
    }));

    const newRoom = {
      id: roomId,
      name: roomName,
      ownerId: userId,
      inviteCode,
      maxMembers: 20,
      createdAt: new Date(),
      questionIds,
      customQuestions: processedCustomQuestions,
      setupMode,
    };

    console.log(`🏗️ Creating room:`, newRoom.id);
    await mockDb.insertRoom(newRoom);
    console.log(`✅ Room created successfully:`, newRoom.id);

    // Add owner as first member
    await mockDb.insertRoomMember({
      roomId,
      userId,
      joinedAt: new Date(),
    });

    const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${inviteCode}`;

    const responseData = {
      roomId,
      inviteCode,
      inviteUrl,
      name: roomName,
    };

    // Set cookie if we created a new user
    if (shouldSetCookie) {
      const cookie = createUserCookie(userId);
      return successResponse(responseData, 200, cookie);
    }

    return successResponse(responseData);
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