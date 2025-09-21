import { subMonths, isWithinInterval } from 'date-fns';
import { expensesStorage, savingsGoalsStorage, budgetsStorage, tipsStorage } from '@/lib/storage';
import { Tip, ExpenseCategory, Expense } from '@/types/financial';

/**
 * Generates personalized tips based on user's spending patterns
 * @param userId - User identifier (defaults to 'default')
 * @returns Promise resolving to array of tips
 */
export const generateTips = async (userId: string = 'default'): Promise<Tip[]> => {
  const expenses = expensesStorage.get();
  const savingsGoals = savingsGoalsStorage.get();
  const budgets = budgetsStorage.get();
  
  const tips: Tip[] = [];
  
  // Analyze spending over last 3 months
  const threeMonthsAgo = subMonths(new Date(), 3);
  const recentExpenses = expenses.filter(expense => 
    new Date(expense.date) >= threeMonthsAgo
  );
  
  // Generate category-specific tips
  tips.push(...generateCategoryTips(recentExpenses));
  
  // Generate budget optimization tips
  tips.push(...generateBudgetTips(recentExpenses, budgets));
  
  // Generate savings goal tips
  tips.push(...generateSavingsGoalTips(recentExpenses, savingsGoals));
  
  // Generate trend-based tips
  tips.push(...generateTrendTips(recentExpenses));
  
  // Sort by confidence score and yearly impact
  const sortedTips = tips
    .sort((a, b) => (b.confidenceScore * b.impactYearly) - (a.confidenceScore * a.impactYearly))
    .slice(0, 5); // Return top 5 tips
  
  // Store tips for later retrieval
  tipsStorage.update(sortedTips);
  
  return sortedTips;
};

/**
 * Generates tips based on category spending patterns
 * @param expenses - User's recent expenses
 * @returns Array of category-based tips
 */
const generateCategoryTips = (expenses: Expense[]): Tip[] => {
  const tips: Tip[] = [];
  const categorySpending = getCategorySpending(expenses);
  
  Object.entries(categorySpending).forEach(([category, monthlyAverage]) => {
    if (monthlyAverage > 200) { // Only suggest for categories with significant spending
      const reductionAmount = Math.min(monthlyAverage * 0.2, 50); // Suggest 20% reduction, max $50
      const yearlyImpact = reductionAmount * 12;
      
      tips.push({
        id: `category_${category}_${Date.now()}`,
        text: `Reducing ${category} expenses by $${reductionAmount.toFixed(0)}/month could save you $${yearlyImpact.toFixed(0)} annually.`,
        impactYearly: yearlyImpact,
        confidenceScore: monthlyAverage > 300 ? 0.8 : 0.6,
        relatedCategory: category as ExpenseCategory,
        actionType: 'reduce-spending',
        suggestedReduction: reductionAmount
      });
    }
  });
  
  return tips;
};

/**
 * Generates budget optimization tips
 * @param expenses - User's recent expenses
 * @param budgets - User's budgets
 * @returns Array of budget optimization tips
 */
const generateBudgetTips = (expenses: Expense[], budgets: any[]): Tip[] => {
  const tips: Tip[] = [];
  const categorySpending = getCategorySpending(expenses);
  
  budgets.forEach(budget => {
    const actualSpending = categorySpending[budget.category] || 0;
    const overspend = actualSpending - budget.monthlyLimit;
    
    if (overspend > 0) {
      const yearlyWaste = overspend * 12;
      
      tips.push({
        id: `budget_${budget.category}_${Date.now()}`,
        text: `You're overspending on ${budget.category} by $${overspend.toFixed(0)}/month. Sticking to your budget saves $${yearlyWaste.toFixed(0)}/year.`,
        impactYearly: yearlyWaste,
        confidenceScore: 0.9, // High confidence for budget overruns
        relatedCategory: budget.category,
        actionType: 'budget-optimization',
        suggestedReduction: overspend
      });
    }
  });
  
  return tips;
};

