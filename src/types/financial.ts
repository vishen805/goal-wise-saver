export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: 'vacation' | 'emergency' | 'home' | 'car' | 'education' | 'other';
  createdAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: ExpenseCategory;
  monthlyLimit: number;
  currentSpent: number;
  month: string; // YYYY-MM format
}

export type ExpenseCategory = 
  | 'food'
  | 'transport' 
  | 'entertainment'
  | 'shopping'
  | 'bills'
  | 'healthcare'
  | 'education'
  | 'other';

export interface MonthlyIncome {
  id: string;
  amount: number;
  source: string;
  month: string; // YYYY-MM format
  isRecurring: boolean;
  createdAt: string;
}

export interface FinancialSummary {
  totalSavings: number;
  totalExpenses: number;
  monthlyBudget: number;
  budgetRemaining: number;
  savingsGoalsProgress: number;
  monthlyIncome: number;
}

export interface AIAdvice {
  id: string;
  type: 'spending-reduction' | 'goal-timeline' | 'budget-optimization' | 'category-analysis';
  title: string;
  message: string;
  impact: {
    monthlySavings: number;
    yearlySavings: number;
    goalTimeReduction?: number; // months saved
  };
  priority: 'high' | 'medium' | 'low';
  actionItems: string[];
  relatedCategory?: ExpenseCategory;
  createdAt: string;
}

export interface CategoryIcon {
  category: ExpenseCategory | SavingsGoal['category'];
  icon: string;
  color: string;
}

// New types for enhanced features
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'savings' | 'budget' | 'achievement';
  earnedAt: string;
  requirement: number; // e.g., 7 for 7-day streak
}

export interface UserStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastSavingDay: string;
  streakHistory: string[]; // dates of saving days
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'no-spend-weekend' | 'reduce-category' | 'save-amount' | 'expense-limit';
  category?: ExpenseCategory;
  targetAmount?: number;
  targetReduction?: number; // percentage for reduce-category
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'failed' | 'expired';
  progress: number; // 0-100
  createdAt: string;
}

export interface Tip {
  id: string;
  text: string;
  impactYearly: number;
  confidenceScore: number; // 0-1
  relatedCategory: ExpenseCategory;
  actionType: 'reduce-spending' | 'increase-savings' | 'budget-optimization';
  suggestedReduction: number; // monthly amount
}

export interface SavingActivity {
  id: string;
  date: string;
  netSavings: number; // positive = saved money, negative = spent savings
  isManualSavingDay: boolean; // user marked as saving day even if netSavings <= 0
  goalContributions: Array<{ goalId: string; amount: number }>;
}