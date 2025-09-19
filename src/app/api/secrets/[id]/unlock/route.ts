import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { secrets, secretAccess, roomMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import {
  getCurrentUserId,
  errorResponse,
  successResponse
} from '@/lib/api/helpers';

// POST /api/secrets/[id]/unlock - Unlock a secret by submitting a new one
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const targetSecretId = params.id;
    const body = await request.json();
    const { body: newSecretBody, selfRating, importance } = body;

    // Validate inputs
    if (!newSecretBody || !selfRating || !importance) {
      return errorResponse('Missing required fields');
    }

    // Validate word count
    const wordCount = newSecretBody.trim().split(/\s+/).filter((word: string) => word.length > 0).length;
    if (wordCount > 100) {
      return errorResponse('Secret must be 100 words or less');
    }

    // Validate ratings
    if (selfRating < 1 || selfRating > 5 || importance < 1 || importance > 5) {
      return errorResponse('Ratings must be between 1 and 5');
    }

    const userId = await getCurrentUserId();
    if (!userId) {
      return errorResponse('User not authenticated', 401);
    }

    // Get target secret details
    const targetSecret = await db
      .select()
      .from(secrets)
      .where(eq(secrets.id, targetSecretId))
      .limit(1);

    if (!targetSecret.length) {
      return errorResponse('Secret not found', 404);
    }

    // Check if user is the author (can't unlock own secret)
    if (targetSecret[0].authorId === userId) {
      return errorResponse('You cannot unlock your own secret', 403);
    }

    // Check if user already has access
    const existingAccess = await db
      .select()
      .from(secretAccess)
      .where(
        and(
          eq(secretAccess.secretId, targetSecretId),
          eq(secretAccess.buyerId, userId)
        )
      )
      .limit(1);

    if (existingAccess.length) {
      return errorResponse('You already have access to this secret', 400);
    }

    // Verify rating requirement (must be equal or higher)
    if (selfRating < targetSecret[0].selfRating) {
      return errorResponse(
        `Your secret must be level ${targetSecret[0].selfRating} or higher`,
        400
      );
    }

    // Check room membership
    const membership = await db
      .select()
      .from(roomMembers)
      .where(
        and(
          eq(roomMembers.roomId, targetSecret[0].roomId),
          eq(roomMembers.userId, userId)
        )
      )
      .limit(1);

    if (!membership.length) {
      return errorResponse('You must be a member of the room', 403);
    }

    // Create the new secret
    const newSecretId = createId();
    await db.insert(secrets).values({
      id: newSecretId,
      roomId: targetSecret[0].roomId,
      authorId: userId,
      body: newSecretBody,
      selfRating,
      importance,
      avgRating: null,
      buyersCount: 0,
      createdAt: new Date(),
      isHidden: false,
    });

    // Grant access to target secret
    await db.insert(secretAccess).values({
      id: createId(),
      secretId: targetSecretId,
      buyerId: userId,
      createdAt: new Date(),
    });

    // Update buyers count
    await db
      .update(secrets)
      .set({
        buyersCount: sql`${secrets.buyersCount} + 1`,
      })
      .where(eq(secrets.id, targetSecretId));

    // Return the unlocked secret
    const unlockedSecret = await db
      .select()
      .from(secrets)
      .where(eq(secrets.id, targetSecretId))
      .limit(1);

    return successResponse({
      message: 'Secret unlocked successfully',
      newSecretId,
      unlockedSecret: unlockedSecret[0],
    });
  } catch (error) {
    console.error('Failed to unlock secret:', error);
    return errorResponse('Failed to unlock secret', 500);
  }
}