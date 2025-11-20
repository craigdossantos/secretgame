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
- **State**: React state + mock database (no global state management)
- **Database**: Mock in-memory implementation (`lib/db/mock.ts`)
- **Auth**: Cookie-based temporary users (no OAuth yet)
- **API**: Next.js route handlers with TypeScript validation
- **Animations**: Framer Motion for card interactions

### Architectural Decisions
1. **Simplified from Drizzle/Supabase** to mock database for faster MVP development
2. **Temporary user system** using cookies instead of full auth
3. **Mock database persists** across hot reloads using global singleton
4. **No real-time updates** - planning 15s polling for V1
5. **Build successfully deploys** to Vercel

---

## ✅ Completed Features

### Infrastructure
- [x] Next.js project with TypeScript strict mode
- [x] Tailwind CSS + shadcn/ui setup (Button, Card, Input, Label, Textarea, Slider, Badge, Avatar, Dialog, Sonner)
- [x] Mock database with full CRUD operations
- [x] API route handlers with proper error handling
- [x] Cookie-based temporary user system
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

### What's Working
- Full room creation flow with question selection
- Custom question creation with tags and image upload toggle
- Mock database persistence across hot reloads
- Homepage with refreshable questions (redesigned with visual synopsis)
- Admin interface for managing questions
- Whisk-inspired card UI with hover effects
- Click-to-reveal pattern for secrets
- **Image upload system** - complete drag-and-drop with preview and modal viewer
- Build passes TypeScript strict mode
- Successfully deployed to Vercel

### Recent Improvements (January 2025)
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
- Multiple dev servers running (background processes)
- Turbopack for fast refresh
- Hot reload working properly
- Mock data persists during development

### Known Issues & Technical Debt
1. **Next.js 15 Async Params** - Using `(await params).id` pattern
2. **Multiple Dev Servers** - Several npm run dev processes in background
3. **No Real Auth** - Using cookies for temporary users
4. **Mock Database Only** - Need to migrate back to Supabase for production
5. **No Polling** - Static data, no real-time updates
6. **No Invite System Yet** - `/invite/[code]` route doesn't exist (Phase 1 blocker)

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

**Current Priority: Phase 1 - Critical Path to Launch**

### Priority 1: Invite System (Launch Blocker) 🔴
Per PROJECT_PLAN.md Phase 1 (8-12 hours):
1. [ ] Create `/invite/[code]` page and landing UI
2. [ ] Create invite API endpoints (GET room info, POST join)
3. [ ] Implement name prompt modal for new users
4. [ ] Add user identity display in header
5. [ ] Create basic onboarding/welcome modal
6. [ ] Test complete invite flow end-to-end

### Priority 2: Phase 1 Polish (Quick Wins)
1. [ ] Show current user name in header with edit icon
2. [ ] "How to Play" link with instructions
3. [ ] Handle edge cases (invalid code, full room, existing user)

### Priority 3: Phase 3 - Enhanced Questions ✅ COMPLETED (January 2025)
Per PROJECT_PLAN.md Phase 3 (10-14 hours):
1. [x] Collaborative question view ("View All Answers" button)
2. [x] Multiple choice custom options ("Other" field)
3. [x] "Who picked what" results view with avatars

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
- `/src/lib/db/mock.ts` - Mock database implementation
- `/src/lib/questions.ts` - Question system logic
- `/src/lib/api/helpers.ts` - API utilities
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