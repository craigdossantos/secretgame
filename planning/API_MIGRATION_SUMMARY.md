# API Migration Summary - Phase 6

**Date**: 2025-11-20
**Branch**: `feature/production-backend`
**Status**: 3 of 12 routes migrated (25% complete)

## Overview

Successfully migrated the first 3 API routes from mockDb to Supabase with NextAuth authentication. This establishes the authentication pattern and database query patterns for the remaining 9 routes.

## Completed Migrations

### 1. `/api/users/me` (GET) - Current User Info

**File**: `src/app/api/users/me/route.ts`

**Changes**:
- Replaced cookie-based auth (`getUserIdFromCookies`) with NextAuth session (`auth()`)
- Replaced `mockDb.findUserById()` with `findUserById()` from Supabase
- Removed `NextRequest` parameter (no longer needed)
- Maintained exact same response format for backward compatibility

**Auth Pattern**:
```typescript
const session = await auth();
if (!session?.user?.id) {
  return successResponse({ user: null });
}
const user = await findUserById(session.user.id);
```

**Response Format** (unchanged):
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "avatarUrl": "string | undefined"
  }
}
```

---

### 2. `/api/rooms` (POST) - Create Room

**File**: `src/app/api/rooms/route.ts`

**Changes**:
- Replaced cookie-based temp user creation with NextAuth session authentication
- Returns `401` if user not authenticated (breaking change - now requires login)
- Replaced `mockDb.insertRoom()` with `insertRoom()` from Supabase
- Replaced `mockDb.insertRoomMember()` with `insertRoomMember()`
- Added `insertRoomQuestion()` calls to save questions to `room_questions` table
- Questions now stored in separate `roomQuestions` table instead of JSON fields
- Removed `userName` parameter (uses authenticated user's name)
- Also migrated GET endpoint to use NextAuth (stub implementation)

**Breaking Changes**:
- **Authentication required**: Unauthenticated requests now return `401` instead of creating temp users
- **userName parameter removed**: No longer accepted in request body
- **Cookie handling removed**: No longer sets `userId` cookie

**Request Body**:
```typescript
{
  name?: string,              // Optional room name
  questionIds?: string[],     // IDs from data/questions.md
  customQuestions?: Array<{   // User-created questions
    id?: string,
    question: string,
    category?: string,
    suggestedLevel?: number,
    difficulty?: 'easy' | 'medium' | 'hard',
    questionType?: string,
    answerConfig?: any,
    allowAnonymous?: boolean
  }>,
  setupMode?: boolean         // Default: false
}
```

**Response Format** (unchanged):
```json
{
  "roomId": "string",
  "inviteCode": "string",
  "inviteUrl": "string",
  "name": "string"
}
```

**Database Operations**:
1. Insert into `rooms` table
2. Insert into `room_members` table (owner as first member)
3. Insert into `room_questions` table for each selected/custom question

---

### 3. `/api/invite/[code]` (GET) - Get Invite Info

**File**: `src/app/api/invite/[code]/route.ts`

**Changes**:
- Replaced `mockDb.findRoomByInviteCode()` with `findRoomByInviteCode()` from Supabase
- Replaced `mockDb.countRoomMembers()` with `countRoomMembers()` from Supabase
- No authentication required (public endpoint)
- Maintained exact same response format

**Response Format** (unchanged):
```json
{
  "roomId": "string",
  "roomName": "string",
  "memberCount": number,
  "maxMembers": number,
  "isFull": boolean
}
```

---

## Established Authentication Pattern

All authenticated routes now follow this pattern:

```typescript
import { auth } from '@/lib/auth';

export async function HANDLER() {
  try {
    // 1. Get session
    const session = await auth();

    // 2. Check authentication
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }

    // 3. Use authenticated user ID
    const userId = session.user.id;

    // 4. Perform database operations with Supabase
    const data = await findSomething(userId);

    return successResponse(data);
  } catch (error) {
    console.error('Error:', error);
    return errorResponse('Error message', 500);
  }
}
```

**Key Points**:
- Always use `auth()` from `@/lib/auth` to get session
- Check `session?.user?.id` for authentication
- Return `401` for unauthenticated requests to protected routes
- Use Supabase query functions from `@/lib/db/supabase`
- Maintain error handling and response format consistency

---

## Remaining Routes to Migrate (9 total)

### High Priority (Core Functionality)

1. **`/api/invite/[code]/join` (POST)** - Join room via invite
   - Auth: Required (NextAuth session)
   - DB: Insert into `room_members`, check capacity
   - Priority: HIGH (needed for user onboarding)

2. **`/api/rooms/[id]` (GET)** - Get room details
   - Auth: Required (verify membership)
   - DB: Join `rooms`, `room_members`, `users` tables
   - Priority: HIGH (room page depends on this)

3. **`/api/rooms/[id]/secrets` (GET/POST)** - Get/create secrets
   - Auth: Required
   - DB: Query/insert `secrets` table with filtering
   - Priority: HIGH (core game mechanic)

4. **`/api/rooms/[id]/questions` (GET)** - Get room questions
   - Auth: Required (verify membership)
   - DB: Query `room_questions` with question data resolution
   - Priority: HIGH (needed for question display)

### Medium Priority (Game Mechanics)

5. **`/api/secrets/[id]/unlock` (POST)** - Unlock secret
   - Auth: Required
   - DB: Insert into `secret_access`, update `secrets.buyersCount`
   - Priority: MEDIUM (unlock mechanic)

6. **`/api/secrets/[id]/rate` (POST)** - Rate secret
   - Auth: Required
   - DB: Upsert `secret_ratings`, update `secrets.avgRating`
   - Priority: MEDIUM (rating mechanic)

7. **`/api/rooms/[id]/complete-setup` (POST)** - Complete room setup
   - Auth: Required (must be owner)
   - DB: Update `rooms.setupMode = false`
   - Priority: MEDIUM (setup flow)

### Lower Priority (Analytics/Features)

8. **`/api/questions/[questionId]/answers` (GET)** - Get all answers for a question
   - Auth: Required (verify room membership)
   - DB: Query `secrets` by `questionId`
   - Priority: LOW (collaborative answers feature)

9. **`/api/secrets` (GET)** - Get user's secrets
   - Auth: Required
   - DB: Query `secrets` by `authorId`
   - Priority: LOW (analytics/user profile)

---

## Migration Checklist (for each route)

- [ ] Read existing implementation to understand logic
- [ ] Identify all mockDb calls and map to Supabase functions
- [ ] Replace cookie auth with NextAuth session
- [ ] Update database queries to use Supabase query layer
- [ ] Maintain response format for backward compatibility
- [ ] Add proper error handling for database operations
- [ ] Test endpoint with curl/Postman
- [ ] Verify `npm run build` passes
- [ ] Document any breaking changes

---

## Testing Commands

### 1. Test `/api/users/me`
```bash
# Without authentication (should return null user)
curl http://localhost:3000/api/users/me

