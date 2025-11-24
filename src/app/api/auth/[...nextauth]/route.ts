import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/config';

// Force cache invalidation - January 24, 2025
const { handlers } = NextAuth(authConfig);

export const GET = handlers.GET;
export const POST = handlers.POST;