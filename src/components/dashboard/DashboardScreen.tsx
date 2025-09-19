import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Target, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { savingsGoalsStorage, expensesStorage, budgetsStorage } from '@/lib/storage';
import { formatCurrency, getProgressColor } from '@/lib/categories';
import { SavingsGoal, Expense, Budget, FinancialSummary } from '@/types/financial';

interface DashboardScreenProps {
  onNavigate: (tab: string) => void;
}

export default function DashboardScreen({ onNavigate }: DashboardScreenProps) {
  const [summary, setSummary] = useState<FinancialSummary>({
    totalSavings: 0,
    totalExpenses: 0,
    monthlyBudget: 0,
    budgetRemaining: 0,
    savingsGoalsProgress: 0,
  });
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [activeGoals, setActiveGoals] = useState<SavingsGoal[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const goals = savingsGoalsStorage.get();
    const expenses = expensesStorage.get();
    const budgets = budgetsStorage.get();
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthExpenses = expenses.filter(e => 
      e.date.startsWith(currentMonth)
    );
    
    const totalSavings = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const totalExpenses = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const monthlyBudget = budgets
      .filter(b => b.month === currentMonth)
      .reduce((sum, budget) => sum + budget.monthlyLimit, 0);
    
    const savingsGoalsProgress = goals.length > 0 
      ? goals.reduce((sum, goal) => sum + (goal.currentAmount / goal.targetAmount) * 100, 0) / goals.length
      : 0;

    setSummary({
      totalSavings,
      totalExpenses,
      monthlyBudget,
      budgetRemaining: monthlyBudget - totalExpenses,
      savingsGoalsProgress,
    });
    
    setRecentExpenses(expenses.slice(0, 5));
    setActiveGoals(goals.slice(0, 3));
  };

  const quickTips = [
    summary.savingsGoalsProgress >= 80 && "🎉 You're doing great with your savings goals!",
    summary.budgetRemaining < 100 && "⚠️ You're close to your monthly budget limit",
    summary.totalSavings > 1000 && "💪 You've built a solid savings foundation!",
    recentExpenses.length === 0 && "📝 Start tracking your expenses to get insights",
  ].filter(Boolean);

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}! 👋
        </h2>
        <p className="text-muted-foreground">Here's your financial overview</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="financial-card gradient-primary text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Total Savings</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalSavings)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-white/80" />
          </div>
        </Card>
        
        <Card className="financial-card gradient-secondary text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">This Month</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalExpenses)}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-white/80" />
          </div>
        </Card>
      </div>

      {/* Budget Overview */}
      <Card className="financial-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Monthly Budget
          </h3>
          <span className={`text-sm font-medium ${
            summary.budgetRemaining >= 0 ? 'text-success' : 'text-destructive'
          }`}>
            {summary.budgetRemaining >= 0 ? '+' : ''}{formatCurrency(summary.budgetRemaining)}
          </span>
        </div>
        <Progress 
          value={summary.monthlyBudget > 0 ? (summary.totalExpenses / summary.monthlyBudget) * 100 : 0} 
          className="w-full h-3 mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Spent: {formatCurrency(summary.totalExpenses)}</span>
          <span>Budget: {formatCurrency(summary.monthlyBudget)}</span>
        </div>
      </Card>

      {/* Savings Goals Progress */}
      {activeGoals.length > 0 && (
        <Card className="financial-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Savings Goals Progress
          </h3>
          <div className="space-y-4">
            {activeGoals.map((goal) => {
              const percentage = (goal.currentAmount / goal.targetAmount) * 100;
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{goal.name}</span>
                    <span className={`text-sm ${getProgressColor(percentage)}`}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={percentage} className="w-full h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatCurrency(goal.currentAmount)}</span>
                    <span>{formatCurrency(goal.targetAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Quick Tips */}
      {quickTips.length > 0 && (
        <Card className="financial-card gradient-accent text-white">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Smart Tip
          </h3>
          <p className="text-sm text-white/90">{quickTips[0]}</p>
        </Card>
      )}

      {/* Recent Expenses */}
      {recentExpenses.length > 0 && (
        <Card className="financial-card">
          <h3 className="font-semibold mb-4">Recent Expenses</h3>
          <div className="space-y-3">
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-sm">
                    {expense.category === 'food' ? '🍽️' : 
                     expense.category === 'transport' ? '🚗' : 
                     expense.category === 'entertainment' ? '🎬' : '📋'}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">{expense.category}</p>
                  </div>
                </div>
                <span className="font-semibold text-destructive">
                  -{formatCurrency(expense.amount)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <Button 
          className="financial-card gradient-primary text-white border-0 font-semibold py-6"
          onClick={() => onNavigate('expenses')}
        >
          Add Expense
        </Button>
        <Button 
          variant="outline" 
          className="py-6 font-semibold"
          onClick={() => onNavigate('goals')}
        >
          New Goal
        </Button>
      </div>
    </div>
  );
}