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
      // Always populate session from token - this is fault-tolerant
      if (token.sub) {
        // Start with token data (always available)
        session.user = {
          ...session.user,
          id: token.sub,
          name: (token.name as string) || "",
          email: (token.email as string) || "",
          image: (token.picture as string) || undefined,
        };

        // Try to enrich with database data (best-effort)
        try {
          const dbUser = await findUserById(token.sub);
          if (dbUser) {
            session.user.name = dbUser.name || session.user.name;
            session.user.email = dbUser.email || session.user.email;
            session.user.image = dbUser.avatarUrl || session.user.image;
          }
        } catch (error) {
          // Database lookup failed - continue with token data
          console.error("Session callback - database lookup failed:", error);
        }
      }

      return session;
    },
    async jwt({ token, user, account, profile }) {
      // Initial sign in - store user data in token
      if (account && user) {
        token.sub = user.id;
        // Preserve profile data for session fallback
        token.name = user.name || (profile as { name?: string })?.name;
        token.email = user.email || (profile as { email?: string })?.email;
        token.picture =
          user.image || (profile as { picture?: string })?.picture;
      }

      return token;
    },
  },
  session: {
    strategy: "jwt", // Use JWT instead of database sessions for simplicity
  },
  // Trust the host header from Vercel/proxies for proper cookie domain
  trustHost: true,
  secret: getServerEnv().NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
