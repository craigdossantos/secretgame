'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QuestionGrid } from '@/components/question-grid';
import { SecretCard } from '@/components/secret-card';
import { parseQuestions, QuestionPrompt, mockQuestions } from '@/lib/questions';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Share2, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Room {
  id: string;
  name: string;
  memberCount: number;
  inviteCode: string;
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
  createdAt: Date;
  isUnlocked?: boolean;
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [questions, setQuestions] = useState<QuestionPrompt[]>([]);
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // Load questions from markdown file
        try {
          const questionsResponse = await fetch('/questions.md');
          if (questionsResponse.ok) {
            const markdownContent = await questionsResponse.text();
            const parsedQuestions = parseQuestions(markdownContent);
            setQuestions(parsedQuestions);
          } else {
            // Fallback to mock questions
            console.warn('Could not load questions.md, using mock questions');
            setQuestions(mockQuestions);
          }
        } catch (questionsError) {
          console.warn('Error loading questions:', questionsError);
          setQuestions(mockQuestions);
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
          body: answer.body,
          selfRating: answer.selfRating,
          importance: answer.importance,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      // Mark question as answered
      setAnsweredQuestionIds(prev => [...prev, answer.questionId]);

      // Optionally reload secrets to show the new one
      const secretsResponse = await fetch(`/api/rooms/${roomId}/secrets`);
      if (secretsResponse.ok) {
        const secretsData = await secretsResponse.json();
        setSecrets(secretsData.secrets || []);
      }

    } catch (error) {
      console.error('Failed to submit answer:', error);
      alert('Failed to submit answer. Please try again.');
    }
  };

  const handleUnlock = (secretId: string) => {
    // This would open the unlock drawer
    console.log('Unlock secret:', secretId);
  };

  const handleRate = (secretId: string, rating: number) => {
    console.log('Rate secret:', secretId, rating);
  };

  const copyInviteLink = async () => {
    if (room) {
      const inviteUrl = `${window.location.origin}/invite/${room.inviteCode}`;
      await navigator.clipboard.writeText(inviteUrl);
      // You could show a toast notification here
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
          <div className="flex items-center justify-between">
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
            <Button
              onClick={copyInviteLink}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Invite Friends
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Question Prompts */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Question Prompts
            </h2>
            <p className="text-gray-600">
              Click on any question card to flip it and share your answer as a secret
            </p>
          </div>
          <QuestionGrid
            questions={questions}
            answeredQuestionIds={answeredQuestionIds}
            onSubmitAnswer={handleSubmitAnswer}
          />
        </div>

        {/* Existing Secrets */}
        {secrets.length > 0 && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Shared Secrets
              </h2>
              <p className="text-gray-600">
                Secrets that have been shared in this room
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
      </div>
    </div>
  );
}