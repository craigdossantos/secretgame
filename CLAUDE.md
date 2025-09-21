# CLAUDE.md - AI Assistant Guide for The Secret Game

This file contains essential information for AI assistants working on this codebase. Please read this thoroughly before making any changes.

## 📋 Project Overview

**The Secret Game** is a web application for small friend groups (≤20) to exchange secrets via invite URLs. Users unlock secrets by submitting secrets of matching "spiciness" levels. The UI is inspired by Google Labs Whisk with card-based design.

### Current Status
- ✅ **MVP Complete**: Question prompts, secret sharing, room system, unified tagging
- ✅ **Deployed**: Ready for Vercel deployment
- 🔄 **Active**: Recently switched from Supabase to mock database for simplicity
- 📋 **Roadmap**: See PROJECT_PLAN.md for future features

### Key Design Principles
- **Card-first UI**: Everything is a card with Whisk-inspired styling
- **Minimal friction**: Quick onboarding, no complex forms
- **Privacy-focused**: Secrets only visible to author and "buyers"
- **Gamified**: Spiciness ratings (🌶️), unlocking mechanism

## 🛠 Technical Stack

### Core Technologies
- **Framework**: Next.js 15.5.3 with App Router
- **Build Tool**: Turbopack (for faster development)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4.x
- **UI Components**: shadcn/ui (Radix UI + Tailwind)
- **Animations**: Framer Motion
- **Database**: Mock implementation (was Drizzle + Supabase)

### Key Dependencies
```json
{
  "next": "15.5.3",
  "react": "19.1.0",
  "typescript": "^5",
  "tailwindcss": "^4",
  "framer-motion": "^12.23.14",
  "lucide-react": "^0.544.0"
}
```

## 🚀 Development Workflow

### Essential Commands
```bash
# Development (with Turbopack)
npm run dev

# Production build
npm run build

# Linting
npm run lint

# E2E testing
npm test:e2e
npm run test:e2e:ui    # with Playwright UI
npm run test:e2e:debug # debug mode
```

### Development Server
- **URL**: http://localhost:3000 (or next available port)
- **Hot Reload**: Enabled with Turbopack
- **Environment**: Uses .env.local for configuration

### Build & Deployment
- **Target**: Vercel with separate project deployment
- **Configuration**: `vercel.json` for standalone deployment
- **Assets**: All paths are relative (no basePath needed)

## 🏗 Code Architecture

### File Structure
```
src/
├── app/                     # Next.js App Router pages
│   ├── page.tsx            # Homepage with question prompts
│   ├── create/page.tsx     # Room creation
│   ├── rooms/[id]/page.tsx # Room view
│   ├── admin/page.tsx      # Question management
│   └── api/                # API routes
├── components/             # Reusable components
│   ├── ui/                 # shadcn/ui components
│   ├── question-card.tsx   # Flip card for questions
│   ├── secret-card.tsx     # Secret display
│   └── chili-rating.tsx    # Spiciness rating
├── lib/                    # Utilities and business logic
│   ├── questions.ts        # Question management & tagging
│   ├── db/mock.ts         # Mock database implementation
│   └── api/helpers.ts      # API utilities
└── data/
    └── questions.md        # Question content
```

### Naming Conventions
- **Components**: PascalCase (e.g., `QuestionCard`)
- **Files**: kebab-case (e.g., `question-card.tsx`)
- **API Routes**: RESTful patterns (`/api/rooms`, `/api/rooms/[id]`)
- **Database**: camelCase for TypeScript, snake_case for SQL

### Component Patterns
```tsx
// Standard component structure
interface ComponentProps {
  // Props interface first
}

export function Component({ prop }: ComponentProps) {
  // Hooks at top
  const [state, setState] = useState();

  // Event handlers
  const handleEvent = () => {};

  // Render
  return <div />;
}
```

## 🎯 Key Features & Business Logic

### Question Prompts System
- **Source**: Markdown file parsed into structured data
- **Tags**: Unified tagging system (no separate categories)
- **Display**: 12 curated questions in 3x4 grid
- **Interaction**: Flip cards to answer

### Unified Tagging System
```typescript
interface Tag {
  name: string;
  type: 'category' | 'topic' | 'priority' | 'mood' | 'format';
}

// Visual hierarchy through colors
const TAG_TYPE_COLORS = {
  category: { bg: 'bg-blue-100', text: 'text-blue-800' },
  topic: { bg: 'bg-green-100', text: 'text-green-800' },
  // ...
};
```

### Room System
- **Creation**: Simple form → unique invite code
- **Joining**: Visit invite URL → temporary user creation
- **Capacity**: 20 members maximum
- **Questions**: Room-specific question selection

### Secret Mechanism
- **Submit**: Body (≤100 words) + self-rating (1-5) + importance
- **Unlock**: Submit secret with same/higher spiciness level
- **Rating**: Chili pepper system (🌶️ x1-5)
- **Access**: Only author and "buyers" see full content

## 💾 Database & Data Flow

### Mock Database Implementation
Located in `src/lib/db/mock.ts` - simulates real database for development:

