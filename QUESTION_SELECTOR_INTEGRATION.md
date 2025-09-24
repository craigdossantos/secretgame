# QuestionSelector Component Integration Guide

## Overview
The QuestionSelector component allows users to select exactly 3 questions for their Secret Game room, with support for custom questions. It follows The Secret Game's Whisk-inspired design patterns.

## Components Created

### 1. QuestionSelector (`/src/components/question-selector.tsx`)
**Purpose**: Multi-select question cards with 3-question limit and custom question support.

**Key Features**:
- Grid layout with Whisk-inspired card design
- Selection limit enforcement (exactly 3 questions)
- Visual feedback (checkmarks, border highlights)
- Custom question creation integration
- Selected questions preview
- Responsive design

**Props**:
```typescript
interface QuestionSelectorProps {
  questions: QuestionPrompt[];           // Available questions to choose from
  selectedQuestionIds: string[];        // Currently selected question IDs
  onSelectionChange: (                  // Callback when selection changes
    selectedIds: string[],
    customQuestions: QuestionPrompt[]
  ) => void;
  maxSelections?: number;                // Maximum selections (default: 3)
}
```

### 2. CustomQuestionModal (`/src/components/custom-question-modal.tsx`)
**Purpose**: Modal dialog for creating custom questions with validation and preview.

**Key Features**:
- Form validation (word count, character limits)
- Category selection with tag preview
- Spiciness rating with interactive chili peppers
- Difficulty selection
- Real-time preview of question card
- Proper error handling

**Props**:
```typescript
interface CustomQuestionModalProps {
  isOpen: boolean;                       // Modal visibility
  onClose: () => void;                   // Close callback
  onCreateQuestion: (question: QuestionPrompt) => void; // Question creation callback
}
```

## Integration Examples

### Basic Usage
```tsx
import { useState } from 'react';
import { QuestionSelector } from '@/components/question-selector';
import { mockQuestions, getCuratedQuestions } from '@/lib/questions';

function CreateRoomPage() {
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [customQuestions, setCustomQuestions] = useState<QuestionPrompt[]>([]);

  const availableQuestions = getCuratedQuestions(mockQuestions);

  const handleSelectionChange = (selectedIds: string[], newCustomQuestions: QuestionPrompt[]) => {
    setSelectedQuestionIds(selectedIds);
    setCustomQuestions(newCustomQuestions);
  };

  return (
    <QuestionSelector
      questions={availableQuestions}
      selectedQuestionIds={selectedQuestionIds}
      onSelectionChange={handleSelectionChange}
      maxSelections={3}
    />
  );
}
```

### Integration with Room Creation API
```tsx
const createRoomWithQuestions = async () => {
  const response = await fetch('/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: roomName,
      userName: userName,
      questionIds: selectedQuestionIds,  // Pass selected questions
      customQuestions: customQuestions   // Pass custom questions
    })
  });

  const data = await response.json();
  return data;
};
```

## Design Patterns

### Card Styling (Whisk-inspired)
- **Default**: `rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-white border border-gray-200`
- **Hover**: `hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] hover:border-gray-300`
- **Selected**: `border-2 border-blue-500 shadow-[0_16px_40px_rgba(59,130,246,0.15)] bg-blue-50`
- **Disabled**: `opacity-50 cursor-not-allowed`

### Interactive States
- **Checkmark**: Green circle with white check icon for selected questions
- **Hover Animation**: `y: -4` transform on card hover
- **Remove Button**: Red X button for custom questions
- **Selection Full**: Grayed out unselectable cards when limit reached

### Responsive Grid
```css
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
```

## File Locations

### Components
- `/src/components/question-selector.tsx` - Main selector component
- `/src/components/custom-question-modal.tsx` - Custom question creation modal

### Demo/Example
- `/src/app/demo-question-selector/page.tsx` - Full working demonstration

### Integration Points
- `/src/app/create/page.tsx` - Room creation flow (ready for integration)
- `/src/lib/questions.ts` - Question data structures and utilities

## API Integration Requirements

### Room Creation API Update
Update the `/api/rooms` endpoint to accept:
```typescript
{
  name: string;
  userName: string;
  questionIds: string[];        // Selected question IDs
  customQuestions?: QuestionPrompt[]; // Custom questions to add to database
}
```

### Database Schema Consideration
Consider adding a `room_questions` table to link specific questions to rooms:
```sql
CREATE TABLE room_questions (
  room_id VARCHAR,
  question_id VARCHAR,
  is_custom BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (room_id, question_id)
);
```

## Testing

### Demo Page
Visit `/demo-question-selector` to test all functionality:
- Question selection/deselection
- Custom question creation
- Selection limit enforcement
- Form validation
- Responsive behavior

### Manual Testing Checklist
- [ ] Can select up to 3 questions
- [ ] Cannot select more than 3 questions
- [ ] Can deselect questions
- [ ] Custom question modal opens/closes properly
- [ ] Custom question form validation works
- [ ] Custom questions appear in grid after creation
- [ ] Selected questions preview updates correctly
- [ ] Responsive design works on mobile

## Accessibility

### Keyboard Navigation
- All cards are focusable with tab navigation
- Enter/Space keys trigger selection
- Modal supports Escape key to close

### Screen Readers
- Cards have proper ARIA labels
- Selection state announced
- Form fields properly labeled
- Error messages announced

### Visual Indicators
- High contrast selection borders
- Clear visual feedback for all states
- Proper color contrast ratios maintained

## Performance Notes

- Components use React.memo where beneficial
- Framer Motion animations are optimized for 60fps
- Large question lists are handled efficiently with virtual scrolling preparation
- Form validation is debounced to prevent excessive re-renders

## Next Steps

1. **Integration**: Add to `/src/app/create/page.tsx` room creation flow
2. **API Updates**: Modify room creation endpoint to handle selected questions
3. **Database**: Update schema to store room-specific question selections
4. **Testing**: Add Playwright e2e tests for question selection flow
5. **Polish**: Add loading states, error boundaries, and edge case handling

---

**Status**: ✅ Implementation Complete - Ready for Integration
**Build Status**: ✅ All TypeScript and ESLint checks passing
**Demo Available**: `/demo-question-selector`