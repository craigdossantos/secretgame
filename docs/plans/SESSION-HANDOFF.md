# Session Handoff: User Flow Redesign

## Current State

**Branch:** `feature/user-flow`
**Status:** ALL TASKS COMPLETE - Ready for manual testing and PR

## Completed Tasks

### Task 1: Slug Utilities (COMPLETE)

- `src/lib/slug.ts` - generateSlug, isValidSlug, normalizeSlug functions
- `src/lib/db/schema.ts` - Added slug and isAnonymous columns to rooms table
- `src/lib/db/supabase.ts` - Added findRoomBySlug and isSlugAvailable functions

### Task 2: Pending Answer Hook (COMPLETE)

- `src/hooks/use-pending-answer.ts` - localStorage storage for pre-auth answers with 30-min expiry

### Task 3: Modify Homepage Flow (COMPLETE)

**File:** `src/app/page.tsx`

Changes made:

- Replaced "How It Works" explainer with `QuestionSelector` component
- Set `maxSelections={1}` for single question selection
- Added inline answer form (Textarea + anonymous checkbox) when question selected
- CTA button: "Get your friends' answers" with subtext "They only see yours once they answer"
- On submit: saves pending answer → triggers Google auth
- After auth: creates room with answer → redirects to room page

### Task 4: Update Room Creation API (COMPLETE)

**File:** `src/app/api/rooms/route.ts`

Changes made:

- Accepts `slug` in request (or auto-generates using `generateSlug()`)
- Accepts `questionId`, `questionText`, and `answer` to create room with creator's first answer
- Accepts `isAnonymous` flag
- Returns `slug` and `slugUrl` in response

### Task 5: Add /[slug] Route (COMPLETE)

**New Files:**

- `src/app/[slug]/page.tsx` - Room page by slug
- `src/app/api/rooms/slug/[slug]/route.ts` - GET room data by slug
- `src/app/api/rooms/slug/[slug]/answers/route.ts` - POST answer to room

Features:

- Loads room by slug
- Shows question + participant count
- Answer form for users who haven't answered
- Reveals all answers after user submits
- Share functionality with native share (mobile) and copy (desktop)

### Task 6: Wire Pending Answer to Auth (COMPLETE)

Implemented directly in pages (alternative to LoginButton callback approach):

- Homepage saves pending answer before `signIn()`, processes after auth
- Slug page saves pending answer with slug field before auth, processes after redirect
- Both pages have `useEffect` hooks that auto-submit pending answers after OAuth redirect

### Task 7: Build Verification (COMPLETE)

- `npm run build` passes ✓
- `npm run lint` passes (only expected warnings about useCallback dependencies)
- Code reviews completed via superpowers agents

## Files Changed Summary

| File                                             | Status   | Description                                      |
| ------------------------------------------------ | -------- | ------------------------------------------------ |
| `src/app/page.tsx`                               | Modified | New homepage with QuestionSelector + answer flow |
| `src/app/[slug]/page.tsx`                        | New      | Room page for joiner flow                        |
| `src/app/api/rooms/route.ts`                     | Modified | Accepts slug, questionId, answer                 |
| `src/app/api/rooms/slug/[slug]/route.ts`         | New      | GET room by slug                                 |
| `src/app/api/rooms/slug/[slug]/answers/route.ts` | New      | POST answer to room                              |

## Manual Testing Checklist

### Creator Flow

- [ ] Homepage shows question grid
- [ ] Clicking question shows answer form
- [ ] Submitting answer triggers Google auth
- [ ] After auth, redirects to room page
- [ ] Room has shareable slug URL

### Joiner Flow

- [ ] Opening slug URL shows question and participant count
- [ ] Answer form appears for new users
- [ ] Submitting triggers auth
- [ ] After auth, all answers are revealed
- [ ] Share/ask your question CTAs appear

### Edge Cases

- [ ] Anonymous mode hides names
- [ ] Pending answer survives OAuth redirect
- [ ] Invalid slug shows error page

## Next Steps

1. Manual testing of both flows
2. Create PR to merge `feature/user-flow` into main
3. Deploy to Vercel for production testing
