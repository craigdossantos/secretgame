'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChiliRating } from '@/components/chili-rating';
import {
  QuestionPrompt,
  QUESTION_CATEGORIES,
  QuestionCategory,
  parseQuestions,
  getActiveQuestions,
  getArchivedQuestions,
  createNewQuestion,
  updateQuestion,
  archiveQuestion,
  unarchiveQuestion
} from '@/lib/questions';
import { Plus, Archive, ArchiveRestore, Trash2, Settings, Tag, Check } from 'lucide-react';

export default function AdminPage() {
  const [questions, setQuestions] = useState<QuestionPrompt[]>([]);
  const [activeQuestions, setActiveQuestions] = useState<QuestionPrompt[]>([]);
  const [archivedQuestions, setArchivedQuestions] = useState<QuestionPrompt[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('home');
  const [showArchived, setShowArchived] = useState(false);
  const [showNewQuestionForm, setShowNewQuestionForm] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [roomQuestionIds, setRoomQuestionIds] = useState<string[]>([]);

  // New question form state
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    category: 'Personal' as QuestionCategory,
    suggestedLevel: 3,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    tags: ''
  });

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, []);

  // Update active/archived lists when questions change
  useEffect(() => {
    let filtered = questions;

    // Filter by archive status
    filtered = showArchived ? getArchivedQuestions(filtered) : getActiveQuestions(filtered);

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(q =>
        q.tags && q.tags.some(tag => selectedTags.includes(tag))
      );
    }

    if (showArchived) {
      setArchivedQuestions(filtered);
    } else {
      setActiveQuestions(filtered);
    }

    // Extract all unique tags
    const tags = new Set<string>();
    questions.forEach(q => {
      q.tags?.forEach(tag => tags.add(tag));
    });
    setAllTags(Array.from(tags).sort());
  }, [questions, showArchived, selectedTags]);

  const loadQuestions = async () => {
    try {
      const response = await fetch('/questions.md');
      const content = await response.text();
      const parsedQuestions = parseQuestions(content);
      setQuestions(parsedQuestions);
    } catch (error) {
      console.error('Failed to load questions:', error);
    }
  };

  const handleCreateQuestion = () => {
    const tagsArray = newQuestion.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    const question = createNewQuestion(
      newQuestion.question,
      newQuestion.category,
      newQuestion.suggestedLevel,
      newQuestion.difficulty,
      tagsArray
    );

    setQuestions(prev => [...prev, question]);

    // Reset form
    setNewQuestion({
      question: '',
      category: 'Personal',
      suggestedLevel: 3,
      difficulty: 'medium',
      tags: ''
    });
    setShowNewQuestionForm(false);
  };

  const handleArchiveQuestion = (questionId: string) => {
    setQuestions(prev => archiveQuestion(questionId, prev));
  };

  const handleUnarchiveQuestion = (questionId: string) => {
    setQuestions(prev => unarchiveQuestion(questionId, prev));
  };

  const handleUpdateSpiciness = (questionId: string, spiciness: number) => {
    setQuestions(prev => updateQuestion(questionId, prev, { suggestedLevel: spiciness }));
  };

  const handleUpdateTags = (questionId: string, tags: string[]) => {
    setQuestions(prev => updateQuestion(questionId, prev, { tags }));
  };

  const handleToggleQuestionInRoom = (questionId: string) => {
    if (roomQuestionIds.includes(questionId)) {
      setRoomQuestionIds(prev => prev.filter(id => id !== questionId));
    } else {
      setRoomQuestionIds(prev => [...prev, questionId]);
    }
  };

  const currentQuestions = showArchived ? archivedQuestions : activeQuestions;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Question Admin</h1>
            <p className="text-gray-600 mt-1">Manage question cards for your Secret Game</p>
          </div>
          <Button onClick={() => setShowNewQuestionForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Question
          </Button>
        </div>

        {/* Room Selection and Filters */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            {/* Room Selection */}
            <div className="flex items-center gap-4">
              <Label htmlFor="room-select" className="text-sm font-medium">
                Select Room:
              </Label>
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home Room (Homepage)</SelectItem>
                  <SelectItem value="room1">Room 1</SelectItem>
                  <SelectItem value="room2">Room 2</SelectItem>
                </SelectContent>
              </Select>
              {selectedRoom !== 'home' && (
                <div className="text-sm text-gray-600">
                  {roomQuestionIds.length} questions selected
                </div>
              )}
            </div>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Filter by tags:</Label>
                <div className="flex items-center gap-2 flex-wrap">
                  {allTags.map(tag => {
                    const isCategoryTag = QUESTION_CATEGORIES.some(cat => cat.toLowerCase() === tag);
                    return (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer hover:scale-105 transition-transform ${
                          isCategoryTag ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' : ''
                        }`}
                        onClick={() => {
                          if (selectedTags.includes(tag)) {
                            setSelectedTags(prev => prev.filter(t => t !== tag));
                          } else {
                            setSelectedTags(prev => [...prev, tag]);
                          }
                        }}
                      >
                        {tag}
                        {isCategoryTag && ' 📂'}
                      </Badge>
                    );
                  })}
                  {selectedTags.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTags([])}
                      className="ml-2"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 ml-auto w-fit">
              <Button
                variant={!showArchived ? "default" : "outline"}
                onClick={() => setShowArchived(false)}
                size="sm"
              >
                Active ({activeQuestions.length})
              </Button>
              <Button
                variant={showArchived ? "default" : "outline"}
                onClick={() => setShowArchived(true)}
                size="sm"
              >
                <Archive className="w-4 h-4 mr-2" />
                Archived ({archivedQuestions.length})
              </Button>
            </div>
          </div>
        </Card>

        {/* New Question Form */}
        {showNewQuestionForm && (
          <Card className="p-6 mb-6 border-blue-200 bg-blue-50">
            <h3 className="text-lg font-semibold mb-4">Add New Question</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="question-text">Question</Label>
                <Textarea
                  id="question-text"
                  placeholder="Enter your question..."
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={newQuestion.category}
                    onValueChange={(value: QuestionCategory) => setNewQuestion(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUESTION_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Difficulty</Label>
                  <Select
                    value={newQuestion.difficulty}
                    onValueChange={(value: 'easy' | 'medium' | 'hard') => setNewQuestion(prev => ({ ...prev, difficulty: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Spiciness Level</Label>
                  <div className="mt-2">
                    <ChiliRating
                      rating={newQuestion.suggestedLevel}
                      onRatingChange={(rating) => setNewQuestion(prev => ({ ...prev, suggestedLevel: rating }))}
                      size="md"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="funny, personal, deep..."
                  value={newQuestion.tags}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, tags: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateQuestion} disabled={!newQuestion.question.trim()}>
                  Create Question
                </Button>
                <Button variant="outline" onClick={() => setShowNewQuestionForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Questions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentQuestions.map((question) => (
            <AdminQuestionCard
              key={question.id}
              question={question}
              onArchive={() => handleArchiveQuestion(question.id)}
              onUnarchive={() => handleUnarchiveQuestion(question.id)}
              onUpdateSpiciness={(spiciness) => handleUpdateSpiciness(question.id, spiciness)}
              onUpdateTags={(tags) => handleUpdateTags(question.id, tags)}
              isArchived={showArchived}
              isSelectedForRoom={roomQuestionIds.includes(question.id)}
              onToggleRoomSelection={() => handleToggleQuestionInRoom(question.id)}
              showRoomSelection={selectedRoom !== 'home'}
            />
          ))}
        </div>

        {currentQuestions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg font-medium">
              {showArchived ? 'No archived questions' : 'No active questions'}
            </div>
            <div className="text-gray-400 text-sm mt-1">
              {!showArchived && 'Add some questions to get started!'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface AdminQuestionCardProps {
  question: QuestionPrompt;
  onArchive: () => void;
  onUnarchive: () => void;
  onUpdateSpiciness: (spiciness: number) => void;
  onUpdateTags: (tags: string[]) => void;
  isArchived: boolean;
  isSelectedForRoom?: boolean;
  onToggleRoomSelection?: () => void;
  showRoomSelection?: boolean;
}

function AdminQuestionCard({
  question,
  onArchive,
  onUnarchive,
  onUpdateSpiciness,
  onUpdateTags,
  isArchived,
  isSelectedForRoom = false,
  onToggleRoomSelection,
  showRoomSelection = false
}: AdminQuestionCardProps) {
  const [editingTags, setEditingTags] = useState(false);
  // Initialize with additional tags only (exclude category tag)
  const [tagInput, setTagInput] = useState(
    question.tags?.filter(tag => tag !== question.category.toLowerCase()).join(', ') || ''
  );

  const handleSaveTags = () => {
    const additionalTags = tagInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    const categoryTag = question.category.toLowerCase();
    // Combine category tag with additional tags
    const allTags = [categoryTag, ...additionalTags];
    onUpdateTags(allTags);
    setEditingTags(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Personal': return 'bg-blue-100 border-blue-200';
      case 'Relationships': return 'bg-pink-100 border-pink-200';
      case 'Embarrassing': return 'bg-red-100 border-red-200';
      case 'Fears & Dreams': return 'bg-purple-100 border-purple-200';
      case 'Opinions': return 'bg-orange-100 border-orange-200';
      case 'Work/School': return 'bg-green-100 border-green-200';
      case 'Random': return 'bg-indigo-100 border-indigo-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <Card className={`p-4 ${getCategoryColor(question.category)} ${isArchived ? 'opacity-60' : ''} ${isSelectedForRoom ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {showRoomSelection && (
              <button
                onClick={onToggleRoomSelection}
                className="w-5 h-5 rounded border-2 border-gray-400 flex items-center justify-center hover:border-blue-500 transition-colors"
                style={{
                  backgroundColor: isSelectedForRoom ? '#3B82F6' : 'transparent',
                  borderColor: isSelectedForRoom ? '#3B82F6' : undefined
                }}
              >
                {isSelectedForRoom && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </button>
            )}
            <Badge variant="outline" className="text-xs">
              {question.category}
            </Badge>
          </div>
          <div className="flex gap-1">
            {isArchived ? (
              <Button size="sm" variant="ghost" onClick={onUnarchive} title="Unarchive">
                <ArchiveRestore className="w-4 h-4" />
              </Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={onArchive} title="Archive">
                <Archive className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Question Text */}
        <p className="text-sm font-medium text-gray-900 min-h-[3rem]">
          {question.question}
        </p>

        {/* Spiciness Rating */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Spiciness:</span>
            <ChiliRating
              rating={question.suggestedLevel}
              onRatingChange={onUpdateSpiciness}
              size="sm"
              readonly={isArchived}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="w-3 h-3 text-gray-600" />
            <span className="text-xs text-gray-600">Tags:</span>
            {!editingTags && !isArchived && (
              <Button size="sm" variant="ghost" onClick={() => setEditingTags(true)} className="h-4 p-0">
                <Settings className="w-3 h-3" />
              </Button>
            )}
          </div>

          {editingTags ? (
            <div className="space-y-2">
              <div className="text-xs text-gray-600 mb-1">
                Category tag "<span className="font-medium">{question.category.toLowerCase()}</span>" is automatically included
              </div>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add additional tags (funny, deep, controversial, etc.)"
                className="text-xs h-7"
              />
              <div className="flex gap-1">
                <Button size="sm" variant="default" onClick={handleSaveTags} className="h-6 text-xs">
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingTags(false);
                    setTagInput(question.tags?.filter(tag => tag !== question.category.toLowerCase()).join(', ') || '');
                  }}
                  className="h-6 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1">
              {question.tags && question.tags.length > 0 ? (
                question.tags.map((tag, index) => {
                  const isCategoryTag = tag === question.category.toLowerCase();
                  return (
                    <Badge
                      key={index}
                      variant={isCategoryTag ? "default" : "secondary"}
                      className={`text-xs ${isCategoryTag ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}`}
                    >
                      {tag}
                      {isCategoryTag && ' 📂'}
                    </Badge>
                  );
                })
              ) : (
                <Badge variant="default" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                  {question.category.toLowerCase()} 📂
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Metadata */}
        {question.createdAt && (
          <div className="text-xs text-gray-400 pt-2 border-t">
            Created: {new Date(question.createdAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </Card>
  );
}