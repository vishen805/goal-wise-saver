import { CategoryIcon, ExpenseCategory } from '@/types/financial';

export const expenseCategories: CategoryIcon[] = [
  { category: 'food', icon: '🍽️', color: 'text-orange-600' },
  { category: 'transport', icon: '🚗', color: 'text-blue-600' },
  { category: 'entertainment', icon: '🎬', color: 'text-purple-600' },
  { category: 'shopping', icon: '🛍️', color: 'text-pink-600' },
  { category: 'bills', icon: '⚡', color: 'text-yellow-600' },
  { category: 'healthcare', icon: '🏥', color: 'text-red-600' },
  { category: 'education', icon: '📚', color: 'text-indigo-600' },
  { category: 'other', icon: '📋', color: 'text-gray-600' },
];

export const savingsCategories: CategoryIcon[] = [
  { category: 'vacation', icon: '✈️', color: 'text-blue-600' },
  { category: 'emergency', icon: '🛡️', color: 'text-red-600' },
  { category: 'home', icon: '🏠', color: 'text-green-600' },
  { category: 'car', icon: '🚗', color: 'text-blue-600' },
  { category: 'education', icon: '🎓', color: 'text-indigo-600' },
  { category: 'other', icon: '💰', color: 'text-yellow-600' },
];

export const getCategoryIcon = (category: ExpenseCategory | string): CategoryIcon => {
  const found = [...expenseCategories, ...savingsCategories].find(
    c => c.category === category
  );
  return found || { category: 'other' as ExpenseCategory, icon: '📋', color: 'text-gray-600' };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

export const getProgressColor = (percentage: number): string => {
  if (percentage >= 100) return 'text-success';
  if (percentage >= 75) return 'text-primary';
  if (percentage >= 50) return 'text-secondary';
  if (percentage >= 25) return 'text-warning';
  return 'text-muted-foreground';
};