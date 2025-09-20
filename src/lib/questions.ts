export interface Tag {
  name: string;
  type: 'category' | 'topic' | 'priority' | 'mood' | 'format';
  color?: string;
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

// Tag type colors following research-based best practices
export const TAG_TYPE_COLORS = {
  category: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  topic: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  priority: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  mood: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  format: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
};

// Convert category to tag
export function categoryToTag(category: string): Tag {
  return {
    name: category.toLowerCase(),
    type: 'category'
  };
}

// Get tag styling classes
export function getTagStyles(tag: Tag): string {
  const colors = TAG_TYPE_COLORS[tag.type];
  return `${colors.bg} ${colors.text} ${colors.border}`;
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