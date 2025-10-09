import { NextRequest } from 'next/server';
import { mockDb } from '@/lib/db/mock';
import { successResponse, errorResponse, getUserIdFromCookies } from '@/lib/api/helpers';

interface RateRequestBody {
  rating: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: secretId } = await params;

    // Get user ID from cookies
    const userId = getUserIdFromCookies(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    // Parse request body
    const data: RateRequestBody = await request.json();
    const { rating } = data;

    // Validate rating (1-5)
    if (rating === undefined || rating < 1 || rating > 5) {
      return errorResponse('Rating must be between 1 and 5', 400);
    }

    // Find the secret
    const secret = await mockDb.findSecretById(secretId);
    if (!secret) {
      return errorResponse('Secret not found', 404);
    }

    // Check if user has access to this secret (must be unlocked or author)
    const isAuthor = secret.authorId === userId;
    const hasAccess = await mockDb.findSecretAccess(secretId, userId);

    if (!isAuthor && !hasAccess) {
      return errorResponse('You must unlock this secret before rating it', 403);
    }

    // Authors can't rate their own secrets
    if (isAuthor) {
      return errorResponse('You cannot rate your own secret', 400);
    }

    // Update or insert rating
    await mockDb.updateSecretRating(secretId, userId, rating);

    // Recalculate average rating
    // Formula: (selfRating + sum of buyer ratings) / (1 + buyer count)
    const allRatings = await mockDb.findSecretRatings(secretId);
    const buyerRatingsSum = allRatings.reduce((sum, r) => sum + r.rating, 0);
    const newAvgRating = (secret.selfRating + buyerRatingsSum) / (1 + allRatings.length);

    // Update secret with new average
    await mockDb.updateSecret(secretId, {
      avgRating: newAvgRating,
    });

    return successResponse({
      message: 'Rating submitted successfully',
      avgRating: parseFloat(newAvgRating.toFixed(1)),
    });
  } catch (error) {
    console.error('Error rating secret:', error);
    return errorResponse('Failed to submit rating', 500);
  }
}
