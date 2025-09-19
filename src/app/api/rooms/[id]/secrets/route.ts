import { NextRequest } from 'next/server';
import { mockDb } from '@/lib/db/mock';
import {
  getCurrentUserId,
  errorResponse,
  successResponse
} from '@/lib/api/helpers';

// GET /api/rooms/[id]/secrets - Get secrets for a specific room
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id;
    const userId = await getCurrentUserId();

    if (!userId) {
      return errorResponse('Authentication required', 401);
    }

    // Check if user is a member of the room
    const membership = await mockDb.findRoomMember(roomId, userId);
    if (!membership) {
      return errorResponse('You are not a member of this room', 403);
    }

    // Get all secrets for the room
    const secrets = await mockDb.findRoomSecrets(roomId);

    // Get user's access to secrets (which ones they've unlocked)
    const userAccess = await mockDb.findUserSecretAccess(userId);
    const accessibleSecretIds = new Set(userAccess.map(a => a.secretId));

    // Transform secrets to include unlock status
    const secretsWithAccess = secrets.map(secret => ({
      id: secret.id,
      body: secret.body,
      selfRating: secret.selfRating,
      importance: secret.importance,
      avgRating: secret.avgRating,
      buyersCount: secret.buyersCount,
      authorName: 'Anonymous', // In a real app, you'd join with user data
      createdAt: secret.createdAt,
      isUnlocked: secret.authorId === userId || accessibleSecretIds.has(secret.id),
    }));

    return successResponse({ secrets: secretsWithAccess });
  } catch (error) {
    console.error('Failed to get room secrets:', error);
    return errorResponse('Failed to get room secrets', 500);
  }
}