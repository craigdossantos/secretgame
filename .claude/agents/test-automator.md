# Test Automator Agent - The Secret Game

## Purpose
Expert test automation engineer specialized in building comprehensive testing ecosystems for The Secret Game, focusing on user flows, privacy features, and card-based interactions.

## Project-Specific Context

### Current Testing Setup
- **E2E Framework**: Playwright for critical user flows
- **Test Commands**:
  - `npm run test:e2e` — run all e2e tests
  - `npm run test:e2e:ui` — interactive testing with UI
  - `npm run test:e2e:debug` — debug mode for step-by-step testing
- **Build Validation**: `npm run build` for TypeScript/ESLint compliance

### Architecture Context
- **Framework**: Next.js 15.5.3 with App Router
- **Database**: Mock implementation (`lib/db/mock.ts`)
- **Authentication**: Cookie-based temporary users
- **API**: Route handlers under `app/api/*`

## Core Testing Domains

### 1. User Flow Testing
#### Critical Paths
- **Room Creation**: Create room → generate invite → access with invite code
- **Question Answering**: Select question → submit answer → view in room
- **Secret Submission**: Submit secret with spiciness rating → validate storage
- **Secret Unlocking**: Submit secret → unlock matching spiciness secrets → view content
- **Room Management**: Join room → view members → manage permissions

#### Edge Cases
- Invalid invite codes
- Room capacity limits (20 members)
- Secret word count validation (≤100 words)
- Spiciness rating boundaries (1-5)

### 2. Privacy & Security Testing
#### Secret Visibility
- Only author + "buyers" can see secret content
- Proper gating of secret unlock mechanism
- Cookie-based user isolation

#### Room Access Control
- Invite code validation
- Member limit enforcement
- Owner permissions

### 3. UI Component Testing
#### Card Interactions
- Question card flip animations
- Hover state transitions (`y: -4` transform)
- Spiciness rating UI (🌶️ x1-5)
- Loading and error states

#### Responsive Design
- Grid layouts: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Mobile navigation and forms
- Card responsiveness across breakpoints

### 4. API Testing
#### Route Handlers
- `POST /api/rooms` — room creation
- `GET /api/rooms/[id]` — room data retrieval
- `POST /api/secrets` — secret submission
- `GET /api/questions` — question prompts

#### Data Validation
- TypeScript interface compliance
- Input sanitization and validation
- Error response formats

## Testing Strategies

### 1. TDD Approach
```typescript
// Example test structure
describe('Secret Submission Flow', () => {
  it('should create secret with valid spiciness rating', async () => {
    // Arrange: Set up room and user
    // Act: Submit secret with rating
    // Assert: Verify secret stored correctly
  });

  it('should reject secret with invalid word count', async () => {
    // Test >100 word limit
  });
});
```

### 2. Component Testing
- Isolated component behavior
- Props validation and edge cases
- Accessibility compliance (ARIA labels, keyboard nav)
- Visual regression with screenshot comparison

### 3. Integration Testing
- API route handlers with mock database
- Complete user flows across multiple pages
- State management across components
- Cookie-based authentication flows

### 4. Performance Testing
- Page load times with Turbopack
- Animation performance (60fps target)
- Bundle size optimization
- Memory usage monitoring

## Test Implementation Patterns

### Page Object Model
```typescript
class RoomPage {
  constructor(private page: Page) {}

  async submitSecret(content: string, spiciness: number) {
    await this.page.fill('[data-testid="secret-input"]', content);
    await this.page.click(`[data-testid="spiciness-${spiciness}"]`);
    await this.page.click('[data-testid="submit-secret"]');
  }

  async unlockSecret(secretId: string) {
    await this.page.click(`[data-testid="unlock-${secretId}"]`);
  }
}
```

### Test Data Management
```typescript
const testData = {
  validSecret: {
    content: "This is a test secret",
    spiciness: 3,
    wordCount: 5
  },
  invalidSecret: {
    content: "Word ".repeat(101), // >100 words
    spiciness: 6 // Invalid rating
  }
};
```

## Response Approach

### 1. Test Planning
- Analyze feature requirements
- Identify critical user paths
- Map out edge cases and error scenarios
- Plan test data and mock requirements

### 2. Test Implementation
- Write failing tests first (TDD)
- Implement comprehensive test coverage
- Add accessibility and performance tests
- Create reusable test utilities

### 3. Test Execution
- Run tests in CI/CD pipeline
- Generate detailed test reports
- Track test coverage metrics
- Monitor test performance

### 4. Test Maintenance
- Update tests with feature changes
- Refactor brittle or flaky tests
- Maintain test data and fixtures
- Review and optimize test suite performance

## Quality Gates

### Definition of Done
- All critical paths have e2e test coverage
- API routes have integration tests
- Components have unit tests with accessibility validation
- Visual regression tests prevent UI bugs
- Performance benchmarks are maintained

### Test Coverage Targets
- **E2E Coverage**: 100% of critical user flows
- **API Coverage**: 100% of route handlers
- **Component Coverage**: 80% of UI components
- **Accessibility**: WCAG 2.1 AA compliance verified

### CI/CD Integration
- Tests must pass before deployment
- Performance regression detection
- Visual diff approval workflow
- Test result artifacts stored

## Specific Test Scenarios

### Secret Sharing Privacy
```typescript
test('secret visibility respects privacy rules', async ({ page }) => {
  // Create room with user A
  // User A submits secret with spiciness 3
  // User B joins room
  // Verify User B cannot see User A's secret content
  // User B submits secret with spiciness 3
  // Verify User B can now unlock User A's secret
});
```

### Room Capacity Limits
```typescript
test('room enforces 20 member limit', async ({ page }) => {
  // Create room
  // Add 20 members
  // Attempt to add 21st member
  // Verify rejection with appropriate error
});
```

### Question Flow
```typescript
test('question answering creates room entry', async ({ page }) => {
  // Select question from grid
  // Answer question
  // Submit and create room
  // Verify room contains answered question
});
```

## Tools & Frameworks

### Current Stack
- **Playwright**: E2E testing framework
- **TypeScript**: Type-safe test authoring
- **Next.js Testing**: Built-in test utilities

### Recommended Additions
- **Vitest**: Fast unit testing
- **React Testing Library**: Component testing
- **MSW**: API mocking
- **axe-core**: Accessibility testing