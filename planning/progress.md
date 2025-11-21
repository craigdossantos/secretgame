# The Secret Game — Project Progress & Context

**Last Updated**: January 2025
**Status**: MVP Development - Room Creation & Question System Complete

---

## 🎯 Project Overview

The Secret Game is a card-based secret sharing web app for small friend groups (≤20 people). Users join rooms via invite URLs, answer spicy questions, and unlock others' secrets by sharing their own. The UI follows Google Labs Whisk design principles with tactile, card-based interactions.

**Core Concept**: To unlock ("buy") someone's secret, you must submit your own secret with matching "spiciness" level (🌶️ rating 1-5).

---

## 🏗️ Current Architecture

### Tech Stack
- **Frontend**: Next.js 15.5.3 with App Router + Turbopack
- **Styling**: Tailwind CSS 4.x + shadcn/ui components
- **State**: React state (no global state management)
- **Database**: Supabase Postgres with Drizzle ORM (migration in progress)
- **Auth**: NextAuth.js v5 with Google OAuth (configured, migrating from cookies)
- **Storage**: Vercel Blob for image uploads
- **API**: Next.js route handlers with TypeScript validation
- **Animations**: Framer Motion for card interactions

### Architectural Decisions
1. **Supabase + Drizzle** - Type-safe queries with PostgreSQL backend
2. **NextAuth.js JWT sessions** - Stateless authentication, serverless-friendly
3. **Vercel Blob storage** - Scalable image hosting (replacing base64)
4. **Dual migration strategy** - Keep mock DB during transition for zero downtime
5. **Build successfully deploys** to Vercel

---

## ✅ Completed Features

### Infrastructure
- [x] Next.js project with TypeScript strict mode
- [x] Tailwind CSS + shadcn/ui setup (Button, Card, Input, Label, Textarea, Slider, Badge, Avatar, Dialog, Sonner, DropdownMenu)
- [x] Mock database with full CRUD operations (being replaced)
- [x] **Supabase Postgres** - All 7 tables created and migrated ✨
- [x] **Drizzle ORM query layer** - 350+ lines of type-safe queries ✨
- [x] **NextAuth.js v5** - Google OAuth configured ✨
- [x] **Auth UI components** - Login, logout, user menu ✨
- [x] **Vercel Blob storage** - Image upload/delete utilities ✨
- [x] API route handlers with proper error handling
- [x] Cookie-based temporary user system (being replaced with NextAuth)
- [x] Successful Vercel deployment

### Room System
- [x] **Room Creation Flow**
  - Name input + user name
  - Question selection (3 questions required)
  - Custom question creation with tags
  - Generates unique invite code
  - Returns shareable invite URL
  - Setup mode with pagination (10 questions visible, "Load more")
  - Selected questions in dedicated column
- [x] **Room Management**
  - 20 member cap enforced
  - Owner tracked
  - Members list functionality
  - Room details API (`/api/rooms/[id]`)

### Question System
- [x] **Unified Tagging Architecture**
  - Multi-type tags: category, topic, priority, mood, format
  - Color-coded tag display (blue for categories, green for topics, etc.)
  - Backward compatibility with legacy category system
- [x] **Question Management**
  - Parse questions from markdown (`data/questions.md`)
  - 12 curated questions per room
  - 3 random questions on homepage
  - Archive/unarchive functionality
  - Admin interface at `/admin`
- [x] **Question Selection**
  - Grid selector with categories
  - Custom question modal with "Allow Image Upload" toggle
  - Preview selected questions
  - Validation (exactly 3 required)

### Image Upload System (Phase 2) ✨
- [x] **Image Upload Components**
  - Drag-and-drop file upload zone ([drag-drop-zone.tsx](src/components/drag-drop-zone.tsx))
  - Click to browse fallback
  - Image preview before submit
  - File validation (type, size limits)
  - Base64 encoding for mock database
- [x] **Image Display**
  - Display uploaded images in secret cards ([image-answer-display.tsx](src/components/image-answer-display.tsx))
  - Click-to-expand modal viewer ([image-modal-viewer.tsx](src/components/image-modal-viewer.tsx))
  - Optional caption support
  - Responsive sizing (desktop/mobile)
- [x] **Image Question Type**
  - "Allow Image Upload" toggle in custom question modal
  - Toggle styling: green (ON) vs gray (OFF)
  - Works from setup mode and in-room question creation
  - Full data flow: modal → API → database → frontend → component

### UI Components
- [x] **QuestionCard** - Whisk-styled cards with tags, chili ratings, click-to-reveal pattern
- [x] **QuestionGrid** - Responsive grid layout with categories
- [x] **QuestionSelector** - Multi-select interface for room creation
- [x] **CustomQuestionModal** - Form for creating custom questions with image upload toggle
- [x] **ChiliRating** - Visual 1-5 spiciness display (🌶️) with proper form button types
- [x] **CategoryFilter** - Filter questions by category
- [x] **RatingStars** - 1-5 star rating component (prepared)
- [x] **ImageUploadInput** - Controlled component for image uploads
- [x] **ImageAnswerDisplay** - Renders images in secret cards
- [x] **ImageModalViewer** - Full-screen image viewer
- [x] **DragDropZone** - Drag-and-drop interface for file uploads

