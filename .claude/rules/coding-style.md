# Coding Style Rules - The Secret Game

Always follow these conventions when working on this project.

## General
- Use meaningful variable and function names
- Keep functions small and focused (single responsibility)
- Add comments for complex logic, not obvious code
- Handle errors explicitly, never silently fail
- Prefer small, focused changes (<400 lines)

## TypeScript/JavaScript
- Use TypeScript for all new files (strict mode enabled)
- Prefer `const` over `let`, never use `var`
- Use async/await over raw promises
- Use early returns to reduce nesting
- Handle Next.js 15 async params: `const id = (await params).id`
- Escape quotes in JSX: `&apos;`, `&quot;`

## React/Next.js
- Use functional components with hooks
- Keep components under 200 lines
- Extract reusable logic into custom hooks
- Use TypeScript interfaces for props (match component names)
- Follow component structure: Interface → Hooks → Handlers → Render

## Component Structure
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

## Styling (Tailwind + Whisk Design)
- Cards: `rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-white border border-gray-200`
- Hover: `hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)]` with subtle transforms
- Colors: Blue for categories, green for topics, purple for moods
- Grid layouts: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

## Testing
- Write tests for all new features
- Test behavior, not implementation
- Use descriptive test names that explain the scenario
- Add tests when fixing bugs (write failing test first)

## Accessibility
- All interactive elements must be focusable and keyboard-accessible
- Include `aria-*` labels for icon-only controls
- Maintain proper tab order throughout forms and grids
- Provide loading states, empty states, and error boundaries
