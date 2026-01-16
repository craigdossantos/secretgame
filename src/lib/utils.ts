import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Type for Radix UI Checkbox checked state
 * Can be boolean or 'indeterminate' for tri-state checkboxes
 */
export type CheckedState = boolean | "indeterminate";

/**
 * Safely converts Radix UI Checkbox checked state to boolean.
 * Treats 'indeterminate' as false for binary checkbox usage.
 *
 * Usage:
 *   onCheckedChange={(checked) => setIsChecked(toBoolean(checked))}
 */
export function toBoolean(checked: CheckedState): boolean {
  return checked === true;
}

/** Maximum allowed word count for secrets */
export const MAX_WORD_COUNT = 100;

/**
 * Counts words in a string, handling whitespace correctly.
 * Words are separated by whitespace and filtered to exclude empty strings.
 */
export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

/**
 * Validates word count against the maximum limit.
 * Returns { valid: true } if count is between 1 and MAX_WORD_COUNT.
 */
export function validateWordCount(text: string): {
  valid: boolean;
  count: number;
  error?: string;
} {
  const count = countWords(text);
  if (count === 0) {
    return { valid: false, count, error: "Text cannot be empty" };
  }
  if (count > MAX_WORD_COUNT) {
    return {
      valid: false,
      count,
      error: `Must be ${MAX_WORD_COUNT} words or less`,
    };
  }
  return { valid: true, count };
}
