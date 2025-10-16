import React from 'react';
import { Tip } from '@/types/financial';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingDown, TrendingUp, Target, DollarSign, Zap } from 'lucide-react';

interface TipsDisplayProps {
  /** Array of tips to display */
  tips: Tip[];
  /** Maximum number of tips to show */
  limit?: number;
  /** Show detailed view */
  detailed?: boolean;
  /** Callback when tip is dismissed */
  onDismiss?: (tipId: string) => void;
  /** Callback when tip action is taken */
  onAction?: (tip: Tip) => void;
}

/**
 * Gets icon for tip action type
 */
const getActionIcon = (actionType: Tip['actionType']) => {
  switch (actionType) {
    case 'reduce-spending':
      return <TrendingDown className="h-4 w-4" />;
    case 'increase-savings':
      return <TrendingUp className="h-4 w-4" />;
    case 'budget-optimization':
      return <Target className="h-4 w-4" />;
    default:
      return <Lightbulb className="h-4 w-4" />;
  }
};

/**
 * Gets badge variant for action type
 */
const getActionVariant = (actionType: Tip['actionType']) => {
  switch (actionType) {
    case 'reduce-spending':
      return 'destructive';
    case 'increase-savings':
      return 'default';
    case 'budget-optimization':
      return 'secondary';
    default:
      return 'outline';
  }
};

/**
 * Gets confidence display info
 */
const getConfidenceInfo = (score: number) => {
  if (score >= 0.8) return { label: 'High', color: 'text-green-600', icon: '🎯' };
  if (score >= 0.6) return { label: 'Medium', color: 'text-orange-600', icon: '⚡' };
  return { label: 'Low', color: 'text-red-600', icon: '💡' };
};

/**
 * Individual tip component
 */
const TipCard: React.FC<{
  tip: Tip;
  detailed: boolean;
  onDismiss?: (tipId: string) => void;
  onAction?: (tip: Tip) => void;
}> = ({ tip, detailed, onDismiss, onAction }) => {
  const confidence = getConfidenceInfo(tip.confidenceScore);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            {getActionIcon(tip.actionType)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={getActionVariant(tip.actionType)} className="text-xs">
                {tip.actionType.replace('-', ' ')}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <span className="mr-1">{confidence.icon}</span>
                {confidence.label} Confidence
              </Badge>
            </div>
            <CardTitle className="text-sm font-medium">{tip.text}</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Impact Section */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Yearly Impact</span>
          </div>
          <span className="text-lg font-bold text-green-600">
            ${tip.impactYearly.toFixed(0)}
          </span>
        </div>

        {detailed && (
          <>
            {/* Additional Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-semibold capitalize">{tip.relatedCategory}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Monthly Reduction</p>
                <p className="font-semibold">${tip.suggestedReduction.toFixed(0)}</p>
              </div>
            </div>

            {/* Confidence Score Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Confidence Score</span>
                <span className={confidence.color}>{(tip.confidenceScore * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary rounded-full h-2 transition-all duration-300"
                  style={{ width: `${tip.confidenceScore * 100}%` }}
                />
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {onAction && (
            <Button 
              size="sm" 
              onClick={() => onAction(tip)}
              className="flex-1"
            >
              <Zap className="h-3 w-3 mr-1" />
              Take Action
            </Button>
          )}
          {onDismiss && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onDismiss(tip.id)}
            >
              Dismiss
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * TipsDisplay component shows personalized financial tips
 * 
 * Features:
 * - Confidence scoring with visual indicators
 * - Impact calculation display
 * - Action type categorization
 * - Interactive dismiss and action buttons
 * - Responsive grid layout
 */
export const TipsDisplay: React.FC<TipsDisplayProps> = ({
  tips,
  limit,
  detailed = false,
  onDismiss,
  onAction
}) => {
  const displayTips = limit ? tips.slice(0, limit) : tips;

  if (tips.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Smart Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-6xl mb-4">💡</div>
          <p className="text-muted-foreground">No tips available</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add some expenses to get personalized saving tips!
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalYearlyImpact = displayTips.reduce((sum, tip) => sum + tip.impactYearly, 0);

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <span className="font-semibold">Smart Tips</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Potential Yearly Savings</p>
              <p className="text-lg font-bold text-green-600">
                ${totalYearlyImpact.toFixed(0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayTips.map(tip => (
          <TipCard
            key={tip.id}
            tip={tip}
            detailed={detailed}
            onDismiss={onDismiss}
            onAction={onAction}
          />
        ))}
      </div>

      {limit && tips.length > limit && (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Showing {limit} of {tips.length} tips
            </p>
            <Button variant="outline" size="sm" className="mt-2">
              View All Tips
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};