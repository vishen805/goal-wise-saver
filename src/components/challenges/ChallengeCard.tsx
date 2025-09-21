import React from 'react';
import { Challenge } from '@/types/financial';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar, Target, Trophy, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface ChallengeCardProps {
  /** Challenge data */
  challenge: Challenge;
  /** Callback when challenge is updated */
  onUpdate?: (challengeId: string, updates: Partial<Challenge>) => void;
  /** Show detailed view */
  detailed?: boolean;
}

/**
 * Gets status icon for challenge
 */
const getStatusIcon = (status: Challenge['status']) => {
  switch (status) {
    case 'active':
      return <AlertCircle className="h-4 w-4" />;
    case 'completed':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'failed':
      return <XCircle className="h-4 w-4" />;
    case 'expired':
      return <XCircle className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

/**
 * Gets status variant for badge
 */
const getStatusVariant = (status: Challenge['status']) => {
  switch (status) {
    case 'active':
      return 'default';
    case 'completed':
      return 'secondary';
    case 'failed':
      return 'destructive';
    case 'expired':
      return 'outline';
    default:
      return 'default';
  }
};

/**
 * Gets challenge type icon
 */
const getTypeIcon = (type: Challenge['type']) => {
  switch (type) {
    case 'no-spend-weekend':
      return '🚫';
    case 'reduce-category':
      return '📉';
    case 'save-amount':
      return '💰';
    case 'expense-limit':
      return '🎯';
    default:
      return '🏆';
  }
};

/**
 * Formats challenge target for display
 */
const formatChallengeTarget = (challenge: Challenge): string => {
  switch (challenge.type) {
    case 'no-spend-weekend':
      return 'No weekend spending';
    case 'reduce-category':
      return `Reduce ${challenge.category} by ${challenge.targetReduction}%`;
    case 'save-amount':
      return `Save $${challenge.targetAmount}`;
    case 'expense-limit':
      return `Limit expenses to $${challenge.targetAmount}`;
    default:
      return 'Complete challenge';
  }
};

/**
 * ChallengeCard component displays individual challenge information
 * 
 * Features:
 * - Progress tracking with visual progress bar
 * - Status indicators and badges
 * - Time remaining calculation
 * - Interactive updates
 * - Responsive design
 */
export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onUpdate,
  detailed = false
}) => {
  const startDate = new Date(challenge.startDate);
  const endDate = new Date(challenge.endDate);
  const today = new Date();
  
  const daysTotal = differenceInDays(endDate, startDate);
  const daysRemaining = Math.max(0, differenceInDays(endDate, today));
  const daysElapsed = daysTotal - daysRemaining;
  
  const progressPercentage = Math.min(100, Math.max(0, challenge.progress));
  
  return (
    <Card className={`hover:shadow-md transition-shadow ${
      challenge.status === 'completed' ? 'border-green-200 bg-green-50/50' :
      challenge.status === 'failed' || challenge.status === 'expired' ? 'border-red-200 bg-red-50/50' :
      'border-border'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getTypeIcon(challenge.type)}</span>
            <div>
              <CardTitle className="text-lg">{challenge.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {formatChallengeTarget(challenge)}
              </p>
            </div>
          </div>
          <Badge variant={getStatusVariant(challenge.status)} className="text-xs">
            {getStatusIcon(challenge.status)}
            <span className="ml-1 capitalize">{challenge.status}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{progressPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          {challenge.status === 'active' && (
            <p className="text-xs text-muted-foreground">
              {progressPercentage >= 100 ? '🎉 Goal achieved!' : 
               progressPercentage >= 75 ? '🔥 Almost there!' :
               progressPercentage >= 50 ? '💪 Halfway done!' :
               '🚀 Keep going!'}
            </p>
          )}
        </div>

        {/* Time Section */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span className="text-muted-foreground">Time</span>
          </div>
          <div className="text-right">
            {challenge.status === 'active' ? (
              <>
                <p className="font-semibold">{daysRemaining} days left</p>
                <p className="text-xs text-muted-foreground">
                  {daysElapsed} of {daysTotal} days elapsed
                </p>
              </>
            ) : (
              <p className="font-semibold">
                {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd')}
              </p>
            )}
          </div>
        </div>

        {detailed && (
          <>
            {/* Description */}
            <div className="text-sm text-muted-foreground">
              {challenge.description}
            </div>

            {/* Challenge Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-semibold capitalize">{challenge.type.replace('-', ' ')}</p>
              </div>
              {challenge.category && (
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-semibold capitalize">{challenge.category}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Action Buttons */}
        {challenge.status === 'active' && onUpdate && (
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onUpdate(challenge.id, { status: 'completed' })}
              className="flex-1"
            >
              <Trophy className="h-3 w-3 mr-1" />
              Mark Complete
            </Button>
          </div>
        )}

        {challenge.status === 'completed' && (
          <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-2 rounded">
            <CheckCircle2 className="h-4 w-4" />
            <span>Challenge completed successfully!</span>
          </div>
        )}

        {(challenge.status === 'failed' || challenge.status === 'expired') && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded">
            <XCircle className="h-4 w-4" />
            <span>
              {challenge.status === 'failed' ? 'Challenge not completed' : 'Challenge expired'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};