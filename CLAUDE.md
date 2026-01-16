# CLAUDE.md - The Secret Game

> AI assistant playbook for **The Secret Game**: a card-based secret sharing app for small friend groups. Ship maintainable features quickly with tests and accessibility baked in. Prefer small, reversible changes.

---

## 1) Purpose & Operating Rules

**Mission Statement**

The Secret Game enables small friend groups (≤20) to exchange secrets via invite URLs. Users unlock secrets by submitting secrets of matching "spiciness" levels. UI inspired by Google Labs Whisk with tactile, card-based design.

**Non-negotiables**

- **ALWAYS** work on feature branches - never directly on main
- Prefer **small, focused changes** (<400 lines) with proper testing
- Ask before destructive actions (schema changes, secrets, deletes)
- Follow commands and conventions defined here
- Maintain Art Deco Gatsby card design principles
- Keep secrets private (only author + "buyers" see content)

**Current Status & Context**

- ✅ **MVP Complete**: Question prompts, unified tagging, room system
- ✅ **Build Ready**: Successfully deployed to Vercel
- 🔄 **Architecture**: Mock database (simplified from Drizzle/Supabase)
- 📋 **Roadmap**: See PROJECT_PLAN.md for V1+ features

---

## 2) Architecture Snapshot

- **Framework:** Next.js 15.5.3 (App Router) + Turbopack for development
- **Styling:** Tailwind CSS 4.x + shadcn/ui (Radix UI primitives)
- **State:** React state + mock database; no global state management
- **Data:** Mock implementation in `src/lib/db/mock.ts` (prepared for Drizzle + Postgres)
- **Auth:** Cookie-based temporary users (prepared for NextAuth.js)
- **API:** Route handlers under `src/app/api/*`; mock database operations
- **Build:** TypeScript strict; ESLint configured
- **Testing:** Playwright for e2e; unit testing with built-in Next.js tools
- **Animations:** Framer Motion for card interactions and micro-animations

**Key Design Constraints**

- Card-first UI with Art Deco Gatsby styling (gold borders, dark backgrounds)
- Gamified interactions (🌶️ spiciness ratings, unlock mechanism)
- Privacy-first (secrets gated behind "unlocking" system)
- Mobile-responsive with tactile hover effects

---

## 3) Commands Claude Should Use

> Claude: prefer these exact commands; do not invent alternatives unless asked.

**Install & bootstrap**

- `npm install` — install dependencies
- `npm run dev` — dev server (with Turbopack)
- `npm run build && npm start` — production build & run

**Quality gates**

- `npm run build` — TypeScript strict + production build
- `npm run lint` — ESLint (warnings become errors on Vercel)
- `npm run test:e2e` — Playwright e2e tests
- `npm run test:e2e:ui` — Playwright with UI
- `npm run test:e2e:debug` — Playwright debug mode

**Project helpers**

- `node screenshot.js` — take full-page screenshot for debugging
- `git add . && git commit -m "..."` — commit with AI attribution format

**Development Notes**

- Server runs on http://localhost:3000 (or next available port)
- Turbopack enables fast refresh and hot reload
- Build must pass before deployment to Vercel

---

## 4) File/Folder Conventions

- `src/app/` — Next.js App Router; uses pages not route groups
- `src/app/page.tsx` — homepage with question prompts grid
- `src/app/create/page.tsx` — room creation flow
- `src/app/rooms/[id]/page.tsx` — room view with secrets
- `src/app/admin/page.tsx` — question management interface
- `src/app/api/*` — route handlers; validate with TypeScript interfaces
- `src/components/ui/*` — shadcn/ui primitives (Button, Card, etc.)
- `src/components/*` — feature components; colocate related logic
- `src/lib/*` — pure helpers and business logic
- `src/lib/db/mock.ts` — mock database implementation
- `src/lib/questions.ts` — question parsing and tag management
- `src/data/questions.md` — markdown source for question content
- `src/types/` — centralized TypeScript type definitions
- `src/hooks/` — custom React hooks

