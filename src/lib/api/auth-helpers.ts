import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { Session } from "next-auth";

export interface AuthResult {
  userId: string;
  session: Session | null;
  isAnonymous: boolean;
}

/**
 * Get authenticated user ID from NextAuth session or cookie fallback.
 * Returns null if not authenticated.
 *
 * This centralizes the authentication pattern used across API routes:
 * 1. First checks NextAuth session for authenticated user ID
 * 2. Falls back to userId cookie for anonymous users
 * 3. Returns null if neither is present
 *
 * @param request - The NextRequest object containing cookies
 * @returns AuthResult with userId, session, and isAnonymous flag, or null if unauthenticated
 */
export async function getAuthenticatedUser(
  request: NextRequest,
): Promise<AuthResult | null> {
  const session = await auth();
  let userId = session?.user?.id;
  const isAnonymous = !userId;

  // Fall back to cookie for anonymous users
  if (!userId) {
    userId = request.cookies.get("userId")?.value;
  }

  if (!userId) {
    return null;
  }

  return { userId, session, isAnonymous };
}

/**
 * Get authenticated user, requiring a full NextAuth session (no cookie fallback).
 * Returns null if no authenticated session exists.
 *
 * Use this for routes that require full authentication (not anonymous users).
 *
 * @returns AuthResult with userId and session, or null if not authenticated
 */
export async function getSessionUser(): Promise<AuthResult | null> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  return { userId, session, isAnonymous: false };
}

/**
 * Require authentication - returns AuthResult or throws Error.
 * Use this for routes that must have authentication.
 *
 * @param request - The NextRequest object containing cookies
 * @throws Error if not authenticated
 * @returns AuthResult with userId, session, and isAnonymous flag
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const result = await getAuthenticatedUser(request);
  if (!result) {
    throw new Error("Authentication required");
  }
  return result;
}

/**
 * Require a full NextAuth session (no cookie fallback).
 * Use this for routes that require authenticated (non-anonymous) users.
 *
 * @throws Error if no authenticated session exists
 * @returns AuthResult with userId and session
 */
export async function requireSessionAuth(): Promise<AuthResult> {
  const result = await getSessionUser();
  if (!result) {
    throw new Error("Authentication required");
  }
  return result;
}
