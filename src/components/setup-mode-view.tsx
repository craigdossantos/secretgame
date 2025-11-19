'use client';

import { useState, useEffect } from 'react';
import { QuestionPrompt, parseQuestions, mockQuestions } from '@/lib/questions';
import { Button } from '@/components/ui/button';
import { CustomQuestionModal } from '@/components/custom-question-modal';
import { toast } from 'sonner';
import { Plus, Check, Edit, Trash2, TextIcon, SlidersHorizontal, CheckSquare, Copy } from 'lucide-react';

interface SetupModeViewProps {
  roomId: string;
  onComplete: () => void;
}

export function SetupModeView({ roomId, onComplete }: SetupModeViewProps) {
  const [allQuestions, setAllQuestions] = useState<QuestionPrompt[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [customQuestions, setCustomQuestions] = useState<QuestionPrompt[]>([]);
  const [isCustomQuestionModalOpen, setIsCustomQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionPrompt | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [inviteCode, setInviteCode] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [visibleQuestionCount, setVisibleQuestionCount] = useState(10);

  // Load questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const questionsResponse = await fetch('/questions.yaml');
        if (questionsResponse.ok) {
          const yamlContent = await questionsResponse.text();
          const parsedQuestions = parseQuestions(yamlContent);
          setAllQuestions(parsedQuestions);
        } else {
          console.warn('Could not load questions.yaml, using mock questions');
          setAllQuestions(mockQuestions);
        }
      } catch (error) {
        console.warn('Error loading questions:', error);
        setAllQuestions(mockQuestions);
      }
    };

    loadQuestions();
  }, []);

  // Load room data for invite code
  useEffect(() => {
    const loadRoomData = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}`);
        if (response.ok) {
          const data = await response.json();
          setInviteCode(data.room.inviteCode);
        }
      } catch (error) {
        console.error('Failed to load room data:', error);
      }
    };

    loadRoomData();
  }, [roomId]);

  const handleCopyInviteLink = async () => {
    const inviteUrl = `${window.location.origin}/invite/${inviteCode}`;
    await navigator.clipboard.writeText(inviteUrl);
    setIsCopied(true);
    toast.success('Invite link copied!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleToggleQuestion = (questionId: string) => {
    setSelectedQuestionIds(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleCreateCustomQuestion = (question: QuestionPrompt) => {
    setCustomQuestions(prev => [...prev, question]);
    setIsCustomQuestionModalOpen(false);
    toast.success('Custom question added!');
  };

  const handleEditQuestion = (question: QuestionPrompt) => {
    setEditingQuestion(question);
    setIsCustomQuestionModalOpen(true);
  };

  const handleUpdateQuestion = (updatedQuestion: QuestionPrompt) => {
    // If editing a suggested question, convert it to custom
    if (!customQuestions.some(q => q.id === updatedQuestion.id)) {
      // Remove from selected suggested questions
      setSelectedQuestionIds(prev => prev.filter(id => id !== updatedQuestion.id));
      // Add as custom question
      setCustomQuestions(prev => [...prev, updatedQuestion]);
    } else {
      // Update existing custom question
      setCustomQuestions(prev =>
        prev.map(q => (q.id === updatedQuestion.id ? updatedQuestion : q))
      );
    }
    setEditingQuestion(null);
    setIsCustomQuestionModalOpen(false);
    toast.success('Question updated!');
  };

  const handleRemoveCustomQuestion = (questionId: string) => {
    setCustomQuestions(prev => prev.filter(q => q.id !== questionId));
    toast.success('Question removed');
  };

  const handleCompleteSetup = async () => {
    const totalQuestions = selectedQuestionIds.length + customQuestions.length;
    if (totalQuestions < 1) {
      toast.error('Please select at least one question');
      return;
    }

    setIsCompleting(true);

    try {
      const response = await fetch(`/api/rooms/${roomId}/complete-setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionIds: selectedQuestionIds,
          customQuestions: customQuestions.map(q => ({
            id: q.id,
            question: q.question,
            category: q.category,
            spiciness: q.suggestedLevel,
            difficulty: q.difficulty || 'medium',
            type: q.questionType || 'text',
            slider: q.answerConfig?.type === 'slider' ? q.answerConfig.config : undefined,
            multipleChoice: q.answerConfig?.type === 'multipleChoice' ? q.answerConfig.config : undefined,
            allowImageUpload: q.allowImageUpload || false,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to complete setup');
        return;
      }

      toast.success('Setup complete! Starting game...');
      onComplete();
    } catch (error) {
      console.error('Failed to complete setup:', error);
      toast.error('Failed to complete setup. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const totalSelected = selectedQuestionIds.length + customQuestions.length;
  const selectedSuggestedQuestions = allQuestions.filter(q =>
    selectedQuestionIds.includes(q.id)
  );

  // Filter out selected questions and apply pagination
  const unselectedQuestions = allQuestions.filter(q => !selectedQuestionIds.includes(q.id));
  const visibleQuestions = unselectedQuestions.slice(0, visibleQuestionCount);
  const hasMoreQuestions = unselectedQuestions.length > visibleQuestionCount;

  const getQuestionTypeIcon = (type?: string) => {
    switch (type) {
      case 'slider':
        return <SlidersHorizontal className="w-4 h-4 text-purple-500" />;
      case 'multipleChoice':
        return <CheckSquare className="w-4 h-4 text-green-500" />;
      default:
        return <TextIcon className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background art-deco-pattern p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif mb-3 text-foreground art-deco-text art-deco-shadow">
            Setup Your Room
          </h1>
          <div className="art-deco-divider my-4">
            <span>◆ ◆ ◆</span>
          </div>
          <p className="text-lg text-muted-foreground">
            Select questions for your group to answer. You can pick suggested questions or create your own.
          </p>
          <div className="mt-4 text-sm text-muted-foreground">
            {totalSelected} question{totalSelected !== 1 ? 's' : ''} selected
          </div>

          {/* Invite Link */}
          {inviteCode && (
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="art-deco-border bg-card/50 backdrop-blur-sm p-4 art-deco-glow">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-primary font-medium mb-2 art-deco-text">Invite Link</p>
                    <p className="text-sm font-mono text-foreground break-all">
                      {`${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${inviteCode}`}
                    </p>
                  </div>
                  <Button
                    onClick={handleCopyInviteLink}
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
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Suggested Questions */}
          <div>
            <h2 className="text-2xl font-serif mb-4 art-deco-text">Suggested Questions</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {/* Create Custom Question Card - First Item */}
              <div
                onClick={() => {
                  setEditingQuestion(null);
                  setIsCustomQuestionModalOpen(true);
                }}
                className="p-4 rounded-xl border-2 border-dashed border-primary/50 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-0.5">Create Custom Question</p>
                    <p className="text-sm text-muted-foreground">
                      Design your own question with any type
                    </p>
                  </div>
                </div>
              </div>

              {/* Regular Suggested Questions - Filtered */}
              {visibleQuestions.map(question => (
                <div
                  key={question.id}
                  className="p-4 rounded-xl border bg-card border-border hover:border-primary/50 cursor-pointer transition-all"
                  onClick={() => handleToggleQuestion(question.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-md border-2 border-border bg-background flex items-center justify-center transition-all">
                      {/* No check icon - questions move when selected */}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        {getQuestionTypeIcon(question.questionType)}
                        <p className="text-sm font-medium text-foreground">
                          {question.question}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="px-2 py-0.5 rounded-md bg-secondary">
                          {question.category}
                        </span>
                        <span>{'🌶️'.repeat(question.suggestedLevel)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Load More Link */}
              {hasMoreQuestions && (
                <button
                  onClick={() => setVisibleQuestionCount(prev => prev + 10)}
                  className="w-full text-center py-3 text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  Load more questions ({unselectedQuestions.length - visibleQuestionCount} remaining)
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Selected Questions */}
          <div>
            <h2 className="text-2xl font-serif mb-4 art-deco-text">Selected Questions</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {/* Selected Suggested Questions */}
              {selectedSuggestedQuestions.map(question => (
                <div
                  key={question.id}
                  className="p-4 rounded-xl bg-card border border-border"
                >
                  <div className="flex items-start gap-3">
                    {getQuestionTypeIcon(question.questionType)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground mb-2">
                        {question.question}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="px-2 py-0.5 rounded-md bg-secondary">
                          {question.category}
                        </span>
                        <span>{'🌶️'.repeat(question.suggestedLevel)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditQuestion(question)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleQuestion(question.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Custom Questions */}
              {customQuestions.map(question => (
                <div
                  key={question.id}
                  className="p-4 rounded-xl bg-card border border-primary/50"
                >
                  <div className="flex items-start gap-3">
                    {getQuestionTypeIcon(question.questionType)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground mb-2">
                        {question.question}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="px-2 py-0.5 rounded-md bg-primary/20 text-primary">
                          Custom
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-secondary">
                          {question.category}
                        </span>
                        <span>{'🌶️'.repeat(question.suggestedLevel)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditQuestion(question)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCustomQuestion(question.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {totalSelected === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="mb-2">No questions selected yet</p>
                  <p className="text-sm">
                    Choose from suggested questions or create your own
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Complete Setup Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleCompleteSetup}
            disabled={isCompleting || totalSelected === 0}
            className="art-deco-border bg-primary text-primary-foreground hover:bg-primary/90 px-12 py-6 text-lg art-deco-text art-deco-glow h-auto"
            size="lg"
          >
            {isCompleting ? 'Starting Game...' : 'Start Playing'}
          </Button>
          {totalSelected === 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              Select at least 1 question to continue
            </p>
          )}
        </div>
      </div>

      {/* Custom Question Modal */}
      <CustomQuestionModal
        isOpen={isCustomQuestionModalOpen}
        onClose={() => {
          setIsCustomQuestionModalOpen(false);
          setEditingQuestion(null);
        }}
        onCreateQuestion={editingQuestion ? handleUpdateQuestion : handleCreateCustomQuestion}
        initialQuestion={editingQuestion || undefined}
      />
    </div>
  );
}
