import { NextRequest } from "next/server";
import {
  findSecretById,
  findRoomMember,
  findRoomSecrets,
  findSecretAccess,
  findUserById,
  insertSecret,
  insertSecretAccess,
  updateSecret,
} from "@/lib/db/supabase";
import { successResponse, errorResponse } from "@/lib/api/helpers";
import { getSessionUserWithUpsert } from "@/lib/api/auth-helpers";
import { createId } from "@paralleldrive/cuid2";
import { countWords, MAX_WORD_COUNT } from "@/lib/utils";

interface UnlockRequestBody {
  questionId: string;
  body: string;
  selfRating: number;
  importance: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: secretId } = await params;

    // Get authenticated user (ensures they exist in database)
    const authResult = await getSessionUserWithUpsert();
    if (!authResult) {
      return errorResponse("Authentication required", 401);
    }
    const { userId } = authResult;

    // Parse request body
    const data: UnlockRequestBody = await request.json();
    const { questionId, body, selfRating, importance } = data;

    // Validate required fields
    if (
      !questionId ||
      !body ||
      selfRating === undefined ||
      importance === undefined
    ) {
      return errorResponse("Missing required fields", 400);
    }

    // Validate word count (≤100 words)
    const wordCount = countWords(body);
    if (wordCount > MAX_WORD_COUNT) {
      return errorResponse(
        `Secret must be ${MAX_WORD_COUNT} words or less`,
        400,
      );
    }
    if (wordCount === 0) {
      return errorResponse("Secret cannot be empty", 400);
    }

    // Validate ratings (1-5)
    if (selfRating < 1 || selfRating > 5 || importance < 1 || importance > 5) {
      return errorResponse("Ratings must be between 1 and 5", 400);
    }

    // Find the secret to unlock
    const secretToUnlock = await findSecretById(secretId);
    if (!secretToUnlock) {
      return errorResponse("Secret not found", 404);
    }

    // Prevent unlocking your own secret
    if (secretToUnlock.authorId === userId) {
      return errorResponse("You cannot unlock your own secret", 400);
    }

    // Check if user already has access
    const existingAccess = await findSecretAccess(secretId, userId);
    if (existingAccess) {
      return errorResponse("You have already unlocked this secret", 400);
    }

    // Validate: submitted secret rating must be >= required rating
    if (selfRating < secretToUnlock.selfRating) {
      return errorResponse(
        `Your secret must have a rating of ${secretToUnlock.selfRating} or higher`,
        400,
      );
    }

    // Verify user is a member of the room
    const membership = await findRoomMember(secretToUnlock.roomId, userId);
    if (!membership) {
      return errorResponse("You must be a member of this room", 403);
    }

    // Check if user already answered this question - if so, update it; otherwise create new
    const existingSecrets = await findRoomSecrets(secretToUnlock.roomId);
    const existingUserSecret = existingSecrets.find(
      (s) => s.authorId === userId && s.questionId === questionId,
    );

    if (existingUserSecret) {
      // Update existing secret
      await updateSecret(existingUserSecret.id, {
        body: body.trim(),
        selfRating,
        importance,
      });
    } else {
      // Create new secret (user's answer to unlock)
      const newSecretId = createId();

      const newSecret = {
        id: newSecretId,
        roomId: secretToUnlock.roomId,
        authorId: userId,
        questionId,
        body: body.trim(),
        selfRating,
        importance,
        avgRating: String(selfRating), // Store as string per schema
        buyersCount: 0,
        isHidden: false,
        answerType: "text",
        answerData: null,
        isAnonymous: false,
      };

      await insertSecret(newSecret);
    }

    // Grant access to the unlocked secret
    const accessId = createId();

    await insertSecretAccess({
      id: accessId,
      secretId,
      buyerId: userId,
    });

    // Increment buyers count
    await updateSecret(secretId, {
      buyersCount: secretToUnlock.buyersCount + 1,
    });

    // Fetch updated secret with author info
    const author = await findUserById(secretToUnlock.authorId);
    const updatedSecret = await findSecretById(secretId);

    if (!updatedSecret) {
      return errorResponse("Failed to fetch updated secret", 500);
    }

    return successResponse({
      message: "Secret unlocked successfully",
      secret: {
        id: updatedSecret.id,
        body: updatedSecret.body,
        selfRating: updatedSecret.selfRating,
        importance: updatedSecret.importance,
        avgRating: updatedSecret.avgRating
          ? Number(updatedSecret.avgRating)
          : null,
        buyersCount: updatedSecret.buyersCount,
        authorName: author?.name || "Unknown",
        authorAvatar: author?.avatarUrl,
        createdAt: updatedSecret.createdAt,
        isUnlocked: true,
        questionId: updatedSecret.questionId,
      },
    });
  } catch {
    return errorResponse("Failed to unlock secret", 500);
  }
}
