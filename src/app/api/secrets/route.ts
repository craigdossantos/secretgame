import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { secrets, roomMembers } from '@/lib/db/schema';
import { createId } from '@paralleldrive/cuid2';
import { eq, and } from 'drizzle-orm';
import {
  getCurrentUserId,
  errorResponse,
  successResponse
} from '@/lib/api/helpers';

// POST /api/secrets - Create a new secret
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomId, body: secretBody, selfRating, importance } = body;

    // Validate inputs
    if (!roomId || !secretBody || !selfRating || !importance) {
      return errorResponse('Missing required fields');
    }

    // Validate word count (max 100 words)
    const wordCount = secretBody.trim().split(/\s+/).filter((word: string) => word.length > 0).length;
    if (wordCount > 100) {
      return errorResponse('Secret must be 100 words or less');
    }

    // Validate ratings (1-5)
    if (selfRating < 1 || selfRating > 5 || importance < 1 || importance > 5) {
      return errorResponse('Ratings must be between 1 and 5');
    }

    const userId = await getCurrentUserId();
    if (!userId) {
      return errorResponse('User not authenticated', 401);
    }

    // Check if user is a member of the room
    const membership = await db
      .select()
      .from(roomMembers)
      .where(
        and(
          eq(roomMembers.roomId, roomId),
          eq(roomMembers.userId, userId)
        )
      )
      .limit(1);

    if (!membership.length) {
      return errorResponse('You must be a member of the room to post secrets', 403);
    }

    // Create the secret
    const secretId = createId();
    const newSecret = {
      id: secretId,
      roomId,
      authorId: userId,
      body: secretBody,
      selfRating,
      importance,
      avgRating: null,
      buyersCount: 0,
      createdAt: new Date(),
      isHidden: false,
    };

    await db.insert(secrets).values(newSecret);

    return successResponse({
      secretId,
      message: 'Secret created successfully',
    });
  } catch (error) {
    console.error('Failed to create secret:', error);
    return errorResponse('Failed to create secret', 500);
  }
}