import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import {
  findSecretById,
  findSecretAccess,
  updateSecretRating,
  findSecretRatings,
  updateSecret,
  upsertUser
} from '@/lib/db/supabase';
import { successResponse, errorResponse } from '@/lib/api/helpers';

interface RateRequestBody {
  rating: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: secretId } = await params;

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
    const data: RateRequestBody = await request.json();
    const { rating } = data;

    console.log(`⭐ User ${userId} attempting to rate secret ${secretId} with ${rating} stars`);

    // Validate rating (1-5)
    if (rating === undefined || rating < 1 || rating > 5) {
      return errorResponse('Rating must be between 1 and 5', 400);
    }

    // Find the secret
    const secret = await findSecretById(secretId);
    if (!secret) {
      console.log(`❌ Secret ${secretId} not found`);
      return errorResponse('Secret not found', 404);
    }

    // Check if user has access to this secret (must be unlocked or author)
    const isAuthor = secret.authorId === userId;
    const hasAccess = await findSecretAccess(secretId, userId);

    if (!isAuthor && !hasAccess) {
      console.log(`❌ User ${userId} has no access to secret ${secretId}`);
      return errorResponse('You must unlock this secret before rating it', 403);
    }

    // Authors can't rate their own secrets
    if (isAuthor) {
      console.log(`❌ User ${userId} attempted to rate their own secret`);
      return errorResponse('You cannot rate your own secret', 400);
    }

    // Update or insert rating
    await updateSecretRating(secretId, userId, rating);

    // Recalculate average rating
    // Formula: (selfRating + sum of buyer ratings) / (1 + buyer count)
    const allRatings = await findSecretRatings(secretId);
    const buyerRatingsSum = allRatings.reduce((sum, r) => sum + r.rating, 0);
    const newAvgRating = (secret.selfRating + buyerRatingsSum) / (1 + allRatings.length);

    // Update secret with new average (store as string per schema)
    await updateSecret(secretId, {
      avgRating: newAvgRating.toFixed(1),
    });

    console.log(`✅ Rating submitted: ${rating} stars. New average: ${newAvgRating.toFixed(1)}`);

    return successResponse({
      message: 'Rating submitted successfully',
      avgRating: parseFloat(newAvgRating.toFixed(1)),
    });
  } catch (error) {
    console.error('❌ Error rating secret:', error);
    return errorResponse('Failed to submit rating', 500);
  }
}
