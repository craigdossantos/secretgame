# Phase 6: Production Backend Infrastructure

**Goal:** Replace mock database with real backend for production deployment

**Estimated Effort:** 20-30 hours
**Priority:** 🔴 CRITICAL FOR PRODUCTION
**Status:** Not Started
**Branch:** `feature/production-backend` (to be created)

---

## Problem Statement

The app currently works perfectly **locally** with a mock in-memory database (`src/lib/db/mock.ts`), but **cannot be deployed to production** because:

- ❌ All data is lost when the server restarts
- ❌ Users cannot access rooms from different devices
- ❌ No persistent authentication across browsers
- ❌ Invite links don't work for real users
- ❌ Cookie-based identity is per-device only
- ❌ Images stored as base64 in memory (not scalable)

**What Works Locally:**
- ✅ Full invite system (`/invite/[code]`)
- ✅ User creation with names
- ✅ Room creation and management
- ✅ Question answering (text, slider, MC, images)
- ✅ Secret unlocking mechanism
- ✅ All Phase 1-3 features functional

**The Gap:** We need real infrastructure to make this work for actual users.

---

## Implementation Plan

### 6.1 Real Database Setup ⭐⭐⭐
**Estimated:** 6-8 hours

**Recommended: Supabase (Postgres)**
- Already in `package.json`
- Includes auth, storage, and database
- Generous free tier
- Great Next.js integration

**Alternative Options:**
- Vercel Postgres (native integration)
- PlanetScale (serverless MySQL)
- Railway (Postgres hosting)

