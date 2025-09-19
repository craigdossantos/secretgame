// Temporarily disabled until NextAuth v5 is properly configured
// import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};