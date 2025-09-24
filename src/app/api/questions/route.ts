import { NextRequest } from 'next/server';
import { parseQuestions, getCuratedQuestions, mockQuestions } from '@/lib/questions';
import { successResponse, errorResponse } from '@/lib/api/helpers';

// GET /api/questions - Get curated questions for room selection
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '12');
    const type = searchParams.get('type') || 'curated'; // 'curated', 'random', or 'all'

    let questions;

    try {
      // Try to load questions from markdown file
      const questionsResponse = await fetch(new URL('/questions.md', process.env.NEXTAUTH_URL || 'http://localhost:3000'));
      if (questionsResponse.ok) {
        const markdownContent = await questionsResponse.text();
        const parsedQuestions = parseQuestions(markdownContent);
        questions = parsedQuestions;
      } else {
        questions = mockQuestions;
      }
    } catch (error) {
      console.warn('Error loading questions from markdown:', error);
      questions = mockQuestions;
    }

    let responseQuestions;

    switch (type) {
      case 'curated':
        responseQuestions = getCuratedQuestions(questions);
        break;
      case 'random':
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        responseQuestions = shuffled.slice(0, count);
        break;
      case 'all':
        responseQuestions = questions;
        break;
      default:
        responseQuestions = getCuratedQuestions(questions);
    }

    return successResponse({
      questions: responseQuestions,
      total: questions.length,
      count: responseQuestions.length,
      type
    });
  } catch (error) {
    console.error('Failed to get questions:', error);
    return errorResponse('Failed to get questions', 500);
  }
}