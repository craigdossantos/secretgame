import { auth } from '@/lib/auth';
import { findUserById } from '@/lib/db/supabase';
import { errorResponse, successResponse } from '@/lib/api/helpers';

// GET /api/users/me - Get current user info
export async function GET() {
  try {
    // Get authenticated user from NextAuth session
    const session = await auth();

    if (!session?.user?.id) {
      return successResponse({ user: null });
    }

    // Fetch user data from Supabase
    const user = await findUserById(session.user.id);

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
