# Next Session: Complete Phase 6 API Migration

## Quick Context

You're 67% done with Phase 6! The core user flow works end-to-end with Supabase:
- ✅ Sign in with Google OAuth
- ✅ Create rooms and select questions
- ✅ Answer questions (all types)
- ✅ View secrets and collaborative answers
- ✅ Join via invite links
- ✅ Data persists across restarts

**BUT:** The unlock and rating features (core game mechanics) still use mockDb.

---

## Message to Start Next Session

```
Continue Phase 6 API migration. We're 67% complete (8/12 routes done).

The core user flow works perfectly - room creation, question answering, and viewing secrets all use Supabase. But 4 routes still use mockDb:

1. /api/secrets/[id]/unlock - Unlock others' secrets (core game mechanic)
2. /api/secrets/[id]/rate - Rate others' secrets
3. /api/rooms/[id]/questions - Get room questions
4. /api/invite/[code] - Preview invite details

Start with /api/secrets/[id]/unlock since it's critical for the "share to unlock" game mechanic. Follow the same pattern we established in the previous 8 routes:

- Use auth() from NextAuth for authentication
- Upsert user before creating data
- Use Supabase query functions from src/lib/db/supabase.ts
- Maintain exact same response format (backward compatible)
- Add emoji-based logging for debugging

Branch: feature/production-backend
Latest commits: 15fc5e1 (8 routes migrated), a8cd0d4 (first 3 routes)

Let's finish Phase 6!
```

---

## What You Need to Know

### Established Patterns

**Authentication:**
```typescript
const session = await auth();
if (!session?.user?.id) {
  return errorResponse('Authentication required', 401);
}

const userId = session.user.id;
```

**User Upsert (before creating data):**
```typescript
await upsertUser({
  id: session.user.id,
  email: session.user.email!,
  name: session.user.name || 'Anonymous',
  avatarUrl: session.user.image || null,
});
```

**Imports:**
```typescript
import { auth } from '@/lib/auth';
import {
  findSecretById,
  insertSecretAccess,
  updateSecret,
  // ... other functions
} from '@/lib/db/supabase';
import { errorResponse, successResponse } from '@/lib/api/helpers';
```

### Available Supabase Functions

Check `src/lib/db/supabase.ts` for complete list. Key ones:

**Secrets:**
- `findSecretById(id)`
- `findSecretsByRoomId(roomId)`
- `updateSecret(id, updates)`
- `insertSecret(secret)`

**Secret Access (unlocking):**
- `insertSecretAccess({secretId, userId})`
- `findSecretAccess(secretId, userId)`

**Secret Ratings:**
- `insertSecretRating({secretId, userId, rating})`
- `findSecretRatings(secretId)`

If functions are missing, add them following the existing pattern!

### Testing After Migration

```bash
# Start dev server
PORT=3000 npm run dev

# Test in browser
# 1. Create room
# 2. Answer questions
# 3. Try to unlock another user's secret (this is what we're migrating)
# 4. Rate a secret

# Check logs for emoji indicators:
# 🔓 for unlocking
# ⭐ for ratings
```

### Success Criteria

- All 4 routes use Supabase instead of mockDb
- `npm run build` passes
- Users can unlock secrets by submitting matching spiciness
- Users can rate unlocked secrets
- Data persists in database
- Response formats unchanged

---

## Estimated Time

- **2-4 hours** for remaining 4 routes
- 30-60 min per route

## Git Branch

Already on `feature/production-backend` with 2 commits done.

---

## Documentation References

- **Complete Summary**: `planning/PHASE_6_COMPLETE_SUMMARY.md`
- **Session 2 Log**: `planning/PHASE_6_SESSION_2_SUMMARY.md`
- **Migration Guide**: `planning/API_MIGRATION_SUMMARY.md`
- **Testing Guide**: `planning/API_MIGRATION_TESTING_GUIDE.md`

---

**After completing these 4 routes, Phase 6 will be 100% done and ready for deployment!** 🚀
