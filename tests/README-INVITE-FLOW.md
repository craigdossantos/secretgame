# Invite Flow E2E Tests

## Overview

Comprehensive end-to-end tests for The Secret Game's invite and join flow, covering the complete user journey from creating a room to joining via invite link.

## Test File

`tests/invite-flow.spec.ts`

## Test Coverage

### 1. Full Invite Flow (Main Happy Path)

**Test:** `should complete full invite flow: create room → share invite → join`

**Steps:**

1. Create a new room from homepage
2. Extract invite code from the room (via UI or API)
3. Navigate to the invite page `/invite/[code]`
4. Verify invite page UI elements (room name, member count, join form)
5. Fill in user name and submit join form
6. Verify redirect to room page
7. Confirm user successfully joined

**Screenshots:**

- `invite-01-room-created.png` - Room page after creation
- `invite-02-invite-page.png` - Invite page view
- `invite-03-ready-to-join.png` - Form filled out
- `invite-04-joined-room.png` - Successfully joined room

### 2. Invalid Invite Code Handling

**Test:** `should handle invalid invite code gracefully`

**Validates:**

- Navigation to invalid invite code shows error state
- Error message: "Invalid Invite" is displayed
- "Go to Homepage" button is available
- No crash or infinite loading

**Screenshot:**

- `invite-05-invalid-code.png` - Error state display

### 3. Name Validation

**Test:** `should show validation error for empty name`

**Validates:**

- Join button is disabled when name field is empty
- Join button becomes enabled when name is entered
- Join button returns to disabled when name is cleared
- Proper React state management

**Implementation Notes:**

- Uses `isDisabled()` checks rather than `toBeDisabled()` for better reliability
- Includes wait times for React state updates
- Handles authentication fallbacks

**Screenshot:**

- `invite-06-empty-name-validation.png` - Validation states

### 4. Room Capacity Handling

**Test:** `should handle room at capacity`

**Status:** Placeholder test
**Reason:** Requires pre-populated test data (20 members in a room)

**Future Implementation:**

- Create room with 20 members via API
- Attempt to join as 21st member
- Verify "Room is Full" message
- Verify "Create Your Own Room" button

### 5. Member Count Display

**Test:** `should display correct member count on invite page`

**Validates:**

- Invite page shows current member count
- Format: "X person/people already playing"
- Flexible regex pattern to handle singular/plural

**Implementation:**

- Uses regex: `/(\\d+\\s+(person|people)\\s+already\\s+playing)/i`
- Logs actual member count for debugging

**Screenshot:**

- `invite-07-member-count.png` - Member count display

### 6. UI State Management

**Test:** `should maintain proper UI states during join process`

**Validates:**

- Name input field is focusable
- Helper text is visible: "This is how others will see you in the room"
- Footer disclaimer is visible
- Button state changes based on input

**Implementation Notes:**

- Tests focus capability rather than autofocus (headless browser limitation)
- Uses flexible regex for footer text matching
- Includes React hydration wait time

**Screenshot:**

- `invite-08-ui-states.png` - UI states

### 7. Long Name Handling

**Test:** `should handle long names gracefully`

**Validates:**

- Input field has `maxLength={50}` constraint
- Names longer than 50 characters are truncated
- Form submission only accepts valid length names

**Test Data:**

- Attempts to enter 60 character name
- Verifies only 50 characters accepted

**Screenshot:**

- `invite-09-long-name.png` - Max length constraint

## Key Implementation Patterns

### Authentication Handling

Tests include fallback logic for invite code retrieval:

```typescript
let inviteCode = "";
try {
  const response = await page.request.get(`/api/rooms/${roomId}`);
  const roomData = await response.json();
  inviteCode = roomData.inviteCode || roomData.room?.inviteCode || "TESTCODE";
} catch {
  inviteCode = "TESTCODE";
}
```

**Reason:** The `/api/rooms/[id]` endpoint requires authentication and only returns `inviteCode` to room members. Tests handle both authenticated and unauthenticated scenarios.

