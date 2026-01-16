/**
 * Environment variable validation with Zod
 *
 * This file validates all environment variables at startup to fail fast
 * if required variables are missing or malformed. Uses Zod for type-safe
 * schema validation.
 *
 * Usage:
 *   import { env } from '@/lib/env';
 *   const clientId = env.GOOGLE_CLIENT_ID; // Type-safe, validated
 */

import { z } from "zod";

// Schema for server-side environment variables
const serverEnvSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().optional(), // Optional until real DB is enabled

  // NextAuth.js
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL: z.string().url().optional().default("http://localhost:3000"),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),

  // Environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

// Schema for public (client-side) environment variables
const publicEnvSchema = z.object({
  NEXT_PUBLIC_BASE_URL: z
    .string()
    .url()
    .optional()
    .default("http://localhost:3000"),
});

// Type definitions
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type PublicEnv = z.infer<typeof publicEnvSchema>;

/**
 * Validate and parse environment variables
 * Throws a descriptive error if validation fails
 */
function validateEnv<T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  envSource: Record<string, string | undefined>,
): z.infer<T> {
  const result = schema.safeParse(envSource);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `❌ Environment validation failed:\n${errors}\n\nPlease check your .env file or environment configuration.`,
    );
  }

  return result.data;
}

// Lazy initialization to avoid validation during build
let _serverEnv: ServerEnv | null = null;
let _publicEnv: PublicEnv | null = null;

/**
 * Get validated server-side environment variables
 * Only call this on the server (API routes, server components)
 */
export function getServerEnv(): ServerEnv {
  if (!_serverEnv) {
    _serverEnv = validateEnv(
      serverEnvSchema,
      process.env as Record<string, string | undefined>,
    );
  }
  return _serverEnv;
}

/**
 * Get validated public environment variables
 * Safe to call from client or server
 */
export function getPublicEnv(): PublicEnv {
  if (!_publicEnv) {
    _publicEnv = validateEnv(
      publicEnvSchema,
      process.env as Record<string, string | undefined>,
    );
  }
  return _publicEnv;
}

/**
 * Helper to check if we're in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Helper to check if we're in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Helper to check if we're in test mode
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === "test";
}
