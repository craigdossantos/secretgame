import { createId } from "@paralleldrive/cuid2";
import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { isProduction } from "@/lib/env";

// Generate a unique invite code using cryptographically secure random bytes
export function generateInviteCode(): string {
  // Generate 4 random bytes (32 bits of entropy) and convert to 6-char alphanumeric
  const bytes = randomBytes(4);
  // Convert to base36 (0-9, a-z) and take 6 characters, uppercase for readability
  const code = bytes.readUInt32BE(0).toString(36).substring(0, 6).toUpperCase();
  // Ensure exactly 6 characters by padding with random chars if needed
  return code
    .padEnd(6, randomBytes(1)[0].toString(36).toUpperCase())
    .substring(0, 6);
}

// Get current user ID from session (temporary solution)
export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("userId")?.value || null;
}

// Get user ID from cookies in API routes (synchronous version for NextRequest)
export function getUserIdFromCookies(request: NextRequest): string | null {
  const userId = request.cookies.get("userId")?.value;
  return userId || null;
}

// Set user ID in cookie (temporary solution)
// Note: In Next.js 15, cookies must be set on the NextResponse object
export function createUserCookie(userId: string) {
  return {
    name: "userId",
    value: userId,
    options: {
      httpOnly: true,
      secure: isProduction(),
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
  };
}

// Create temporary user
export async function createTempUser(name: string) {
  return {
    id: createId(),
    email: `${createId()}@temp.com`,
    name,
    avatarUrl: undefined,
    createdAt: new Date(),
  };
}

// Error response helper
export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Success response helper
export function successResponse(
  data: unknown,
  status = 200,
  cookie?: {
    name: string;
    value: string;
    options: {
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: "strict" | "lax" | "none";
      maxAge?: number;
    };
  },
) {
  const response = NextResponse.json(data, { status });

  if (cookie) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }

  return response;
}
