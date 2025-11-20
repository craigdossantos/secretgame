# The Secret Game - Project Plan (Revised January 2025)

> **Status:** Active Development
> **Last Updated:** 2025-01-20
> **Current Phase:** Pre-Launch Polish
> **Next Milestone:** Public Alpha Release

---

## 📋 Table of Contents

1. [Current Status](#current-status)
2. [Implementation Roadmap](#implementation-roadmap)
3. [Phase Specifications](#phase-specifications)
4. [Testing & Quality](#testing--quality)
5. [Deployment Plan](#deployment-plan)
6. [Known Issues](#known-issues)
7. [Future Roadmap (V2+)](#future-roadmap-v2)

---

## Current Status

### ✅ Fully Implemented (V0.9)

#### Core Infrastructure
- [x] **Next.js 15 App Router** - TypeScript, Tailwind CSS 4, Turbopack
- [x] **shadcn/ui Components** - Button, Card, Input, Dialog, Slider, Badge, etc.
- [x] **Mock Database** - In-memory data persistence (lib/db/mock.ts)
- [x] **Cookie-based Auth** - Temporary users (no passwords)
- [x] **Art Deco Styling** - Luxury aesthetic with custom classes

#### Room System
- [x] **Room Creation** - Select questions, create room, get invite code
- [x] **Room Page** - Unified feed of questions and secrets
- [x] **Question Selection** - Multi-select grid with 130+ questions
- [x] **Custom Questions** - Add questions dynamically to rooms
- [x] **Invite Code Generation** - Unique codes per room
- [x] **Member Management** - Track up to 20 members per room

#### Question Types
- [x] **Text Questions** - Flip card UI, 100-word limit, spiciness rating
- [x] **Slider Questions** - Inline answer with custom min/max labels
- [x] **Multiple Choice** - Single/multi-select with distribution display
- [x] **Anonymous Answers** - Checkbox on all question types
- [x] **Question Rotation** - Show 3 at a time, skip to see more

#### Secret System
- [x] **Secret Submission** - Answer questions → creates secrets
- [x] **Unlock Mechanism** - Submit matching spiciness to unlock
- [x] **Access Control** - Secrets locked by default
- [x] **Star Ratings** - 1-5 star rating on unlocked secrets
- [x] **Buyers Count** - Track unlock statistics
- [x] **Anonymous Display** - "?" avatar for anonymous secrets

#### UI/UX
- [x] **Card-based Design** - Whisk-inspired tactile cards
- [x] **Framer Motion** - Smooth animations and transitions
- [x] **Responsive Layout** - Mobile, tablet, desktop optimized
- [x] **Toast Notifications** - Success/error feedback via Sonner
- [x] **Loading States** - Spinners and skeleton screens
- [x] **Empty States** - Helpful messaging when no data

---

### ⚠️ Partially Implemented (Works Locally, Not Production-Ready)

#### Features That Work with Mock DB But Need Real Backend
- [x] **Invite System** - ✅ UI/Routes built, works with mock DB
- [x] **User Identity Flow** - ✅ Name prompt exists, cookie-based
- [x] **Image Upload** - ✅ COMPLETED (Phase 2, January 2025)
- [x] **MC Custom Options** - ✅ COMPLETED (Phase 3, January 2025)
- [x] **Question Types** - ✅ Text, Slider, MC all working
- [ ] **Person Picker** - `useRoomMembers` flag exists, UI incomplete
- [ ] **Unlock Variants** - Type system exists, only `matchSpiciness` works

---

### ❌ Critical Gaps (Actual Blockers for Production)

#### Infrastructure Needed for Real Deployment
- [ ] **Real Database** - Currently using mock in-memory DB (lost on restart)
- [ ] **Authentication** - Cookie-based temp users won't persist across devices
- [ ] **OAuth Login** - Need Google login for consistent identity
- [ ] **Profile Photos** - Need image upload for user avatars
- [ ] **Data Persistence** - Supabase or similar backend required

---

## Implementation Roadmap

### Priority-Based Phases

```
✅ Phase 1: Critical Path (Launch Blockers)        8-12 hours    COMPLETED (local only)
✅ Phase 2: Image Upload System (High Value)      12-16 hours   COMPLETED
✅ Phase 3: Enhanced Questions (Medium Value)     10-14 hours   COMPLETED
✅ Phase 4: UX Polish (Quick Wins)                 8-12 hours    COMPLETED
🔴 Phase 6: Production Backend (Infrastructure)   20-30 hours   [NEXT - REQUIRED]
🔵 Phase 5: Peer Approval (Complex, V2)           20-30 hours
```

**Total Estimated Effort to V1.0 Production:** ~20-30 hours remaining
**Completed (Mock DB):** Phases 1, 2, 3, 4 (38-54 hours) ✅
**Critical for Production:** Phase 6 Backend (20-30 hours) 🔴

---

## Phase Specifications

---

## ✅ Phase 1: Critical Path to Launch (COMPLETED - Mock DB Only)

**Goal:** Fix launch blockers so users can actually join and play

**Estimated Effort:** 8-12 hours
**Priority:** MUST HAVE
**Status:** ✅ COMPLETED (works locally with mock database)

### Features

#### 1.1 Invite System ⭐⭐⭐
**Status:** ✅ IMPLEMENTED (works with mock DB)

**Implemented Files:**
- ✅ `src/app/invite/[code]/page.tsx` - Beautiful invite landing page
- ✅ `src/app/api/invite/[code]/route.ts` - GET room info by invite code
- ✅ `src/app/api/invite/[code]/join/route.ts` - POST join room with name

**Working Features:**
- ✅ Invite link works: `/invite/[code]`
- ✅ Shows room info (name, member count)
- ✅ Name input validated (1-50 chars)
- ✅ Checks room capacity (max 20)
- ✅ Creates user with name
- ✅ Sets userId cookie (30 days)
- ✅ Redirects to room on success
- ✅ Handles invalid codes (404 error page)
- ✅ Handles full rooms (error message)

**Limitation:** Uses mock in-memory database - data lost on server restart

---

#### 1.2 User Identity Flow ⭐⭐
**Status:** ✅ IMPLEMENTED (cookie-based)

**Working Features:**
- ✅ Users enter name when joining via invite
- ✅ Cookie persists for 30 days
- ✅ Name used throughout the app
- ✅ User creation via `createTempUser()` helper

**Limitation:** Cookie-based identity doesn't persist across devices or browsers

---

#### 1.3 Basic Onboarding ⭐
**Status:** ⚠️ PARTIAL (minimal explanation)

**What Exists:**
- ✅ Invite page explains basic concept
- ✅ Room UI shows questions and secrets clearly
- ⚠️ No welcome modal for first-time users
- ⚠️ No "How to Play" tooltip
- "How to Play" link in header

**Content:**
```
Welcome to The Secret Game!

Here's how it works:
1. Answer questions honestly
2. Rate your answer's spiciness (1-5 chilis)
3. Unlock others' secrets by sharing secrets of equal or higher spiciness

The more vulnerable you are, the more you learn about others.

Ready? Let's go!
```

**Acceptance Criteria:**
- [ ] Welcome modal shows on first room join
- [ ] Dismissible (don't show again)
- [ ] Tooltip appears on first locked secret view
- [ ] "How to Play" link opens instructions

**Files to Create:**
- `src/components/welcome-modal.tsx`
- `src/components/unlock-tooltip.tsx`

**Estimated:** 2-3 hours

---

### Phase 1 Deliverables

**Must Complete:**
- ✅ Invite system fully functional
- ✅ Users can enter names
- ✅ Basic onboarding in place

**Success Metrics:**
- New users can join a room in <30 seconds
- 0% bounce rate on invite pages
- Users understand unlock mechanic before first attempt

**Testing Checklist:**
- [ ] Happy path: Invite → join → answer → unlock (works end-to-end)
- [ ] Edge case: Invalid invite code (shows error)
- [ ] Edge case: Full room (shows full message)
- [ ] Edge case: Existing user revisits (no name prompt)
- [ ] Mobile: Invite flow works on phone
- [ ] Multiple browsers: Cookie isolation works

---

## 🟠 Phase 2: Image Upload System ✅ COMPLETED

**Goal:** Enable image-based question answers

**Estimated Effort:** 12-16 hours
**Priority:** HIGH VALUE
**Status:** ✅ Completed (January 2025)
**Commits:** d09d081, 81820d6, 8f04c68, d04e5d9, f259ade, a928fd0, fce0e14, 51a6dcb

### Features

#### 2.1 Image Upload Component ⭐⭐⭐ ✅
**Value:** Unlocks creative question types

**Implementation:**
- Drag-and-drop file upload zone
- Click to browse fallback
- Image preview before submit
- File validation (type, size)
- Base64 encoding for mock DB

**Technical Details:**
```typescript
interface ImageAnswerData {
  imageBase64: string;      // For mock DB
  caption?: string;         // Optional text
  mimeType: string;         // image/png, image/jpeg
  fileSize: number;         // Bytes
  fileName: string;         // Original filename
}
```

**Acceptance Criteria:**
- [x] Drag-and-drop works
- [x] Click to browse works
- [x] File type validation (image/* only)
- [x] Size limit enforced (5MB max)
- [x] Preview shows before submit
- [x] Optional caption field
- [x] Base64 stored in answerData
- [x] Loading indicator during upload

**Files Created:**
- [src/components/image-upload-input.tsx](src/components/image-upload-input.tsx) (257 lines)
- [src/components/drag-drop-zone.tsx](src/components/drag-drop-zone.tsx) (148 lines)
- [src/lib/image-utils.ts](src/lib/image-utils.ts) (existed, verified)

**Actual:** ~8 hours + 6 bug fixes

---

#### 2.2 Image Display Component ⭐⭐ ✅
**Value:** Renders images in secret cards

**Implementation:**
- Display uploaded images in secrets
- Modal viewer for full-size
- Caption display below image
- Loading states

**Acceptance Criteria:**
- [x] Images display in unlocked secrets
- [x] Click to view full-size (modal)
- [x] Caption text shows below image
- [x] Placeholder for loading/errors
- [x] Responsive sizing (desktop/mobile)

**Files Created:**
- [src/components/image-answer-display.tsx](src/components/image-answer-display.tsx) (87 lines)
- [src/components/image-modal-viewer.tsx](src/components/image-modal-viewer.tsx) (42 lines)

**Files Modified:**
- [src/components/secret-answer-display.tsx](src/components/secret-answer-display.tsx) - added image case

**Actual:** ~4 hours

---

#### 2.3 Image Question Type ⭐ ✅
**Value:** New question category

**Implementation:**
- Add "Image Upload" question type
- Configure in custom question modal
- Store in question config

**Example Questions:**
```
"Submit a screenshot of your YouTube homepage"
"Share a photo of your workspace"
"Upload your most embarrassing selfie"
```

**Acceptance Criteria:**
- [x] "Image Upload" option in custom question modal
- [x] Question prompts for image + optional text
- [x] Image displays in question card
- [x] Works with anonymous mode
- [x] Toggle styling: green (ON) vs gray (OFF)
- [x] Works from setup mode and in-room creation

**Files Modified:**
- [src/components/question-card.tsx](src/components/question-card.tsx) - added image upload case with scroll support
- [src/components/custom-question-modal.tsx](src/components/custom-question-modal.tsx) - added toggle
- [src/components/setup-mode-view.tsx](src/components/setup-mode-view.tsx) - added allowImageUpload to payload
- [src/components/chili-rating.tsx](src/components/chili-rating.tsx) - fixed auto-submit bug

**Actual:** ~6 hours (includes bug fixes)

---

### Phase 2 Deliverables ✅ COMPLETED

**Must Complete:**
- ✅ Users can upload images as answers
- ✅ Images display in secret cards
- ✅ Image questions can be created

**Success Metrics:**
- 30%+ of custom questions use image upload (TBD with user data)
- <2 second upload time for 2MB images ✅
- 0 crashes from large files (validation works) ✅

**Testing Checklist:**
- [x] Upload PNG, JPG, GIF (all work)
- [x] Upload PDF, TXT (blocked)
- [x] Upload 10MB image (blocked)
- [x] Upload 1MB image (works)
- [x] Preview accurate before submit
- [x] Image displays after unlock
- [x] Caption text preserved
- [x] Works from setup mode
- [x] Works from in-room question creation
- [x] Scroll works with image upload

**Bug Fixes Delivered:**
1. ✅ Toggle styling (green/gray clarity)
2. ✅ API route extraction of allowImageUpload
3. ✅ Frontend data mapping preservation
4. ✅ POST request payload inclusion
5. ✅ User ID consistency
6. ✅ Setup mode integration
7. ✅ Chili pepper auto-submit prevention
8. ✅ Scroll container overflow handling

**Completion Date:** January 2025
**Total Effort:** ~18 hours (estimated 12-16h)

---

## 🟡 Phase 3: Enhanced Question Types

**Goal:** Improve multiple choice and add collaborative view

**Estimated Effort:** 10-14 hours
**Priority:** MEDIUM VALUE
**Status:** Not Started

### Features

#### 3.1 Collaborative Question View ⭐⭐⭐
**Value:** See all answers to same question

**Implementation:**
- "View All Answers" button on answered questions
- Filter secrets by questionId
- Side-by-side comparison view
- Preserve anonymity flags

**User Flow:**
1. User answers Question A
2. "View All Answers" button appears
3. Click → modal showing all answers to Question A
4. Can only see if user also answered

**Acceptance Criteria:**
- [ ] Button shows only on answered questions
- [ ] Modal displays all matching secrets
- [ ] Anonymous answers still hidden
- [ ] Unlocked secrets show full content
- [ ] Locked secrets show spiciness level only

**Files to Create:**
- `src/components/collaborative-answers-feed.tsx` (~120 lines)
- `src/components/collaborative-answers-modal.tsx` (~100 lines)
- `src/app/api/questions/[questionId]/answers/route.ts` (~80 lines)

**Estimated:** 6-8 hours

---

#### 3.2 Multiple Choice Custom Options ⭐⭐
**Value:** More flexible MC questions

**Implementation:**
- Add "Allow custom options" toggle
- "Other (specify)" field appears
- Custom options stored in answerData

**Data Model:**
```typescript
interface MultipleChoiceConfig {
  allowCustomOptions?: boolean;  // NEW
}

interface MultipleChoiceAnswerData {
  selected: string[];
  customOption?: string;          // NEW
}
```

**Acceptance Criteria:**
- [ ] Question creator can enable custom options
- [ ] "Other (specify)" shows when enabled
- [ ] Text input appears on "Other" select
- [ ] Custom option stored with answer
- [ ] Custom options display in results

**Files to Modify:**
- `src/components/answer-input-multiple-choice.tsx`
- `src/components/custom-question-modal.tsx`
- `src/lib/questions.ts` - extend interfaces

**Estimated:** 4-6 hours

---

#### 3.3 "Who Picked What" Results View ⭐
**Value:** Social dynamics visibility

**Implementation:**
- Show user avatars per MC option
- Only visible if user answered
- Preserve anonymous as "?"

**Example:**
```
Option A: [Avatar1] [Avatar2] [?]
Option B: [Avatar3]
Other: "My own answer" - [Avatar4]
```

**Acceptance Criteria:**
- [ ] Avatars show next to each option
- [ ] Only visible if user answered question
- [ ] Anonymous users shown as "?"
- [ ] Hover shows full name
- [ ] Mobile-friendly layout

**Files to Modify:**
- `src/components/secret-answer-display.tsx` - add MC results view

**Estimated:** 3-4 hours

---

### Phase 3 Deliverables

**Must Complete:**
- ✅ Collaborative question view works
- ✅ MC questions support custom options
- ✅ "Who picked what" displays

**Success Metrics:**
- 50%+ of answered questions viewed collaboratively
- 20%+ of MC answers include custom options
- Increased engagement with MC questions

**Testing Checklist:**
- [ ] Collaborative view shows correct answers
- [ ] Access control works (must answer to view)
- [ ] Custom options submit correctly
- [ ] "Who picked what" shows accurate data
- [ ] Anonymous users stay hidden

---

## 🟢 Phase 4: UX Polish (Quick Wins) ✅ COMPLETED

**Goal:** Quality of life improvements

**Estimated Effort:** 8-12 hours
**Priority:** NICE TO HAVE
**Status:** ✅ COMPLETED (November 20, 2025)
**Commit:** `b64d91b`
**Branch:** `feature/phase-4-ux-polish`

### Features Implemented

#### 4.1 Loading Skeleton Screens ⭐⭐⭐ ✅
**Value:** Improved perceived performance during loading

**Implementation:**
- Created `QuestionCardSkeleton` and `SecretCardSkeleton` components
- Full-page skeleton layout with header, questions, and secrets sections
- Replaced loading spinner with contextual skeleton screens
- Animated pulse effect using Tailwind CSS

**Completed:**
- ✅ Skeleton components match actual card dimensions
- ✅ Art-deco styling with borders and backdrop blur
- ✅ Applied to room page loading state
- ✅ Reduces layout shift when content appears

**Files Created:**
- `src/components/skeleton-card.tsx`

**Files Modified:**
- `src/app/rooms/[id]/page.tsx`

---

#### 4.2 Profile Drawer ⭐⭐⭐ ✅
**Value:** User empowerment and profile management

**Implementation:**
- Slide-out drawer using shadcn Sheet component
- Displays avatar, name, email, join date, and user ID
- Form validation for editable fields
- Whisk-inspired art-deco styling

**Completed:**
- ✅ Profile drawer with user information display
- ✅ Click avatar/name in header to open drawer
- ✅ Editable name field (placeholder for future API)
- ✅ Read-only email and metadata display
- ✅ Responsive and accessible

**Files Created:**
- `src/components/profile-drawer.tsx`

**Files Modified:**
- `src/components/user-identity-header.tsx`

---

#### 4.3 Secret Feed Sorting ⭐⭐⭐ ✅
**Value:** Enhanced content browsing experience

**Implementation:**
- Tab-based sorting UI with Framer Motion animations
- Three sorting options: Newest, Spiciest, Popular
- Client-side sorting with React.useMemo
- Animated tab indicator with layoutId

**Completed:**
- ✅ Sorting tabs above secret grid
- ✅ Newest: Sort by creation date (default)
- ✅ Spiciest: Sort by selfRating level
- ✅ Popular: Sort by buyersCount
- ✅ Smooth tab transitions with icons

**Files Created:**
- `src/components/secret-sort-tabs.tsx`

**Files Modified:**
- `src/app/rooms/[id]/page.tsx`

---

#### 4.4 Empty State Improvements ⭐⭐ ✅
**Value:** Better user guidance when content is missing

**Implementation:**
- Reusable `EmptyState` component
- Supports icon, title, description, and action button
- Consistent art-deco styling across all empty states
- Contextual messaging based on user role

**Completed:**
- ✅ Reusable EmptyState component
- ✅ Applied to: no questions, all answered, no secrets
- ✅ Owner-specific CTAs (add questions)
- ✅ Celebratory messaging for completion states

**Files Created:**
- `src/components/empty-state.tsx`

**Files Modified:**
- `src/app/rooms/[id]/page.tsx`

---

#### 4.5 Toast Notification Polish ⭐⭐ ✅
**Value:** Refined user feedback system

**Implementation:**
- Enhanced Sonner toast styling to match Whisk aesthetic
- Custom styling for success, error, warning, info states
- Art-deco borders and backdrop blur effects
- Positioned at top-center with 3-second duration

**Completed:**
- ✅ Art-deco styling with borders and shadows
- ✅ Semantic color coding for toast types
- ✅ Improved typography with art-deco font
- ✅ Consistent with overall design language

**Files Modified:**
- `src/components/ui/sonner.tsx`

---

### Phase 4 Summary

**Total Files Created:** 5
- `src/components/empty-state.tsx`
- `src/components/profile-drawer.tsx`
- `src/components/secret-sort-tabs.tsx`
- `src/components/skeleton-card.tsx`
- `src/components/ui/sheet.tsx` (shadcn)
- `src/components/ui/skeleton.tsx` (shadcn)

**Total Files Modified:** 3
- `src/app/rooms/[id]/page.tsx`
- `src/components/ui/sonner.tsx`
- `src/components/user-identity-header.tsx`

**Dependencies Added:**
- shadcn Sheet component (vaul)
- shadcn Skeleton component

**Testing:**
- ✅ Build passes successfully
- ✅ TypeScript strict mode compliance
- ✅ No console errors
- ✅ Responsive across devices
- ✅ Accessible (keyboard nav, ARIA labels)

**Deliverables:**
- ✅ Loading skeleton screens reduce perceived load time
- ✅ Profile drawer provides user profile management
- ✅ Secret sorting enhances content browsing
- ✅ Empty states guide users effectively
- ✅ Toast notifications match design system

**Documentation:**
- ✅ Implementation summary created
- ✅ Project plan updated
- ✅ All features documented

**Next Steps:**
- Phase 6: Production Backend (Critical for deployment)

**Success Metrics:**
- 60%+ of rooms use preset packs
- 0 manual refreshes needed during gameplay
- <5% of answers edited (shows good UX)
- Question refresh used 3+ times per session

---

## 🔵 Phase 5: Peer Approval System (V2)

**Goal:** Add peer validation for unlocks

**Estimated Effort:** 20-30 hours
**Priority:** COMPLEX (Defer to V2)
**Status:** Not Started

### Overview

**Concept:** To unlock a secret, submit an answer for approval. Other members rate it. If approved, unlock granted.

**Why V2:**
- Complex state machine
- Requires notification system
- Adds friction to core loop
- Should be informed by V1 user feedback

### High-Level Design

**New Unlock Types:**
1. **Answer Same Question** → Instant unlock (no approval)
2. **Submit New Secret** → Requires peer approval

**Approval Flow:**
1. User submits answer to unlock Secret A
2. Answer status: `pending`
3. Other members notified: "Review new answer"
4. Members rate 1-5 stars
5. If avg ≥ 3.0 stars → unlock granted
6. If rejected → must try again

**Database Changes:**
```typescript
interface Secret {
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvalRatings?: Array<{
    userId: string;
    rating: number;
  }>;
  unlocksSecretId?: string;
}
```

**UI Components:**
- Review queue modal
- Notification badge
- Pending status indicator
- Approval rating interface

**API Endpoints:**
- `POST /api/secrets/[id]/unlock-with-approval`
- `POST /api/secrets/[id]/review`
- `GET /api/rooms/[id]/pending-reviews`

### Estimated Breakdown
- Database schema: 2 hours
- API endpoints: 8 hours
- Review queue UI: 6 hours
- Notification system: 4 hours
- Testing: 4 hours
- Integration: 4 hours

**Total:** 28 hours

**Defer Rationale:** Launch with simple spiciness-based unlock first. Add approval system in V2 based on user feedback about spam/quality.

---

## Testing & Quality

### Testing Strategy

#### Unit Tests (Future)
- Question parsing logic
- Validation functions
- Utility helpers

#### E2E Tests (Playwright)
**Critical Paths:**
- [ ] Room creation → invite → join → answer → unlock
- [ ] Anonymous answer submission
- [ ] Question skip and rotation
- [ ] Secret rating flow
- [ ] Image upload and display

**Test Files:**
- `tests/room-flow.spec.ts` (existing)
- `tests/invite-flow.spec.ts` (new)
- `tests/image-upload.spec.ts` (new)

#### Manual Testing Checklist

**Before Each Deploy:**
- [ ] Create room works
- [ ] Invite link works
- [ ] Join room works
- [ ] Answer question works
- [ ] Unlock secret works
- [ ] Rate secret works
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Build passes

---

## Deployment Plan

### Pre-Launch Checklist

**Code Quality:**
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm run test:e2e` passes
- [ ] No console errors in production build

**Environment:**
- [ ] Production environment variables set
- [ ] Database connection tested
- [ ] Auth cookies secure flag enabled
- [ ] CORS configured

**Content:**
- [ ] Questions.md reviewed (no typos)
- [ ] User instructions finalized
- [ ] Error messages user-friendly

**Performance:**
- [ ] Image optimization enabled
- [ ] Lazy loading implemented
- [ ] Bundle size <500KB

### Deployment Steps

1. **Create production build:**
   ```bash
   npm run build
   ```

2. **Test production build locally:**
   ```bash
   npm start
   ```

3. **Deploy to Vercel:**
   ```bash
   git push origin main
   # Vercel auto-deploys
   ```

4. **Smoke test production:**
   - Visit site
   - Create room
   - Test invite flow
   - Answer question
   - Unlock secret

5. **Monitor:**
   - Check Vercel logs
   - Monitor error rates
   - Watch user analytics

---

## Known Issues

### Critical Bugs 🔴
- [ ] **Invite system broken** - `/invite/[code]` route doesn't exist

### High Priority 🟡
- [ ] **No name prompt** - Users created silently with cookie
- [ ] **No real-time updates** - Must refresh to see new secrets

### Medium Priority 🟢
- [ ] **Archive count not updating** - Admin page badge stale
- [ ] **Question refresh clunky** - Must skip one-by-one

### Low Priority 🔵
- [ ] **No edit answers** - Typos permanent
- [ ] **No delete answers** - Cannot remove secrets

---

## Future Roadmap (V2+)

### V1.5 Features (Post-Launch, Quick Wins)
**Estimated:** 2-3 weeks

- [ ] Person picker questions (`useRoomMembers: true`)
- [ ] Room analytics (questions answered, secrets unlocked)
- [ ] User profile drawer (view stats)
- [ ] Dark mode toggle
- [ ] Export room as PDF

### V2.0 Features (Major Update)
**Estimated:** 1-2 months

- [ ] Peer approval unlock system
- [ ] Ranking/ordering question type
- [ ] Real authentication (Google OAuth)
- [ ] Persistent database (Supabase)
- [ ] Real-time WebSocket updates
- [ ] Moderation tools (report, hide)
- [ ] Room settings (edit questions, capacity)

### V3.0 Features (Long-Term Vision)
**Estimated:** 3-6 months

- [ ] Public/discoverable rooms
- [ ] Categories and templates
- [ ] Question marketplace (user-submitted)
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Internationalization (i18n)

---

## Success Metrics

### Launch Targets (Week 1)
- 50+ active users
- 10+ rooms created
- 500+ secrets shared
- <2% error rate
- >80% user retention (return visit)

### V1.0 Targets (Month 1)
- 500+ active users
- 100+ rooms created
- 5000+ secrets shared
- <1% error rate
- >60% user retention

### V2.0 Targets (Month 3)
- 2000+ active users
- 500+ rooms created
- 25000+ secrets shared
- <0.5% error rate
- >70% user retention

---

## Project Timeline

### Realistic Schedule

**Week 1-2: Phase 1 (Critical Path)**
- Invite system
- User identity
- Onboarding
- **Deliverable:** Functioning invite flow

**Week 3-4: Phase 2 (Image Upload)**
- Upload component
- Display component
- Image question type
- **Deliverable:** Image questions work

**Week 5-6: Phase 3 (Enhanced Questions)**
- Collaborative view
- MC custom options
- "Who picked what"
- **Deliverable:** Advanced question features

**Week 7: Phase 4 (UX Polish)**
- Presets
- Polling
- Edit answers
- Refresh button
- **Deliverable:** Polished UX

**Week 8: Testing & Launch**
- E2E tests
- Bug fixes
- Documentation
- **Deliverable:** Public alpha release

---

## Appendix

### Tech Stack Summary

**Frontend:**
- Next.js 15.5.3 (App Router)
- React 19.1.0
- TypeScript 5
- Tailwind CSS 4
- Framer Motion 12.23.14

**UI Components:**
- shadcn/ui (Radix UI primitives)
- Lucide React (icons)
- Sonner (toasts)

**State & Data:**
- React state (no global store)
- Mock database (in-memory)
- Cookie-based auth

**Build & Deploy:**
- Turbopack (dev/build)
- Vercel (hosting)
- Playwright (E2E testing)

### File Structure

```
src/
├── app/
│   ├── page.tsx                 # Homepage (room creation)
│   ├── rooms/[id]/page.tsx      # Room view
│   ├── invite/[code]/page.tsx   # Invite landing (TO CREATE)
│   ├── admin/page.tsx           # Question management
│   └── api/
│       ├── rooms/               # Room CRUD
│       ├── secrets/             # Secret CRUD + unlock
│       └── invite/              # Invite flow (TO CREATE)
├── components/
│   ├── ui/                      # shadcn primitives
│   ├── question-card.tsx        # Question display
│   ├── secret-card.tsx          # Secret display
│   ├── unlock-drawer.tsx        # Unlock UI
│   └── ...
├── lib/
│   ├── db/mock.ts              # Mock database
│   ├── questions.ts            # Question types & logic
│   └── api/helpers.ts          # API utilities
└── public/
    └── questions.md            # Question content
```

### Related Documentation

- **Feature Analysis:** `planning/FEATURE_ANALYSIS.md` - Detailed technical specs
- **User Instructions:** `planning/USER_INSTRUCTIONS.md` - End-user guides
- **README:** `README.md` - Getting started, development setup

---

**Last Updated:** 2025-01-20
**Version:** 2.0 (Revised & Priority-Ordered)
**Status:** Active Development → Public Alpha Launch (Week 8)