# With authentication (requires NextAuth session cookie)
curl http://localhost:3000/api/users/me \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### 2. Test `/api/rooms` (POST)
```bash
# Create room (requires authentication)
curl -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "name": "Test Room",
    "questionIds": ["q1", "q2", "q3"],
    "customQuestions": [],
    "setupMode": false
  }'
```

### 3. Test `/api/invite/[code]`
```bash
# Get invite info (public endpoint)
curl http://localhost:3000/api/invite/ABC123
```

**Note**: To get a valid session token:
1. Start dev server: `npm run dev`
2. Sign in via Google OAuth at http://localhost:3000
3. Use browser dev tools → Application → Cookies to copy `next-auth.session-token`

---

## Breaking Changes Summary

### `/api/rooms` (POST) - BREAKING
- **Before**: Accepted `userName` parameter, created temporary users, set cookies
- **After**: Requires NextAuth authentication, rejects unauthenticated requests
- **Migration Path**:
  - Frontend must ensure users are authenticated before creating rooms
  - Remove `userName` from request payloads
  - Add sign-in flow before room creation

### `/api/users/me` (GET) - Compatible
- No breaking changes
- Returns `null` user for unauthenticated requests (same as before)

### `/api/invite/[code]` (GET) - Compatible
- No breaking changes
- Public endpoint, works without authentication

---

## Database Schema Changes

### Questions Storage Model Change

**Before (mockDb)**:
```typescript
room = {
  questionIds: ["q1", "q2"],        // Array field
  customQuestions: [{...}, {...}]   // JSON field
}
```

**After (Supabase)**:
```sql
-- Separate table for all questions
CREATE TABLE room_questions (
  id TEXT PRIMARY KEY,
  room_id TEXT REFERENCES rooms(id),
  question_id TEXT,              -- NULL for custom questions
  question TEXT,                 -- Custom question text
  category VARCHAR(100),
  suggested_level INTEGER,
  difficulty VARCHAR(20),
  question_type VARCHAR(50),
  answer_config JSONB,
  allow_anonymous BOOLEAN,
  created_by TEXT REFERENCES users(id),
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Benefits**:
- Normalized data structure
- Easier querying and filtering
- Better support for question types and configurations
- Proper foreign key relationships

---

## Next Steps (Recommended Order)

1. **Migrate `/api/invite/[code]/join`** (join room functionality)
2. **Migrate `/api/rooms/[id]`** (room details page)
3. **Migrate `/api/rooms/[id]/questions`** (question listing)
4. **Migrate `/api/rooms/[id]/secrets`** (secret CRUD operations)
5. **Migrate `/api/secrets/[id]/unlock`** (unlock mechanism)
6. **Migrate `/api/secrets/[id]/rate`** (rating mechanism)
7. **Migrate `/api/rooms/[id]/complete-setup`** (setup flow)
8. **Migrate `/api/questions/[questionId]/answers`** (collaborative answers)
9. **Migrate `/api/secrets`** (user's secrets)

**Time Estimate**: ~30 minutes per route × 9 routes = ~4.5 hours

---

## Build Status

✅ **Build Passing**: `npm run build` succeeds
⚠️ **Warnings**: Pre-existing ESLint warnings (not blocking)
✅ **TypeScript**: Strict mode passing
✅ **Deployment Ready**: Can deploy to Vercel

---

## Additional Notes

### Bonus Fix Applied
Fixed missing skeleton components in `/src/app/rooms/[id]/page.tsx` that were blocking the build:
- Added `QuestionCardSkeleton` component
- Added `SecretCardSkeleton` component
- These provide loading states for the room page

### Files Modified
- `src/app/api/users/me/route.ts` - Migrated to Supabase
- `src/app/api/rooms/route.ts` - Migrated POST and GET to Supabase
- `src/app/api/invite/[code]/route.ts` - Migrated to Supabase
- `src/app/rooms/[id]/page.tsx` - Added skeleton components

### Dependencies Verified
- NextAuth session management working
- Supabase query layer functions available
- All imports resolving correctly
- No new dependencies required