**Naming**

- Components: `PascalCase.tsx` (e.g., `QuestionCard`)
- Files: `kebab-case.tsx` (e.g., `question-card.tsx`)
- API routes: RESTful (`/api/rooms`, `/api/rooms/[id]`)
- Interfaces: match component names (`QuestionCardProps`)

**Component Structure**

```tsx
interface ComponentProps {
  // Props interface first
}

export function Component({ prop }: ComponentProps) {
  // 1. Hooks
  const [state, setState] = useState();

  // 2. Event handlers
  const handleEvent = () => {};

  // 3. Render
  return <div />;
}
```

---

## 5) UI & Accessibility Expectations

**Design System (Art Deco Gatsby Theme)**

The project uses a luxury Art Deco theme with a dark background and gold accents.

_Color Palette:_

- Background: Pure black (`#000000`)
- Foreground: Cream white (`#f7f7f7`)
- Primary/Accent: Muted gold (`#c5995f`) - used for borders, text highlights
- Card background: Very dark (`bg-card/50 backdrop-blur-sm`)

_Card Styling:_

- Base: `art-deco-border p-5 bg-card/50 backdrop-blur-sm`
- Hover: `hover:art-deco-glow` (subtle box-shadow effect)
- The `.art-deco-border` class adds gold borders with inner border pseudo-element

_Typography:_

- Font: Cormorant (serif) for elegant, Art Deco feel
- Text styling: `.art-deco-text` = `letter-spacing: 0.15em; text-transform: uppercase;`
- Heading color: `text-[#f4e5c2]` (warm cream)

_Tag/Badge Styling:_

- Variant `artdeco`: Gold border, transparent bg, uppercase, wide letter-spacing
- Category colors: Blue (Personal), Pink (Relationships), Red (Embarrassing), Purple (Fears & Dreams), Orange (Opinions), Green (Work/School), Indigo (Random)

_Animations (Framer Motion):_

- Card hover: `whileHover={{ y: -4 }}` subtle lift
- Card entrance: `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}`
- 3D perspective: `.perspective-1000` class for depth effects

_CSS Utility Classes (defined in globals.css):_

- `.art-deco-border` - Gold border with inner border effect
- `.art-deco-dialog-border` - Gold border without pseudo-element (for dialogs)
- `.art-deco-text` - Uppercase, tracked text
- `.art-deco-glow` - Subtle box-shadow on hover
- `.art-deco-divider` - Decorative divider with gold gradient
- `.art-deco-tag` - Tag styling for badges

**Interaction Patterns**

- Accordion-style expand/collapse for text questions
- Inline answers for slider and multiple choice questions
- Chili pepper ratings (🌶️ x1-5) for "spiciness"
- Smooth Framer Motion animations on hover/press
- Grid layouts: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` for cards

**Accessibility Requirements**

- All interactive elements must be focusable and keyboard-accessible
- Include `aria-*` labels for icon-only controls (chili peppers, buttons)
- Card interactions: `tabIndex={0}`, `role="button"`, `aria-expanded`
- Rating components use `role="radiogroup"` with arrow key navigation
- Category filters use `aria-pressed` for toggle state
- Maintain proper tab order throughout forms and grids
- Provide loading states, empty states, and error boundaries

**Definition of Done (UI)**

- Follows Art Deco Gatsby theme (gold on black, serif fonts)
- All states implemented (hover, focus, loading, error)
- No console errors; proper semantic HTML structure
- Keyboard accessible with proper ARIA attributes

---

## 6) API & Data Contracts

**Current Implementation: Mock Database**

- Located in `src/lib/db/mock.ts` - simulates persistence for development
- Cookie-based temporary user system (no real auth yet)
- In-memory data store with CRUD operations

**Data Models**

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
}
interface Room {
  id: string;
  name: string;
  ownerId: string;
  inviteCode: string;
  maxMembers: number;
  questionIds?: string[];
  createdAt: Date;
}
interface Secret {
  id: string;
  roomId: string;
  authorId: string;
  body: string;
  selfRating: number;
  importance: number;
  avgRating?: number;
  buyersCount: number;
  createdAt: Date;
}
```

