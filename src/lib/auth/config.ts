import { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import { createId } from '@paralleldrive/cuid2';
import { insertUser, findUserById, findUserByEmail, upsertUser } from '@/lib/db/supabase';

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

        // On sign-in, sync user with our database
        if (account?.provider === 'google' && profile?.email) {
          // Use Google's sub (subject) as the user ID for consistency
          const googleId = (profile as { sub?: string }).sub || user.id || createId();

          // Check if user exists by email first (handles ID migration)
          const existingUserByEmail = await findUserByEmail(profile.email);

          if (existingUserByEmail) {
            console.log('👤 Existing user found by email:', existingUserByEmail.id);
            // Use existing user's ID (don't change it)
            user.id = existingUserByEmail.id;
          } else {
            // Check by Google ID
            const existingUserById = await findUserById(googleId);

            if (!existingUserById) {
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
              console.log('👤 Existing user found by ID', googleId);
              user.id = googleId;
            }
          }
        }
        return true;
      } catch (error) {
        console.error('❌ SignIn callback error:', error);
        return false;
      }
    },
    async session({ session, token }) {
      console.log('👤 Session callback triggered', {
        hasTokenSub: !!token.sub,
        tokenSub: token.sub,
        hasSessionUser: !!session.user
      });

      // Create user object from token if it doesn't exist
      if (token.sub) {
        // Fetch user data from database
        const dbUser = await findUserById(token.sub);
        console.log('🔍 DB user lookup result:', dbUser ? 'Found' : 'Not found');

        if (dbUser) {
          // Populate session with user data
          session.user = {
            ...session.user,
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email || '',
            image: dbUser.avatarUrl || undefined,
          };
          console.log('✅ Session populated from DB user:', dbUser.id);
        } else {
          // Token exists but user not in DB - shouldn't happen but handle gracefully
          session.user = {
            ...session.user,
            id: token.sub,
            name: token.name as string || '',
            email: token.email as string || '',
            image: token.picture as string || undefined,
          };
          console.log('⚠️ Session populated from token (user not in DB)');
        }
      } else {
        console.log('❌ No token.sub found - returning empty session');
      }

      console.log('📤 Returning session with user:', session.user?.id || 'null');
      return session;
    },
    async jwt({ token, user, account }) {
      console.log('🔑 JWT callback triggered', {
        hasAccount: !!account,
        hasUser: !!user,
        userId: user?.id,
        tokenSub: token.sub,
        accountProvider: account?.provider
      });

      // Initial sign in
      if (account && user) {
        console.log('✅ Setting token.sub to user.id:', user.id);
        token.sub = user.id;
      }

      console.log('📤 Returning token with sub:', token.sub);
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