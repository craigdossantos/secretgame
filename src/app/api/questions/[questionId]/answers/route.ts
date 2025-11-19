import { NextRequest } from 'next/server';
import { mockDb } from '@/lib/db/mock';
import { successResponse, errorResponse, getUserIdFromCookies } from '@/lib/api/helpers';

// GET /api/questions/[questionId]/answers - Get all answers for a specific question
// Only accessible if the current user has also answered this question
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await context.params;
    const userId = getUserIdFromCookies(request);

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    // Get roomId from query params
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return errorResponse('roomId is required', 400);
    }

    console.log(`🔍 Fetching collaborative answers for question ${questionId} in room ${roomId}`);

    // Verify user is a member of the room
    const membership = await mockDb.findRoomMember(roomId, userId);
    if (!membership) {
      return errorResponse('You must be a member of this room', 403);
    }

    // Check if current user has answered this question
    const allSecrets = await mockDb.findRoomSecrets(roomId);
    const userAnswered = allSecrets.some(
      s => s.authorId === userId && s.questionId === questionId
    );

    if (!userAnswered) {
      return errorResponse(
        'You must answer this question before viewing others\' answers',
        403
      );
    }

    // Get all secrets for this question
    const questionSecrets = allSecrets.filter(s => s.questionId === questionId);

    // Get all users who answered (for enrichment)
    const userIds = [...new Set(questionSecrets.map(s => s.authorId))];
    const users = await Promise.all(
      userIds.map(id => mockDb.findUserById(id))
    );
    const userMap = new Map(users.filter(Boolean).map(u => [u!.id, u!]));

    // Check which secrets the current user has unlocked
    const userAccess = await mockDb.findUserSecretAccess(userId);
    const unlockedSecretIds = new Set(userAccess.map(access => access.secretId));

    // Format secrets for response
    const formattedSecrets = questionSecrets.map(secret => {
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
        avgRating: secret.avgRating,
        buyersCount: secret.buyersCount,
        authorName: showAuthor ? (author?.name || 'Unknown') : 'Anonymous',
        authorAvatar: showAuthor ? author?.avatarUrl : undefined,
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
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    console.log(`✅ Found ${formattedSecrets.length} answers for question ${questionId}`);

    return successResponse({
      answers: formattedSecrets,
      questionId,
      totalAnswers: formattedSecrets.length,
    });
  } catch (error) {
    console.error('Failed to fetch collaborative answers:', error);
    return errorResponse('Failed to fetch answers', 500);
  }
}
