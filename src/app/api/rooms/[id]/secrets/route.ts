import { NextRequest } from 'next/server';
import { mockDb } from '@/lib/db/mock';
import { successResponse, errorResponse, getUserIdFromCookies } from '@/lib/api/helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;

    // Get user ID from cookies
    const userId = getUserIdFromCookies(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    // Verify room exists
    const room = await mockDb.findRoomById(roomId);
    if (!room) {
      return errorResponse('Room not found', 404);
    }

    // Verify user is a member
    const membership = await mockDb.findRoomMember(roomId, userId);
    if (!membership) {
      return errorResponse('You must be a member of this room', 403);
    }

    // Get all secrets for this room
    const allSecrets = await mockDb.findRoomSecrets(roomId);

    // Filter secrets: only include those for room's questions
    const roomQuestionIds = room.questionIds || [];
    const customQuestionIds = (room.customQuestions || []).map(q => q.id);
    const validQuestionIds = [...roomQuestionIds, ...customQuestionIds];

    const filteredSecrets = allSecrets.filter(secret => {
      // Only include secrets that have a questionId and it's in the room's questions
      return secret.questionId && validQuestionIds.includes(secret.questionId);
    });

    // For each secret, check if current user has access
    const userSecretAccess = await mockDb.findUserSecretAccess(userId);
    const unlockedSecretIds = new Set(userSecretAccess.map(access => access.secretId));

    // Get user info for authors
    const secretsWithAccess = await Promise.all(
      filteredSecrets.map(async (secret) => {
        const author = await mockDb.findUserById(secret.authorId);
        const isAuthor = secret.authorId === userId;
        const hasAccess = unlockedSecretIds.has(secret.id);
        const isUnlocked = isAuthor || hasAccess;

        return {
          id: secret.id,
          body: isUnlocked ? secret.body : '', // Only send body if unlocked
          selfRating: secret.selfRating,
          importance: secret.importance,
          avgRating: secret.avgRating || null,
          buyersCount: secret.buyersCount,
          authorName: author?.name || 'Unknown',
          authorAvatar: author?.avatarUrl,
          createdAt: secret.createdAt.toISOString(), // Convert Date to ISO string for JSON
          isUnlocked,
          questionId: secret.questionId,
        };
      })
    );

    return successResponse({
      secrets: secretsWithAccess,
    });
  } catch (error) {
    console.error('Error fetching room secrets:', error);
    return errorResponse('Failed to fetch secrets', 500);
  }
}
