import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import {
  findRoomById,
  findRoomMember,
  findRoomSecrets,
  insertSecret,
  updateSecret,
  upsertUser
} from '@/lib/db/supabase';
import { successResponse, errorResponse } from '@/lib/api/helpers';
import { createId } from '@paralleldrive/cuid2';

interface SecretSubmitBody {
  roomId: string;
  questionId: string;
  body: string;
  selfRating: number;
  importance: number;
  answerType?: string;
  answerData?: unknown;
  isAnonymous?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Get user session from NextAuth
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }
    const userId = session.user.id;

    // Upsert user to ensure they exist in database
    await upsertUser({
      id: userId,
      email: session.user.email!,
      name: session.user.name || 'Anonymous',
      avatarUrl: session.user.image || null,
    });

    // Parse request body
    const data: SecretSubmitBody = await request.json();
    const { roomId, questionId, body, selfRating, importance, answerType, answerData, isAnonymous } = data;

    console.log(`📝 Creating/updating secret for question ${questionId} in room ${roomId}`);

    // Validate required fields
    if (!roomId || !questionId || !body || selfRating === undefined || importance === undefined) {
      return errorResponse('Missing required fields', 400);
    }

    // Validate word count (≤100 words) for text answers only
    if (!answerType || answerType === 'text') {
      const wordCount = body.trim().split(/\s+/).filter(word => word.length > 0).length;
      if (wordCount > 100) {
        return errorResponse('Secret must be 100 words or less', 400);
      }

      if (wordCount === 0) {
        return errorResponse('Secret cannot be empty', 400);
      }
    }

    // Validate ratings (1-5)
    if (selfRating < 1 || selfRating > 5 || importance < 1 || importance > 5) {
      return errorResponse('Ratings must be between 1 and 5', 400);
    }

    // Verify room exists
    const room = await findRoomById(roomId);
    if (!room) {
      console.log(`❌ Room ${roomId} not found`);
      return errorResponse('Room not found', 404);
    }

    // Verify user is a member of the room
    const membership = await findRoomMember(roomId, userId);
    if (!membership) {
      console.log(`❌ User ${userId} is not a member of room ${roomId}`);
      return errorResponse('You must be a member of this room to submit secrets', 403);
    }

    // Check if user already has a secret for this question in this room
    const existingSecrets = await findRoomSecrets(roomId);
    const existingSecret = existingSecrets.find(
      s => s.authorId === userId && s.questionId === questionId
    );

    if (existingSecret) {
      // Update existing secret (edit answer)
      console.log(`♻️ Updating existing secret ${existingSecret.id}`);

      await updateSecret(existingSecret.id, {
        body: body.trim(),
        selfRating,
        importance,
        answerType: answerType || 'text',
        answerData,
        isAnonymous: isAnonymous || false,
      });

      console.log(`✅ Secret updated successfully`);

      return successResponse({
        message: 'Secret updated successfully',
        secret: {
          ...existingSecret,
          body: body.trim(),
          selfRating,
          importance,
          answerType: answerType || 'text',
          answerData,
          isAnonymous: isAnonymous || false,
        },
      });
    } else {
      // Create new secret
      const secretId = createId();

      console.log(`🆕 Creating new secret ${secretId}`);

      const newSecret = {
        id: secretId,
        roomId,
        authorId: userId,
        body: body.trim(),
        selfRating,
        importance,
        avgRating: String(selfRating), // Initially, avgRating = selfRating (stored as string)
        buyersCount: 0,
        isHidden: false,
        questionId, // Store questionId for filtering
        answerType: answerType || 'text',
        answerData,
        isAnonymous: isAnonymous || false,
      };

      await insertSecret(newSecret);

      console.log(`✅ Secret created successfully`);

      return successResponse(
        {
          message: 'Secret submitted successfully',
          secret: newSecret,
        },
        201
      );
    }
  } catch (error) {
    console.error('❌ Error submitting secret:', error);
    return errorResponse('Failed to submit secret', 500);
  }
}
