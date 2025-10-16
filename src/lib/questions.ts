export interface Tag {
  name: string;
  type: 'category' | 'topic' | 'priority' | 'mood' | 'format';
  color?: string;
}

// Question Types - Different input/answer formats
export type QuestionType =
  | 'text'              // Traditional text answer (current default)
  | 'slider'            // Numeric slider with custom labels
  | 'multipleChoice';   // Single or multi-select options

// Type-specific configuration for questions
export interface SliderConfig {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  step?: number;
}

export interface MultipleChoiceConfig {
  options: string[];
  allowMultiple: boolean;
  useRoomMembers?: boolean; // Use room member names as options
  showDistribution?: boolean; // Show % breakdown in results
}

export type AnswerConfig =
  | { type: 'text' }
  | { type: 'slider'; config: SliderConfig }
  | { type: 'multipleChoice'; config: MultipleChoiceConfig };

// Unlock requirements for bounty system
export interface UnlockRequirement {
  type: 'matchSpiciness' | 'answerAnyQuestion' | 'answerSpecificQuestion';
  bountyQuestionId?: string; // Required if type is 'answerSpecificQuestion'
}

export interface QuestionPrompt {
  id: string;
  question: string;
  category: string; // Keep for backward compatibility, will be migrated to tags
  suggestedLevel: number; // 1-5
  difficulty: 'easy' | 'medium' | 'hard';
  archived?: boolean;
  tags?: Tag[];
  createdAt?: string;
  updatedAt?: string;
  // New fields for question types
  questionType?: QuestionType; // Defaults to 'text' for backward compatibility
  answerConfig?: AnswerConfig; // Type-specific configuration
  unlockRequirement?: UnlockRequirement; // Custom unlock logic (defaults to matchSpiciness)
  allowAnonymous?: boolean; // Allow users to answer anonymously
  allowImageUpload?: boolean; // Allow image upload for text answers
}

export type QuestionCategory =
  | 'Personal'
  | 'Relationships'
  | 'Embarrassing'
  | 'Fears & Dreams'
  | 'Opinions'
  | 'Work/School'
  | 'Random';

export const QUESTION_CATEGORIES: QuestionCategory[] = [
  'Personal',
  'Relationships',
  'Embarrassing',
  'Fears & Dreams',
  'Opinions',
  'Work/School',
  'Random'
];

// Convert category to tag
export function categoryToTag(category: string): Tag {
  return {
    name: category.toLowerCase(),
    type: 'category'
  };
}

// Get tag styling classes - simplified for Art Deco uniform styling
// Note: Currently unused as we apply variant="artdeco" directly to Badge components
// Kept for backward compatibility if needed
export function getTagStyles(): string {
  return 'art-deco-tag';
}

// Parse questions from markdown format
export function parseQuestions(markdownContent: string): QuestionPrompt[] {
  const lines = markdownContent.split('\n');
  const questions: QuestionPrompt[] = [];
  let currentCategory = '';

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check if line is a category header
    if (trimmedLine.startsWith('## ')) {
      currentCategory = trimmedLine.replace('## ', '');
      continue;
    }

    // Check if line is a question
    if (trimmedLine.startsWith('- ') && trimmedLine.includes('|')) {
      const questionPart = trimmedLine.substring(2); // Remove "- "
      const parts = questionPart.split(' | ');

      if (parts.length >= 3) {
        const questionText = parts[0];
        const levelMatch = parts[1].match(/level: (\d+)/);
        const difficultyMatch = parts[2].match(/difficulty: (easy|medium|hard)/);

        if (levelMatch && difficultyMatch) {
          questions.push({
            id: `${currentCategory.toLowerCase().replace(/[^a-z0-9]/g, '')}_${questions.length}`,
            question: questionText,
            category: currentCategory,
            suggestedLevel: parseInt(levelMatch[1]),
            difficulty: difficultyMatch[1] as 'easy' | 'medium' | 'hard',
            tags: [categoryToTag(currentCategory)], // Auto-add category as tag
            archived: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
    }
  }

  return questions;
}

// Filter questions by category
export function filterQuestionsByCategory(
  questions: QuestionPrompt[],
  selectedCategories: string[]
): QuestionPrompt[] {
  if (selectedCategories.length === 0) {
    return questions;
  }

  return questions.filter(q => selectedCategories.includes(q.category));
}

// Get tag counts for filtering
export function getTagCounts(questions: QuestionPrompt[]): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const question of questions) {
    if (question.tags) {
      for (const tag of question.tags) {
        counts[tag.name] = (counts[tag.name] || 0) + 1;
      }
    }
  }

  return counts;
}

// Get category counts (backward compatibility)
export function getCategoryCounts(questions: QuestionPrompt[]): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const question of questions) {
    counts[question.category] = (counts[question.category] || 0) + 1;
  }

  return counts;
}