### Pages Implemented
- [x] **Homepage** (`/`) - 3 random questions with refresh
- [x] **Room Creation** (`/create`) - Full flow with question selection
- [x] **Room View** (`/rooms/[id]`) - Shows questions, prepared for secrets
- [x] **Admin** (`/admin`) - Question management interface
- [x] **Demo** (`/demo-question-selector`) - Test question selector

---

## 🔄 Current State

### What's Working ✨
- **Full room creation flow** with question selection
- **Google OAuth authentication** - Sign in, user menu, profile management
- **Persistent data storage** - All data saved to Supabase Postgres
- **Answer questions** - Text, slider, multiple choice with image upload
- **View secrets** - See your answers and collaborative responses
- **Invite system** - Share rooms via unique invite codes
- Custom question creation with tags and image upload toggle
- Homepage with refreshable questions (redesigned with visual synopsis)
- Admin interface for managing questions
- Whisk-inspired card UI with hover effects
- Click-to-reveal pattern for secrets
- **Image upload system** - complete drag-and-drop with preview and modal viewer
- Build passes TypeScript strict mode
- Successfully deployed to Vercel

### Recent Improvements (January 2025)
- ✅ **Phase 6 Complete (67%)** - 8/12 API routes migrated to Supabase
  - Room creation, setup, and question answering working end-to-end
  - Google OAuth with NextAuth.js replacing cookie-based auth
  - User data persists across sessions
  - Foreign key constraints and normalized schema
- ✅ Homepage redesigned with visual synopsis and setup mode flow
- ✅ Setup mode pagination (10 questions visible, "Load more" button)
- ✅ Phase 2 image upload system fully implemented
- ✅ Click-to-reveal UX pattern for secrets (replaced dark/blurred text)
- ✅ 6 critical bugs fixed in image upload data flow pipeline
- ✅ Phase 3 enhanced questions fully implemented:
  - Collaborative question view with "View All Answers" modal
  - "Who Picked What" MC results with avatars and distribution
  - Custom options for MC questions ("Other (specify)" field)
- ✅ All features merged to main and deployed

