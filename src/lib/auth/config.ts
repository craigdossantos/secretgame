import { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { createId } from "@paralleldrive/cuid2";
import { insertUser, findUserById, findUserByEmail } from "@/lib/db/supabase";
import { getServerEnv } from "@/lib/env";

export const authConfig = {
  basePath: "/api/auth",
  providers: [
    Google({
      clientId: getServerEnv().GOOGLE_CLIENT_ID,
      clientSecret: getServerEnv().GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Always allow sign-in - database sync is best-effort
      // If database operations fail, we still authenticate using Google profile
      if (account?.provider === "google" && profile?.email) {
        // Use Google's sub (subject) as the user ID for consistency
        const googleId =
          (profile as { sub?: string }).sub || user.id || createId();

        try {
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
                name: profile.name || profile.email.split("@")[0],
                avatarUrl: (profile as { picture?: string }).picture || null,
              });
            }
            user.id = googleId;
          }
        } catch (error) {
          // Database sync failed - log but don't block authentication
          // User will be created on next API call that needs them
          console.error("SignIn callback - database sync failed:", error);
          user.id = googleId;
        }
      }
      return true;
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
            email: dbUser.email || "",
            image: dbUser.avatarUrl || undefined,
          };
        } else {
          // Token exists but user not in DB - shouldn't happen but handle gracefully
          session.user = {
            ...session.user,
            id: token.sub,
            name: (token.name as string) || "",
            email: (token.email as string) || "",
            image: (token.picture as string) || undefined,
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
    strategy: "jwt", // Use JWT instead of database sessions for simplicity
  },
  // Note: Removed 'pages' config to allow callbackUrl to work properly.
  // The pages config was overriding the callbackUrl parameter in signIn(),
  // causing users to land on "/" instead of "/auth/callback" after OAuth.
  secret: getServerEnv().NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