**Tasks:**
- [ ] Create Supabase project at [supabase.com](https://supabase.com)
- [ ] Set up database schema (see below)
- [ ] Configure environment variables
- [ ] Test connection from Next.js API routes
- [ ] Set up Row Level Security (RLS) policies

**Database Schema:**
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms table
CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  name TEXT,
  owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  invite_code TEXT UNIQUE NOT NULL,
  max_members INTEGER DEFAULT 20 CHECK (max_members > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Room members (join table)
CREATE TABLE room_members (
  room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);

-- Room questions (stores custom questions + selected question IDs)
CREATE TABLE room_questions (
  room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_data JSONB, -- For custom questions
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (room_id, question_id)
);

-- Secrets/Answers table
CREATE TABLE secrets (
  id TEXT PRIMARY KEY,
  room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
  author_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  body TEXT NOT NULL,
  self_rating INTEGER CHECK (self_rating BETWEEN 1 AND 5),
  importance INTEGER CHECK (importance BETWEEN 1 AND 5),
  avg_rating DECIMAL(2,1),
  buyers_count INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,
  answer_type TEXT DEFAULT 'text', -- 'text', 'slider', 'multipleChoice', 'imageUpload'
  answer_data JSONB, -- Type-specific answer data
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Secret unlocks (tracks who unlocked what)
CREATE TABLE secret_unlocks (
  secret_id TEXT REFERENCES secrets(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (secret_id, user_id)
);

-- Secret ratings
CREATE TABLE secret_ratings (
  secret_id TEXT REFERENCES secrets(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  rated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (secret_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_rooms_invite_code ON rooms(invite_code);
CREATE INDEX idx_room_members_user_id ON room_members(user_id);
CREATE INDEX idx_secrets_room_id ON secrets(room_id);
CREATE INDEX idx_secrets_author_id ON secrets(author_id);
CREATE INDEX idx_secret_unlocks_user_id ON secret_unlocks(user_id);
```

---

### 6.2 Authentication System ⭐⭐⭐
**Estimated:** 8-10 hours

**Recommended: Supabase Auth**
- Built-in with Supabase database
- Google OAuth ready to go
- Profile photo storage included
- Session management automatic

**Alternative Options:**
- **Clerk** - Beautiful UI, but paid tier required
- **NextAuth.js** - Self-hosted, more setup needed

**Tasks:**
- [ ] Configure Supabase Auth in dashboard
- [ ] Set up Google OAuth provider:
  - Create OAuth app in Google Cloud Console
  - Add authorized redirect URIs
  - Get client ID and secret
- [ ] Install `@supabase/ssr` for Next.js 15 App Router
- [ ] Create auth utilities (`src/lib/supabase/client.ts`, `server.ts`)
- [ ] Add login UI components
- [ ] Update API routes to get user from session
- [ ] Add profile photo upload to storage
- [ ] Test login/logout flow

**Files to Create:**
```
src/
├── lib/
│   └── supabase/
│       ├── client.ts          # Client-side Supabase client
│       ├── server.ts          # Server-side Supabase client
│       └── middleware.ts      # Auth middleware
├── components/
│   ├── auth/
│   │   ├── login-button.tsx   # Google login button
│   │   ├── logout-button.tsx  # Logout button
│   │   └── user-menu.tsx      # Profile dropdown
│   └── profile/
│       ├── avatar-upload.tsx  # Profile photo upload
│       └── profile-editor.tsx # Edit name/photo
```

**Files to Modify:**
```
src/lib/api/helpers.ts         # Replace cookie auth with Supabase auth
src/app/layout.tsx             # Add Supabase provider
All API route files            # Use auth from session
```

**Environment Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... # For admin operations

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
```

**Auth Flow:**
1. User clicks "Login with Google" button
2. Redirects to Google OAuth consent screen
3. Google redirects back with auth code
4. Supabase exchanges code for session
5. Session stored in cookie (httpOnly, secure)
6. User data populated in database
7. Profile photo uploadable to Supabase Storage

---

### 6.3 Data Migration & API Updates ⭐⭐
**Estimated:** 4-6 hours

**Goal:** Replace all `mockDb` calls with real Supabase queries

**Strategy:**
1. Create new `src/lib/db/supabase.ts` with query functions
2. Keep same function signatures as `mock.ts` for easy migration
3. Update API routes one-by-one
4. Test each route after migration
5. Remove `mock.ts` when complete

**Tasks:**
- [ ] Create `src/lib/db/supabase.ts` with:
  - `findUserById(id)`
  - `insertUser(user)`
  - `findRoomByInviteCode(code)`
  - `insertRoom(room)`
  - `insertRoomMember({roomId, userId})`
  - `getRoomMembers(roomId)`
  - `insertSecret(secret)`
  - `getRoomSecrets(roomId)`
  - `unlockSecret(secretId, userId)`
  - etc.
- [ ] Update all `/api/*` routes to use Supabase client
- [ ] Add error handling for database failures
- [ ] Add database connection pooling (built-in with Supabase)
- [ ] Test all existing features with real DB

**Migration Pattern:**
```typescript
// BEFORE (mock DB)
import { mockDb } from '@/lib/db/mock';
const room = await mockDb.findRoomByInviteCode(code);

// AFTER (Supabase)
import { supabaseDb } from '@/lib/db/supabase';
const room = await supabaseDb.findRoomByInviteCode(code);
```

**Files to Update:**
- `src/app/api/invite/[code]/route.ts`
- `src/app/api/invite/[code]/join/route.ts`
- `src/app/api/rooms/route.ts`
- `src/app/api/rooms/[id]/route.ts`
- `src/app/api/rooms/[id]/secrets/route.ts`
- `src/app/api/secrets/route.ts`
- `src/app/api/secrets/[id]/unlock/route.ts`
- `src/app/api/secrets/[id]/rate/route.ts`
- `src/app/api/questions/[questionId]/answers/route.ts`
- All other API routes

---

### 6.4 Image Storage Migration ⭐
**Estimated:** 2-4 hours

**Problem:** Images currently stored as base64 strings in mock DB. Need real file storage.

**Recommended: Supabase Storage**
- Integrated with Supabase Auth
- Automatic signed URLs
- CDN included
- Free tier: 1GB storage

**Alternative Options:**
- Vercel Blob Storage ($0.15/GB)
- Cloudinary (with transformations)
- AWS S3 (industry standard)

**Tasks:**
- [ ] Create Supabase Storage buckets:
  - `avatars` - User profile photos (public)
  - `answer-images` - Question answer images (private, RLS)
- [ ] Update `src/lib/image-utils.ts`:
  - Replace base64 encoding with file upload
  - Generate signed URLs for viewing
  - Add image compression before upload
- [ ] Update `ImageUploadInput.tsx` to upload to storage
- [ ] Update `ImageAnswerDisplay.tsx` to load from storage
- [ ] Store storage URLs in `answer_data.imageUrl` instead of base64
- [ ] Set up RLS policies for image access

**Storage Structure:**
```
avatars/
  └── {userId}/
      └── avatar.jpg

answer-images/
  └── {roomId}/
      └── {secretId}/
          └── {timestamp}-{filename}
```

**Data Model Change:**
```typescript
// BEFORE (base64 in DB)
interface ImageAnswerData {
  imageBase64: string; // Huge string
  caption?: string;
  mimeType: string;
}

// AFTER (URL in DB)
interface ImageAnswerData {
  imageUrl: string; // https://xxx.supabase.co/storage/v1/...
  caption?: string;
  mimeType: string;
  fileName: string;
}
```

---

### 6.5 Environment & Deployment ⭐
**Estimated:** 2-4 hours

**Tasks:**
- [ ] Create `.env.example` template
- [ ] Document all required environment variables
- [ ] Add environment variables to Vercel project
- [ ] Test deployment with real backend
- [ ] Set up database backups (Supabase auto-backups)
- [ ] Add error tracking (optional: Sentry)
- [ ] Configure CORS if needed
- [ ] Test production build locally: `npm run build && npm start`

**Environment Variables Checklist:**
```bash
# .env.local (local development)
# .env.example (template for team)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Optional: Error tracking
SENTRY_DSN=

# Optional: Analytics
NEXT_PUBLIC_GA_ID=
```

**Vercel Deployment:**
1. Push code to GitHub
2. Connect Vercel to repo
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push
5. Test production URL

---

## Acceptance Criteria

### Infrastructure
- [ ] Supabase project created and connected
- [ ] Database schema deployed and tested
- [ ] All tables have proper indexes
- [ ] Row Level Security (RLS) policies configured
- [ ] Database accessible from Vercel deployment

### Authentication
- [ ] Users can log in with Google OAuth
- [ ] Profile photos can be uploaded and displayed
- [ ] Auth persists across devices and browsers
- [ ] Sessions expire properly (7 days default)
- [ ] Logout works correctly
- [ ] Protected API routes reject unauthenticated requests

### Data Persistence
- [ ] All Phase 1-3 features work with real database
- [ ] Data persists across server restarts
- [ ] Multiple users can join same room simultaneously
- [ ] Invite links work for real users across devices
- [ ] No data lost when Vercel redeploys

### Storage
- [ ] Images upload to Supabase Storage
- [ ] Images display from storage URLs
- [ ] Signed URLs work for private images
- [ ] RLS prevents unauthorized image access
- [ ] Image file size limits enforced (5MB)

### Production Deployment
- [ ] App successfully deployed to Vercel
- [ ] Environment variables configured correctly
- [ ] No mock database code in production build
- [ ] Error handling for all DB failures
- [ ] Performance acceptable (< 2s page loads)
- [ ] HTTPS enforced in production
- [ ] No console errors in production

### Testing
- [ ] End-to-end flow works:
  1. User A creates room
  2. User A gets invite link
  3. User B opens invite link on different device
  4. User B logs in with Google
  5. User B joins room
  6. User B sees questions
  7. User B answers question with image
  8. User A sees User B's locked secret
  9. User A submits matching secret to unlock
  10. User A views User B's image answer
- [ ] All Phase 1-3 features tested in production
- [ ] Mobile testing on real devices
- [ ] Cross-browser testing (Chrome, Safari, Firefox)

---

## Files Changed Summary

**New Files:**
```
src/lib/supabase/
  ├── client.ts
  ├── server.ts
  └── middleware.ts

src/lib/db/
  └── supabase.ts (replaces mock.ts)

src/components/auth/
  ├── login-button.tsx
  ├── logout-button.tsx
  └── user-menu.tsx

src/components/profile/
  ├── avatar-upload.tsx
  └── profile-editor.tsx

.env.example
PHASE_6_PRODUCTION_BACKEND.md
```

**Modified Files:**
```
src/lib/api/helpers.ts (auth helpers)
src/lib/image-utils.ts (storage instead of base64)
src/app/layout.tsx (add auth provider)
All files in src/app/api/ (use real DB)
src/components/image-upload-input.tsx (upload to storage)
src/components/image-answer-display.tsx (load from storage)
package.json (verify Supabase packages)
```

**Deleted Files:**
```
src/lib/db/mock.ts (replaced by supabase.ts)
```

---

## Estimated Timeline

**Week 1:**
- Day 1-2: Database setup + schema (6-8 hours)
- Day 3-4: Authentication + OAuth (8-10 hours)
- Day 5: Data migration planning (2 hours)

**Week 2:**
- Day 1-2: API route migration (4-6 hours)
- Day 3: Image storage migration (2-4 hours)
- Day 4: Deployment + testing (2-4 hours)
- Day 5: Bug fixes + polish (2-4 hours)

**Total:** 20-30 hours over 2 weeks (part-time) or 3-4 days (full-time)

---

## Success Metrics

**Before (Mock DB):**
- ✅ Works locally perfectly
- ❌ Data lost on restart
- ❌ Single-device only
- ❌ Can't share with real users

**After (Production):**
- ✅ Works locally AND in production
- ✅ Data persists permanently
- ✅ Multi-device, multi-user
- ✅ Shareable with friends worldwide
- ✅ Ready for public alpha launch

---

## Next Steps After Phase 6

Once backend is production-ready:
1. **Soft launch** with 5-10 beta testers
2. **Phase 4: UX Polish** (8-12 hours)
   - Welcome modal for new users
   - Better onboarding flow
   - Profile drawer enhancements
3. **Public alpha launch** 🚀
4. **Phase 5: Peer Approval** (optional V2 feature)

---

## Resources

**Supabase Documentation:**
- [Next.js App Router + Supabase](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

**Alternative Auth:**
- [Clerk Documentation](https://clerk.com/docs/quickstarts/nextjs)
- [NextAuth.js Guide](https://next-auth.js.org/getting-started/example)

**Database Migration:**
- [Drizzle ORM](https://orm.drizzle.team/) (optional type-safe queries)
- [Prisma](https://www.prisma.io/) (alternative ORM)

---

**Last Updated:** January 2025
**Ready to Start:** Yes - all frontend features complete, just need backend
