# Phase 6: Production Backend - Progress Update

**Last Updated:** 2025-01-20
**Current Branch:** `feature/production-backend`
**Status:** 50% Complete - Database & Environment Setup Done ✅

---

## 🎉 What's Been Completed

### 1. Infrastructure Setup ✅

**Database:** Supabase Postgres
- URL: `https://bcmxtslzrrpfjgsuenou.supabase.co`
- Connected and migrated successfully
- All 7 tables created with proper relationships

**Storage:** Vercel Blob
- Token configured: `BLOB_READ_WRITE_TOKEN`
- Ready for image uploads

**Environment Variables:** All configured in `.env.local`
```bash
# Database
DATABASE_URL=postgresql://postgres.bcmxtslzrrpfjgsuenou:...
NEXT_PUBLIC_SUPABASE_URL=https://bcmxtslzrrpfjgsuenou.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=ulGhBPfHYKz5cYcOjPpzed5lTcTeSfFEBYsUs3VFROo=

# Google OAuth
GOOGLE_CLIENT_ID=51502761266-cuo186ahsb0185p3kfk4g50n94ndqk2n...
GOOGLE_CLIENT_SECRET=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
```

### 2. Database Schema ✅

**Location:** `src/lib/db/schema.ts`
**Migration:** `src/lib/db/migrations/0000_noisy_baron_strucker.sql`

**Tables Created:**

1. **`users`** - User accounts
   - `id` (text, PK)
   - `email` (varchar, unique, nullable)
   - `name` (varchar, required)
   - `avatarUrl` (text, nullable)
   - `createdAt` (timestamp)

2. **`rooms`** - Game rooms
   - `id` (text, PK)
   - `name` (varchar, nullable)
   - `ownerId` (text, FK → users)
   - `inviteCode` (varchar, unique)
   - `maxMembers` (integer, default 20)
   - `setupMode` (boolean, default true) ← NEW!
   - `createdAt` (timestamp)

3. **`room_members`** - Room membership
   - `roomId` (text, FK → rooms, cascade delete)
   - `userId` (text, FK → users, cascade delete)
   - `joinedAt` (timestamp)
   - PK: (roomId, userId)

4. **`room_questions`** ← NEW TABLE!
   - `id` (text, PK)
   - `roomId` (text, FK → rooms, cascade)
   - `questionId` (text, nullable) - From questions.md
   - `question` (text, nullable) - Custom question text
   - `category` (varchar)
   - `suggestedLevel` (integer, 1-5)
   - `difficulty` (varchar: easy/medium/hard)
   - `questionType` (varchar: text/slider/multipleChoice/imageUpload)
   - `answerConfig` (jsonb) - Type-specific config
   - `allowAnonymous` (boolean)
   - `createdBy` (text, FK → users, nullable)
   - `displayOrder` (integer)
   - `createdAt` (timestamp)

5. **`secrets`** - User answers
   - `id` (text, PK)
   - `roomId` (text, FK → rooms, cascade)
   - `authorId` (text, FK → users, cascade)
   - `questionId` (text, FK → room_questions) ← NEW!
   - `body` (text) - Main answer text
   - `selfRating` (integer, 1-5) - Spiciness
   - `importance` (integer, 1-5)
   - `avgRating` (numeric)
   - `buyersCount` (integer)
   - `isHidden` (boolean)
   - `isAnonymous` (boolean) ← NEW!
   - `answerType` (varchar: text/slider/multipleChoice/imageUpload) ← NEW!
   - `answerData` (jsonb) ← NEW! - Type-specific answer data
   - `createdAt` (timestamp)

6. **`secret_access`** - Unlock tracking
   - `id` (text, PK)
   - `secretId` (text, FK → secrets, cascade)
   - `buyerId` (text, FK → users, cascade)
   - `createdAt` (timestamp)
   - Unique: (buyerId, secretId)

7. **`secret_ratings`** - User ratings
   - `id` (text, PK)
   - `secretId` (text, FK → secrets, cascade)
   - `raterId` (text, FK → users, cascade)
   - `rating` (integer, 1-5)
   - `createdAt` (timestamp)
   - Unique: (raterId, secretId)

**Key Features Supported:**
- ✅ All Phase 1-5 question types (text, slider, multiple choice, image upload)
- ✅ Custom questions with full configuration
- ✅ Room setup/play mode switching
- ✅ Anonymous answers
- ✅ JSONB for flexible answer storage
- ✅ Proper cascade deletes
- ✅ Indexes for performance