### React State Timing

Tests include strategic wait times for React hydration and state updates:

```typescript
await page.waitForLoadState("networkidle");
await page.waitForTimeout(1000); // Wait for React hydration
```

**Reason:** Client-side React components need time to hydrate and update state, especially for form validations.

### Flexible Text Matching

Uses regex patterns for text that might vary:

```typescript
// Flexible member count matching
page.locator("text=/(\\d+\\s+(person|people)\\s+already\\s+playing)/i");

// Partial footer text matching
page.locator("text=/By joining.*honest.*respectful/i");
```

**Reason:** Handles singular/plural variations and prevents false failures from minor text changes.

## Running the Tests

### Run all invite flow tests

```bash
npm run test:e2e -- tests/invite-flow.spec.ts
```

### Run specific test

```bash
npm run test:e2e -- tests/invite-flow.spec.ts -g "full invite flow"
```

### Run with UI (debugging)

```bash
npm run test:e2e:ui -- tests/invite-flow.spec.ts
```

### Run in debug mode

```bash
npm run test:e2e:debug -- tests/invite-flow.spec.ts
```

## Expected Results

### Test Summary

- **Total Tests:** 7
- **Expected Passing:** 6 (when room capacity test is implemented)
- **Browsers:** Chromium, Firefox, WebKit (via Playwright)
- **Duration:** ~1-2 minutes

### Success Criteria

All tests pass with:

- No console errors
- All assertions pass
- Screenshots captured successfully
- Proper navigation flow

## Known Issues & Limitations

### 1. Autofocus in Headless Browsers

**Issue:** `autoFocus` attribute may not work consistently in headless mode
**Workaround:** Test checks if input is focusable rather than already focused

### 2. Invite Code Retrieval

**Issue:** API endpoint requires authentication for invite code access
**Workaround:** Tests include fallback logic and can extract from UI if available

### 3. Room Capacity Test

**Issue:** Requires pre-populated room with 20 members
**Status:** Placeholder test included, needs implementation with test data setup

### 4. Timing Sensitivity

**Issue:** React hydration and state updates need time
**Workaround:** Strategic `waitForTimeout()` calls included

## Future Enhancements

### Additional Test Scenarios

1. **Already a Member:** Test redirect when user is already in the room
2. **Session Persistence:** Test that joining creates persistent session
3. **Multiple Browsers:** Test concurrent joins from different browsers
4. **Name Special Characters:** Test Unicode, emojis, special characters in names
5. **Network Failures:** Test handling of API failures during join
6. **Back Navigation:** Test browser back button behavior

### Performance Testing

- Measure page load times
- Test with slow network conditions
- Verify loading states display correctly

### Accessibility Testing

- Keyboard navigation through invite flow
- Screen reader compatibility
- Focus management and tab order
- ARIA labels and roles

## Related Files

### Components

- `src/app/invite/[code]/page.tsx` - Invite page component

### API Routes

- `src/app/api/invite/[code]/route.ts` - Get room info by invite code
- `src/app/api/invite/[code]/join/route.ts` - Join room endpoint
- `src/app/api/rooms/route.ts` - Create room endpoint

### Test Screenshots

- `test-results/invite-*.png` - Generated screenshots from test runs

## Troubleshooting

### Tests Failing?

1. Check if development server is running
2. Verify database is accessible (Supabase connection)
3. Check for console errors in screenshots
4. Run with `--debug` flag for detailed logs

### Flaky Tests?

1. Increase timeout values if needed
2. Check network conditions
3. Verify test isolation (each test should be independent)
4. Check for race conditions in React state updates

## Contributing

When adding new invite flow tests:

1. Follow existing naming patterns
2. Include descriptive console.log statements
3. Take screenshots at key steps
4. Handle authentication edge cases
5. Add appropriate wait times for React state
6. Update this README with new test descriptions

---

**Last Updated:** January 16, 2026
**Test Coverage:** 7 tests covering main invite/join flow
**Maintainer:** AI Assistant collaboration
