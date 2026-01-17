# Session Handoff: User Flow Redesign

## Current State

**Branch:** `feature/user-flow`
**Last Commit:** `d510cfd` - cleanup: remove duplicate components, keep lean plan

## What's Done

### Task 1: Slug Utilities (COMPLETE)

- `src/lib/slug.ts` - generateSlug, isValidSlug, normalizeSlug functions
- `src/lib/db/schema.ts` - Added slug and isAnonymous columns to rooms table
- `src/lib/db/supabase.ts` - Added findRoomBySlug and isSlugAvailable functions

### Task 2: Pending Answer Hook (COMPLETE)

- `src/hooks/use-pending-answer.ts` - localStorage storage for pre-auth answers with 30-min expiry

## What's Remaining (5 Tasks)

### Task 3: Modify Homepage Flow

**File:** `src/app/page.tsx`

Modify (don't rewrite) to:

- Replace "How It Works" explainer with `QuestionSelector` component (from `src/components/question-selector.tsx`)
- Set `maxSelections={1}` for single question selection
- When question selected → show inline answer form (Textarea + anonymous checkbox)
- CTA button: "Get your friends' answers" with subtext "They only see yours once they answer"
- On submit: if not authenticated → save to pending answer hook → trigger Google auth
- After auth: create room with answer → show share screen with editable slug

### Task 4: Update Room Creation API

**File:** `src/app/api/rooms/route.ts`

Modify to:

- Accept `slug` in request (or auto-generate using `generateSlug()`)
- Accept `questionId` and `answer` to create room with creator's first answer
- Accept `isAnonymous` flag
- Return `slug` in response for share URL construction

### Task 5: Add /[slug] Route

**File:** `src/app/[slug]/page.tsx` (NEW - only new file needed)

Create route that:

- Loads room by slug using `findRoomBySlug()`
- Shows question + participant count (who has answered)
- If user hasn't answered: show answer form
- If user has answered: show all answers using `SecretsFeed` component
- Reuse `RoomHeader` for display

### Task 6: Wire Pending Answer to Auth

**Files:** `src/app/page.tsx`, `src/app/[slug]/page.tsx`, `src/components/auth/login-button.tsx`

- Modify `LoginButton` to accept `onBeforeSignIn` callback
- Before auth: save answer via `usePendingAnswer` hook
- After OAuth redirect: check for pending answer, auto-submit

### Task 7: Build Verification

- Run `npm run build` and fix TypeScript errors
- Run `npm run lint` and fix lint errors
- Manual test creator flow: homepage → select question → answer → auth → share
- Manual test joiner flow: /[slug] → answer → auth → reveal answers

## Key Existing Components to REUSE

| Component          | Location                               | Purpose                      |
| ------------------ | -------------------------------------- | ---------------------------- |
| `QuestionSelector` | `src/components/question-selector.tsx` | Question grid with selection |
| `LoginButton`      | `src/components/auth/login-button.tsx` | Google sign-in               |
| `SecretsFeed`      | `src/components/secrets-feed.tsx`      | Display answers              |
| `RoomHeader`       | `src/components/room-header.tsx`       | Room header display          |
| `useRoomData`      | `src/hooks/use-room-data.ts`           | Room data fetching           |

## Reference Files

- **Design Doc:** `docs/plans/2025-01-16-user-flow-redesign.md`
- **Lean Plan:** `/Users/craigdossantos/.claude/plans/radiant-weaving-gray.md`
- **Current Homepage:** `src/app/page.tsx`
- **Room API:** `src/app/api/rooms/route.ts`
- **Slug Utils:** `src/lib/slug.ts`
- **Pending Hook:** `src/hooks/use-pending-answer.ts`

## Start Command for New Session

```
Continue implementing the user flow redesign on branch feature/user-flow.

Read docs/plans/SESSION-HANDOFF.md for context. Tasks 1-2 are done.
Start with Task 3: Modify the homepage (src/app/page.tsx) to use the
existing QuestionSelector component with maxSelections={1}.

Key principle: REUSE existing components, don't rebuild them.
```
