import { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import { createId } from '@paralleldrive/cuid2';
import { insertUser, findUserById } from '@/lib/db/supabase';

export const authConfig = {
  basePath: '/api/auth',
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log('🔐 SignIn callback triggered', {
          userId: user.id,
          email: user.email,
          provider: account?.provider
        });

        // On first sign-in, create user in our database
        if (account?.provider === 'google' && profile?.email) {
          // Use Google's sub (subject) as the user ID for consistency
          const googleId = (profile as { sub?: string }).sub || user.id || createId();
          const existingUser = await findUserById(googleId);

          if (!existingUser) {
            // Create new user with Google profile data
            console.log('🆕 Creating new user in database', googleId);
            await insertUser({
              id: googleId,
              email: profile.email,
              name: profile.name || profile.email.split('@')[0],
              avatarUrl: (profile as { picture?: string }).picture || null,
            });
            user.id = googleId;
            console.log('✅ New user created successfully');
          } else {
            console.log('👤 Existing user found', googleId);
            user.id = googleId;
          }
        }
        return true;
      } catch (error) {
        console.error('❌ SignIn callback error:', error);
        return false;
      }
    },
    async session({ session, token }) {
      // Create user object from token if it doesn't exist
      if (token.sub) {
        // Fetch user data from database
        const dbUser = await findUserById(token.sub);

        if (dbUser) {
          // Populate session with user data
          session.user = {
            ...session.user,
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email || '',
            image: dbUser.avatarUrl || undefined,
          };
        } else {
          // Token exists but user not in DB - shouldn't happen but handle gracefully
          session.user = {
            ...session.user,
            id: token.sub,
            name: token.name as string || '',
            email: token.email as string || '',
            image: token.picture as string || undefined,
          };
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt', // Use JWT instead of database sessions for simplicity
  },
  pages: {
    signIn: '/', // Redirect to homepage for sign-in
    error: '/', // Redirect errors to homepage
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;