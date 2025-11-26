// Supabase database query layer - replaces mock.ts for production
import { db } from './index';
import * as schema from './schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import type {
  User,
  Room,
  RoomMember,
  RoomQuestion,
  Secret,
  SecretAccess,
  SecretRating
} from './schema';

// ============================================================================
// USERS
// ============================================================================

export async function insertUser(user: Omit<User, 'createdAt'>): Promise<void> {
  await db.insert(schema.users).values(user);
}

export async function upsertUser(user: Omit<User, 'createdAt'>): Promise<void> {
  await db
    .insert(schema.users)
    .values(user)
    .onConflictDoUpdate({
      target: schema.users.id,
      set: {
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    });
}

export async function findUserById(id: string): Promise<User | undefined> {
  const result = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  return result[0];
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const result = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  return result[0];
}

// ============================================================================
// ROOMS
// ============================================================================

export async function insertRoom(room: Omit<Room, 'createdAt'>): Promise<void> {
  await db.insert(schema.rooms).values(room);
}

export async function findRoomById(id: string): Promise<Room | undefined> {
  const result = await db
    .select()
    .from(schema.rooms)
    .where(eq(schema.rooms.id, id))
    .limit(1);
  return result[0];
}

export async function findRoomByInviteCode(inviteCode: string): Promise<Room | undefined> {
  const result = await db
    .select()
    .from(schema.rooms)
    .where(eq(schema.rooms.inviteCode, inviteCode))
    .limit(1);
  return result[0];
}

export async function updateRoom(id: string, updates: Partial<Room>): Promise<void> {
  await db
    .update(schema.rooms)
    .set(updates)
    .where(eq(schema.rooms.id, id));
}

// ============================================================================
// ROOM MEMBERS
// ============================================================================

export async function insertRoomMember(member: Omit<RoomMember, 'joinedAt'>): Promise<void> {
  await db.insert(schema.roomMembers).values(member);
}

export async function findRoomMember(
  roomId: string,
  userId: string
): Promise<RoomMember | undefined> {
  const result = await db
    .select()
    .from(schema.roomMembers)
    .where(
      and(
        eq(schema.roomMembers.roomId, roomId),
        eq(schema.roomMembers.userId, userId)
      )
    )
    .limit(1);
  return result[0];
}

export async function findRoomMembers(roomId: string): Promise<RoomMember[]> {
  return await db
    .select()
    .from(schema.roomMembers)
    .where(eq(schema.roomMembers.roomId, roomId));
}

export async function countRoomMembers(roomId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.roomMembers)
    .where(eq(schema.roomMembers.roomId, roomId));
  return result[0]?.count ?? 0;
}

export async function findUserRooms(userId: string): Promise<Room[]> {
  const result = await db
    .select({
      id: schema.rooms.id,
      name: schema.rooms.name,
      ownerId: schema.rooms.ownerId,
      inviteCode: schema.rooms.inviteCode,
      maxMembers: schema.rooms.maxMembers,
      setupMode: schema.rooms.setupMode,
      createdAt: schema.rooms.createdAt,
    })
    .from(schema.roomMembers)
    .innerJoin(schema.rooms, eq(schema.roomMembers.roomId, schema.rooms.id))
    .where(eq(schema.roomMembers.userId, userId))
    .orderBy(desc(schema.rooms.createdAt));
    
  return result;
}

// ============================================================================
// ROOM QUESTIONS
// ============================================================================

export async function insertRoomQuestion(
  question: Omit<RoomQuestion, 'createdAt'>
): Promise<RoomQuestion> {
  const result = await db
    .insert(schema.roomQuestions)
    .values(question)
    .returning();
  return result[0];
}

export async function findRoomQuestions(roomId: string): Promise<RoomQuestion[]> {
  return await db
    .select()
    .from(schema.roomQuestions)
    .where(eq(schema.roomQuestions.roomId, roomId))
    .orderBy(schema.roomQuestions.displayOrder);
}

export async function findRoomQuestionById(id: string): Promise<RoomQuestion | undefined> {
  const result = await db
    .select()
    .from(schema.roomQuestions)
    .where(eq(schema.roomQuestions.id, id))
    .limit(1);
  return result[0];
}

export async function updateRoomQuestion(
  id: string,
  updates: Partial<RoomQuestion>
): Promise<void> {
  await db
    .update(schema.roomQuestions)
    .set(updates)
    .where(eq(schema.roomQuestions.id, id));
}

export async function deleteRoomQuestion(id: string): Promise<void> {
  await db
    .delete(schema.roomQuestions)
    .where(eq(schema.roomQuestions.id, id));
}

// ============================================================================
// SECRETS
// ============================================================================

export async function insertSecret(secret: Omit<Secret, 'createdAt'>): Promise<void> {
  await db.insert(schema.secrets).values(secret);
}

