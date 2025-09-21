import { addDays, isAfter, isBefore, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { challengesStorage, expensesStorage, savingActivitiesStorage } from '@/lib/storage';
import { Challenge, ExpenseCategory, Expense } from '@/types/financial';

/**
 * Creates a new challenge for the user
 * @param challenge - Challenge object to create
 * @returns Created challenge
 */
export const createChallenge = (challenge: Omit<Challenge, 'id' | 'createdAt'>): Challenge => {
  const newChallenge: Challenge = {
    ...challenge,
    id: `challenge_${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  
  challengesStorage.add(newChallenge);
  return newChallenge;
};

/**
 * Gets all active challenges for a user
 * @param userId - User identifier (defaults to 'default')
 * @returns Array of active challenges
 */
export const getActiveChallenges = (userId: string = 'default'): Challenge[] => {
  return challengesStorage.getActive();
};

/**
 * Evaluates all active challenges and updates their status
 * @param userId - User identifier (defaults to 'default')
 * @returns Updated challenges array
 */
export const evaluateChallenges = (userId: string = 'default'): Challenge[] => {
  const challenges = challengesStorage.getActive();
  const expenses = expensesStorage.get();
  const savingActivities = savingActivitiesStorage.get();
  const today = new Date();
  
  challenges.forEach(challenge => {
    const challengeStart = new Date(challenge.startDate);
    const challengeEnd = new Date(challenge.endDate);
    
    // Check if challenge has expired
    if (isAfter(today, challengeEnd)) {
      const progress = calculateChallengeProgress(challenge, expenses, savingActivities);
      const status = progress >= 100 ? 'completed' : 'failed';
      challengesStorage.update(challenge.id, { status, progress });
      return;
    }
    
    // Calculate current progress for active challenges
    const progress = calculateChallengeProgress(challenge, expenses, savingActivities);
    challengesStorage.update(challenge.id, { progress });
    
    // Check if challenge is completed early
    if (progress >= 100) {
      challengesStorage.update(challenge.id, { status: 'completed' });
    }
  });
  
  return challengesStorage.get();
};

/**
 * Calculates the progress of a challenge (0-100)
 * @param challenge - Challenge to evaluate
 * @param expenses - User's expenses
 * @param savingActivities - User's saving activities
 * @returns Progress percentage (0-100)
 */
const calculateChallengeProgress = (
  challenge: Challenge,
  expenses: Expense[],
  savingActivities: any[]
): number => {
  const challengeStart = new Date(challenge.startDate);
  const challengeEnd = new Date(challenge.endDate);
  
  switch (challenge.type) {
    case 'no-spend-weekend': {
      // Check if user spent money on weekends within challenge period
      const weekendExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const isWeekend = expenseDate.getDay() === 0 || expenseDate.getDay() === 6;
        return isWeekend && isWithinInterval(expenseDate, { start: challengeStart, end: challengeEnd });
      });
      
      return weekendExpenses.length === 0 ? 100 : 0;
    }
    
    case 'reduce-category': {
      if (!challenge.category || !challenge.targetReduction) return 0;
      
      // Calculate spending in category during challenge period
      const categoryExpenses = expenses.filter(expense => 
        expense.category === challenge.category &&
        isWithinInterval(new Date(expense.date), { start: challengeStart, end: challengeEnd })
      );
      
      const totalSpent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Compare with historical average (last 3 months before challenge)
      const historicalStart = addDays(challengeStart, -90);
      const historicalExpenses = expenses.filter(expense =>
        expense.category === challenge.category &&
        isWithinInterval(new Date(expense.date), { start: historicalStart, end: challengeStart })
      );
      
      const historicalAverage = historicalExpenses.length > 0 
        ? historicalExpenses.reduce((sum, expense) => sum + expense.amount, 0) / 3
        : 0;
      
      if (historicalAverage === 0) return 0;
      
      const reductionAchieved = ((historicalAverage - totalSpent) / historicalAverage) * 100;
      return Math.max(0, Math.min(100, (reductionAchieved / challenge.targetReduction) * 100));
    }
    
    case 'save-amount': {
      if (!challenge.targetAmount) return 0;
      
      const savingsInPeriod = savingActivities
        .filter(activity => 
          isWithinInterval(new Date(activity.date), { start: challengeStart, end: challengeEnd })
        )
        .reduce((sum, activity) => sum + Math.max(0, activity.netSavings), 0);
      
      return Math.min(100, (savingsInPeriod / challenge.targetAmount) * 100);
    }
    
    case 'expense-limit': {
      if (!challenge.targetAmount) return 0;
      
      const totalExpenses = expenses
        .filter(expense => 
          isWithinInterval(new Date(expense.date), { start: challengeStart, end: challengeEnd })
        )
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      if (totalExpenses <= challenge.targetAmount) return 100;
      return Math.max(0, 100 - ((totalExpenses - challenge.targetAmount) / challenge.targetAmount) * 100);
    }
    
    default:
      return 0;
  }
};

/**
 * Creates preset challenges for common scenarios
 */
export const createPresetChallenges = () => {
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  
  return {
    noSpendWeekend: (): Challenge => createChallenge({
      name: 'No-Spend Weekend',
      description: 'Avoid spending money on weekends this month',
      type: 'no-spend-weekend',
      startDate: weekStart.toISOString(),
      endDate: weekEnd.toISOString(),
      status: 'active',
      progress: 0
    }),
    
    reduceFoodExpenses: (): Challenge => createChallenge({
      name: 'Reduce Food Spending',
      description: 'Cut food expenses by 20% this month',
      type: 'reduce-category',
      category: 'food',
      targetReduction: 20,
      startDate: monthStart.toISOString(),
      endDate: monthEnd.toISOString(),
      status: 'active',
      progress: 0
    }),
    
    saveWeekly: (amount: number): Challenge => createChallenge({
      name: `Save $${amount} This Week`,
      description: `Save at least $${amount} by the end of this week`,
      type: 'save-amount',
      targetAmount: amount,
      startDate: weekStart.toISOString(),
      endDate: weekEnd.toISOString(),
      status: 'active',
      progress: 0
    }),
    
    monthlyBudget: (limit: number): Challenge => createChallenge({
      name: `Monthly Budget Challenge`,
      description: `Keep total expenses under $${limit} this month`,
      type: 'expense-limit',
      targetAmount: limit,
      startDate: monthStart.toISOString(),
      endDate: monthEnd.toISOString(),
      status: 'active',
      progress: 0
    })
  };
};

/**
 * Gets challenge statistics for display
 * @returns Challenge statistics object
 */
export const getChallengeStats = () => {
  const allChallenges = challengesStorage.get();
  
  return {
    total: allChallenges.length,
    active: allChallenges.filter(c => c.status === 'active').length,
    completed: allChallenges.filter(c => c.status === 'completed').length,
    failed: allChallenges.filter(c => c.status === 'failed').length,
    completionRate: allChallenges.length > 0 
      ? (allChallenges.filter(c => c.status === 'completed').length / allChallenges.length) * 100 
      : 0
  };
};