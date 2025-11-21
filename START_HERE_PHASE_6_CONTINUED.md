# START HERE: Phase 6 Production Backend (Continued)

**Date:** 2025-01-20
**Branch:** `feature/production-backend`
**Status:** Database infrastructure complete ✅ → Ready for query layer

---

## 🎯 Quick Context

You're implementing Phase 6: Production Backend for The Secret Game. The database infrastructure is **fully set up and working** - now you need to connect the app to it.

### What's Already Done ✅

1. **Supabase Database** - Live and migrated with all 7 tables
2. **Vercel Blob Storage** - Configured for image uploads
3. **Environment Variables** - All credentials in `.env.local`
4. **Complete Schema** - Supports all Phase 1-5 features (custom questions, multiple choice, images, anonymous mode, etc.)
5. **Migration Scripts** - Can reset/reapply schema anytime

### What You're Building Next 🔨

**Create the database query layer** to replace `mockDb` calls with real Supabase queries.

---

## 🚀 Next Conversation Starter

```
I'm continuing Phase 6 production backend implementation for The Secret Game.

Current status:
- ✅ Supabase database fully set up with 7 tables
- ✅ Schema includes all Phase 1-5 features (room_questions, answer types, etc.)
- ✅ Environment variables configured
- ✅ Migration applied successfully

Branch: feature/production-backend
Commit: 9a20883 "feat(phase-6): Complete database infrastructure setup"

Next task: Create src/lib/db/supabase.ts with query functions that match
the mockDb interface. Use Drizzle ORM with the existing schema.

Let's start by implementing the user and room query functions.
```

---

## 📁 Key Files to Know

### Database
- **`src/lib/db/schema.ts`** - Complete schema (7 tables, all features)
- **`src/lib/db/index.ts`** - Drizzle client (already configured)
- **`src/lib/db/mock.ts`** - Reference for function signatures

### Environment
- **`.env.local`** - All credentials (Supabase + Vercel Blob + NextAuth + Google OAuth)

### Documentation
- **`planning/PHASE_6_PROGRESS.md`** - Detailed progress report
- **`planning/PHASE_6_PRODUCTION_BACKEND.md`** - Original specification

### Scripts
- **`scripts/reset-database.mjs`** - Reset database if needed
- **`node scripts/reset-database.mjs`** - Run this command

---

## 🎯 Implementation Plan

### 1. Create Query Layer (First Priority)
**File:** `src/lib/db/supabase.ts`

Match these function signatures from `mock.ts`:

```typescript
// Users
findUserById(id: string): Promise<User | undefined>
insertUser(user: User): Promise<void>

// Rooms
insertRoom(room: Room): Promise<void>
findRoomById(id: string): Promise<Room | undefined>
findRoomByInviteCode(code: string): Promise<Room | undefined>
updateRoom(id: string, updates: Partial<Room>): Promise<void>

// Room Members
insertRoomMember(member: RoomMember): Promise<void>
findRoomMember(roomId: string, userId: string): Promise<RoomMember | undefined>
findRoomMembers(roomId: string): Promise<RoomMember[]>
countRoomMembers(roomId: string): Promise<number>

// Secrets
insertSecret(secret: Secret): Promise<void>
findSecretById(id: string): Promise<Secret | undefined>
findRoomSecrets(roomId: string): Promise<Secret[]>
updateSecret(id: string, updates: Partial<Secret>): Promise<void>

// Secret Access
insertSecretAccess(access: SecretAccess): Promise<void>
findSecretAccess(secretId: string, buyerId: string): Promise<SecretAccess | undefined>
findUserSecretAccess(buyerId: string): Promise<SecretAccess[]>

// Secret Ratings
insertSecretRating(rating: SecretRating): Promise<void>
updateSecretRating(secretId: string, raterId: string, rating: number): Promise<void>
findSecretRatings(secretId: string): Promise<SecretRating[]>
```

**Use Drizzle ORM patterns:**
```typescript
import { db } from './index';
import * as schema from './schema';
import { eq, and, desc } from 'drizzle-orm';

export async function findUserById(id: string) {
  const result = await db.select()
    .from(schema.users)
    .where(eq(schema.users.id, id));
  return result[0];
}
```

### 2. Set Up NextAuth.js (~1 hour)
- Create `src/app/api/auth/[...nextauth]/route.ts`
- Verify `src/lib/auth/config.ts` (already exists)
- Add session helpers

### 3. Auth UI Components (~1 hour)
- `src/components/auth/login-button.tsx`
- `src/components/auth/logout-button.tsx`
- `src/components/auth/user-menu.tsx`

### 4. Vercel Blob Utilities (~1 hour)
- Create `src/lib/blob-storage.ts`
- Update `src/lib/image-utils.ts`

### 5. Migrate API Routes (~4-6 hours)
Replace `mockDb` imports with `supabase.ts` functions

### 6. Test Everything (~2-3 hours)
Full end-to-end testing

---

## 💡 Important Notes

### Database Connection
The Drizzle client is already configured in `src/lib/db/index.ts`:
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
```

Just import and use it! ✨

### Testing Queries
You can test queries in isolation:
```typescript
// Test file or API route
import { findUserById } from '@/lib/db/supabase';

const user = await findUserById('test-id');
console.log(user);
```

### If Something Goes Wrong
```bash
# Reset database to clean state
node scripts/reset-database.mjs

# Check database in Supabase dashboard
# https://supabase.com/dashboard/project/bcmxtslzrrpfjgsuenou
```

---

## 🗂️ Schema Reference

### All Tables Created:

1. **users** - User accounts
2. **rooms** - Game rooms with `setupMode`
3. **room_members** - Membership join table
4. **room_questions** - Custom + curated questions with answer configs
5. **secrets** - Answers with `answerType`, `answerData`, `isAnonymous`
6. **secret_access** - Unlock tracking
7. **secret_ratings** - User ratings

**See `planning/PHASE_6_PROGRESS.md` for full column details.**

---

## ⏱️ Time Estimates

| Remaining Task | Time | Priority |
|----------------|------|----------|
| Database query layer | 2-3 hours | 🔥 NOW |
| NextAuth.js setup | 1-2 hours | High |
| Auth UI components | 1 hour | High |
| Vercel Blob utilities | 1 hour | Medium |
| API route migration | 4-6 hours | High |
| Testing & debugging | 2-3 hours | High |
| **Total remaining** | **11-16 hours** | - |

---

## ✅ Success Criteria

When Phase 6 is complete, you should be able to:

1. ✅ Log in with Google OAuth
2. ✅ Create a room (saved to Supabase)
3. ✅ Share invite link
4. ✅ Join from different device/browser
5. ✅ Answer all question types (text, slider, MC, image)
6. ✅ Upload images to Vercel Blob
7. ✅ Unlock and view secrets
8. ✅ Rate secrets
9. ✅ Data persists across restarts
10. ✅ Deploy to Vercel production

---

## 🤖 Pro Tips for Next Session

1. **Start with one table** - Implement all User functions first, test them
2. **Keep mock.ts** - Use as reference until migration complete
3. **Test incrementally** - Don't migrate all routes at once
4. **Use Drizzle Studio** - `npx drizzle-kit studio` for DB GUI
5. **Check types** - TypeScript will catch schema mismatches

---

**You're 50% done! The hard infrastructure work is complete.** 🎉

**Next up:** Build the query layer that connects your beautiful UI to the real database.

Good luck! 🚀
