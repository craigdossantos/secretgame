import { NextRequest } from "next/server";
import {
  findSecretById,
  findSecretAccess,
  updateSecretRating,
  findSecretRatings,
  updateSecret,
} from "@/lib/db/supabase";
import { successResponse, errorResponse } from "@/lib/api/helpers";
import { getSessionUserWithUpsert } from "@/lib/api/auth-helpers";

interface RateRequestBody {
  rating: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: secretId } = await params;

    // Get authenticated user (auto-upserts to database)
    const authResult = await getSessionUserWithUpsert();
    if (!authResult) {
      return errorResponse("Authentication required", 401);
    }
    const { userId } = authResult;

    // Parse request body
    const data: RateRequestBody = await request.json();
    const { rating } = data;

    // Validate rating (1-5)
    if (rating === undefined || rating < 1 || rating > 5) {
      return errorResponse("Rating must be between 1 and 5", 400);
    }

    // Find the secret
    const secret = await findSecretById(secretId);
    if (!secret) {
      return errorResponse("Secret not found", 404);
    }

    // Check if user has access to this secret (must be unlocked or author)
    const isAuthor = secret.authorId === userId;
    const hasAccess = await findSecretAccess(secretId, userId);

    if (!isAuthor && !hasAccess) {
      return errorResponse("You must unlock this secret before rating it", 403);
    }

    // Authors can't rate their own secrets
    if (isAuthor) {
      return errorResponse("You cannot rate your own secret", 400);
    }

    // Update or insert rating
    await updateSecretRating(secretId, userId, rating);

    // Recalculate average rating
    // Formula: (selfRating + sum of buyer ratings) / (1 + buyer count)
    const allRatings = await findSecretRatings(secretId);
    const buyerRatingsSum = allRatings.reduce((sum, r) => sum + r.rating, 0);
    const newAvgRating =
      (secret.selfRating + buyerRatingsSum) / (1 + allRatings.length);

    // Update secret with new average (store as string per schema)
    await updateSecret(secretId, {
      avgRating: newAvgRating.toFixed(1),
    });

    return successResponse({
      message: "Rating submitted successfully",
      avgRating: parseFloat(newAvgRating.toFixed(1)),
    });
  } catch {
    return errorResponse("Failed to submit rating", 500);
  }
}
