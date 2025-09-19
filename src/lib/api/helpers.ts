import { createId } from '@paralleldrive/cuid2';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Generate a unique invite code
export function generateInviteCode(): string {
  // Generate a 6-character alphanumeric code
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Get current user ID from session (temporary solution)
export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('userId')?.value || null;
}

// Set user ID in cookie (temporary solution)
export async function setUserId(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set('userId', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

// Create temporary user
export async function createTempUser(name: string) {
  return {
    id: createId(),
    email: `${createId()}@temp.com`,
    name,
    avatarUrl: null,
    createdAt: new Date(),
  };
}

// Error response helper
export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Success response helper
export function successResponse(data: any, status = 200) {
  return NextResponse.json(data, { status });
}