```typescript
interface MockDatabase {
  users: User[];
  rooms: Room[];
  roomMembers: RoomMember[];
  secrets: Secret[];
  // ... methods for CRUD operations
}
```

### Data Models
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
  questionIds?: string[]; // Room-specific questions
  createdAt: Date;
}

interface Secret {
  id: string;
  roomId: string;
  authorId: string;
  body: string;
  selfRating: number;     // 1-5 spiciness
  importance: number;     // 1-5 keep-it-private
  avgRating?: number;     // Calculated average
  buyersCount: number;
  createdAt: Date;
}
```

### API Patterns
- **Helpers**: `src/lib/api/helpers.ts` for common operations
- **Error Handling**: Consistent `errorResponse()` and `successResponse()`
- **Authentication**: Cookie-based temporary users
- **Validation**: Server-side word count and rating validation

## 🎨 UI/UX Guidelines

### Card Design System
```css
/* Base card styling (Whisk-inspired) */
.card {
  @apply rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]
         bg-white border border-gray-200 transition-all duration-200
         hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)];
}
```

### Animation Patterns
```tsx
// Standard card entrance
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ y: -4 }}
>
```

### Color System
- **Primary**: Blue-based (`bg-blue-100`, `text-blue-800`)
- **Tags**: Color-coded by type (category=blue, topic=green, etc.)
- **Status**: Green=success, red=error, yellow=warning
- **Interactive**: Hover states with subtle transforms

### Responsive Breakpoints
```css
/* Grid patterns */
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 /* Cards */
grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 /* Smaller items */
```

## ⚡ Common Tasks

### Adding New Questions
1. Edit `src/data/questions.md`
2. Questions auto-parsed on page load
3. Format: `- Question text | level: X | difficulty: easy/medium/hard`

### Creating New Components
1. Place in `src/components/` (or `src/components/ui/` for base UI)
2. Use TypeScript interfaces for props
3. Follow existing component patterns
4. Add to exports if reusable

### API Development
1. Create in `src/app/api/`
2. Use helper functions from `src/lib/api/helpers.ts`
3. Implement proper error handling
4. Follow RESTful conventions

### Testing & Debugging
```bash
# Run Playwright tests
npm run test:e2e

# Debug with UI
npm run test:e2e:ui

# Take screenshots for debugging
node screenshot.js
```

## 🐛 Known Issues & Workarounds

### TypeScript/ESLint
- **Issue**: Strict linting can cause build failures on Vercel
- **Fix**: Escape quotes in JSX (`&apos;`, `&quot;`)
- **Pattern**: Use `unknown` instead of `any` for type safety

### Next.js 15 Breaking Changes
- **Issue**: Dynamic route params are now `Promise<{ id: string }>`
- **Fix**: `const id = (await params).id;`
- **Context**: Updated for Next.js 15 compatibility

### Asset Paths for Proxy Deployment
- **Issue**: Absolute paths break when proxying
- **Solution**: Use separate deployment + subdomain instead
- **Alternative**: Configure `assetPrefix` if proxy is required

### Mock Database Limitations
- **Issue**: No persistence across server restarts
- **Context**: Switched from Supabase for development speed
- **Future**: Can easily switch back to Drizzle + Supabase

## 🚢 Deployment

### Vercel Configuration
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

### Deployment Options
1. **Recommended**: Separate Vercel project with subdomain
2. **Alternative**: Proxy through main site (requires careful configuration)
3. **Future**: Integration into main site codebase

### Environment Variables
Currently using mock data, but prepared for:
```bash
DATABASE_URL=          # For future Supabase connection
NEXTAUTH_SECRET=       # For authentication
GOOGLE_CLIENT_ID=      # For OAuth
GOOGLE_CLIENT_SECRET=  # For OAuth
```

## 🔮 Future Development

### Immediate Roadmap (from PROJECT_PLAN.md)
- Real database integration (Supabase)
- Google OAuth authentication
- Real-time polling (15s intervals)
- Enhanced moderation tools

### Architecture Considerations
- **State Management**: Consider Zustand if complexity grows
- **Real-time**: WebSockets or polling for live updates
- **Caching**: React Query for API state management
- **Testing**: Expand Playwright coverage

### Technical Debt
- Mock database needs replacement
- Some components could use better TypeScript types
- API error handling could be more robust
- Need proper user authentication flow

## 📝 Development Notes

### Code Style
- **No comments**: Only add comments when explicitly requested
- **Consistency**: Follow existing patterns in the codebase
- **TypeScript**: Prefer strict typing over `any`
- **Components**: Functional components with hooks

### Git Workflow
- **Commits**: Include both technical changes and AI attribution
- **Messages**: Clear, descriptive commit messages
- **Branches**: Use `main` for primary development

### AI Assistant Guidelines
1. **Read this file first** before making changes
2. **Check PROJECT_PLAN.md** for broader context
3. **Test builds** before committing (`npm run build`)
4. **Follow patterns** established in existing code
5. **Ask questions** if architecture decisions are unclear

---

**Last Updated**: 2025-01-20
**Version**: 1.0
**Maintainer**: AI Assistant with user guidance

For questions about this file or the project architecture, refer to PROJECT_PLAN.md or examine the existing codebase patterns.