// Get a curated mix of 12 questions from different categories
export function getCuratedQuestions(questions: QuestionPrompt[]): QuestionPrompt[] {
  if (questions.length === 0) return [];

  // Filter out archived questions
  const activeQuestions = questions.filter(q => !q.archived);

  // Group questions by category
  const questionsByCategory: Record<string, QuestionPrompt[]> = {};
  for (const question of activeQuestions) {
    if (!questionsByCategory[question.category]) {
      questionsByCategory[question.category] = [];
    }
    questionsByCategory[question.category].push(question);
  }

  // Get ~2 questions from each category to make 12 total
  const selectedQuestions: QuestionPrompt[] = [];
  const categories = Object.keys(questionsByCategory);
  const questionsPerCategory = Math.floor(12 / categories.length);
  const remainder = 12 % categories.length;

  categories.forEach((category, index) => {
    const categoryQuestions = questionsByCategory[category];
    // Shuffle questions in this category
    const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);

    // Take questionsPerCategory + 1 if we need to distribute remainder
    const takeCount = questionsPerCategory + (index < remainder ? 1 : 0);
    selectedQuestions.push(...shuffled.slice(0, takeCount));
  });

  // Shuffle the final selection
  return selectedQuestions.sort(() => Math.random() - 0.5).slice(0, 12);
}

// Get 3 random questions from different categories for homepage
export function getRandomQuestions(questions: QuestionPrompt[], count: number = 3, excludeIds: string[] = []): QuestionPrompt[] {
  if (questions.length === 0) return [];

  // Filter out archived questions and excluded questions
  const activeQuestions = questions.filter(q => !q.archived && !excludeIds.includes(q.id));

  if (activeQuestions.length === 0) return [];

  // Group questions by category
  const questionsByCategory: Record<string, QuestionPrompt[]> = {};
  for (const question of activeQuestions) {
    if (!questionsByCategory[question.category]) {
      questionsByCategory[question.category] = [];
    }
    questionsByCategory[question.category].push(question);
  }

  const categories = Object.keys(questionsByCategory);
  const selectedQuestions: QuestionPrompt[] = [];

  // Try to get one question from different categories first
  for (let i = 0; i < count && i < categories.length; i++) {
    const category = categories[i];
    const categoryQuestions = questionsByCategory[category];
    const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
    if (shuffled.length > 0) {
      selectedQuestions.push(shuffled[0]);
      // Remove selected question from the pool
      questionsByCategory[category] = categoryQuestions.filter(q => q.id !== shuffled[0].id);
    }
  }

  // If we need more questions, pick randomly from remaining
  while (selectedQuestions.length < count) {
    const remainingQuestions = Object.values(questionsByCategory).flat();
    if (remainingQuestions.length === 0) break;

    const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
    const selectedQuestion = remainingQuestions[randomIndex];
    selectedQuestions.push(selectedQuestion);

    // Remove from the pool
    for (const category of Object.keys(questionsByCategory)) {
      questionsByCategory[category] = questionsByCategory[category].filter(q => q.id !== selectedQuestion.id);
    }
  }

  return selectedQuestions;
}

// Admin helper functions
export function getActiveQuestions(questions: QuestionPrompt[]): QuestionPrompt[] {
  return questions.filter(q => !q.archived);
}

export function getArchivedQuestions(questions: QuestionPrompt[]): QuestionPrompt[] {
  return questions.filter(q => q.archived);
}

export function archiveQuestion(questionId: string, questions: QuestionPrompt[]): QuestionPrompt[] {
  return questions.map(q =>
    q.id === questionId
      ? { ...q, archived: true, updatedAt: new Date().toISOString() }
      : q
  );
}

export function unarchiveQuestion(questionId: string, questions: QuestionPrompt[]): QuestionPrompt[] {
  return questions.map(q =>
    q.id === questionId
      ? { ...q, archived: false, updatedAt: new Date().toISOString() }
      : q
  );
}

