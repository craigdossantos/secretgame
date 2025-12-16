# Task List: Code Review & Cleanup
Created: 2024-12-15
Status: In Progress

## Tasks

### Critical - Must Fix Before Publishing
- [x] Fix ESLint warnings (9 total) - these break Vercel builds
  - Verification: `npm run lint` shows 0 warnings ✅
- [x] Run Prettier to format all files (48+ files need formatting)
  - Verification: `npx prettier --check "src/**/*.{ts,tsx}"` passes ✅

### High Priority - Code Quality
- [x] Remove unused import `QuestionCard` from `src/app/rooms/[id]/page.tsx:5`
  - Verification: ESLint no longer flags this line ✅
- [x] Remove or use `userSpicinessRatings` state at `src/app/rooms/[id]/page.tsx:93`
  - Verification: ESLint warning resolved ✅
- [x] Remove or use `handleSubmitAnswer` function at `src/app/rooms/[id]/page.tsx:272`
  - Verification: ESLint warning resolved ✅
- [x] Remove or use `handleRateSpiciness` function at `src/app/rooms/[id]/page.tsx:496`
  - Verification: ESLint warning resolved ✅
- [x] Fix `_showAverage` unused variable in `src/components/chili-rating.tsx:20`
  - Verification: ESLint warning resolved ✅
- [x] Remove unused `loading`, `setLoading`, `error` state in `src/components/setup-mode-view.tsx:23-24`
  - Verification: ESLint warning resolved ✅
- [x] Remove unused `expect` import in `tests/debug.spec.ts:1`
  - Verification: ESLint warning resolved ✅
- [x] Remove `showAverage` prop from `ChiliRating` and usages in `question-card.tsx`
  - Verification: TypeScript compilation passes ✅
- [x] Fix unused `_q` parameter in `rooms/[id]/page.tsx` onAnswer callback
  - Verification: ESLint warning resolved ✅
- [x] Remove debug console.log statements (6 instances in rooms/[id]/page.tsx)
  - Verification: No console.log in production code ✅

### Medium Priority - Architecture Improvements
- [ ] Refactor `src/app/rooms/[id]/page.tsx` (now ~960 lines - still exceeds 200 line guideline)
  - Verification: File is under 200 lines after extraction
- [ ] Consolidate duplicate custom question mapping logic in room page
  - Verification: Single mapping function, DRY code

### Low Priority - Documentation & Polish
- [ ] Update README.md with actual project description (currently boilerplate)
  - Verification: README describes The Secret Game
- [ ] Create PROJECT_PLAN.md (referenced in CLAUDE.md but doesn't exist)
  - Verification: File exists with roadmap

## Progress Log
- 2024-12-15 Created task list from code review
- 2024-12-15 Completed all critical and high priority tasks:
  - Ran Prettier on 48+ files
  - Fixed all 9 ESLint warnings
  - Removed unused imports, state variables, and functions
  - Removed debug console.log statements
  - Build passes successfully
