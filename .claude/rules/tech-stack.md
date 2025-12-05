# Tech Stack Rules - The Secret Game

## Current Stack
- **Framework:** Next.js 15.5.3 (App Router) + Turbopack
- **Styling:** Tailwind CSS 4.x + shadcn/ui (Radix UI primitives)
- **State:** React state + mock database; no global state management
- **Data:** Mock implementation in `lib/db/mock.ts` (prepared for Drizzle + Postgres)
- **Auth:** Cookie-based temporary users (prepared for NextAuth.js)
- **API:** Route handlers under `app/api/*`
- **Testing:** Playwright for e2e
- **Animations:** Framer Motion for card interactions

## File Organization
- `app/` — Next.js App Router pages
- `app/api/*` — Route handlers
- `components/ui/*` — shadcn/ui primitives (Button, Card, etc.)
- `components/*` — Feature components
- `lib/*` — Pure helpers and business logic
- `lib/db/mock.ts` — Mock database implementation
- `data/questions.md` — Question content source

## Package Management
- Use npm (not yarn or pnpm)
- Pin exact versions for critical dependencies
- Check for security vulnerabilities before adding new packages
- Run `npm run build` before committing

## Naming Conventions
- Components: `PascalCase.tsx` (e.g., `QuestionCard`)
- Files: `kebab-case.tsx` (e.g., `question-card.tsx`)
- API routes: RESTful (`/api/rooms`, `/api/rooms/[id]`)
- Interfaces: match component names (`QuestionCardProps`)

## API Patterns
- Use helpers: `successResponse()`, `errorResponse()` from `lib/api/helpers.ts`
- Validate inputs: word count ≤100, ratings 1-5, required fields
- Return typed responses with proper HTTP status codes

## Business Rules
- Unlock mechanism: submit secret with same/higher spiciness level
- Room capacity: 20 members maximum
- Secret visibility: only author + "buyers" see full content
- Questions: 12 curated from markdown, room-specific selection
- Spiciness ratings: 🌶️ x1-5

## Git Workflow
- **NEVER** work directly on main branch
- Branch naming: `feature/`, `fix/`, `update/`, `refactor/`
- **NEVER** commit without running `npm run build` first
- Keep commits small and focused
