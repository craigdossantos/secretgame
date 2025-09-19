# The Secret Game — V0 Project Plan

## Executive Summary
A minimal, playable web prototype for small friend groups (≤20) to exchange secrets via an invite URL. Cards are the primary UI, styled after Google Labs Whisk: airy, tactile, low‑chrome. To unlock ("buy") a secret, a player submits a new secret with the same self‑rated secrecy (1–5). After viewing, buyers rate the secret; the displayed rating is the arithmetic mean of the submitter rating plus all buyer ratings. V0 focuses on speed to playable with tight scope.

---

## ✅ Completed Tasks

### Infrastructure & Setup
- [x] **Next.js project setup** - TypeScript, Tailwind CSS, App Router
- [x] **shadcn/ui configuration** - Button, Card, Input, Label, Textarea, Slider, Badge, Avatar, Dialog, Sonner components
- [x] **Database schema design** - Drizzle ORM with PostgreSQL
- [x] **Auth.js configuration** - Google OAuth setup with DrizzleAdapter
- [x] **Project structure** - Core directories and configuration files

### Database Schema
- [x] **users table** - id, email, name, avatar_url, created_at
- [x] **rooms table** - id, name, owner_id, invite_code, max_members, created_at
- [x] **room_members table** - room_id, user_id, joined_at (composite PK)
- [x] **secrets table** - id, room_id, author_id, body, self_rating, importance, avg_rating, buyers_count, created_at, is_hidden
- [x] **secret_access table** - id, secret_id, buyer_id, created_at
- [x] **secret_ratings table** - id, secret_id, rater_id, rating, created_at
- [x] **Indexes and constraints** - Performance optimizations and RLS preparation

---

## 🔄 In Progress

### Core Components
- [ ] **SecretCard component** - Locked/unlocked variants with Whisk styling
- [ ] **UnlockDrawer component** - Inline submit form with rating sliders
- [ ] **RatingStars component** - 1-5 star rating system
- [ ] **RoomMembersBar component** - Horizontal avatar strip
- [ ] **ImportanceSlider component** - 1-5 importance rating
- [ ] **LoadingSkeleton component** - Card grid skeleton states

---

## ⏳ Pending Tasks

### API Implementation
- [ ] **POST /api/rooms** - Create room → returns { inviteUrl }
- [ ] **POST /api/rooms/:id/join** - Validate invite → add to room_members
- [ ] **GET /api/rooms/:id** - Room info + members + paginated secret metadata
- [ ] **POST /api/secrets** - Create secret (standalone submit)
- [ ] **POST /api/secrets/:id/unlock** - Unlock with matching rating validation
- [ ] **POST /api/secrets/:id/rate** - Rate secret and update avg_rating

### Core Features
- [ ] **Room creation flow** - Minimal form with optional name
- [ ] **Invite URL system** - Shareable links with unique codes
- [ ] **Join room flow** - Google OAuth on invite URL visit
- [ ] **Secret submission** - Body (≤100 words), self_rating, importance
- [ ] **Unlock mechanism** - Submit secret with exact matching rating
- [ ] **Rating system** - 1-5 stars with arithmetic mean calculation
- [ ] **Access control** - Body visible only to author and buyers

### UI/UX Implementation
- [ ] **Card grid layout** - Responsive grid with hover effects
- [ ] **Whisk-inspired styling** - Cards with rounded-2xl, shadows, hover animations
- [ ] **Motion design** - Framer Motion micro-interactions
- [ ] **Empty states** - "No secrets yet—be the first to post"
- [ ] **Loading states** - Skeleton components during data fetching
- [ ] **Toast notifications** - Success/error feedback
- [ ] **Word counter** - Real-time validation (≤100 words)

### Authentication & Security
- [ ] **Google OAuth flow** - Sign in page and session management
- [ ] **Route protection** - Middleware for authenticated routes
- [ ] **RLS policies** - Row-level security for data access
- [ ] **Input validation** - Server-side word count and rating validation

---

## Scope & Rules (V0)

### ✅ Completed Rules
- [x] Database supports 20-member room cap
- [x] Auth schema ready for Google OAuth
- [x] Secret fields: body, self_rating (1–5), importance (1–5)
- [x] Rating calculation schema (arithmetic mean)