### 3. Migration Scripts ✅

**Created:**
- `scripts/reset-database.mjs` - Drop all tables and reapply migration
- `scripts/apply-migration.mjs` - Apply specific migration

**Usage:**
```bash
node scripts/reset-database.mjs  # Fresh start
```

---

## 📋 What's Left To Do

### Next Session Tasks (in order):

#### 1. Create Database Query Layer (2-3 hours)
**File:** `src/lib/db/supabase.ts`

Create query functions matching the mock DB interface:
```typescript
// Users
export async function insertUser(user: Omit<User, 'createdAt'>): Promise<User>
export async function findUserById(id: string): Promise<User | null>

// Rooms
export async function insertRoom(room: Omit<Room, 'createdAt'>): Promise<Room>
export async function findRoomById(id: string): Promise<Room | null>
export async function findRoomByInviteCode(code: string): Promise<Room | null>
export async function updateRoom(id: string, updates: Partial<Room>): Promise<void>

// Room Members
export async function insertRoomMember(member: Omit<RoomMember, 'joinedAt'>): Promise<void>
export async function findRoomMember(roomId: string, userId: string): Promise<RoomMember | null>
export async function findRoomMembers(roomId: string): Promise<RoomMember[]>
export async function countRoomMembers(roomId: string): Promise<number>

// Room Questions
export async function insertRoomQuestion(question: Omit<RoomQuestion, 'createdAt'>): Promise<RoomQuestion>
export async function findRoomQuestions(roomId: string): Promise<RoomQuestion[]>
export async function updateRoomQuestion(id: string, updates: Partial<RoomQuestion>): Promise<void>

// Secrets
export async function insertSecret(secret: Omit<Secret, 'createdAt'>): Promise<Secret>
export async function findSecretById(id: string): Promise<Secret | null>
export async function findRoomSecrets(roomId: string): Promise<Secret[]>
export async function updateSecret(id: string, updates: Partial<Secret>): Promise<void>

// Secret Access
export async function insertSecretAccess(access: Omit<SecretAccess, 'createdAt'>): Promise<void>
export async function findSecretAccess(secretId: string, buyerId: string): Promise<SecretAccess | null>
export async function findUserSecretAccess(buyerId: string): Promise<SecretAccess[]>

// Secret Ratings
export async function insertSecretRating(rating: Omit<SecretRating, 'createdAt'>): Promise<void>
export async function updateSecretRating(secretId: string, raterId: string, rating: number): Promise<void>
export async function findSecretRatings(secretId: string): Promise<SecretRating[]>
```

**Use Drizzle ORM:**
```typescript
import { db } from './index';
import * as schema from './schema';
import { eq, and, desc } from 'drizzle-orm';

// Example
export async function findUserById(id: string): Promise<User | null> {
  const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
  return result[0] || null;
}
```

#### 2. Set Up NextAuth.js (1-2 hours)

**File:** `src/app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/config';

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };
```

**Update:** `src/lib/auth/config.ts`
```typescript
// Already exists, just verify it's using Google OAuth
```

**Create:** `src/lib/auth/index.ts`
```typescript
import { getServerSession } from 'next-auth';
import { authConfig } from './config';

export async function getSession() {
  return await getServerSession(authConfig);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}
```

#### 3. Create Auth UI Components (1 hour)

**Files to create:**
- `src/components/auth/login-button.tsx`
- `src/components/auth/logout-button.tsx`
- `src/components/auth/user-menu.tsx`

**Add to:** `src/app/layout.tsx`
```typescript
import { UserMenu } from '@/components/auth/user-menu';

// Add to header
```

#### 4. Set Up Vercel Blob Utilities (1 hour)

**File:** `src/lib/blob-storage.ts`

```typescript
import { put, del } from '@vercel/blob';

export async function uploadImage(
  file: File,
  path: string
): Promise<string> {
  const blob = await put(path, file, {
    access: 'public',
  });
  return blob.url;
}

export async function deleteImage(url: string): Promise<void> {
  await del(url);
}
```

**Update:** `src/lib/image-utils.ts`
- Replace base64 encoding with blob uploads
- Update image display to use blob URLs

#### 5. Migrate API Routes (4-6 hours)

**Strategy:** Go one route at a time, test each

