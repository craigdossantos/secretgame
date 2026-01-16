/**
 * Centralized type definitions for database models
 *
 * These types represent the core data models used throughout the application.
 * They align with the database schema defined in src/lib/db/schema.ts
 * but include runtime-friendly types (e.g., Date instead of timestamp).
 */

// ============================================================================
// BASE TYPES (match database schema)
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  createdAt: Date;
}

export interface Room {
  id: string;
  name?: string | null;
  ownerId: string;
  inviteCode: string;
  maxMembers: number;
  setupMode?: boolean;
  createdAt: Date;
}

export interface RoomMember {
  roomId: string;
  userId: string;
  joinedAt: Date;
}

export interface CustomQuestion {
  id: string;
  roomId: string;
  question: string;
  category: string;
  suggestedLevel: number;
  difficulty: "easy" | "medium" | "hard";
  createdBy: string;
  createdAt: Date;
  questionType?: string;
  answerConfig?: unknown;
  allowAnonymous?: boolean;
  allowImageUpload?: boolean;
}

export interface Secret {
  id: string;
  roomId: string;
  authorId: string;
  questionId?: string | null;
  body: string;
  selfRating: number;
  importance: number;
  avgRating?: number | null;
  buyersCount: number;
  isHidden: boolean;
  isAnonymous?: boolean;
  answerType?: string;
  answerData?: unknown;
  createdAt: Date;
}

export interface SecretAccess {
  id: string;
  secretId: string;
  buyerId: string;
  createdAt: Date;
}

export interface SecretRating {
  id: string;
  secretId: string;
  raterId: string;
  rating: number;
  createdAt: Date;
}

// ============================================================================
// ANSWER DATA TYPES (for typed answers)
// ============================================================================

/**
 * Answer types supported by the system
 */
export type AnswerType = "text" | "slider" | "multipleChoice" | "imageUpload";

/**
 * Slider answer data
 * Used when questionType is "slider"
 */
export interface SliderAnswerData {
  value: number;
}

/**
 * Multiple choice answer data
 * Used when questionType is "multipleChoice"
 */
export interface MultipleChoiceAnswerData {
  selected: string[];
}

/**
 * Image upload answer data
 * Used when questionType is "imageUpload"
 */
export interface ImageUploadAnswerData {
  imageBase64: string;
  caption?: string;
  mimeType?: string;
  fileSize?: number;
  fileName?: string;
}

/**
 * Text answer data (default)
 * For plain text answers, the body field is used directly
 */
export interface TextAnswerData {
  text?: string; // Optional, body field is primary
}

/**
 * Union type for all answer data types
 */
export type AnswerData =
  | SliderAnswerData
  | MultipleChoiceAnswerData
  | ImageUploadAnswerData
  | TextAnswerData;

// ============================================================================
// TYPE GUARDS (runtime validation)
// ============================================================================

/**
 * Check if value is a valid SliderAnswerData
 */
export function isSliderAnswerData(data: unknown): data is SliderAnswerData {
  return (
    typeof data === "object" &&
    data !== null &&
    "value" in data &&
    typeof (data as SliderAnswerData).value === "number"
  );
}

/**
 * Check if value is a valid MultipleChoiceAnswerData
 */
export function isMultipleChoiceAnswerData(
  data: unknown,
): data is MultipleChoiceAnswerData {
  return (
    typeof data === "object" &&
    data !== null &&
    "selected" in data &&
    Array.isArray((data as MultipleChoiceAnswerData).selected) &&
    (data as MultipleChoiceAnswerData).selected.every(
      (item) => typeof item === "string",
    )
  );
}

/**
 * Check if value is a valid ImageUploadAnswerData
 */
export function isImageUploadAnswerData(
  data: unknown,
): data is ImageUploadAnswerData {
  return (
    typeof data === "object" &&
    data !== null &&
    "imageBase64" in data &&
    typeof (data as ImageUploadAnswerData).imageBase64 === "string"
  );
}

/**
 * Check if value is a valid TextAnswerData
 * Note: Returns true for null/undefined since text answers may not have
 * structured answerData (the body field is used directly instead).
 */
export function isTextAnswerData(data: unknown): data is TextAnswerData {
  if (data === null || data === undefined) return true;
  if (typeof data !== "object") return false;
  const textData = data as TextAnswerData;
  return textData.text === undefined || typeof textData.text === "string";
}

/**
 * Get typed answer data based on answerType
 * Returns null if data doesn't match expected type
 */
export function getTypedAnswerData<T extends AnswerType>(
  answerType: T,
  data: unknown,
): T extends "slider"
  ? SliderAnswerData | null
  : T extends "multipleChoice"
    ? MultipleChoiceAnswerData | null
    : T extends "imageUpload"
      ? ImageUploadAnswerData | null
      : TextAnswerData | null {
  switch (answerType) {
    case "slider":
      return (isSliderAnswerData(data) ? data : null) as ReturnType<
        typeof getTypedAnswerData<T>
      >;
    case "multipleChoice":
      return (isMultipleChoiceAnswerData(data) ? data : null) as ReturnType<
        typeof getTypedAnswerData<T>
      >;
    case "imageUpload":
      return (isImageUploadAnswerData(data) ? data : null) as ReturnType<
        typeof getTypedAnswerData<T>
      >;
    default:
      return (
        isTextAnswerData(data) ? (data as TextAnswerData) : null
      ) as ReturnType<typeof getTypedAnswerData<T>>;
  }
}

// ============================================================================
// EXTENDED TYPES (for UI components and API responses)
// ============================================================================

/**
 * Secret with author information and unlock status
 * Used by UI components to display secrets with context
 */
export interface SecretWithAuthor extends Omit<Secret, "createdAt"> {
  authorName: string;
  authorAvatar?: string | null;
  createdAt: string; // ISO string from API
  isUnlocked?: boolean;
  isAuthor?: boolean;
  questionText?: string;
  questionConfig?: unknown; // Store original question config for display context
}

/**
 * Room with additional metadata
 * Used for display in UI components
 */
export interface RoomWithDetails extends Omit<Room, "createdAt"> {
  memberCount: number;
  questionIds?: string[];
  customQuestions?: CustomQuestion[];
  createdAt: string; // ISO string from API
}
