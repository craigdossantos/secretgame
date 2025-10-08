import { NextRequest } from 'next/server';
import { mockDb } from '@/lib/db/mock';
import { successResponse, errorResponse, getUserIdFromCookies } from '@/lib/api/helpers';
import { createId } from '@paralleldrive/cuid2';

interface SecretSubmitBody {
  roomId: string;
  questionId: string;
  body: string;
  selfRating: number;
  importance: number;
}

export async function POST(request: NextRequest) {
  try {
    // Get user ID from cookies
    const userId = getUserIdFromCookies(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    // Parse request body
    const data: SecretSubmitBody = await request.json();
    const { roomId, questionId, body, selfRating, importance } = data;

    // Validate required fields
    if (!roomId || !questionId || !body || selfRating === undefined || importance === undefined) {
      return errorResponse('Missing required fields', 400);
    }

    // Validate word count (≤100 words)
    const wordCount = body.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount > 100) {
      return errorResponse('Secret must be 100 words or less', 400);
    }

    if (wordCount === 0) {
      return errorResponse('Secret cannot be empty', 400);
    }

    // Validate ratings (1-5)
    if (selfRating < 1 || selfRating > 5 || importance < 1 || importance > 5) {
      return errorResponse('Ratings must be between 1 and 5', 400);
    }

    // Verify room exists
    const room = await mockDb.findRoomById(roomId);
    if (!room) {
      return errorResponse('Room not found', 404);
    }

    // Verify user is a member of the room
    const membership = await mockDb.findRoomMember(roomId, userId);
    if (!membership) {
      return errorResponse('You must be a member of this room to submit secrets', 403);
    }

    // Check if user already has a secret for this question in this room
    const existingSecrets = await mockDb.findRoomSecrets(roomId);
    const existingSecret = existingSecrets.find(
      s => s.authorId === userId && s.questionId === questionId
    );

    if (existingSecret) {
      // Update existing secret (edit answer)
      await mockDb.updateSecret(existingSecret.id, {
        body: body.trim(),
        selfRating,
        importance,
      });

      return successResponse({
        message: 'Secret updated successfully',
        secret: {
          ...existingSecret,
          body: body.trim(),
          selfRating,
          importance,
        },
      });
    } else {
      // Create new secret
      const secretId = createId();
      const now = new Date();

      const newSecret = {
        id: secretId,
        roomId,
        authorId: userId,
        body: body.trim(),
        selfRating,
        importance,
        avgRating: selfRating, // Initially, avgRating = selfRating
        buyersCount: 0,
        createdAt: now,
        isHidden: false,
        questionId, // Store questionId for filtering
      };

      await mockDb.insertSecret(newSecret);

      return successResponse(
        {
          message: 'Secret submitted successfully',
          secret: newSecret,
        },
        201
      );
    }
  } catch (error) {
    console.error('Error submitting secret:', error);
    return errorResponse('Failed to submit secret', 500);
  }
}
