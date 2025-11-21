import { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import { createId } from '@paralleldrive/cuid2';
import { insertUser, findUserById } from '@/lib/db/supabase';

export const authConfig = {
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
      // On first sign-in, create user in our database
      if (account?.provider === 'google' && profile?.email) {
        const existingUser = await findUserById(user.id || createId());

        if (!existingUser) {
          // Create new user with Google profile data
          const userId = createId();
          await insertUser({
            id: userId,
            email: profile.email,
            name: profile.name || profile.email.split('@')[0],
            avatarUrl: (profile as { picture?: string }).picture || null,
          });
          user.id = userId;
        }
      }
      return true;
    },
    async session({ session, token }) {
      // Add user ID to session
      if (session.user && token.sub) {
        session.user.id = token.sub;

        // Fetch latest user data from database
        const dbUser = await findUserById(token.sub);
        if (dbUser) {
          session.user.name = dbUser.name;
          if (dbUser.email) session.user.email = dbUser.email;
          if (dbUser.avatarUrl) session.user.image = dbUser.avatarUrl;
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