**API Patterns**

- Use helpers from `src/lib/api/helpers.ts`: `successResponse()`, `errorResponse()`
- Validate inputs: word count ≤100, ratings 1-5, required fields
- Return typed responses with proper HTTP status codes
- Handle Next.js 15 async params: `const id = (await params).id`

**Business Rules**

- Unlock mechanism: submit secret with same/higher spiciness level
- Room capacity: 20 members maximum
- Secret visibility: only author + "buyers" see full content
- Questions: 12 curated from markdown, room-specific selection

---

## 7) Git Workflow & Feature Development

**ALWAYS work on feature branches - NEVER directly on main:**

```bash
# Start new feature
git checkout -b feature/your-feature-name

# Work on changes
git add . && git commit -m "feat: your changes"

# Push to remote
git push -u origin feature/your-feature-name

# Create PR to merge back to main
# (Use GitHub web interface or gh CLI)
```

**Branch naming conventions:**

- `feature/add-spiciness-slider` - New features
- `fix/secret-unlock-bug` - Bug fixes
- `update/question-prompts` - Content updates
- `refactor/database-mock` - Code refactoring

**Git Rules**

- **NEVER** work directly on main branch - always use feature branches
- **NEVER** commit without running `npm run build` first
- Create PR from feature branch to merge into main
- Keep commits small and focused (prefer <400 lines)

---

## 8) Security & Permissions

**Current Security Model**

- Cookie-based temporary users (no passwords/tokens yet)
- Room access via invite codes (unique, not guessable)
- Secret visibility gated by "unlock" mechanism
- No PII logging; mask user data in development

**Claude Guidelines**

- Never read or write `.env*` files without explicit instruction
- Do not run scripts outside this repository
- Avoid `sudo` or system-level operations
- Ask before touching authentication or secret-related logic

---

## 9) Testing Policy

**Current Testing Setup**

- E2E tests with Playwright for critical user flows
- Screenshot testing for UI debugging (`node screenshot.js`)
- Build testing ensures TypeScript/ESLint compliance

**Testing Guidelines**

- Test core flows: room creation, question answering, secret unlocking
- Add tests when fixing bugs (write failing test first, then fix)
- Use Playwright UI for interactive debugging: `npm run test:e2e:ui`
- Screenshot before/after for UI changes

**Definition of Done**

- `npm run build` passes (TypeScript + production build)
- Core e2e flows work in latest test run
- No console errors in development mode

---

## 10) Review & Definition of Done

A change is **done** when:

- **Builds cleanly**: `npm run build` passes without errors
- **Follows conventions**: matches existing patterns in codebase
- **Maintains design**: preserves Art Deco Gatsby card aesthetics
- **Works end-to-end**: core user flows function properly
- **No regressions**: existing features continue working

**PR Checklist**

- [ ] Problem statement & approach explained
- [ ] Changes are small and focused (prefer <400 lines)
- [ ] Screenshots for UI changes
- [ ] Build passes locally
- [ ] Follows component/naming conventions
- [ ] No console errors in development

---

## 11) How to Collaborate with Claude (Workflow)

**Standard Loop** (follow unless told otherwise):

1. **Explore**: Read relevant files, understand current implementation
2. **Plan**: Propose focused changes (bullets), ask to proceed
3. **Implement**: Make small, reversible changes; show diffs
4. **Verify**: Run `npm run build`, check for errors, test manually
5. **Refine**: Fix issues iteratively
6. **Commit**: Use conventional format with AI attribution

**Project-Specific Patterns**