export function createNewQuestion(
  question: string,
  category: QuestionCategory,
  suggestedLevel: number,
  difficulty: 'easy' | 'medium' | 'hard',
  additionalTags: Tag[] = []
): QuestionPrompt {
  const now = new Date().toISOString();
  const categoryTag = categoryToTag(category);

  // Ensure category is always included as a tag, plus any additional tags
  const allTags = [categoryTag, ...additionalTags];

  return {
    id: `${category.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}`,
    question,
    category,
    suggestedLevel,
    difficulty,
    tags: allTags,
    archived: false,
    createdAt: now,
    updatedAt: now
  };
}

export function updateQuestion(
  questionId: string,
  questions: QuestionPrompt[],
  updates: Partial<QuestionPrompt>
): QuestionPrompt[] {
  return questions.map(q => {
    if (q.id === questionId) {
      const updatedQuestion = { ...q, ...updates, updatedAt: new Date().toISOString() };

      // If tags are being updated, ensure category is always included
      if (updates.tags) {
        const categoryTag = categoryToTag(q.category);
        const otherTags = updates.tags.filter(tag => tag.name !== categoryTag.name);
        updatedQuestion.tags = [categoryTag, ...otherTags];
      }

      return updatedQuestion;
    }
    return q;
  });
}

// Mock questions data (fallback if markdown fails to load)
export const mockQuestions: QuestionPrompt[] = [
  {
    id: 'personal_1',
    question: "What's a habit you have that you think is weird?",
    category: 'Personal',
    suggestedLevel: 2,
    difficulty: 'easy',
    tags: [categoryToTag('Personal'), { name: 'quirky', type: 'topic' }],
    archived: false
  },
  {
    id: 'relationships_1',
    question: "Who was your first crush and what happened?",
    category: 'Relationships',
    suggestedLevel: 3,
    difficulty: 'medium',
    tags: [categoryToTag('Relationships'), { name: 'dating', type: 'topic' }],
    archived: false
  },
  {
    id: 'embarrassing_1',
    question: "What's the most embarrassing thing that's happened to you in public?",
    category: 'Embarrassing',
    suggestedLevel: 4,
    difficulty: 'medium',
    tags: [categoryToTag('Embarrassing'), { name: 'funny', type: 'mood' }],
    archived: false
  },
  {
    id: 'fears_1',
    question: "What's your biggest regret in life so far?",
    category: 'Fears & Dreams',
    suggestedLevel: 5,
    difficulty: 'hard',
    tags: [categoryToTag('Fears & Dreams'), { name: 'deep', type: 'mood' }],
    archived: false
  },
  {
    id: 'opinions_1',
    question: "What's an unpopular opinion you hold?",
    category: 'Opinions',
    suggestedLevel: 3,
    difficulty: 'medium',
    tags: [categoryToTag('Opinions'), { name: 'controversial', type: 'topic' }],
    archived: false
  },
  {
    id: 'work_1',
    question: "What's the worst mistake you've made at work/school?",
    category: 'Work/School',
    suggestedLevel: 4,
    difficulty: 'medium',
    tags: [categoryToTag('Work/School'), { name: 'career', type: 'topic' }],
    archived: false
  },
  {
    id: 'random_1',
    question: "What's your weirdest guilty pleasure?",
    category: 'Random',
    suggestedLevel: 2,
    difficulty: 'easy',
    tags: [categoryToTag('Random'), { name: 'fun', type: 'mood' }],
    archived: false
  }
];

// Question Type Labels and Descriptions
export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  text: 'Text Answer',
  slider: 'Slider Scale',
  multipleChoice: 'Multiple Choice'
};

export const QUESTION_TYPE_DESCRIPTIONS: Record<QuestionType, string> = {
  text: 'Traditional text-based answer (up to 100 words)',
  slider: 'Numeric scale with custom labels (e.g., 1-10)',
  multipleChoice: 'Select from predefined options'
};

// Helper: Get default config for a question type
export function getDefaultAnswerConfig(type: QuestionType): AnswerConfig {
  switch (type) {
    case 'text':
      return { type: 'text' };
    case 'slider':
      return {
        type: 'slider',
        config: {
          min: 1,
          max: 10,
          minLabel: 'Not at all',
          maxLabel: 'Extremely',
          step: 1
        }
      };
    case 'multipleChoice':
      return {
        type: 'multipleChoice',
        config: {
          options: ['Option 1', 'Option 2', 'Option 3'],
          allowMultiple: false,
          useRoomMembers: false,
          showDistribution: true
        }
      };
  }
}