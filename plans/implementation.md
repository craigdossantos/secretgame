# Code Review Report: The Secret Game
Created: 2024-12-15

## Overview

Comprehensive code review of the Secret Game repository analyzing code quality, unused code, architecture issues, and production readiness.

---

## Executive Summary

| Category | Status | Issues Found |
|----------|--------|--------------|
| **ESLint** | ⚠️ Warnings | 9 warnings (will fail Vercel) |
| **Prettier** | ❌ Needs Formatting | 48+ files unformatted |
| **Build** | ✅ Passing | Compiles successfully |
| **Tests** | ✅ Present | Playwright e2e configured |
| **Documentation** | ⚠️ Incomplete | README is boilerplate |

**Overall Assessment**: The codebase is functional but needs cleanup before publishing. ESLint warnings will cause Vercel deployment failures.

---

## 1. ESLint Issues (9 Warnings)

All warnings are `@typescript-eslint/no-unused-vars`:

### Critical File: `src/app/rooms/[id]/page.tsx`
| Line | Variable | Issue |
|------|----------|-------|
| 5 | `QuestionCard` | Imported but never used |
| 93 | `userSpicinessRatings` | State declared but never used |
| 272 | `handleSubmitAnswer` | Function defined but never used |
| 496 | `handleRateSpiciness` | Function defined but never used |

**Root Cause**: This file was refactored to use `SingleQuestionView` but old code wasn't cleaned up.

### Other Files
| File | Line | Variable | Issue |
|------|------|----------|-------|
| `chili-rating.tsx` | 20 | `_showAverage` | Destructured but not used |
| `setup-mode-view.tsx` | 23 | `loading` | Declared but not used |
| `setup-mode-view.tsx` | 23 | `setLoading` | Declared but not used |
| `setup-mode-view.tsx` | 24 | `error` | Declared but not used |
| `tests/debug.spec.ts` | 1 | `expect` | Imported but not used |

---

## 2. Prettier Formatting Issues

**48 files** need formatting. Key files:
- All API routes (`src/app/api/**/*.ts`)
- All components (`src/components/*.tsx`)
- All pages (`src/app/*.tsx`, `src/app/**/page.tsx`)

**Fix**: Run `npx prettier --write "src/**/*.{ts,tsx}"`

---

## 3. Code Architecture Issues

### 3.1 Oversized Component
**File**: `src/app/rooms/[id]/page.tsx`
**Lines**: 996 (guideline: <200)

**Problems**:
1. Contains inline skeleton components that should be extracted
2. Duplicate mapping logic for custom questions (lines 141-170 and 192-221)
3. Multiple debug console.log statements
4. Many state variables that could be consolidated

**Recommendation**: Extract into:
- `QuestionCardSkeleton.tsx`
- `SecretCardSkeleton.tsx`
- `RoomHeader.tsx`
- `QuestionsSection.tsx`
- `SecretsSection.tsx`

### 3.2 Debug Logging in Production Code
Multiple console.log statements should be removed:
```tsx
console.log('🏠 LOADING CUSTOM QUESTIONS');
console.log('Custom questions from API:', roomData.room.customQuestions);
console.log('📋 MAPPED CUSTOM QUESTIONS:', customQuestions);
```

### 3.3 Unused Destructured Props
In `chili-rating.tsx`, `showAverage` is destructured but prefixed with `_` to suppress the warning - this should either be implemented or removed.

---

## 4. Unused Code Analysis

### 4.1 Potentially Unused Components
| Component | File | Used? |
|-----------|------|-------|
| `QuestionCard` | `question-card.tsx` | Imported but not rendered in room page |
| `RatingStars` | `rating-stars.tsx` | Need to verify usage |

### 4.2 Dead Functions
| Function | Location | Reason |
|----------|----------|--------|
| `handleSubmitAnswer` | `rooms/[id]/page.tsx:272` | Replaced by `SingleQuestionView` handling |
| `handleRateSpiciness` | `rooms/[id]/page.tsx:496` | Never wired to any component |

### 4.3 Unused State
| State | Location | Reason |
|-------|----------|--------|
| `userSpicinessRatings` | `rooms/[id]/page.tsx:93` | Intended for tracking but never read |
| `loading`, `error` | `setup-mode-view.tsx:23-24` | Loading state handled differently |