- **Bug fix**: Identify issue → minimal fix → test with `node screenshot.js`
- **New feature**: Check existing patterns → follow card-based design → add to appropriate section
- **UI change**: Maintain Art Deco aesthetic → test responsive behavior → screenshot before/after

**When to Ask**

- Before changing core business logic (unlock mechanism, spiciness ratings)
- Before architectural changes (switching from mock database)
- When encountering deployment-related configuration
- If conventions conflict or are unclear

---

## 12) Known Issues & Project Context

**Current Architecture Decisions**

- **Mock Database**: Simplified from Drizzle+Supabase for development speed
- **Temporary Users**: Cookie-based, no real authentication yet
- **Asset Paths**: Configured for separate deployment (not proxy)

**Known Technical Debt**

- Next.js 15 compatibility: async params pattern (`const id = (await params).id`)
- TypeScript strictness: escape quotes in JSX (`&apos;`, `&quot;`)
- Build process: ESLint warnings become errors on Vercel

**Future Migration Path**

- Planned: Switch back to Drizzle + Supabase for persistence
- Planned: Implement NextAuth.js for proper authentication
- Planned: Add real-time polling (15s intervals)
- See `PROJECT_PLAN.md` for complete V1+ roadmap

---

## 13) Quick Reference

**Essential Commands**

- `npm run dev` — development server
- `npm run build` — production build + TypeScript check
- `npm run test:e2e` — Playwright tests
- `node screenshot.js` — debug screenshots

**Key Files**

- `src/app/page.tsx` — homepage with question grid
- `src/lib/questions.ts` — unified tagging system
- `src/lib/db/mock.ts` — mock database
- `src/data/questions.md` — question content source
- `src/types/models.ts` — centralized type definitions
- `PROJECT_PLAN.md` — feature roadmap

**Design Principles**

- Card-first UI (Art Deco Gatsby theme)
- Gold on black color scheme
- Spiciness ratings (🌶️ x1-5)
- Privacy-gated secrets
- Mobile-responsive

**Workflow Loop**

- Explore → Plan → Implement → Verify → Commit

---

## 14) Development Modes (Antigravity-Style)

Use these slash commands to activate different development modes:

| Command       | Use For                           | Artifacts                                 |
| ------------- | --------------------------------- | ----------------------------------------- |
| `/plan`       | New features, significant changes | Full (tasks, implementation, walkthrough) |
| `/build`      | Medium tasks                      | Light (only if needed)                    |
| `/fast`       | Quick fixes, small changes        | None                                      |
| `/test`       | Browser testing                   | Test specs and results                    |
| `/fix-errors` | Debugging                         | Error documentation                       |
| `/learn`      | End of session                    | Knowledge base updates                    |

### Artifact Locations

- `plans/` - Planning documents (tasks.md, implementation.md, walkthrough.md)
- `knowledge/` - Persistent learnings (patterns, decisions, lessons, snippets)
- `testing/specs/` - Test specifications
- `testing/tests/` - Playwright tests
- `testing/screenshots/` - Visual captures
- `testing/traces/` - Playwright traces and videos

### Feedback Loop

When using `/plan`, I will pause after creating artifacts for your review. You can:

- Edit `plans/implementation.md` to change the approach
- Edit `plans/tasks.md` to add/remove/reorder tasks
- Say "proceed" when ready

I will re-read these files before implementing to catch your changes.

### Rules System

Persistent guidelines are stored in `.claude/rules/`:

- `coding-style.md` - Code conventions and patterns
- `tech-stack.md` - Technology preferences and constraints

### Knowledge Base

Cross-session learnings in `knowledge/`:

- `patterns.md` - Successful code patterns
- `decisions.md` - Architecture decisions
- `lessons.md` - What worked and what didn't
- `snippets/` - Reusable code

Run `/learn` at end of sessions to extract and save insights.

---

**Version**: 3.1 (Sprint 5 Documentation update)
**Last Updated**: 2025-01-16
**Maintainer**: AI Assistant collaboration
