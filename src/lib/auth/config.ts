import { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import { createId } from '@paralleldrive/cuid2';
import { insertUser, findUserById, findUserByEmail } from '@/lib/db/supabase';

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
        // On sign-in, sync user with our database
        if (account?.provider === 'google' && profile?.email) {
          // Use Google's sub (subject) as the user ID for consistency
          const googleId = (profile as { sub?: string }).sub || user.id || createId();

          // Check if user exists by email first (handles ID migration)
          const existingUserByEmail = await findUserByEmail(profile.email);

          if (existingUserByEmail) {
            // Use existing user's ID (don't change it)
            user.id = existingUserByEmail.id;
          } else {
            // Check by Google ID
            const existingUserById = await findUserById(googleId);

            if (!existingUserById) {
              // Create new user with Google profile data
              await insertUser({
                id: googleId,
                email: profile.email,
                name: profile.name || profile.email.split('@')[0],
                avatarUrl: (profile as { picture?: string }).picture || null,
              });
              user.id = googleId;
            } else {
              user.id = googleId;
            }
          }
        }
        return true;
      } catch (error) {
        console.error('SignIn callback error:', error);
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