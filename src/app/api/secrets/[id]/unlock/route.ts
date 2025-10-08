import { NextRequest } from 'next/server';
import { mockDb } from '@/lib/db/mock';
import { successResponse, errorResponse, getUserIdFromCookies } from '@/lib/api/helpers';
import { createId } from '@paralleldrive/cuid2';

interface UnlockRequestBody {
  questionId: string;
  body: string;
  selfRating: number;
  importance: number;
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
    const data: UnlockRequestBody = await request.json();
    const { questionId, body, selfRating, importance } = data;

    // Validate required fields
    if (!questionId || !body || selfRating === undefined || importance === undefined) {
      return errorResponse('Missing required fields', 400);
    }

    // Validate word count (≤100 words)
    const wordCount = body.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount > 100) {
      return errorResponse('Secret must be 100 words or less', 400);
    }

    if (wordCount === 0) {
      return errorResponse('Secret cannot be empty', 400);
    }

    // Validate ratings (1-5)
    if (selfRating < 1 || selfRating > 5 || importance < 1 || importance > 5) {
      return errorResponse('Ratings must be between 1 and 5', 400);
    }

    // Find the secret to unlock
    const secretToUnlock = await mockDb.findSecretById(secretId);
    if (!secretToUnlock) {
      return errorResponse('Secret not found', 404);
    }

    // Prevent unlocking your own secret
    if (secretToUnlock.authorId === userId) {
      return errorResponse('You cannot unlock your own secret', 400);
    }

    // Check if user already has access
    const existingAccess = await mockDb.findSecretAccess(secretId, userId);
    if (existingAccess) {
      return errorResponse('You have already unlocked this secret', 400);
    }

    // Validate: submitted secret rating must be >= required rating
    if (selfRating < secretToUnlock.selfRating) {
      return errorResponse(
        `Your secret must have a rating of ${secretToUnlock.selfRating} or higher`,
        400
      );
    }

    // Verify user is a member of the room
    const membership = await mockDb.findRoomMember(secretToUnlock.roomId, userId);
    if (!membership) {
      return errorResponse('You must be a member of this room', 403);
    }

    // Check if user already answered this question - if so, update it; otherwise create new
    const existingSecrets = await mockDb.findRoomSecrets(secretToUnlock.roomId);
    const existingUserSecret = existingSecrets.find(
      s => s.authorId === userId && s.questionId === questionId
    );

    if (existingUserSecret) {
      // Update existing secret
      await mockDb.updateSecret(existingUserSecret.id, {
        body: body.trim(),
        selfRating,
        importance,
      });
    } else {
      // Create new secret (user's answer to unlock)
      const newSecretId = createId();
      const now = new Date();

      const newSecret = {
        id: newSecretId,
        roomId: secretToUnlock.roomId,
        authorId: userId,
        questionId,
        body: body.trim(),
        selfRating,
        importance,
        avgRating: selfRating,
        buyersCount: 0,
        createdAt: now,
        isHidden: false,
      };

      await mockDb.insertSecret(newSecret);
    }

    // Grant access to the unlocked secret
    const accessId = createId();
    await mockDb.insertSecretAccess({
      id: accessId,
      secretId,
      buyerId: userId,
      createdAt: new Date(),
    });

    // Increment buyers count
    await mockDb.updateSecret(secretId, {
      buyersCount: secretToUnlock.buyersCount + 1,
    });

    // Fetch updated secret with author info
    const author = await mockDb.findUserById(secretToUnlock.authorId);
    const updatedSecret = await mockDb.findSecretById(secretId);

    return successResponse({
      message: 'Secret unlocked successfully',
      secret: {
        id: updatedSecret!.id,
        body: updatedSecret!.body,
        selfRating: updatedSecret!.selfRating,
        importance: updatedSecret!.importance,
        avgRating: updatedSecret!.avgRating || null,
        buyersCount: updatedSecret!.buyersCount,
        authorName: author?.name || 'Unknown',
        authorAvatar: author?.avatarUrl,
        createdAt: updatedSecret!.createdAt,
        isUnlocked: true,
        questionId: updatedSecret!.questionId,
      },
    });
  } catch (error) {
    console.error('Error unlocking secret:', error);
    return errorResponse('Failed to unlock secret', 500);
  }
}
