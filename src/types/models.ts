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
