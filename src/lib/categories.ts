import { CategoryIcon, ExpenseCategory } from '@/types/financial';

export const expenseCategories: CategoryIcon[] = [
  { category: 'food', icon: '🍽️', color: 'text-orange-600' },
  { category: 'transport', icon: '🚗', color: 'text-blue-600' },
  { category: 'entertainment', icon: '🎬', color: 'text-purple-600' },
  { category: 'shopping', icon: '🛍️', color: 'text-pink-600' },
  { category: 'bills', icon: '⚡', color: 'text-orange-600' },
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
  { category: 'other', icon: '💰', color: 'text-gray-600' },
];

export const getCategoryIcon = (category: ExpenseCategory | string): CategoryIcon => {
  const found = [...expenseCategories, ...savingsCategories].find(
    c => c.category === category
  );
  return found || { category: 'other' as ExpenseCategory, icon: '📋', color: 'text-gray-600' };
};

import { currencyStorage, languageStorage } from '@/lib/storage';

export const formatCurrency = (amount: number): string => {
  const currency = currencyStorage.get() || 'USD';
  const lang = languageStorage.get() === 'zh' ? 'zh-TW' : 'en-US';
  try {
    return new Intl.NumberFormat(lang, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch (e) {
    // Fallback
    return `${currency} ${amount.toFixed(2)}`;
  }
};

export const formatDate = (date: string): string => {
  const lang = languageStorage.get() === 'zh' ? 'zh-TW' : 'en-US';
  return new Intl.DateTimeFormat(lang, {
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