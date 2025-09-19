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

export interface FinancialSummary {
  totalSavings: number;
  totalExpenses: number;
  monthlyBudget: number;
  budgetRemaining: number;
  savingsGoalsProgress: number;
}

export interface CategoryIcon {
  category: ExpenseCategory | SavingsGoal['category'];
  icon: string;
  color: string;
}