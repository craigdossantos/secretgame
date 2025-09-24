'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { QuestionSelector } from '@/components/question-selector';
import { parseQuestions, QuestionPrompt, mockQuestions, getCuratedQuestions } from '@/lib/questions';

export default function CreateRoomPage() {
  const router = useRouter();
  const [step, setStep] = useState<'basic' | 'questions' | 'success'>('basic');
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [allQuestions, setAllQuestions] = useState<QuestionPrompt[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [customQuestions, setCustomQuestions] = useState<QuestionPrompt[]>([]);

  // Load questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const questionsResponse = await fetch('/questions.md');
        if (questionsResponse.ok) {
          const markdownContent = await questionsResponse.text();
          const parsedQuestions = parseQuestions(markdownContent);
          setAllQuestions(getCuratedQuestions(parsedQuestions));
        } else {
          setAllQuestions(getCuratedQuestions(mockQuestions));
        }
      } catch (error) {
        setAllQuestions(getCuratedQuestions(mockQuestions));
      }
    };
    loadQuestions();
  }, []);

  const handleBasicInfoNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      setStep('questions');
    }
  };

  const handleSelectionChange = (selectedIds: string[], customQuestions: QuestionPrompt[]) => {
    setSelectedQuestionIds(selectedIds);
    setCustomQuestions(customQuestions);
  };

  const handleCreateRoom = async () => {
    setError('');
    setIsCreating(true);

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: roomName || 'Secret Room',
          userName: userName.trim(),
          questionIds: selectedQuestionIds,
          customQuestions: customQuestions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create room');
      }

      setInviteUrl(data.inviteUrl);
      setRoomId(data.roomId);
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setIsCreating(false);
    }
  };

  const copyInviteUrl = () => {
    navigator.clipboard.writeText(inviteUrl);
  };

  const goToRoom = () => {
    router.push(`/rooms/${roomId}`);
  };

  if (step === 'success' && inviteUrl) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Room Created! 🎉</h1>
            <p className="text-gray-600">Share this invite link with your friends</p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={inviteUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                onClick={copyInviteUrl}
                variant="outline"
                size="icon"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <Button onClick={goToRoom} className="w-full">
              Enter Room
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            Save this link! You&apos;ll need it to invite friends.
          </p>
        </Card>
      </div>
    );
  }

  if (step === 'basic') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Create a Secret Room</h1>
            <p className="text-lg text-gray-600">Set up your room and choose questions for your friends</p>
          </div>

          <div className="flex items-center justify-center">
            <Card className="max-w-md w-full p-6">
              <h2 className="text-xl font-semibold mb-6">Basic Information</h2>

              <form onSubmit={handleBasicInfoNext} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userName">Your Name</Label>
                  <Input
                    id="userName"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roomName">Room Name (optional)</Label>
                  <Input
                    id="roomName"
                    placeholder="e.g., Friends' Secrets"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full flex items-center gap-2"
                  disabled={!userName.trim()}
                >
                  Next: Choose Questions
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>

              <p className="text-sm text-gray-500 mt-6 text-center">
                You&apos;ll choose 3 questions in the next step
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'questions') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Choose Questions</h1>
              <p className="text-lg text-gray-600">Select exactly 3 questions for your room: {roomName || 'Secret Room'}</p>
            </div>
            <Button
              onClick={() => setStep('basic')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>

          {/* Question Selection */}
          <div className="mb-8">
            <QuestionSelector
              questions={allQuestions}
              selectedQuestionIds={selectedQuestionIds}
              onSelectionChange={handleSelectionChange}
              maxSelections={3}
            />
          </div>

          {/* Create Room Button */}
          <div className="flex justify-center">
            <Card className="p-6">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <Button
                onClick={handleCreateRoom}
                className="w-full flex items-center gap-2"
                disabled={isCreating || selectedQuestionIds.length !== 3}
                size="lg"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Room...
                  </>
                ) : (
                  `Create Room with ${selectedQuestionIds.length + customQuestions.length} Questions`
                )}
              </Button>

              <p className="text-sm text-gray-500 mt-2 text-center">
                {selectedQuestionIds.length === 3
                  ? 'Ready to create your room!'
                  : `Select ${3 - selectedQuestionIds.length} more question${3 - selectedQuestionIds.length !== 1 ? 's' : ''}`
                }
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null; // This should not happen
}