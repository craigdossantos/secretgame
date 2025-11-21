'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QuestionCard } from '@/components/question-card';
import { SecretCard } from '@/components/secret-card';
import { UnlockDrawer } from '@/components/unlock-drawer';
import { UnlockQuestionModal } from '@/components/unlock-question-modal';
import { CustomQuestionModal } from '@/components/custom-question-modal';
import { WelcomeModal } from '@/components/welcome-modal';
import { UserIdentityHeader } from '@/components/user-identity-header';
import { SetupModeView } from '@/components/setup-mode-view';
import { CollaborativeAnswersModal } from '@/components/collaborative-answers-modal';
import { EmptyState } from '@/components/empty-state';
import { parseQuestions, QuestionPrompt, mockQuestions } from '@/lib/questions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Users, Copy, Check, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Room {
  id: string;
  name: string;
  memberCount: number;
  inviteCode: string;
  ownerId: string;
  questionIds?: string[];
  setupMode?: boolean;
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
  questionText?: string;
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
  const [unlockQuestionModalOpen, setUnlockQuestionModalOpen] = useState(false);
  const [questionForUnlock, setQuestionForUnlock] = useState<QuestionPrompt | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isCustomQuestionModalOpen, setIsCustomQuestionModalOpen] = useState(false);
  const [userSpicinessRatings, setUserSpicinessRatings] = useState<Record<string, number>>({});
  const [collaborativeModalOpen, setCollaborativeModalOpen] = useState(false);
  const [selectedCollaborativeQuestion, setSelectedCollaborativeQuestion] = useState<QuestionPrompt | null>(null);

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

        // Load questions from YAML file
        try {
          const questionsResponse = await fetch('/questions.yaml');
          if (questionsResponse.ok) {
            const yamlContent = await questionsResponse.text();
            const parsedQuestions = parseQuestions(yamlContent);

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
            console.log('🏠 LOADING CUSTOM QUESTIONS');
            console.log('Custom questions from API:', roomData.room.customQuestions);

            if (roomData.room.customQuestions && roomData.room.customQuestions.length > 0) {
              const customQuestions = roomData.room.customQuestions.map((cq: {
                id: string;
                question: string;
                category: string;
                suggestedLevel: number;
                difficulty: string;
                createdAt: string | Date;
                questionType?: string;
                answerConfig?: unknown;
                allowAnonymous?: boolean;
                allowImageUpload?: boolean;
              }) => ({
                id: cq.id,
                question: cq.question,
                category: cq.category,
                suggestedLevel: cq.suggestedLevel,
                difficulty: cq.difficulty,
                tags: [{ name: cq.category.toLowerCase(), type: 'category' as const }],
                archived: false,
                createdAt: cq.createdAt,
                updatedAt: cq.createdAt,
                // Include type-specific fields
                questionType: cq.questionType,
                answerConfig: cq.answerConfig,
                allowAnonymous: cq.allowAnonymous,
                allowImageUpload: cq.allowImageUpload  // Fixed: Include allowImageUpload
              }));
              console.log('📋 MAPPED CUSTOM QUESTIONS:', customQuestions);
              roomQs.push(...customQuestions);
            }

            setRoomQuestions(roomQs);
          } else {
            // Fallback to mock questions
            console.warn('Could not load questions.yaml, using mock questions');

            const roomQs: QuestionPrompt[] = [];

            // Add selected regular questions
            if (roomData.room.questionIds && roomData.room.questionIds.length > 0) {
              const selectedQuestions = mockQuestions.filter(q =>
                roomData.room.questionIds.includes(q.id)
              );
              roomQs.push(...selectedQuestions);
            }

            // Add custom questions
            console.log('🏠 LOADING CUSTOM QUESTIONS');
            console.log('Custom questions from API:', roomData.room.customQuestions);

            if (roomData.room.customQuestions && roomData.room.customQuestions.length > 0) {
              const customQuestions = roomData.room.customQuestions.map((cq: {
                id: string;
                question: string;
                category: string;
                suggestedLevel: number;
                difficulty: string;
                createdAt: string | Date;
                questionType?: string;
                answerConfig?: unknown;
                allowAnonymous?: boolean;
                allowImageUpload?: boolean;
              }) => ({
                id: cq.id,
                question: cq.question,
                category: cq.category,
                suggestedLevel: cq.suggestedLevel,
                difficulty: cq.difficulty,
                tags: [{ name: cq.category.toLowerCase(), type: 'category' as const }],
                archived: false,
                createdAt: cq.createdAt,
                updatedAt: cq.createdAt,
                // Include type-specific fields
                questionType: cq.questionType,
                answerConfig: cq.answerConfig,
                allowAnonymous: cq.allowAnonymous,
                allowImageUpload: cq.allowImageUpload  // Fixed: Include allowImageUpload
              }));
              console.log('📋 MAPPED CUSTOM QUESTIONS:', customQuestions);
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
    answerType?: string;
    answerData?: unknown;
    isAnonymous?: boolean;
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
          answerType: answer.answerType,
          answerData: answer.answerData,
          isAnonymous: answer.isAnonymous,
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
    if (secret && secret.questionId) {
      // Find the question for this secret
      const question = roomQuestions.find(q => q.id === secret.questionId);

      if (question) {
        // Show question-based unlock modal
        setSelectedSecretToUnlock(secret);
        setQuestionForUnlock(question);
        setUnlockQuestionModalOpen(true);
      } else {
        // Fallback to generic unlock drawer if question not found
        setSelectedSecretToUnlock(secret);
        setUnlockDrawerOpen(true);
      }
    } else {
      // No questionId - use generic unlock drawer
      if (secret) {
        setSelectedSecretToUnlock(secret);
        setUnlockDrawerOpen(true);
      }
    }
  };

  const handleUnlockQuestionSubmit = async (answer: {
    questionId: string;
    body: string;
    selfRating: number;
    importance: number;
    answerType?: string;
    answerData?: unknown;
    isAnonymous?: boolean;
  }) => {
    if (!selectedSecretToUnlock) return;

    try {
      // Submit answer to unlock the target secret
      const response = await fetch(`/api/secrets/${selectedSecretToUnlock.id}/unlock`, {
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
          answerType: answer.answerType,
          answerData: answer.answerData,
          isAnonymous: answer.isAnonymous,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unlock secret');
      }

      toast.success('Secret unlocked! Your answer has been shared.');

      // Close modal
      setUnlockQuestionModalOpen(false);
      setQuestionForUnlock(null);
      setSelectedSecretToUnlock(null);

      // Mark question as answered
      if (!answeredQuestionIds.includes(answer.questionId)) {
        setAnsweredQuestionIds(prev => [...prev, answer.questionId]);
      }

      // Reload secrets to show both the new answer and unlocked secret
      const secretsResponse = await fetch(`/api/rooms/${roomId}/secrets`);
      if (secretsResponse.ok) {
        const secretsData = await secretsResponse.json();
        setSecrets(secretsData.secrets || []);
      }
    } catch (error) {
      console.error('Failed to unlock secret:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to unlock secret');
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
          roomId,
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

  const handleRateSpiciness = (questionId: string, spiciness: number) => {
    setUserSpicinessRatings(prev => ({
      ...prev,
      [questionId]: spiciness
    }));
  };

  const handleCreateCustomQuestion = async (customQuestion: QuestionPrompt) => {
    try {
      const requestBody = {
        question: customQuestion.question,
        category: customQuestion.category,
        suggestedLevel: customQuestion.suggestedLevel,
        difficulty: customQuestion.difficulty || 'medium',
        questionType: customQuestion.questionType || 'text',
        answerConfig: customQuestion.answerConfig,
        allowAnonymous: customQuestion.allowAnonymous || false,
        allowImageUpload: customQuestion.allowImageUpload || false,  // Fixed: Include allowImageUpload
      };

      const response = await fetch(`/api/rooms/${roomId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add custom question');
      }

      const data = await response.json();
      toast.success('Question added to room!');

      // Add the new question to roomQuestions
      const newQuestion: QuestionPrompt = {
        id: data.question.id,
        question: data.question.question,
        category: data.question.category,
        suggestedLevel: data.question.suggestedLevel,
        difficulty: data.question.difficulty,
        tags: [{ name: data.question.category.toLowerCase(), type: 'category' as const }],
        archived: false,
        createdAt: data.question.createdAt,
        updatedAt: data.question.createdAt,
        // Type-specific fields
        questionType: data.question.questionType || 'text',
        answerConfig: data.question.answerConfig,
        allowAnonymous: data.question.allowAnonymous || false,
        allowImageUpload: data.question.allowImageUpload || false  // Fixed: Include allowImageUpload
      };

      // Prepend to room questions (add to start)
      setRoomQuestions(prev => [newQuestion, ...prev]);

      // Prepend to displayed questions (add to start), pushing oldest off if needed
      setDisplayedQuestions(prev => {
        const updated = [newQuestion, ...prev];
        return updated.slice(0, 3); // Keep only first 3
      });

      setIsCustomQuestionModalOpen(false);
    } catch (error) {
      console.error('Failed to add custom question:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add custom question');
    }
  };

  const handleSetupComplete = () => {
    // Reload room data to get updated questions and exit setup mode
    setLoading(true);
    setRoom(null);
    const loadRoomData = async () => {
      try {
        const roomResponse = await fetch(`/api/rooms/${roomId}`);
        if (!roomResponse.ok) {
          throw new Error('Room not found');
        }
        const roomData = await roomResponse.json();
        setRoom(roomData.room);
        setLoading(false);
        // Force reload to get questions and secrets
        window.location.reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load room');
        setLoading(false);
      }
    };
    loadRoomData();
  };

  const handleViewCollaborativeAnswers = (question: QuestionPrompt) => {
    setSelectedCollaborativeQuestion(question);
    setCollaborativeModalOpen(true);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background art-deco-pattern">
        {/* Header Skeleton */}
        <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-secondary/30 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-8 w-48 bg-secondary/30 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-secondary/30 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-10 w-32 bg-secondary/30 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content Skeletons */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-6 text-center">
            <div className="h-8 w-64 bg-secondary/30 rounded mx-auto mb-2 animate-pulse" />
            <div className="h-4 w-96 bg-secondary/30 rounded mx-auto animate-pulse" />
          </div>

          {/* Question Cards Skeleton */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <QuestionCardSkeleton />
            <QuestionCardSkeleton />
            <QuestionCardSkeleton />
          </div>

          {/* Secrets Skeleton */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <SecretCardSkeleton />
            <SecretCardSkeleton />
            <SecretCardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background art-deco-pattern flex items-center justify-center">
        <div className="text-center art-deco-border p-8 bg-card/50 backdrop-blur-sm art-deco-glow max-w-md">
          <h1 className="text-2xl font-serif text-foreground mb-2 art-deco-text art-deco-shadow">Room Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="bg-secondary border-border hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // Setup mode view
  if (room?.setupMode) {
    return <SetupModeView roomId={roomId} onComplete={handleSetupComplete} />;
  }

  return (
    <div className="min-h-screen bg-background art-deco-pattern">
      {/* Welcome Modal */}
      <WelcomeModal roomName={room?.name} />

      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Top row: Title and back button */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="rounded-full hover:bg-primary/10"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-serif text-foreground art-deco-text art-deco-shadow">
                  {room?.name || 'Secret Room'}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs flex items-center gap-1 bg-secondary/50 border border-border">
                    <Users className="w-3 h-3" />
                    {room?.memberCount || 1} member{room?.memberCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </div>
            <div>
              <UserIdentityHeader />
            </div>
          </div>

          {/* Art Deco Divider */}
          <div className="art-deco-divider my-4">
            <span>◆</span>
          </div>

          {/* Invite link card */}
          {room && (
            <div className="art-deco-border bg-card/50 backdrop-blur-sm p-4 art-deco-glow">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-primary font-medium mb-2 art-deco-text">Invite Link</p>
                  <p className="text-sm font-mono text-foreground break-all">
                    {`${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${room.inviteCode}`}
                  </p>
                </div>
                <Button
                  onClick={copyInviteLink}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 shrink-0 bg-secondary border-border hover:bg-primary hover:text-primary-foreground transition-all"
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
          <EmptyState
            icon="❓"
            title="No Questions Yet"
            description={
              room?.ownerId === currentUserId
                ? "Get the conversation started by adding some spicy questions for your group!"
                : "Waiting for questions to be added to this room."
            }
            action={
              room?.ownerId === currentUserId
                ? {
                    label: 'Add Questions to Room',
                    onClick: () => router.push(`/admin?room=${roomId}`),
                  }
                : undefined
            }
          />
        ) : (
          /* Unified Feed: Questions at top, Secrets below */
          <div className="space-y-8">
            {/* Unanswered Questions (3 at a time) */}
            {displayedQuestions.length > 0 && (
              <div>
                <div className="art-deco-divider mb-6">
                  <span>◆ ◆ ◆</span>
                </div>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-serif text-foreground art-deco-text art-deco-shadow">
                    Answer Questions to Share Secrets
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Click a question to flip it and share your answer
                  </p>
                </div>

                {/* Question Cards Grid - 3 columns */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-4">
                  {displayedQuestions.map((question) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      isAnswered={answeredQuestionIds.includes(question.id)}
                      onSubmit={handleSubmitAnswer}
                      onSkip={handleSkipQuestion}
                      onRateSpiciness={handleRateSpiciness}
                      userSpicinessRating={userSpicinessRatings[question.id] || 0}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Questions Answered State */}
            {displayedQuestions.length === 0 && roomQuestions.length > 0 && (
              <EmptyState
                icon="🎉"
                title="All Questions Answered!"
                description="You've answered or skipped all available questions."
              />
            )}

            {/* Custom Question Banner - Always visible when there are questions in room */}
            {roomQuestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                className="w-full mb-8"
              >
                <Card
                  className="relative w-full art-deco-border p-5 border-2 border-dashed bg-card/30 backdrop-blur-sm hover:border-primary hover:art-deco-glow transition-all duration-200 cursor-pointer"
                  onClick={() => setIsCustomQuestionModalOpen(true)}
                >
                  <div className="flex items-center justify-center gap-4">
                    <div className="rounded-full p-3 bg-primary/10 border border-primary/30">
                      <Plus className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground art-deco-text text-sm">
                        Add a Question
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Create your own question for the room
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Answered Questions Section */}
            {answeredQuestionIds.length > 0 && (
              <div>
                <div className="art-deco-divider my-8">
                  <span>◆ ◆ ◆</span>
                </div>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-serif text-foreground art-deco-text art-deco-shadow">
                    Your Answered Questions
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    View all answers from the group for questions you&apos;ve answered
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roomQuestions
                    .filter((q) => answeredQuestionIds.includes(q.id))
                    .map((question) => {
                      const questionSecretCount = secrets.filter(
                        (s) => s.questionId === question.id
                      ).length;
                      return (
                        <Card
                          key={question.id}
                          className="art-deco-border p-4 bg-card/50 backdrop-blur-sm hover:art-deco-glow transition-all duration-200"
                        >
                          <div className="space-y-3">
                            <p className="text-sm font-medium leading-snug">
                              {question.question}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">
                                {questionSecretCount}{' '}
                                {questionSecretCount === 1 ? 'answer' : 'answers'}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewCollaborativeAnswers(question)}
                                className="text-xs"
                              >
                                View All Answers
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Secrets Feed */}
            {secrets.length > 0 && (
              <div>
                <div className="art-deco-divider my-8">
                  <span>◆ ◆ ◆</span>
                </div>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-serif text-foreground art-deco-text art-deco-shadow">
                    Secrets ({secrets.length})
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
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

            {/* No Secrets Yet State - Show Example */}
            {secrets.length === 0 && roomQuestions.length > 0 && (
              <div>
                <div className="art-deco-divider my-8">
                  <span>◆ ◆ ◆</span>
                </div>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-serif text-foreground art-deco-text art-deco-shadow">
                    Secrets (0)
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Example of how secrets will appear - answer a question to share yours!
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <SecretCard
                    secret={{
                      id: 'example-secret',
                      body: 'This is an example of a locked secret. The actual content is hidden until you unlock it by sharing a secret of equal or higher spiciness level. Secrets keep the conversation interesting and build trust in your group!',
                      selfRating: 3,
                      importance: 4,
                      avgRating: null,
                      buyersCount: 0,
                      authorName: 'Example User',
                      createdAt: new Date().toISOString(),
                      isUnlocked: false,
                      questionText: displayedQuestions[0]?.question || 'What\'s something you\'ve never told anyone?'
                    }}
                    onUnlock={() => {}}
                    onRate={() => {}}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Unlock Question Modal - New question-based unlock */}
      {selectedSecretToUnlock && questionForUnlock && (
        <UnlockQuestionModal
          isOpen={unlockQuestionModalOpen}
          onClose={() => {
            setUnlockQuestionModalOpen(false);
            setQuestionForUnlock(null);
            setSelectedSecretToUnlock(null);
          }}
          question={questionForUnlock}
          requiredSpiciness={selectedSecretToUnlock.selfRating}
          targetSecretAuthor={selectedSecretToUnlock.authorName}
          onAnswerSubmit={handleUnlockQuestionSubmit}
        />
      )}

      {/* Unlock Drawer - Fallback for secrets without questionId */}
      {selectedSecretToUnlock && (
        <UnlockDrawer
          isOpen={unlockDrawerOpen}
          onOpenChange={setUnlockDrawerOpen}
          requiredRating={selectedSecretToUnlock.selfRating}
          onSubmit={handleUnlockSubmit}
        />
      )}

      {/* Custom Question Modal */}
      <CustomQuestionModal
        isOpen={isCustomQuestionModalOpen}
        onClose={() => setIsCustomQuestionModalOpen(false)}
        onCreateQuestion={handleCreateCustomQuestion}
      />

      {/* Collaborative Answers Modal */}
      {selectedCollaborativeQuestion && (
        <CollaborativeAnswersModal
          open={collaborativeModalOpen}
          onOpenChange={setCollaborativeModalOpen}
          questionId={selectedCollaborativeQuestion.id}
          questionText={selectedCollaborativeQuestion.question}
          question={selectedCollaborativeQuestion}
          roomId={roomId}
          onUnlock={handleUnlock}
        />
      )}
    </div>
  );
}