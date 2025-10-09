'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionSelector } from '@/components/question-selector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { parseQuestions, QuestionPrompt, mockQuestions } from '@/lib/questions';
import { toast } from 'sonner';

export default function Home() {
  const router = useRouter();
  const [allQuestions, setAllQuestions] = useState<QuestionPrompt[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [customQuestions, setCustomQuestions] = useState<QuestionPrompt[]>([]);
  const [userName, setUserName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Load questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const questionsResponse = await fetch('/questions.md');
        if (questionsResponse.ok) {
          const markdownContent = await questionsResponse.text();
          const parsedQuestions = parseQuestions(markdownContent);
          setAllQuestions(parsedQuestions);
        } else {
          console.warn('Could not load questions.md, using mock questions');
          setAllQuestions(mockQuestions);
        }
      } catch (error) {
        console.warn('Error loading questions:', error);
        setAllQuestions(mockQuestions);
      }
    };

    loadQuestions();
  }, []);

  const handleSelectionChange = (selectedIds: string[], customQs: QuestionPrompt[]) => {
    setSelectedQuestionIds(selectedIds);
    setCustomQuestions(customQs);
  };

  const handleCreateRoom = async () => {
    // Validation
    if (!userName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!roomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }

    if (selectedQuestionIds.length === 0) {
      toast.error('Please select at least one question');
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: userName.trim(),
          name: roomName.trim(),
          questionIds: selectedQuestionIds.filter(id =>
            !customQuestions.some(cq => cq.id === id)
          ),
          customQuestions: customQuestions.map(cq => ({
            question: cq.question,
            category: cq.category,
            suggestedLevel: cq.suggestedLevel,
            difficulty: cq.difficulty || 'medium',
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to create room');
        return;
      }

      // Immediately redirect to the room
      toast.success(`Room "${data.name}" created successfully!`);
      router.push(`/rooms/${data.roomId}`);
    } catch (error) {
      console.error('Failed to create room:', error);
      toast.error('Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header with Room Creation Form */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-4">
            <h1 className="text-4xl font-bold mb-2">The Secret Game</h1>
            <p className="text-lg text-gray-600">
              Select questions, create a room, and start sharing secrets with friends
            </p>
          </div>

          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <Input
                id="userName"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full"
                disabled={isCreating}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-1">
                Room Name
              </label>
              <Input
                id="roomName"
                placeholder="Enter room name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full"
                disabled={isCreating}
              />
            </div>
            <Button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="rounded-xl px-6 h-10"
              size="lg"
            >
              {isCreating ? 'Creating...' : 'Create Room'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Question Selection */}
      <main className="max-w-7xl mx-auto p-6">
        <QuestionSelector
          questions={allQuestions}
          selectedQuestionIds={selectedQuestionIds}
          onSelectionChange={handleSelectionChange}
          maxSelections={null}
        />
      </main>
    </div>
  );
}
