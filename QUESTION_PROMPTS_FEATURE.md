# Question Prompts Feature Plan

## 🎯 Overview
Transform empty room screens into engaging grids of question prompt cards that users can answer as secrets. Each card flips to reveal an answer form, creating an interactive and guided experience.

## ✨ Core Features

### 1. **Question Prompt Cards**
- **Grid Layout**: Responsive card grid similar to current SecretCard layout
- **Flip Animation**: Cards flip on click to reveal answer form on the back
- **Visual Design**: Whisk-inspired styling with question preview on front
- **Categories**: Each question has one or more category tags
- **Difficulty Levels**: Questions tagged with suggested secrecy levels (1-5)

### 2. **Category Filtering System**
- **Filter Bar**: Horizontal tag bar at the top of the room
- **Active States**: Selected categories highlighted, others dimmed
- **Multi-Select**: Allow multiple categories to be active simultaneously
- **Clear Filters**: "All" option to show all questions
- **Category Counts**: Show number of questions per category

### 3. **Question Database**
- **Markdown File**: Store questions in structured markdown format
- **Metadata**: Category, suggested secrecy level, difficulty
- **Variety**: Mix of light, deep, funny, and serious prompts
- **Expandable**: Easy to add new questions

## 🏗️ Technical Architecture

### Components Needed:
1. **QuestionCard** - Flippable card with question front / answer form back
2. **CategoryFilter** - Tag-based filtering component
3. **QuestionGrid** - Grid layout with filtering logic
4. **QuestionPromptForm** - Answer form on card back (reuse UnlockDrawer logic)

### Data Structure:
```typescript
interface QuestionPrompt {
  id: string;
  question: string;
  category: string[];
  suggestedLevel: number; // 1-5 secrecy level
  difficulty: 'easy' | 'medium' | 'hard';
}
```

### Categories (Initial Set):
- **Personal** - Childhood, memories, personal habits
- **Relationships** - Family, friends, dating, crushes
- **Fears & Dreams** - Anxieties, aspirations, goals
- **Embarrassing** - Funny mishaps, awkward moments
- **Opinions** - Controversial takes, unpopular opinions
- **Work/School** - Professional secrets, academic confessions
- **Random** - Quirky, unexpected questions

## 🎨 User Experience Flow

### Room Entry Experience:
1. **Join Room** → See grid of question prompt cards
2. **Browse Categories** → Filter by interests using tag bar
3. **Select Question** → Click card to flip and see answer form
4. **Answer & Submit** → Fill form, set secrecy level, submit as secret
5. **Card Transforms** → Becomes regular SecretCard for others to unlock

### Visual States:
- **Question Front**: Category tag, difficulty indicator, question preview
- **Flip Animation**: Smooth 3D flip using CSS transforms or Framer Motion
- **Answer Back**: Form with textarea, rating sliders, submit button
- **Post-Submit**: Card flips back, shows "Question Answered" state

## 📁 Implementation Plan

### Phase 1: Foundation
- [ ] Create questions.md file with initial 50+ questions
- [ ] Build QuestionCard component with flip animation
- [ ] Create question loading/parsing system

### Phase 2: Filtering
- [ ] Build CategoryFilter component
- [ ] Implement filtering logic
- [ ] Add category count badges

### Phase 3: Integration
- [ ] Update room page to show question grid
- [ ] Connect question answers to secret creation API
- [ ] Handle answered vs. unanswered question states

### Phase 4: Polish
- [ ] Add smooth animations and transitions
- [ ] Implement responsive grid layout
- [ ] Add empty states and loading states

## 🎯 Success Criteria
- Room feels engaging and full of content immediately
- Users can easily find questions that interest them
- Flip animation feels smooth and intuitive
- Category filtering works seamlessly
- Question answers integrate with existing secret system

## 🔮 Future Enhancements
- **Custom Questions**: Allow room owners to add custom prompts
- **Question Voting**: Members vote on which questions to add
- **Daily Questions**: Rotating featured questions
- **Question Stats**: Track most popular categories/questions
- **Difficulty Modes**: Easy/Hard room settings affect question mix

---

This transforms the secret game from "what should I share?" to "here are engaging prompts to inspire authentic sharing" - much more user-friendly and engaging!