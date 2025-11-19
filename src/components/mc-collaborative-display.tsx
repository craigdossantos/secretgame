'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AnswerWithUser {
  userId: string;
  userName: string;
  userAvatar?: string;
  isAnonymous: boolean;
  selected: string[];
}

interface MCCollaborativeDisplayProps {
  options: string[];
  answers: AnswerWithUser[];
  currentUserId: string;
}

export function MCCollaborativeDisplay({
  options,
  answers,
  currentUserId,
}: MCCollaborativeDisplayProps) {
  // Group answers by option
  const answersByOption = new Map<string, AnswerWithUser[]>();

  options.forEach(option => {
    answersByOption.set(option, []);
  });

  // Also track custom answers (if any)
  const customAnswers: AnswerWithUser[] = [];

  answers.forEach(answer => {
    answer.selected.forEach(selectedOption => {
      if (options.includes(selectedOption)) {
        answersByOption.get(selectedOption)?.push(answer);
      } else {
        // This is a custom option
        customAnswers.push(answer);
      }
    });
  });

  // Calculate percentages
  const totalAnswers = answers.length;

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-muted-foreground mb-3">
        {totalAnswers} {totalAnswers === 1 ? 'person' : 'people'} answered
      </div>

      <div className="space-y-2">
        {options.map((option, index) => {
          const answersForOption = answersByOption.get(option) || [];
          const percentage =
            totalAnswers > 0 ? Math.round((answersForOption.length / totalAnswers) * 100) : 0;

          return (
            <div key={index} className="border rounded-lg p-3 bg-card/50">
              {/* Option header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {answersForOption.some((a) => a.userId === currentUserId) && (
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium truncate">{option}</span>
                </div>
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {answersForOption.length} ({percentage}%)
                </Badge>
              </div>

              {/* Progress bar */}
              {totalAnswers > 0 && (
                <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-2">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}

              {/* Avatars of people who picked this */}
              {answersForOption.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  <TooltipProvider>
                    {answersForOption.map((answer, idx) => (
                      <Tooltip key={idx}>
                        <TooltipTrigger asChild>
                          <div className="cursor-pointer">
                            {answer.isAnonymous ? (
                              <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                                <span className="text-xs font-medium text-primary">?</span>
                              </div>
                            ) : (
                              <Avatar className="h-6 w-6 border-2 border-background">
                                <AvatarImage src={answer.userAvatar} />
                                <AvatarFallback className="text-xs">
                                  {answer.userName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            {answer.isAnonymous ? 'Anonymous' : answer.userName}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                </div>
              )}
            </div>
          );
        })}

        {/* Custom answers section */}
        {customAnswers.length > 0 && (
          <div className="border rounded-lg p-3 bg-card/50 border-dashed">
            <div className="text-sm font-medium mb-2">Other answers:</div>
            <div className="space-y-1">
              {customAnswers.map((answer, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                  {answer.isAnonymous ? (
                    <span>• Anonymous:</span>
                  ) : (
                    <span>• {answer.userName}:</span>
                  )}
                  <span className="font-medium text-foreground">
                    {answer.selected.find(s => !options.includes(s))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
