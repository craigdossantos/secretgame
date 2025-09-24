'use client';

import { useState, useEffect } from 'react';
import { SecretCard } from '@/components/secret-card';
import { UnlockDrawer } from '@/components/unlock-drawer';
import { QuestionGrid } from '@/components/question-grid';
import { parseQuestions, QuestionPrompt, mockQuestions, getRandomQuestions } from '@/lib/questions';

// Mock data for demo
const mockSecrets = [
  {
    id: '1',
    body: 'I once pretended to be sick to skip my own birthday party because I was too anxious about people singing happy birthday to me.',
    selfRating: 3,
    importance: 4,
    avgRating: 3.2,
    buyersCount: 5,
    authorName: 'Sarah M.',
    createdAt: new Date('2024-01-15'),
    isUnlocked: true,
  },
  {
    id: '2',
    body: 'I have a secret stash of candy hidden in my closet that I eat when I\'m stressed, and I\'ve never told anyone about it...',
    selfRating: 2,
    importance: 2,
    avgRating: null,
    buyersCount: 0,
    authorName: 'Alex K.',
    createdAt: new Date('2024-01-16'),
    isUnlocked: false,
  },
  {
    id: '3',
    body: 'I accidentally sent a love confession text to my mom instead of my crush. She replied with grocery list items.',
    selfRating: 4,
    importance: 3,
    avgRating: 4.1,
    buyersCount: 8,
    authorName: 'Jordan T.',
    createdAt: new Date('2024-01-17'),
    isUnlocked: true,
  },
  {
    id: '4',
    body: 'Sometimes I talk to my plants and pretend they\'re giving me life advice. Yesterday my fiddle leaf fig told me to quit my job...',
    selfRating: 1,
    importance: 1,
    avgRating: null,
    buyersCount: 0,
    authorName: 'Casey L.',
    createdAt: new Date('2024-01-18'),
    isUnlocked: false,
  },
];

export default function Home() {
  const [selectedSecret, setSelectedSecret] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [allQuestions, setAllQuestions] = useState<QuestionPrompt[]>([]);
  const [displayedQuestions, setDisplayedQuestions] = useState<QuestionPrompt[]>([]);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>([]);

  // Load questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const questionsResponse = await fetch('/questions.md');
        if (questionsResponse.ok) {
          const markdownContent = await questionsResponse.text();
          const parsedQuestions = parseQuestions(markdownContent);
          console.log('Parsed questions:', parsedQuestions.slice(0, 3)); // Debug first 3 questions
          setAllQuestions(parsedQuestions);
          setDisplayedQuestions(getRandomQuestions(parsedQuestions, 3));
        } else {
          console.warn('Could not load questions.md, using mock questions');
          setAllQuestions(mockQuestions);
          setDisplayedQuestions(getRandomQuestions(mockQuestions, 3));
        }
      } catch (error) {
        console.warn('Error loading questions:', error);
        setAllQuestions(mockQuestions);
        setDisplayedQuestions(getRandomQuestions(mockQuestions, 3));
      }
    };

    loadQuestions();
  }, []);

  const refreshQuestions = () => {
    setDisplayedQuestions(getRandomQuestions(allQuestions, 3, answeredQuestionIds));
  };

  const handleUnlock = (secretId: string) => {
    setSelectedSecret(secretId);
    setIsDrawerOpen(true);
  };

  const handleSubmitSecret = async (newSecret: { body: string; selfRating: number; importance: number }) => {
    console.log('New secret submitted:', newSecret);
    // Here you would normally call your API
    // For demo, we'll just close the drawer
    setIsDrawerOpen(false);
    setSelectedSecret(null);
  };

  const handleRate = (secretId: string, rating: number) => {
    console.log(`Rated secret ${secretId} with ${rating} stars`);
    // Here you would normally call your API
  };

  const handleSubmitAnswer = async (answer: {
    questionId: string;
    body: string;
    selfRating: number;
    importance: number;
  }) => {
    console.log('Demo answer submitted:', answer);

    // Mark question as answered
    setAnsweredQuestionIds(prev => [...prev, answer.questionId]);

    // For demo purposes, show alert
    alert(`Question answered! In a real room, this would become a secret that others can unlock.`);
  };

  const targetSecret = mockSecrets.find(s => s.id === selectedSecret);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl font-bold mb-2">The Secret Game</h1>
        <p className="text-lg text-gray-600">Exchange secrets with your friends</p>
        <div className="flex gap-4 mt-4">
          <a
            href="/create"
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Create Room
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Question Prompts */}
        <div className="mb-12">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Try Out Question Prompts
              </h2>
              <p className="text-gray-600">
                Click on any question card to flip it and see how the answer form works. Create a room to share answers as secrets!
              </p>
            </div>
            <button
              onClick={refreshQuestions}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              disabled={displayedQuestions.length === 0}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh Questions
            </button>
          </div>
          {displayedQuestions.length > 0 ? (
            <QuestionGrid
              questions={displayedQuestions}
              answeredQuestionIds={answeredQuestionIds}
              onSubmitAnswer={handleSubmitAnswer}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading questions...</p>
            </div>
          )}
        </div>

        {/* Example Secrets */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Example Secrets
            </h2>
            <p className="text-gray-600">
              See how secrets look when they&apos;re shared in a room
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockSecrets.map((secret) => (
              <SecretCard
                key={secret.id}
                secret={secret}
                onUnlock={handleUnlock}
                onRate={handleRate}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Unlock Drawer */}
      <UnlockDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        requiredRating={targetSecret?.selfRating || 1}
        onSubmit={handleSubmitSecret}
      />
    </main>
  );
}
