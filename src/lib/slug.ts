import { createId } from "@paralleldrive/cuid2";

/**
 * Generate a random URL-safe slug
 * Format: 8-char lowercase alphanumeric (e.g., "x7k2m9np")
 */
export function generateSlug(): string {
  const id = createId().slice(0, 8).toLowerCase();
  return id;
}

/**
 * Validate a custom slug
 * Rules: lowercase, alphanumeric, hyphens only, 3-50 chars
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length < 3 || slug.length > 50) return false;
  return /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(slug);
}

/**
 * Normalize a user-provided slug
 * Converts to lowercase, replaces spaces with hyphens, removes invalid chars
 */
export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