---

## 5. Missing Features for Production

### 5.1 Documentation
- **README.md**: Contains Next.js boilerplate, not project description
- **PROJECT_PLAN.md**: Referenced in CLAUDE.md but doesn't exist

### 5.2 Missing Functionality (Based on CLAUDE.md)
| Feature | Status | Notes |
|---------|--------|-------|
| Real-time polling | ❌ Not Implemented | "Planned: 15s intervals" |
| Real database | ⚠️ Partial | Drizzle + Supabase code exists but uses mock in some places |
| NextAuth.js | ✅ Implemented | Google OAuth working |
| Cookie-based temp users | ✅ Implemented | Fallback for anonymous |

### 5.3 Database Architecture Confusion
The codebase has **dual database implementations**:
1. `src/lib/db/mock.ts` - In-memory mock database
2. `src/lib/db/supabase.ts` - Real Drizzle/PostgreSQL queries

**Issue**: Some routes may still use mock, others use Supabase. Need consistent approach.

---

## 6. Security Considerations

### 6.1 Good Practices Already In Place
- NextAuth.js for authentication
- JWT sessions (not storing sensitive data)
- Input validation on API routes

### 6.2 Areas to Review
- No rate limiting on API endpoints
- Console.log statements could leak data
- Error messages may expose internal details

---

## 7. Dependencies Analysis

### Production Dependencies (14)
All seem necessary and up-to-date:
- Next.js 15.5.3 (latest)
- React 19.1.0 (latest)
- Tailwind CSS 4.x (latest)
- Framer Motion 12.x (latest)

### Dev Dependencies
- Playwright properly configured for e2e testing
- TypeScript 5.x
- ESLint 9.x

### Missing Dependencies
- **Prettier not in devDependencies** - Should be added
- No unit testing framework (only e2e)

---

## 8. Files to Delete/Clean

### Potentially Unused Files
Need verification before deletion:
```
src/components/rating-stars.tsx - Verify if used
tests/debug.spec.ts - Contains only unused import
```

### Debug Files
```
public/mockups/ - Directory should not be in production?
homepage-debug.png - Debug artifact
homepage-updated.png - Debug artifact
```

---

## 9. Production Readiness Checklist

### Must Complete
- [ ] Fix all 9 ESLint warnings
- [ ] Run Prettier on all files
- [ ] Remove debug console.log statements
- [ ] Update README.md with project description
- [ ] Decide on database approach (mock vs Supabase)

### Should Complete
- [ ] Refactor oversized room page component
- [ ] Add Prettier to devDependencies
- [ ] Create PROJECT_PLAN.md
- [ ] Remove unused functions and state

### Nice to Have
- [ ] Add unit tests
- [ ] Implement real-time polling
- [ ] Add rate limiting
- [ ] Add error boundaries

---

## 10. Recommended Fix Order

1. **Run Prettier** - Quick win, fixes 48+ files
2. **Fix ESLint warnings** - Required for Vercel deployment
3. **Remove debug logs** - Clean production code
4. **Update README** - Professional presentation
5. **Refactor room page** - Technical debt reduction

---

## Technical Approach

### Phase 1: Quick Cleanup (Est. 30 min)
1. Add Prettier to devDependencies
2. Run `npx prettier --write "src/**/*.{ts,tsx}"`
3. Remove unused imports and variables
4. Run `npm run build` to verify

### Phase 2: Code Quality (Est. 1-2 hours)
1. Extract skeleton components
2. Remove duplicate code
3. Remove debug console.logs
4. Refactor room page into smaller components

### Phase 3: Documentation (Est. 30 min)
1. Update README.md
2. Create PROJECT_PLAN.md with roadmap

---

## Conclusion

The Secret Game has solid foundations with modern tech (Next.js 15, React 19, Tailwind 4) and follows good patterns in most areas. However, it has accumulated technical debt during rapid development:

1. **Blocker**: ESLint warnings will fail Vercel deployments
2. **High Priority**: 48+ unformatted files reduce maintainability
3. **Medium Priority**: 996-line component violates style guide

The codebase is deployable after fixing ESLint warnings, but investing in cleanup will significantly improve maintainability.
