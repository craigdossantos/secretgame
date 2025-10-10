// Simple in-memory mock database for development
import { createId } from '@paralleldrive/cuid2';

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
}

interface Room {
  id: string;
  name?: string;
  ownerId: string;
  inviteCode: string;
  maxMembers: number;
  createdAt: Date;
  questionIds?: string[]; // IDs of questions selected for this room
  customQuestions?: CustomQuestion[]; // Custom questions created for this room
}

interface CustomQuestion {
  id: string;
  roomId: string;
  question: string;
  category: string;
  suggestedLevel: number;
  difficulty: 'easy' | 'medium' | 'hard';
  createdBy: string; // userId
  createdAt: Date;
}

interface RoomMember {
  roomId: string;
  userId: string;
  joinedAt: Date;
}

interface Secret {
  id: string;
  roomId: string;
  authorId: string;
  questionId?: string; // Link to question being answered
  body: string;
  selfRating: number;
  importance: number;
  avgRating?: number;
  buyersCount: number;
  createdAt: Date;
  isHidden: boolean;
}

interface SecretAccess {
  id: string;
  secretId: string;
  buyerId: string;
  createdAt: Date;
}

interface SecretRating {
  id: string;
  secretId: string;
  raterId: string;
  rating: number;
  createdAt: Date;
}

class MockDatabase {
  private users: Map<string, User> = new Map();
  private rooms: Map<string, Room> = new Map();
  private roomMembers: Map<string, RoomMember> = new Map();
  private secrets: Map<string, Secret> = new Map();
  private secretAccess: Map<string, SecretAccess> = new Map();
  private secretRatings: Map<string, SecretRating> = new Map();

  // Users
  async insertUser(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async findUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  // Rooms
  async insertRoom(room: Room): Promise<void> {
    this.rooms.set(room.id, room);
  }

  async findRoomById(id: string): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async findRoomByInviteCode(inviteCode: string): Promise<Room | undefined> {
    return Array.from(this.rooms.values()).find(r => r.inviteCode === inviteCode);
  }

  async updateRoom(id: string, updates: Partial<Room>): Promise<void> {
    const room = this.rooms.get(id);
    if (room) {
      this.rooms.set(id, { ...room, ...updates });
    }
  }

  // Room Members
  async insertRoomMember(member: RoomMember): Promise<void> {
    const key = `${member.roomId}:${member.userId}`;
    this.roomMembers.set(key, member);
  }

  async findRoomMember(roomId: string, userId: string): Promise<RoomMember | undefined> {
    const key = `${roomId}:${userId}`;
    return this.roomMembers.get(key);
  }

  async findRoomMembers(roomId: string): Promise<RoomMember[]> {
    return Array.from(this.roomMembers.values()).filter(m => m.roomId === roomId);
  }

  async countRoomMembers(roomId: string): Promise<number> {
    return Array.from(this.roomMembers.values()).filter(m => m.roomId === roomId).length;
  }

  // Secrets
  async insertSecret(secret: Secret): Promise<void> {
    this.secrets.set(secret.id, secret);
  }

  async findSecretById(id: string): Promise<Secret | undefined> {
    return this.secrets.get(id);
  }

  async findRoomSecrets(roomId: string): Promise<Secret[]> {
    return Array.from(this.secrets.values())
      .filter(s => s.roomId === roomId && !s.isHidden)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateSecret(id: string, updates: Partial<Secret>): Promise<void> {
    const secret = this.secrets.get(id);
    if (secret) {
      this.secrets.set(id, { ...secret, ...updates });
    }
  }

  // Secret Access
  async insertSecretAccess(access: SecretAccess): Promise<void> {
    this.secretAccess.set(access.id, access);
  }

  async findSecretAccess(secretId: string, buyerId: string): Promise<SecretAccess | undefined> {
    return Array.from(this.secretAccess.values()).find(
      a => a.secretId === secretId && a.buyerId === buyerId
    );
  }

  async findUserSecretAccess(buyerId: string): Promise<SecretAccess[]> {
    return Array.from(this.secretAccess.values()).filter(a => a.buyerId === buyerId);
  }

  // Secret Ratings
  async insertSecretRating(rating: SecretRating): Promise<void> {
    this.secretRatings.set(rating.id, rating);
  }

  async updateSecretRating(secretId: string, raterId: string, rating: number): Promise<void> {
    const existingRating = Array.from(this.secretRatings.values()).find(
      r => r.secretId === secretId && r.raterId === raterId
    );

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.createdAt = new Date();
    } else {
      await this.insertSecretRating({
        id: createId(),
        secretId,
        raterId,
        rating,
        createdAt: new Date(),
      });
    }
  }

  async findSecretRatings(secretId: string): Promise<SecretRating[]> {
    return Array.from(this.secretRatings.values()).filter(r => r.secretId === secretId);
  }
}

// Ensure singleton pattern for mock database across hot reloads
declare global {
  var __mockDb: MockDatabase | undefined;
}

// Use global reference to persist across hot reloads in development
export const mockDb = globalThis.__mockDb ?? new MockDatabase();
globalThis.__mockDb = mockDb;