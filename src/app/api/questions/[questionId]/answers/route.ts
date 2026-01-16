import { NextRequest } from "next/server";
import {
  findRoomMember,
  findRoomSecrets,
  findUserById,
  findUserSecretAccess,
} from "@/lib/db/supabase";
import { successResponse, errorResponse } from "@/lib/api/helpers";
import { getSessionUserWithUpsert } from "@/lib/api/auth-helpers";

// GET /api/questions/[questionId]/answers - Get all answers for a specific question
// Only accessible if the current user has also answered this question
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ questionId: string }> },
) {
  try {
    const { questionId } = await context.params;

    // Get authenticated user with database upsert
    const authResult = await getSessionUserWithUpsert();
    if (!authResult) {
      return errorResponse("Authentication required", 401);
    }
    const { userId } = authResult;

    // Get roomId from query params
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return errorResponse("roomId is required", 400);
    }

    // Verify user is a member of the room
    const membership = await findRoomMember(roomId, userId);
    if (!membership) {
      return errorResponse("You must be a member of this room", 403);
    }

    // Check if current user has answered this question
    const allSecrets = await findRoomSecrets(roomId);
    const userAnswered = allSecrets.some(
      (s) => s.authorId === userId && s.questionId === questionId,
    );

    if (!userAnswered) {
      return errorResponse(
        "You must answer this question before viewing others' answers",
        403,
      );
    }

    // Get all secrets for this question
    const questionSecrets = allSecrets.filter(
      (s) => s.questionId === questionId,
    );

    // Get all users who answered (for enrichment)
    const userIds = [...new Set(questionSecrets.map((s) => s.authorId))];
    const users = await Promise.all(userIds.map((id) => findUserById(id)));
    const userMap = new Map(users.filter(Boolean).map((u) => [u!.id, u!]));

    // Check which secrets the current user has unlocked
    const userAccess = await findUserSecretAccess(userId);
    const unlockedSecretIds = new Set(
      userAccess.map((access) => access.secretId),
    );

    // Format secrets for response
    const formattedSecrets = questionSecrets.map((secret) => {
      const author = userMap.get(secret.authorId);
      const isUnlocked =
        secret.authorId === userId || // User's own secret
        unlockedSecretIds.has(secret.id); // User has unlocked it

      // For anonymous secrets, hide author info unless it's the current user's
      const isCurrentUser = secret.authorId === userId;
      const showAuthor = !secret.isAnonymous || isCurrentUser;

      return {
        id: secret.id,
        body: isUnlocked ? secret.body : null,
        selfRating: secret.selfRating,
        importance: secret.importance,
        avgRating: secret.avgRating ? Number(secret.avgRating) : null,
        buyersCount: secret.buyersCount,
        authorName: showAuthor ? author?.name || "Unknown" : "Anonymous",
        authorAvatar: showAuthor ? author?.avatarUrl : undefined,
        authorId: secret.authorId, // Include for collaborative display
        isAnonymous: secret.isAnonymous && !isCurrentUser,
        createdAt: secret.createdAt.toISOString(),
        isUnlocked,
        isOwnSecret: isCurrentUser,
        answerType: secret.answerType,
        answerData: isUnlocked ? secret.answerData : null,
      };
    });

    // Sort by creation date (oldest first)
    formattedSecrets.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    return successResponse({
      answers: formattedSecrets,
      questionId,
      totalAnswers: formattedSecrets.length,
      currentUserId: userId, // Include for client-side (secure alternative to cookie reading)
    });
  } catch {
    return errorResponse("Failed to fetch answers", 500);
  }
}