**Routes to update:**
1. `/api/users/me/route.ts` - Get current user
2. `/api/rooms/route.ts` - Create room
3. `/api/rooms/[id]/route.ts` - Get room details
4. `/api/rooms/[id]/questions/route.ts` - Manage questions
5. `/api/rooms/[id]/complete-setup/route.ts` - Complete setup
6. `/api/invite/[code]/route.ts` - Get invite info
7. `/api/invite/[code]/join/route.ts` - Join room
8. `/api/rooms/[id]/secrets/route.ts` - Get room secrets
9. `/api/secrets/route.ts` - Create secret
10. `/api/secrets/[id]/unlock/route.ts` - Unlock secret
11. `/api/secrets/[id]/rate/route.ts` - Rate secret
12. `/api/questions/[questionId]/answers/route.ts` - Submit answer

**Pattern:**
```typescript
// BEFORE
import { mockDb } from '@/lib/db/mock';
const room = await mockDb.findRoomById(id);

// AFTER
import { findRoomById } from '@/lib/db/supabase';
const room = await findRoomById(id);
```

#### 6. Test Everything (2-3 hours)

- Run `npm run build` - Should pass
- Test locally: `npm run dev`
- Test full user flow:
  1. Login with Google
  2. Create room
  3. Get invite link
  4. Join from another browser
  5. Answer questions (all types)
  6. Upload image
  7. Unlock secrets
  8. Rate secrets

---

## 🚨 Important Notes

### Current State:
- ✅ Database schema is LIVE in Supabase
- ✅ All environment variables configured
- ⚠️ App still uses `mockDb` - needs migration
- ⚠️ No authentication yet - cookie-based temp users

### Key Files Modified:
- `src/lib/db/schema.ts` - Complete rewrite with new features
- `.env.local` - All credentials added
- `drizzle.config.ts` - Already configured for Supabase

### Don't Delete:
- `src/lib/db/mock.ts` - Keep as reference during migration
- Old migration files - Deleted, using fresh 0000 migration

### Testing Database:
```bash
# If you need to reset and start over
node scripts/reset-database.mjs

# Check tables in Supabase dashboard:
# https://supabase.com/dashboard/project/bcmxtslzrrpfjgsuenou/editor
```

---

## 📊 Time Estimates

| Task | Estimated Time | Status |
|------|---------------|--------|
| Infrastructure setup | 2 hours | ✅ Done |
| Database schema design | 2 hours | ✅ Done |
| Migration creation & push | 2 hours | ✅ Done |
| Database query layer | 2-3 hours | ⏳ Next |
| NextAuth.js setup | 1-2 hours | ⏳ Next |
| Auth UI components | 1 hour | ⏳ Next |
| Vercel Blob utilities | 1 hour | ⏳ Next |
| API route migration | 4-6 hours | ⏳ Next |
| Testing & bug fixes | 2-3 hours | ⏳ Next |
| **Total** | **20-30 hours** | **50% Complete** |

---

## 🎯 Next Conversation Starter

```
I'm continuing Phase 6 production backend work. I've completed:
- ✅ Supabase database setup with all 7 tables
- ✅ Environment variables configured
- ✅ Schema migrated successfully

Next up: Create the database query layer (src/lib/db/supabase.ts)
to replace mockDb calls. The schema is already in Supabase and
ready to use with Drizzle ORM.

Let's start by creating the query functions matching the mock DB interface.
```

---

## 📁 Key File Locations

```
src/lib/db/
├── schema.ts              # ✅ Complete - 7 tables with all features
├── schema-old.ts          # Backup of old schema
├── index.ts               # ✅ Drizzle client (already configured)
├── mock.ts                # 📚 Reference - keep until migration done
└── migrations/
    └── 0000_noisy_baron_strucker.sql  # ✅ Applied to Supabase

scripts/
├── reset-database.mjs     # ✅ Utility to reset DB
└── apply-migration.mjs    # ✅ Utility to apply migrations

.env.local                 # ✅ All credentials configured
drizzle.config.ts          # ✅ Configured for Supabase
```

---

## 🔧 Useful Commands

```bash
# Development
npm run dev                # Start dev server

# Database
node scripts/reset-database.mjs  # Reset DB and reapply schema
npx drizzle-kit studio           # Open Drizzle Studio (DB GUI)

# Testing
npm run build              # Verify no TypeScript errors
npm run lint               # Check code quality

# Git
git status                 # Should be on feature/production-backend
git log --oneline -5       # See recent commits
```

---

**Ready to continue! Next session: Build the query layer.** 🚀
