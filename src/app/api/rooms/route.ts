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
    const { name = 'Secret Room', userName, questionIds = [], customQuestions = [] } = body;

    if (!userName || userName.trim().length === 0) {
      return errorResponse('User name is required');
    }

    // Validate question selection
    if (questionIds.length + customQuestions.length !== 3) {
      return errorResponse('Exactly 3 questions must be selected');
    }

    // Get or create user
    let userId = await getCurrentUserId();
    let user;
    let shouldSetCookie = false;

    if (!userId) {
      // Create temporary user
      user = await createTempUser(userName);
      await mockDb.insertUser(user);
      userId = user.id;
      shouldSetCookie = true;
    } else {
      // Get existing user
      user = await mockDb.findUserById(userId);
      if (!user) {
        user = await createTempUser(userName);
        await mockDb.insertUser(user);
        userId = user.id;
        shouldSetCookie = true;
      }
    }

    // Create room
    const roomId = createId();
    const inviteCode = generateInviteCode();

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
      name,
      ownerId: userId,
      inviteCode,
      maxMembers: 20,
      createdAt: new Date(),
      questionIds,
      customQuestions: processedCustomQuestions,
    };

    await mockDb.insertRoom(newRoom);

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
      name,
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