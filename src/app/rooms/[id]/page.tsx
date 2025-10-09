'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QuestionGrid } from '@/components/question-grid';
import { SecretCard } from '@/components/secret-card';
import { UnlockDrawer } from '@/components/unlock-drawer';
import { parseQuestions, QuestionPrompt, mockQuestions } from '@/lib/questions';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Room {
  id: string;
  name: string;
  memberCount: number;
  inviteCode: string;
  ownerId: string;
  questionIds?: string[];
}

interface Secret {
  id: string;
  body: string;
  selfRating: number;
  importance: number;
  avgRating: number | null;
  buyersCount: number;
  authorName: string;
  authorAvatar?: string;
  createdAt: string; // ISO string from API
  isUnlocked?: boolean;
  questionId?: string;
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [roomQuestions, setRoomQuestions] = useState<QuestionPrompt[]>([]); // All questions in room
  const [displayedQuestions, setDisplayedQuestions] = useState<QuestionPrompt[]>([]); // 3 currently shown
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>([]);
  const [skippedQuestionIds, setSkippedQuestionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [unlockDrawerOpen, setUnlockDrawerOpen] = useState(false);
  const [selectedSecretToUnlock, setSelectedSecretToUnlock] = useState<Secret | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Load room data and questions
  useEffect(() => {
    const loadRoomData = async () => {
      try {
        setLoading(true);

        // Load room details
        const roomResponse = await fetch(`/api/rooms/${roomId}`);
        if (!roomResponse.ok) {
          throw new Error('Room not found');
        }
        const roomData = await roomResponse.json();
        setRoom(roomData.room);

        // Get current user ID from cookies
        const userId = document.cookie
          .split('; ')
          .find(row => row.startsWith('userId='))
          ?.split('=')[1];
        setCurrentUserId(userId || null);

        // Load questions from markdown file
        try {
          const questionsResponse = await fetch('/questions.md');
          if (questionsResponse.ok) {
            const markdownContent = await questionsResponse.text();
            const parsedQuestions = parseQuestions(markdownContent);

            // Filter questions for this room
            const roomQs: QuestionPrompt[] = [];

            // Add selected regular questions
            if (roomData.room.questionIds && roomData.room.questionIds.length > 0) {
              const selectedQuestions = parsedQuestions.filter(q =>
                roomData.room.questionIds.includes(q.id)
              );
              roomQs.push(...selectedQuestions);
            }

            // Add custom questions
            if (roomData.room.customQuestions && roomData.room.customQuestions.length > 0) {
              const customQuestions = roomData.room.customQuestions.map((cq: {
                id: string;
                question: string;
                category: string;
                suggestedLevel: number;
                difficulty: string;
                createdAt: string | Date;
              }) => ({
                id: cq.id,
                question: cq.question,
                category: cq.category,
                suggestedLevel: cq.suggestedLevel,
                difficulty: cq.difficulty,
                tags: [{ name: cq.category.toLowerCase(), type: 'category' as const }],
                archived: false,
                createdAt: cq.createdAt,
                updatedAt: cq.createdAt
              }));
              roomQs.push(...customQuestions);
            }

            setRoomQuestions(roomQs);
          } else {
            // Fallback to mock questions
            console.warn('Could not load questions.md, using mock questions');

            const roomQs: QuestionPrompt[] = [];

            // Add selected regular questions
            if (roomData.room.questionIds && roomData.room.questionIds.length > 0) {
              const selectedQuestions = mockQuestions.filter(q =>
                roomData.room.questionIds.includes(q.id)
              );
              roomQs.push(...selectedQuestions);
            }

            // Add custom questions
            if (roomData.room.customQuestions && roomData.room.customQuestions.length > 0) {
              const customQuestions = roomData.room.customQuestions.map((cq: {
                id: string;
                question: string;
                category: string;
                suggestedLevel: number;
                difficulty: string;
                createdAt: string | Date;
              }) => ({
                id: cq.id,
                question: cq.question,
                category: cq.category,
                suggestedLevel: cq.suggestedLevel,
                difficulty: cq.difficulty,
                tags: [{ name: cq.category.toLowerCase(), type: 'category' as const }],
                archived: false,
                createdAt: cq.createdAt,
                updatedAt: cq.createdAt
              }));
              roomQs.push(...customQuestions);
            }

            setRoomQuestions(roomQs);
          }
        } catch (questionsError) {
          console.warn('Error loading questions:', questionsError);
          setRoomQuestions([]);
        }

        // Load room secrets
        const secretsResponse = await fetch(`/api/rooms/${roomId}/secrets`);
        if (secretsResponse.ok) {
          const secretsData = await secretsResponse.json();
          setSecrets(secretsData.secrets || []);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load room');
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      loadRoomData();
    }
  }, [roomId]);

  // Helper: Update the 3 displayed questions
  const updateDisplayedQuestions = React.useCallback(() => {
    const availableQuestions = roomQuestions.filter(
      q => !answeredQuestionIds.includes(q.id) && !skippedQuestionIds.includes(q.id)
    );

    // Always show up to 3 questions
    const questionsToShow = availableQuestions.slice(0, 3);
    setDisplayedQuestions(questionsToShow);
  }, [roomQuestions, answeredQuestionIds, skippedQuestionIds]);

  // Update displayed questions when dependencies change
  useEffect(() => {
    if (roomQuestions.length > 0) {
      updateDisplayedQuestions();
    }
  }, [roomQuestions, answeredQuestionIds, skippedQuestionIds, updateDisplayedQuestions]);

  const handleSkipQuestion = (questionId: string) => {
    setSkippedQuestionIds(prev => [...prev, questionId]);
    // updateDisplayedQuestions will be called by useEffect
  };

  const handleSubmitAnswer = async (answer: {
    questionId: string;
    body: string;
    selfRating: number;
    importance: number;
  }) => {
    try {
      // Submit answer as a secret
      const response = await fetch('/api/secrets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          questionId: answer.questionId,
          body: answer.body,
          selfRating: answer.selfRating,
          importance: answer.importance,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit answer');
      }

      const data = await response.json();
      toast.success(data.message || 'Secret submitted successfully!');

      // Mark question as answered
      if (!answeredQuestionIds.includes(answer.questionId)) {
        setAnsweredQuestionIds(prev => [...prev, answer.questionId]);
      }

      // Reload secrets to show the new one
      const secretsResponse = await fetch(`/api/rooms/${roomId}/secrets`);
      if (secretsResponse.ok) {
        const secretsData = await secretsResponse.json();
        setSecrets(secretsData.secrets || []);
      }

    } catch (error) {
      console.error('Failed to submit answer:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit answer');
    }
  };

  const handleUnlock = (secretId: string) => {
    const secret = secrets.find(s => s.id === secretId);
    if (secret) {
      setSelectedSecretToUnlock(secret);
      setUnlockDrawerOpen(true);
    }
  };

  const handleUnlockSubmit = async (unlockData: {
    body: string;
    selfRating: number;
    importance: number;
  }) => {
    if (!selectedSecretToUnlock) return;

    try {
      const response = await fetch(`/api/secrets/${selectedSecretToUnlock.id}/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: selectedSecretToUnlock.questionId || selectedSecretToUnlock.id, // Use secret's questionId
          body: unlockData.body,
          selfRating: unlockData.selfRating,
          importance: unlockData.importance,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unlock secret');
      }

      await response.json();
      toast.success('Secret unlocked!');

      // Reload secrets to show unlocked state
      const secretsResponse = await fetch(`/api/rooms/${roomId}/secrets`);
      if (secretsResponse.ok) {
        const secretsData = await secretsResponse.json();
        setSecrets(secretsData.secrets || []);
      }

      setUnlockDrawerOpen(false);
      setSelectedSecretToUnlock(null);
    } catch (error) {
      console.error('Failed to unlock secret:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to unlock secret');
      throw error; // Re-throw so UnlockDrawer can handle loading state
    }
  };

  const handleRate = async (secretId: string, rating: number) => {
    try {
      const response = await fetch(`/api/secrets/${secretId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to rate secret');
      }

      const data = await response.json();
      toast.success('Rating submitted!');

      // Update the secret in state with new average
      setSecrets(prevSecrets =>
        prevSecrets.map(s =>
          s.id === secretId ? { ...s, avgRating: data.avgRating } : s
        )
      );
    } catch (error) {
      console.error('Failed to rate secret:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit rating');
    }
  };

  const copyInviteLink = async () => {
    if (room) {
      const inviteUrl = `${window.location.origin}/invite/${room.inviteCode}`;
      await navigator.clipboard.writeText(inviteUrl);
      setIsCopied(true);
      toast.success('Invite link copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Room Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Top row: Title and back button */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="rounded-full"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {room?.name || 'Secret Room'}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {room?.memberCount || 1} member{room?.memberCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Invite link card */}
          {room && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs text-blue-700 font-medium mb-1">Invite Friends</p>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {`${window.location.origin}/invite/${room.inviteCode}`}
                  </p>
                </div>
                <Button
                  onClick={copyInviteLink}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 shrink-0 bg-white"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content - Unified Feed */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {roomQuestions.length === 0 ? (
          /* No Questions in Room State */
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <div className="mb-4">
              <div className="text-6xl mb-4">❓</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Questions Yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {room?.ownerId === currentUserId
                  ? "Get the conversation started by adding some spicy questions for your group!"
                  : "Waiting for questions to be added to this room."}
              </p>
            </div>
            {room?.ownerId === currentUserId && (
              <Button
                onClick={() => router.push(`/admin?room=${roomId}`)}
                size="lg"
                className="rounded-xl"
              >
                Add Questions to Room
              </Button>
            )}
          </div>
        ) : (
          /* Unified Feed: Questions at top, Secrets below */
          <div className="space-y-8">
            {/* Unanswered Questions (3 at a time) */}
            {displayedQuestions.length > 0 && (
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Answer Questions to Share Secrets
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Click a question to flip it and share your answer
                  </p>
                </div>
                <QuestionGrid
                  questions={displayedQuestions}
                  answeredQuestionIds={answeredQuestionIds}
                  onSubmitAnswer={handleSubmitAnswer}
                  onSkipQuestion={handleSkipQuestion}
                />
              </div>
            )}

            {/* All Questions Answered State */}
            {displayedQuestions.length === 0 && roomQuestions.length > 0 && (
              <div className="text-center py-8 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  All Questions Answered!
                </h3>
                <p className="text-sm text-gray-600">
                  You&apos;ve answered or skipped all available questions.
                </p>
              </div>
            )}

            {/* Secrets Feed */}
            {secrets.length > 0 && (
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Secrets ({secrets.length})
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Your secrets appear unlocked. Unlock others&apos; by sharing secrets of equal or higher spiciness.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {secrets.map((secret) => (
                    <SecretCard
                      key={secret.id}
                      secret={secret}
                      onUnlock={handleUnlock}
                      onRate={handleRate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No Secrets Yet State (only if there are questions) */}
            {secrets.length === 0 && roomQuestions.length > 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <div className="text-6xl mb-4">🤫</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Secrets Yet
                </h3>
                <p className="text-gray-600">
                  Be the first to share a secret by answering a question above!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Unlock Drawer */}
      {selectedSecretToUnlock && (
        <UnlockDrawer
          isOpen={unlockDrawerOpen}
          onOpenChange={setUnlockDrawerOpen}
          requiredRating={selectedSecretToUnlock.selfRating}
          onSubmit={handleUnlockSubmit}
        />
      )}
    </div>
  );
}