export async function findSecretById(id: string): Promise<Secret | undefined> {
  const result = await db
    .select()
    .from(schema.secrets)
    .where(eq(schema.secrets.id, id))
    .limit(1);
  return result[0];
}

export async function findRoomSecrets(roomId: string): Promise<Secret[]> {
  return await db
    .select()
    .from(schema.secrets)
    .where(
      and(
        eq(schema.secrets.roomId, roomId),
        eq(schema.secrets.isHidden, false)
      )
    )
    .orderBy(desc(schema.secrets.createdAt));
}

export async function findSecretsByQuestionId(questionId: string): Promise<Secret[]> {
  return await db
    .select()
    .from(schema.secrets)
    .where(
      and(
        eq(schema.secrets.questionId, questionId),
        eq(schema.secrets.isHidden, false)
      )
    )
    .orderBy(desc(schema.secrets.createdAt));
}

export async function updateSecret(id: string, updates: Partial<Secret>): Promise<void> {
  await db
    .update(schema.secrets)
    .set(updates)
    .where(eq(schema.secrets.id, id));
}

// ============================================================================
// SECRET ACCESS (Unlocks)
// ============================================================================

export async function insertSecretAccess(
  access: Omit<SecretAccess, 'createdAt'>
): Promise<void> {
  await db.insert(schema.secretAccess).values(access);
}

export async function findSecretAccess(
  secretId: string,
  buyerId: string
): Promise<SecretAccess | undefined> {
  const result = await db
    .select()
    .from(schema.secretAccess)
    .where(
      and(
        eq(schema.secretAccess.secretId, secretId),
        eq(schema.secretAccess.buyerId, buyerId)
      )
    )
    .limit(1);
  return result[0];
}

export async function findUserSecretAccess(buyerId: string): Promise<SecretAccess[]> {
  return await db
    .select()
    .from(schema.secretAccess)
    .where(eq(schema.secretAccess.buyerId, buyerId));
}

export async function findSecretAccessBySecretId(secretId: string): Promise<SecretAccess[]> {
  return await db
    .select()
    .from(schema.secretAccess)
    .where(eq(schema.secretAccess.secretId, secretId));
}

// ============================================================================
// SECRET RATINGS
// ============================================================================

export async function insertSecretRating(
  rating: Omit<SecretRating, 'createdAt'>
): Promise<void> {
  await db.insert(schema.secretRatings).values(rating);
}

export async function updateSecretRating(
  secretId: string,
  raterId: string,
  rating: number
): Promise<void> {
  // Check if rating already exists
  const existing = await db
    .select()
    .from(schema.secretRatings)
    .where(
      and(
        eq(schema.secretRatings.secretId, secretId),
        eq(schema.secretRatings.raterId, raterId)
      )
    )
    .limit(1);

  if (existing[0]) {
    // Update existing rating
    await db
      .update(schema.secretRatings)
      .set({ rating, createdAt: new Date() })
      .where(eq(schema.secretRatings.id, existing[0].id));
  } else {
    // Insert new rating - need to generate ID
    const { createId } = await import('@paralleldrive/cuid2');
    await insertSecretRating({
      id: createId(),
      secretId,
      raterId,
      rating,
    });
  }
}

export async function findSecretRatings(secretId: string): Promise<SecretRating[]> {
  return await db
    .select()
    .from(schema.secretRatings)
    .where(eq(schema.secretRatings.secretId, secretId));
}

export async function findSecretRatingByUser(
  secretId: string,
  raterId: string
): Promise<SecretRating | undefined> {
  const result = await db
    .select()
    .from(schema.secretRatings)
    .where(
      and(
        eq(schema.secretRatings.secretId, secretId),
        eq(schema.secretRatings.raterId, raterId)
      )
    )
    .limit(1);
  return result[0];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get full room details with members and questions
 */
export async function getRoomWithDetails(roomId: string) {
  const room = await findRoomById(roomId);
  if (!room) return null;

  const [members, questions] = await Promise.all([
    findRoomMembers(roomId),
    findRoomQuestions(roomId),
  ]);

  return {
    room,
    members,
    questions,
  };
}

/**
 * Get user's accessible secrets in a room
 * (secrets they authored + secrets they unlocked)
 */
export async function getUserAccessibleSecrets(
  roomId: string,
  userId: string
): Promise<Secret[]> {
  // Get all room secrets
  const allSecrets = await findRoomSecrets(roomId);

  // Get user's unlocks
  const userAccess = await findUserSecretAccess(userId);
  const unlockedSecretIds = new Set(userAccess.map(a => a.secretId));

  // Filter to accessible secrets
  return allSecrets.filter(
    secret => secret.authorId === userId || unlockedSecretIds.has(secret.id)
  );
}
