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
    <div className="min-h-screen bg-background art-deco-pattern">
      {/* Sticky Header with Room Creation Form */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-6 text-center">
            <h1 className="text-5xl font-serif mb-3 text-foreground art-deco-text art-deco-shadow">The Secret Game</h1>
            <div className="art-deco-divider my-4">
              <span>◆ ◆ ◆</span>
            </div>
            <p className="text-lg text-muted-foreground">
              Select questions, create a room, and start sharing secrets with friends
            </p>
          </div>

          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label htmlFor="userName" className="block text-sm font-medium text-foreground mb-2 art-deco-text">
                Your Name
              </label>
              <Input
                id="userName"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-secondary/30 border-border text-foreground placeholder:text-muted-foreground"
                disabled={isCreating}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="roomName" className="block text-sm font-medium text-foreground mb-2 art-deco-text">
                Room Name
              </label>
              <Input
                id="roomName"
                placeholder="Enter room name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full bg-secondary/30 border-border text-foreground placeholder:text-muted-foreground"
                disabled={isCreating}
              />
            </div>
            <Button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="art-deco-border bg-primary text-primary-foreground hover:bg-primary/90 px-6 h-10 art-deco-text art-deco-glow"
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