/**
 * Generates savings goal related tips
 * @param expenses - User's recent expenses
 * @param savingsGoals - User's savings goals
 * @returns Array of savings goal tips
 */
const generateSavingsGoalTips = (expenses: Expense[], savingsGoals: any[]): Tip[] => {
  const tips: Tip[] = [];
  const totalMonthlySpending = getTotalMonthlySpending(expenses);
  
  savingsGoals.forEach(goal => {
    const remainingAmount = goal.targetAmount - goal.currentAmount;
    const deadline = new Date(goal.deadline);
    const monthsRemaining = Math.max(1, Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));
    const monthlyNeeded = remainingAmount / monthsRemaining;
    
    if (monthlyNeeded > 0) {
      const suggestedReduction = Math.min(monthlyNeeded, totalMonthlySpending * 0.1); // Max 10% of spending
      
      tips.push({
        id: `savings_${goal.id}_${Date.now()}`,
        text: `To reach your ${goal.name} goal, save $${monthlyNeeded.toFixed(0)}/month. Consider reducing discretionary spending by $${suggestedReduction.toFixed(0)}/month.`,
        impactYearly: suggestedReduction * 12,
        confidenceScore: 0.7,
        relatedCategory: 'other' as ExpenseCategory,
        actionType: 'increase-savings',
        suggestedReduction: suggestedReduction
      });
    }
  });
  
  return tips;
};

/**
 * Generates tips based on spending trends
 * @param expenses - User's recent expenses
 * @returns Array of trend-based tips
 */
const generateTrendTips = (expenses: Expense[]): Tip[] => {
  const tips: Tip[] = [];
  const monthlySpending = getMonthlyTrends(expenses);
  
  // Check for increasing trend
  if (monthlySpending.length >= 2) {
    const recent = monthlySpending[monthlySpending.length - 1];
    const previous = monthlySpending[monthlySpending.length - 2];
    const increase = recent.total - previous.total;
    
    if (increase > 100) { // Significant increase
      tips.push({
        id: `trend_increase_${Date.now()}`,
        text: `Your spending increased by $${increase.toFixed(0)} last month. Identifying the cause could prevent $${(increase * 12).toFixed(0)} in annual overspending.`,
        impactYearly: increase * 12,
        confidenceScore: 0.6,
        relatedCategory: 'other' as ExpenseCategory,
        actionType: 'reduce-spending',
        suggestedReduction: increase * 0.5
      });
    }
  }
  
  return tips;
};

/**
 * Gets average monthly spending by category
 * @param expenses - User's expenses
 * @returns Object with category spending averages
 */
const getCategorySpending = (expenses: Expense[]): Record<string, number> => {
  const categoryTotals: Record<string, number> = {};
  const monthsCount = Math.max(1, Math.ceil(expenses.length / 30)); // Rough estimate
  
  expenses.forEach(expense => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  });
  
  // Convert to monthly averages
  Object.keys(categoryTotals).forEach(category => {
    categoryTotals[category] = categoryTotals[category] / monthsCount;
  });
  
  return categoryTotals;
};

/**
 * Gets total monthly spending
 * @param expenses - User's expenses
 * @returns Average monthly spending
 */
const getTotalMonthlySpending = (expenses: Expense[]): number => {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthsCount = Math.max(1, Math.ceil(expenses.length / 30));
  return total / monthsCount;
};

/**
 * Gets monthly spending trends
 * @param expenses - User's expenses
 * @returns Array of monthly spending data
 */
const getMonthlyTrends = (expenses: Expense[]): Array<{ month: string; total: number }> => {
  const monthlyData: Record<string, number> = {};
  
  expenses.forEach(expense => {
    const month = expense.date.substring(0, 7); // YYYY-MM
    monthlyData[month] = (monthlyData[month] || 0) + expense.amount;
  });
  
  return Object.entries(monthlyData)
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

/**
 * Gets stored tips for display
 * @returns Array of stored tips
 */
export const getStoredTips = (): Tip[] => {
  return tipsStorage.get();
};