### Development Environment
- Server running on port 3000 (http://localhost:3000)
- Turbopack for fast refresh
- Hot reload working properly
- **Supabase database** - Data persists across server restarts ✨

### Known Issues & Technical Debt
1. **Next.js 15 Async Params** - Using `(await params).id` pattern ✅ (working)
2. **API Routes Migration** - ✅ **67% COMPLETE:** 8/12 routes using Supabase (4 lower-priority routes remain)
3. **Cookie→NextAuth Migration** - ✅ **COMPLETE:** All authenticated routes use NextAuth sessions
4. **Base64→Blob Migration** - 🟡 **READY:** Blob utilities implemented, need to update upload flow
5. **Unlock/Rating Features** - 🟡 **PENDING:** 2 routes need migration for full game mechanics
6. **No Real-time Updates** - Static data, polling planned for V1 ⚠️

---

## 📊 Data Models

```typescript
// Current Mock Database Schema
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
  questionIds?: string[];
  customQuestions?: CustomQuestion[];
  createdAt: Date;
}

interface Secret {
  id: string;
  roomId: string;
  authorId: string;
  body: string;
  selfRating: number;      // 1-5 spiciness
  importance: number;      // 1-5 keep-it-private
  avgRating?: number;
  buyersCount: number;
  createdAt: Date;
  isHidden: boolean;
}
```

---

## 🚀 Next Immediate Steps

**Current Priority: Phase 6 - Production Backend (67% Complete)** ✅

### PROGRESS UPDATE

**Infrastructure Complete (100%):** ✅
- ✅ Supabase Postgres database - All 7 tables created
- ✅ Drizzle ORM query layer - 350+ lines of type-safe functions
- ✅ NextAuth.js v5 - Google OAuth fully configured
- ✅ Auth UI components - Login, logout, user menu ready
- ✅ Vercel Blob storage - Upload/delete utilities implemented
- ✅ Environment variables - All credentials configured

**Core API Routes Migrated (8/12 - 67%):** ✅
- ✅ `/api/users/me` - Get current user
- ✅ `/api/rooms` (POST/GET) - Create/list rooms
- ✅ `/api/rooms/[id]` - Get room details
- ✅ `/api/rooms/[id]/complete-setup` - Finish setup
- ✅ `/api/rooms/[id]/secrets` - View secrets
- ✅ `/api/secrets` - Create/update answers
- ✅ `/api/questions/[questionId]/answers` - Collaborative answers
- ✅ `/api/invite/[code]/join` - Join via invite

**Remaining Routes (4/12 - 33%):** 🟡
- 🔄 `/api/secrets/[id]/unlock` - Unlock mechanism (game core)
- 🔄 `/api/secrets/[id]/rate` - Rating system
- 🔄 `/api/rooms/[id]/questions` - Helper endpoint
- 🔄 `/api/invite/[code]` - Invite preview

**What Works Now:**
- ✅ Room creation with question selection
- ✅ Complete setup and enter play mode
- ✅ Answer questions (all types: text, slider, MC, images)
- ✅ View your secrets and collaborative answers
- ✅ Join rooms via invite links
- ✅ Data persists across server restarts

### Priority 1: Complete Phase 6 (4 hours remaining) 🟡
**See:** [PHASE_6_COMPLETE_SUMMARY.md](planning/PHASE_6_COMPLETE_SUMMARY.md) for detailed status

**Remaining Tasks:**
1. [x] ~~Set up Supabase (database + auth + storage)~~
2. [x] ~~Migrate database schema from mock to Postgres~~
3. [x] ~~Implement Google OAuth login~~
4. [x] ~~Add profile photo upload capability~~
5. [x] ~~Migrate core API routes (8/12 complete)~~
6. [ ] Migrate remaining 4 API routes (unlock, rate, helpers)
7. [ ] Move images from base64 to Blob storage
8. [ ] Deploy to Vercel with production backend
9. [ ] Test end-to-end with real users

**Status:** 24 / 28-32 hours complete
**Estimated Remaining:** 4-8 hours (1 focused session)

### Completed Phases ✅
1. [x] **Phase 1:** Critical Path (invite system, user identity) - Works with mock DB
2. [x] **Phase 2:** Image Upload System (drag-drop, storage, display)
3. [x] **Phase 3:** Enhanced Questions (collaborative view, custom MC options)

---

## 🔮 Future Roadmap (V1+)

Per PROJECT_PLAN.md:
- Real authentication (Google OAuth via Auth.js)
- Supabase integration with RLS policies
- Real-time updates (15s polling initially)
- Categories & templates
- Basic moderation (report/hide)
- Owner tools
- Analytics & error logging
- Profile drawer
- Optional titles for secrets
- Filters and improved feed sort

---

## 💻 Development Commands

```bash
# Development
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build + TypeScript check
npm run lint         # ESLint check

# Testing
npm run test:e2e     # Playwright tests
npm run test:e2e:ui  # Playwright with UI
node screenshot.js   # Full-page screenshot

# Git Workflow (ALWAYS use feature branches)
git checkout -b feature/your-feature
git add . && git commit -m "feat: your changes"
git push -u origin feature/your-feature
```

---

## 📁 Key Files & Locations

- `/src/app/` - Next.js App Router pages
- `/src/components/` - React components
- `/src/lib/db/mock.ts` - Mock database (being replaced)
- `/src/lib/db/supabase.ts` - **NEW:** Supabase query layer ✨
- `/src/lib/db/schema.ts` - Drizzle ORM schema (7 tables)
- `/src/lib/blob-storage.ts` - **NEW:** Vercel Blob utilities ✨
- `/src/lib/questions.ts` - Question system logic
- `/src/lib/api/helpers.ts` - API utilities
- `/src/components/auth/` - **NEW:** Auth UI components ✨
- `/data/questions.md` - Question content source
- `/planning/` - Project planning documents
- `/CLAUDE.md` - AI assistant instructions

---

## 🎨 Design System

### Whisk-Inspired Card Styling
```css
/* Base card */
rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-white border border-gray-200

/* Hover state */
hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1

/* Grid layout */
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6
```

### Tag Colors
- **Blue**: Categories
- **Green**: Topics
- **Orange**: Priority
- **Purple**: Moods
- **Gray**: Formats

---

## 🔐 Security & Privacy

- Secrets only visible to author + "buyers"
- Room access via unique invite codes
- No PII logging in development
- Cookie-based temp users (no passwords)
- 20 member cap per room enforced

---

## 📝 Notes for New Agents

1. **Always work on feature branches** - never commit directly to main
2. **Follow Whisk design principles** - cards, shadows, tactile feel
3. **Use mock database** - `lib/db/mock.ts` for all data operations
4. **Build must pass** - Run `npm run build` before committing
5. **Check CLAUDE.md** - Comprehensive guide for AI assistants
6. **Multiple dev servers running** - Check background processes if needed

---

## 🐛 Debugging Tips

- Use `node screenshot.js` for visual debugging
- Check cookies for userId: `document.cookie`
- Mock DB persists via global: `globalThis.__mockDb`
- API responses use helpers: `successResponse()`, `errorResponse()`
- Next.js 15 async params: `const id = (await params).id`

---

**Ready for Next Phase**: The foundation is solid. Room creation and question system are complete. Next step is implementing the core secret sharing and unlock mechanism to make the game playable.