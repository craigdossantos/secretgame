import { NextRequest } from 'next/server';
import { createId } from '@paralleldrive/cuid2';
import { auth } from '@/lib/auth';
import {
  upsertUser,
  insertRoom,
  insertRoomMember,
  insertRoomQuestion,
} from '@/lib/db/supabase';
import {
  generateInviteCode,
  errorResponse,
  successResponse
} from '@/lib/api/helpers';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from NextAuth session
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }

    const userId = session.user.id;
    const body = await request.json();
    const { name, questionIds = [], customQuestions = [], setupMode = false } = body;

    // Ensure user exists in database (upsert from NextAuth session)
    await upsertUser({
      id: userId,
      email: session.user.email!,
      name: session.user.name || 'Anonymous',
      avatarUrl: session.user.image || null,
    });

    // Validate question selection only if NOT in setup mode
    if (!setupMode) {
      const totalQuestions = questionIds.length + customQuestions.length;
      if (totalQuestions < 1) {
        return errorResponse('At least 1 question must be selected');
      }
    }

    // Create room
    const roomId = createId();
    const inviteCode = generateInviteCode();

    // Auto-generate room name if not provided
    const roomName = name || `Room ${inviteCode.slice(0, 6)}`;

    console.log(`🏗️ Creating room:`, roomId);

    // Insert room into Supabase
    try {
      await insertRoom({
        id: roomId,
        name: roomName,
        ownerId: userId,
        inviteCode,
        maxMembers: 20,
        setupMode,
      });
      console.log(`✅ Room created successfully:`, roomId);
    } catch (insertError) {
      console.error(`❌ Failed to insert room:`, insertError);
      throw insertError;
    }

    // Add owner as first member
    await insertRoomMember({
      roomId,
      userId,
    });

    // Process and insert selected questions from data/questions.md
    for (let i = 0; i < questionIds.length; i++) {
      await insertRoomQuestion({
        id: createId(),
        roomId,
        questionId: questionIds[i], // Reference to curated question
        question: null, // Will be resolved from questionId
        category: null,
        suggestedLevel: null,
        difficulty: null,
        questionType: 'text',
        answerConfig: null,
        allowAnonymous: false,
        createdBy: null, // Curated question, no specific creator
        displayOrder: i,
      });
    }

    // Process and insert custom questions
    for (let i = 0; i < customQuestions.length; i++) {
      const q = customQuestions[i];
      await insertRoomQuestion({
        id: q.id || createId(),
        roomId,
        questionId: null, // Custom question, not from curated list
        question: q.question,
        category: q.category || 'Custom',
        suggestedLevel: q.suggestedLevel || 3,
        difficulty: q.difficulty || 'medium',
        questionType: q.questionType || 'text',
        answerConfig: q.answerConfig || null,
        allowAnonymous: q.allowAnonymous || false,
        createdBy: userId,
        displayOrder: questionIds.length + i,
      });
    }

    const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${inviteCode}`;

    return successResponse({
      roomId,
      inviteCode,
      inviteUrl,
      name: roomName,
    });
  } catch (error) {
    console.error('Failed to create room:', error);
    return errorResponse('Failed to create room', 500);
  }
}

// GET /api/rooms - Get user's rooms
export async function GET() {
  try {
    // Get authenticated user from NextAuth session
    const session = await auth();

    if (!session?.user?.id) {
      return successResponse({ rooms: [] });
    }

    // TODO: Implement room listing with Supabase
    // This will need to join rooms with room_members to find user's rooms
    const userRooms: unknown[] = [];

    return successResponse({ rooms: userRooms });
  } catch (error) {
    console.error('Failed to get rooms:', error);
    return errorResponse('Failed to get rooms', 500);
  }
}