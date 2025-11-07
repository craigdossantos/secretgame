import { NextRequest } from 'next/server';
import { mockDb } from '@/lib/db/mock';
import { getUserIdFromCookies, errorResponse, successResponse } from '@/lib/api/helpers';

// GET /api/users/me - Get current user info
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromCookies(request);

    if (!userId) {
      return successResponse({ user: null });
    }

    const user = await mockDb.findUserById(userId);

    if (!user) {
      return successResponse({ user: null });
    }

    return successResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Failed to get current user:', error);
    return errorResponse('Failed to get current user', 500);
  }
}
