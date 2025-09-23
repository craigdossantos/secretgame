# The Secret Game - AI Agents

This directory contains specialized AI agents tailored for The Secret Game project. Each agent is configured with project-specific knowledge, conventions, and best practices.

## Available Agents

### 🎨 Frontend & UI
- **[frontend-developer.md](./frontend-developer.md)** - React/Next.js components, Whisk-inspired design, card interactions
- **[ui-ux-designer.md](./ui-ux-designer.md)** - Design systems, user flows, accessibility, Whisk aesthetic
- **[ui-visual-validator.md](./ui-visual-validator.md)** - Visual regression testing, design system compliance

### 🧪 Testing & Quality
- **[test-automator.md](./test-automator.md)** - E2E testing, privacy feature testing, Playwright workflows
- **[tdd-orchestrator.md](./tdd-orchestrator.md)** - Test-driven development, red-green-refactor cycles
- **[performance-engineer.md](./performance-engineer.md)** - Next.js optimization, animation performance, Core Web Vitals

### 🔒 Security & Compliance
- **[security-auditor.md](./security-auditor.md)** - Privacy-first security, secret sharing protection, access control

### 📈 SEO & Content
- **[seo-content-writer.md](./seo-content-writer.md)** - Privacy-focused content, friend group messaging, brand voice
- **[seo-meta-optimizer.md](./seo-meta-optimizer.md)** - Meta tags, social sharing, search optimization

## How to Use These Agents

### 1. Claude Code Integration
Copy the relevant agent content into your Claude Code conversation when working on specific domains:

```
For React component work:
"Please follow the guidelines in .claude/agents/frontend-developer.md for this task..."

For testing:
"Use the testing approach outlined in .claude/agents/test-automator.md..."
```

### 2. Project Context
Each agent includes:
- **Project-Specific Context** - The Secret Game's architecture and constraints
- **Design System Knowledge** - Whisk-inspired UI patterns and tokens
- **Business Rules** - Privacy features, spiciness ratings, room limits
- **Technical Stack** - Next.js 15+, Tailwind, Framer Motion, etc.

### 3. Agent Specializations

#### Frontend Development
- Whisk-inspired card design (`rounded-2xl`, shadows, hover effects)
- Framer Motion animations (60fps target)
- TypeScript strict mode patterns
- Responsive grid layouts

#### Testing Strategy
- Privacy feature test coverage (secret visibility, unlock mechanism)
- E2E flows (room creation, secret sharing, member management)
- Accessibility testing (WCAG 2.1 AA compliance)
- Performance benchmarking

#### Security Focus
- Secret content protection
- Room access control via invite codes
- Input validation and sanitization
- Cookie-based session security

#### SEO & Content
- Privacy-conscious messaging
- Friend group targeting
- Trust-building content
- Conversion optimization

## Agent Usage Examples

### Starting a New Feature
1. **Plan** with `tdd-orchestrator.md` - Define tests first
2. **Design** with `ui-ux-designer.md` - Create user flows and wireframes
3. **Implement** with `frontend-developer.md` - Build components following design system
4. **Test** with `test-automator.md` - Create comprehensive test coverage
5. **Optimize** with `performance-engineer.md` - Ensure 60fps animations and fast loading
6. **Secure** with `security-auditor.md` - Validate privacy and access controls
7. **Validate** with `ui-visual-validator.md` - Ensure design system compliance

### Content Creation
1. **Strategy** with `seo-content-writer.md` - Plan content approach and messaging
2. **Optimize** with `seo-meta-optimizer.md` - Create compelling meta tags and social sharing

### Quality Assurance
- Use `tdd-orchestrator.md` for test-first development
- Apply `performance-engineer.md` for optimization reviews
- Follow `security-auditor.md` for privacy audits
- Validate with `ui-visual-validator.md` for design consistency

## Project-Specific Conventions

### Design System
- **Cards**: `rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]`
- **Hover**: `hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)]` with `y: -4` transform
- **Colors**: Blue (categories), green (topics), purple (moods)
- **Grid**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

### File Conventions
- Components: `PascalCase.tsx`
- Files: `kebab-case.tsx`
- Location: `components/` for features, `components/ui/` for primitives

### Commands
- `npm run dev` - Development server with Turbopack
- `npm run build` - Production build + TypeScript check
- `npm run test:e2e` - Playwright tests
- `npm run lint` - ESLint validation

### Git Workflow
- **ALWAYS** work on feature branches
- **NEVER** commit directly to main
- Run `npm run build` before commits
- Follow conventional commit format

## Best Practices

### Multi-Agent Workflow
1. Start with the most relevant primary agent for your task
2. Cross-reference with related agents (e.g., frontend + ui-ux + performance)
3. Use security and testing agents as quality gates
4. Apply SEO agents for public-facing content

### Context Switching
When switching between different types of work, explicitly reference the appropriate agent to maintain consistency:
- "Switching to performance optimization mode using .claude/agents/performance-engineer.md"
- "Now focusing on security review following .claude/agents/security-auditor.md"

### Quality Gates
Each agent defines specific quality criteria:
- **Frontend**: Design system compliance, accessibility, TypeScript strict
- **Testing**: Coverage requirements, TDD discipline
- **Performance**: Core Web Vitals, animation smoothness
- **Security**: Privacy controls, input validation
- **SEO**: Meta optimization, content quality

---

These agents ensure consistent, high-quality development across all aspects of The Secret Game project. Reference them frequently to maintain project standards and leverage specialized knowledge.