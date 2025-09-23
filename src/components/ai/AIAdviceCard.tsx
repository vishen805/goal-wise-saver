import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Target, 
  PiggyBank, 
  BarChart3, 
  Clock, 
  DollarSign,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { AIAdvice } from '@/types/financial';
import { formatCurrency } from '@/lib/categories';

interface AIAdviceCardProps {
  advice: AIAdvice[];
  onRefresh: () => void;
  onViewDetails: (advice: AIAdvice) => void;
}

export function AIAdviceCard({ advice, onRefresh, onViewDetails }: AIAdviceCardProps) {
  if (advice.length === 0) {
    return (
      <Card className="financial-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-primary" />
            AI Financial Advisor
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-center py-8">
          <PiggyBank className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">
            Add some expenses and income to get personalized advice!
          </p>
          <Button onClick={onRefresh} variant="outline">
            Generate Advice
          </Button>
        </div>
      </Card>
    );
  }

  const topAdvice = advice[0];
  const totalPotentialSavings = advice.reduce((sum, a) => sum + a.impact.yearlySavings, 0);

  const getAdviceIcon = (type: AIAdvice['type']) => {
    switch (type) {
      case 'spending-reduction':
        return <TrendingUp className="w-4 h-4" />;
      case 'goal-timeline':
        return <Target className="w-4 h-4" />;
      case 'budget-optimization':
        return <BarChart3 className="w-4 h-4" />;
      case 'category-analysis':
        return <PiggyBank className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: AIAdvice['priority']) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="financial-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <PiggyBank className="w-5 h-5 text-primary" />
          AI Financial Advisor
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Potential Savings Summary */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Potential Annual Savings</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(totalPotentialSavings)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{advice.length} insights</p>
            <Badge variant={getPriorityColor(topAdvice.priority)} className="mt-1">
              {topAdvice.priority} priority
            </Badge>
          </div>
        </div>
      </div>

      {/* Top Advice */}
      <div className="space-y-4">
        <div 
          className="border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => onViewDetails(topAdvice)}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {getAdviceIcon(topAdvice.type)}
              <h4 className="font-medium">{topAdvice.title}</h4>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {topAdvice.message}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Monthly Impact</p>
                <p className="text-sm font-medium text-success">
                  +{formatCurrency(topAdvice.impact.monthlySavings)}
                </p>
              </div>
              {topAdvice.impact.goalTimeReduction && (
                <div>
                  <p className="text-xs text-muted-foreground">Time Saved</p>
                  <p className="text-sm font-medium text-primary">
                    {topAdvice.impact.goalTimeReduction} months
                  </p>
                </div>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              {topAdvice.type.replace('-', ' ')}
            </Badge>
          </div>
        </div>

        {/* Additional Advice Preview */}
        {advice.length > 1 && (
          <div className="space-y-2">
            {advice.slice(1, 3).map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onViewDetails(item)}
              >
                <div className="flex items-center gap-2">
                  {getAdviceIcon(item.type)}
                  <span className="text-sm font-medium">{item.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-success">
                    +{formatCurrency(item.impact.monthlySavings)}/mo
                  </span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )}

        {advice.length > 3 && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {/* Navigate to full AI advisor screen */}}
          >
            View All {advice.length} Insights
          </Button>
        )}
      </div>
    </Card>
  );
}