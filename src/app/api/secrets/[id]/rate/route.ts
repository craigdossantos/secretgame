import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { secrets, secretAccess, secretRatings } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import {
  getCurrentUserId,
  errorResponse,
  successResponse
} from '@/lib/api/helpers';

// POST /api/secrets/[id]/rate - Rate a secret
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const secretId = params.id;
    const body = await request.json();
    const { rating } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return errorResponse('Rating must be between 1 and 5');
    }

    const userId = await getCurrentUserId();
    if (!userId) {
      return errorResponse('User not authenticated', 401);
    }

    // Get secret details
    const secret = await db
      .select()
      .from(secrets)
      .where(eq(secrets.id, secretId))
      .limit(1);

    if (!secret.length) {
      return errorResponse('Secret not found', 404);
    }

    // Check if user has access (either author or buyer)
    const hasAccess = secret[0].authorId === userId ||
      (await db
        .select()
        .from(secretAccess)
        .where(
          and(
            eq(secretAccess.secretId, secretId),
            eq(secretAccess.buyerId, userId)
          )
        )
        .limit(1)).length > 0;

    if (!hasAccess) {
      return errorResponse('You must unlock this secret first', 403);
    }

    // Check if user already rated
    const existingRating = await db
      .select()
      .from(secretRatings)
      .where(
        and(
          eq(secretRatings.secretId, secretId),
          eq(secretRatings.raterId, userId)
        )
      )
      .limit(1);

    if (existingRating.length) {
      // Update existing rating
      await db
        .update(secretRatings)
        .set({
          rating,
          createdAt: new Date(),
        })
        .where(
          and(
            eq(secretRatings.secretId, secretId),
            eq(secretRatings.raterId, userId)
          )
        );
    } else {
      // Create new rating
      await db.insert(secretRatings).values({
        id: createId(),
        secretId,
        raterId: userId,
        rating,
        createdAt: new Date(),
      });
    }

    // Calculate new average rating
    const allRatings = await db
      .select({ rating: secretRatings.rating })
      .from(secretRatings)
      .where(eq(secretRatings.secretId, secretId));

    // Include the self rating in the average
    const ratings = [secret[0].selfRating, ...allRatings.map(r => r.rating)];
    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

    // Update secret with new average
    await db
      .update(secrets)
      .set({
        avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
      })
      .where(eq(secrets.id, secretId));

    return successResponse({
      message: 'Rating submitted successfully',
      newAvgRating: Math.round(avgRating * 10) / 10,
    });
  } catch (error) {
    console.error('Failed to rate secret:', error);
    return errorResponse('Failed to rate secret', 500);
  }
}