### ⏳ Pending Rules
- [ ] One‑off, persistent rooms with shareable invite URL
- [ ] Google OAuth upon visiting invite URL
- [ ] Title omitted to reduce friction
- [ ] Unlock rule: exact self_rating match
- [ ] Instant unlock mechanism
- [ ] Body visible only to author and buyers
- [ ] No edits/deletes (submit warning)
- [ ] Polling instead of realtime (15s intervals)

---

## Visual & Interaction Design

### Card Grid
- [ ] Responsive: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`
- [ ] Cards: `rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-white/95 border border-black/5`
- [ ] Hover: slight lift, 1–2° tilt, shadow deepen
- [ ] Focus: `ring-2 ring-offset-2 ring-black/10`

### Card States
- [ ] **Locked**: Header + badges + blurred teaser + unlock CTA
- [ ] **Unlocked**: Header + badges + full text + rating interface

### Motion & Interactions
- [ ] Framer Motion hover/press effects
- [ ] Grid entrance stagger animation
- [ ] Smooth transitions between states

---

## UX Flow Checklist

1. [ ] **Create Room** → minimal form → get invite URL
2. [ ] **Join Room** → open URL → Google OAuth → Card Grid
3. [ ] **Browse Cards** → tap locked card → drawer/modal opens
4. [ ] **Unlock** → inline form → submit → reveal content
5. [ ] **Rate** → 1–5 stars → card average updates

---

## Tech Stack Status

### ✅ Implemented
- Frontend: Next.js (App Router), React, TypeScript, Tailwind
- UI: shadcn/ui components
- Database: Schema designed with Drizzle ORM
- Auth: Auth.js configuration ready

### ⏳ Pending
- Database: Supabase connection and RLS policies
- Auth: Google OAuth credentials and flow
- Storage: N/A (text only)
- Realtime: 15s polling implementation
- Deploy: Vercel deployment
- Observability: Deferred to V1

---

## Milestones & Timeline

### M0 – Scaffold ✅ (Completed)
- [x] Repo setup
- [x] Tailwind/shadcn theme
- [x] Auth.js (Google) configuration
- [x] Supabase schema
- [ ] Vercel deploy

### M1 – Cards & Access (Days 2–4)
- [ ] Card grid (locked/unlocked)
- [ ] UnlockDrawer with validation
- [ ] Gated body delivery
- [ ] RatingStars + avg update

### M2 – Polish (Days 5–6)
- [ ] Members bar
- [ ] Word counter
- [ ] Skeletons, empty states
- [ ] Polling (15s)
- [ ] Optimistic UI
- [ ] Copy pass
- [ ] Light QA

---

## Acceptance Criteria (V0)

- [ ] Create room and join via invite URL + Google OAuth
- [ ] Room caps at 20 members
- [ ] Card grid with Whisk‑like visuals
- [ ] Locked cards hide body with blurred teaser
- [ ] Unlock: submit secret with matching rating → instant reveal
- [ ] Rate 1–5 after viewing → updated average (1 decimal)
- [ ] Word limit enforced (≤100 words)
- [ ] Importance slider captured
- [ ] Members bar shows avatars, reflects changes on refresh/poll

---

## Copy & Micro‑text

- [ ] Locked CTA: "Unlock by submitting a level {X} secret"
- [ ] Rating prompt: "How secret did this feel?"
- [ ] Importance label: "Keep‑it‑private: {n}/5"
- [ ] Submit warning: "No edits in V0—post carefully."
- [ ] Empty state: "No secrets yet—be the first."

---

## Configuration Decisions

- [ ] **Polling interval**: 15s
- [ ] **Rating rounding**: 1 decimal
- [ ] **Unlock rule**: Exact match (not ≥)
- [ ] **Importance**: Metadata only (no economic effect)

---

## Environment Setup Required

### .env.local Variables Needed:
```bash
# Supabase (need real values)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
DATABASE_URL=your_database_url_here

# Auth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Google OAuth (need real values)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

---

## Next Steps

1. **Set up Supabase project** and get real environment variables
2. **Configure Google OAuth** in Google Cloud Console
3. **Build SecretCard component** with Whisk styling
4. **Implement UnlockDrawer** with rating sliders
5. **Create API routes** for rooms and secrets
6. **Add Framer Motion animations**
7. **Test end-to-end flow**
8. **Deploy to Vercel**

---

## Future (V1+)
- Categories & templates
- Realtime updates
- Basic moderation (report/hide)
- Owner tools
- Analytics & error logging
- Profile drawer
- Optional titles
- Filters
- Improved feed sort