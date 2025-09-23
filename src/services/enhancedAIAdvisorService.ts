import { Expense, SavingsGoal, Budget, MonthlyIncome, AIAdvice, ExpenseCategory } from '@/types/financial';
import { expensesStorage, savingsGoalsStorage, budgetsStorage, incomeStorage, aiAdviceStorage } from '@/lib/storage';

/**
 * Enhanced AI Advisor Service - provides sophisticated financial analysis and personalized advice
 */
export class EnhancedAIAdvisorService {
  
  /**
   * Generate comprehensive financial advice based on user's complete financial profile
   */
  static async generateAdvice(forceRefresh = false): Promise<AIAdvice[]> {
    const existingAdvice = aiAdviceStorage.getLatest();
    
    // Return cached advice if less than 1 hour old and not forcing refresh
    if (!forceRefresh && existingAdvice.length > 0) {
      const latestAdvice = existingAdvice[0];
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (new Date(latestAdvice.createdAt) > hourAgo) {
        return existingAdvice;
      }
    }

    const expenses = expensesStorage.get();
    const goals = savingsGoalsStorage.get();
    const budgets = budgetsStorage.get();
    const income = incomeStorage.getCurrentMonthIncome();

    if (expenses.length === 0 && goals.length === 0) {
      return this.generateOnboardingAdvice();
    }

    const advice: AIAdvice[] = [];

    // Analyze spending patterns
    advice.push(...this.analyzeSpendingPatterns(expenses, income));
    
    // Analyze goal progress
    advice.push(...this.analyzeGoalProgress(goals, expenses, income));
    
    // Analyze budget efficiency
    advice.push(...this.analyzeBudgetEfficiency(expenses, budgets, income));
    
    // Category-specific analysis
    advice.push(...this.analyzeCategorySpending(expenses, income));

    // Sort by priority and impact
    const sortedAdvice = advice
      .sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        return b.impact.yearlySavings - a.impact.yearlySavings;
      })
      .slice(0, 5);

    // Cache the advice
    aiAdviceStorage.clear();
    sortedAdvice.forEach(advice => aiAdviceStorage.add(advice));

    return sortedAdvice;
  }

  private static generateOnboardingAdvice(): AIAdvice[] {
    return [{
      id: Date.now().toString(),
      type: 'budget-optimization',
      title: 'Welcome to Smart Financial Planning!',
      message: 'Start by tracking your income and expenses for a few days to get personalized advice.',
      impact: { monthlySavings: 0, yearlySavings: 0 },
      priority: 'medium',
      actionItems: [
        'Add your monthly income',
        'Track daily expenses for one week',
        'Set your first savings goal'
      ],
      createdAt: new Date().toISOString()
    }];
  }

  private static analyzeSpendingPatterns(expenses: Expense[], income: number): AIAdvice[] {
    const advice: AIAdvice[] = [];
    const monthlyExpenses = this.getMonthlyExpenses(expenses);
    
    if (monthlyExpenses === 0 || income === 0) return advice;

    const savingsRate = ((income - monthlyExpenses) / income) * 100;

    // Low savings rate advice
    if (savingsRate < 20) {
      const targetSavings = income * 0.2;
      const currentSavings = income - monthlyExpenses;
      const neededReduction = targetSavings - currentSavings;

      advice.push({
        id: `savings-rate-${Date.now()}`,
        type: 'spending-reduction',
        title: 'Boost Your Savings Rate',
        message: `You're currently saving ${savingsRate.toFixed(1)}% of your income. Experts recommend saving at least 20%. You need to reduce spending by $${neededReduction.toFixed(0)} monthly to reach this target.`,
        impact: {
          monthlySavings: neededReduction,
          yearlySavings: neededReduction * 12
        },
        priority: savingsRate < 10 ? 'high' : 'medium',
        actionItems: [
          'Review largest expense categories',
          'Cancel unused subscriptions',
          'Cook at home more often',
          'Set up automatic savings transfers'
        ],
        createdAt: new Date().toISOString()
      });
    }

    // High spending month alert
    const previousMonthExpenses = this.getPreviousMonthExpenses(expenses);
    if (previousMonthExpenses > 0 && monthlyExpenses > previousMonthExpenses * 1.15) {
      const increase = monthlyExpenses - previousMonthExpenses;
      advice.push({
        id: `spending-spike-${Date.now()}`,
        type: 'spending-reduction',
        title: 'Spending Increase Alert',
        message: `Your spending increased by $${increase.toFixed(0)} (${(((monthlyExpenses / previousMonthExpenses) - 1) * 100).toFixed(1)}%) compared to last month. Let's identify what changed.`,
        impact: {
          monthlySavings: increase * 0.5,
          yearlySavings: increase * 0.5 * 12
        },
        priority: 'high',
        actionItems: [
          'Review recent purchases',
          'Identify one-time vs recurring increases',
          'Set spending alerts for top categories'
        ],
        createdAt: new Date().toISOString()
      });
    }

    return advice;
  }

  private static analyzeGoalProgress(goals: SavingsGoal[], expenses: Expense[], income: number): AIAdvice[] {
    const advice: AIAdvice[] = [];
    
    if (goals.length === 0 || income === 0) return advice;

    const monthlyExpenses = this.getMonthlyExpenses(expenses);
    const currentMonthlySavings = Math.max(0, income - monthlyExpenses);
    
    goals.forEach(goal => {
      const remainingAmount = goal.targetAmount - goal.currentAmount;
      const deadlineDate = new Date(goal.deadline);
      const monthsRemaining = Math.max(1, Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));
      const requiredMonthlySavings = remainingAmount / monthsRemaining;

      if (requiredMonthlySavings > currentMonthlySavings) {
        const shortfall = requiredMonthlySavings - currentMonthlySavings;
        
        advice.push({
          id: `goal-shortfall-${goal.id}`,
          type: 'goal-timeline',
          title: `${goal.name} Timeline Risk`,
          message: `To reach your ${goal.name} goal by ${new Date(goal.deadline).toLocaleDateString()}, you need to save $${requiredMonthlySavings.toFixed(0)}/month. You're currently saving $${currentMonthlySavings.toFixed(0)}/month. You need an additional $${shortfall.toFixed(0)}/month.`,
          impact: {
            monthlySavings: shortfall,
            yearlySavings: shortfall * 12,
            goalTimeReduction: 0
          },
          priority: monthsRemaining <= 6 ? 'high' : 'medium',
          actionItems: [
            `Reduce spending by $${shortfall.toFixed(0)}/month`,
            'Consider extending goal deadline',
            'Find additional income sources',
            'Automate savings transfers'
          ],
          createdAt: new Date().toISOString()
        });
      } else if (currentMonthlySavings > requiredMonthlySavings * 1.2) {
        // Ahead of schedule
        const excess = currentMonthlySavings - requiredMonthlySavings;
        const monthsAhead = Math.floor((excess * monthsRemaining) / remainingAmount * monthsRemaining);
        
        advice.push({
          id: `goal-ahead-${goal.id}`,
          type: 'goal-timeline',
          title: `${goal.name} Ahead of Schedule!`,
          message: `Great news! You're on track to reach your ${goal.name} goal ${monthsAhead} months early. Consider setting a more ambitious target or starting a new goal.`,
          impact: {
            monthlySavings: 0,
            yearlySavings: 0,
            goalTimeReduction: monthsAhead
          },
          priority: 'low',
          actionItems: [
            'Increase goal target amount',
            'Set a new savings goal',
            'Consider investing excess savings'
          ],
          createdAt: new Date().toISOString()
        });
      }
    });

    return advice;
  }

  private static analyzeBudgetEfficiency(expenses: Expense[], budgets: Budget[], income: number): AIAdvice[] {
    const advice: AIAdvice[] = [];
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    if (budgets.length === 0 || income === 0) return advice;

    const categorySpending = this.getCategorySpending(expenses);
    const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
    const totalSpending = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0);

    // Over-budget analysis
    budgets.forEach(budget => {
      const spent = categorySpending[budget.category] || 0;
      const overBudget = spent - budget.monthlyLimit;
      
      if (overBudget > 0) {
        advice.push({
          id: `budget-exceeded-${budget.category}`,
          type: 'budget-optimization',
          title: `${budget.category} Budget Exceeded`,
          message: `You've overspent in ${budget.category} by $${overBudget.toFixed(0)} this month. Your budget was $${budget.monthlyLimit}, but you spent $${spent.toFixed(0)}.`,
          impact: {
            monthlySavings: overBudget * 0.7,
            yearlySavings: overBudget * 0.7 * 12
          },
          priority: 'high',
          actionItems: [
            `Set spending alerts at 80% of ${budget.category} budget`,
            'Review and reduce non-essential purchases',
            'Look for cheaper alternatives',
            'Consider increasing budget if necessary'
          ],
          relatedCategory: budget.category,
          createdAt: new Date().toISOString()
        });
      }
    });

    // Budget efficiency recommendation
    if (totalBudget > income * 0.8) {
      advice.push({
        id: `budget-too-high-${Date.now()}`,
        type: 'budget-optimization',
        title: 'Budget vs Income Imbalance',
        message: `Your total budget ($${totalBudget.toFixed(0)}) is ${((totalBudget / income) * 100).toFixed(0)}% of your income. This leaves little room for savings and unexpected expenses.`,
        impact: {
          monthlySavings: (totalBudget - income * 0.7),
          yearlySavings: (totalBudget - income * 0.7) * 12
        },
        priority: 'high',
        actionItems: [
          'Follow 50/30/20 rule: 50% needs, 30% wants, 20% savings',
          'Reduce budgets in discretionary categories',
          'Prioritize essential vs non-essential expenses'
        ],
        createdAt: new Date().toISOString()
      });
    }

    return advice;
  }

  private static analyzeCategorySpending(expenses: Expense[], income: number): AIAdvice[] {
    const advice: AIAdvice[] = [];
    const categorySpending = this.getCategorySpending(expenses);
    const totalSpending = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0);
    
    if (totalSpending === 0 || income === 0) return advice;

    // Analyze each category against benchmarks
    const categoryBenchmarks: Record<ExpenseCategory, number> = {
      food: 0.15, // 15% of income
      transport: 0.15,
      entertainment: 0.05,
      shopping: 0.05,
      bills: 0.25,
      healthcare: 0.05,
      education: 0.05,
      other: 0.05
    };

    Object.entries(categorySpending).forEach(([category, amount]) => {
      const categoryKey = category as ExpenseCategory;
      const percentage = amount / income;
      const benchmark = categoryBenchmarks[categoryKey];
      
      if (percentage > benchmark * 1.5) { // 50% above benchmark
        const excess = amount - (income * benchmark);
        const potentialSavings = excess * 0.3; // Conservative 30% reduction
        
        advice.push({
          id: `category-high-${category}`,
          type: 'category-analysis',
          title: `High ${category} Spending`,
          message: `Your ${category} spending ($${amount.toFixed(0)}) is ${((percentage / benchmark - 1) * 100).toFixed(0)}% above typical levels. Reducing by just 30% would save you $${potentialSavings.toFixed(0)} monthly.`,
          impact: {
            monthlySavings: potentialSavings,
            yearlySavings: potentialSavings * 12
          },
          priority: percentage > benchmark * 2 ? 'high' : 'medium',
          actionItems: this.getCategoryActionItems(categoryKey),
          relatedCategory: categoryKey,
          createdAt: new Date().toISOString()
        });
      }
    });

    return advice;
  }

  private static getCategoryActionItems(category: ExpenseCategory): string[] {
    const actionMap: Record<ExpenseCategory, string[]> = {
      food: [
        'Cook at home 2-3 more times per week',
        'Plan meals and create shopping lists',
        'Buy generic brands and shop sales',
        'Reduce dining out and takeaway orders'
      ],
      transport: [
        'Use public transport or bike when possible',
        'Combine errands into single trips',
        'Consider carpooling or ride-sharing',
        'Maintain your car to improve fuel efficiency'
      ],
      entertainment: [
        'Look for free community events',
        'Use streaming services instead of movie theaters',
        'Host potluck dinners instead of going out',
        'Take advantage of happy hours and discounts'
      ],
      shopping: [
        'Use the 24-hour rule for non-essential purchases',
        'Shop with a list and stick to it',
        'Compare prices and look for discounts',
        'Buy quality items that last longer'
      ],
      bills: [
        'Review and cancel unused subscriptions',
        'Negotiate better rates with providers',
        'Switch to energy-efficient appliances',
        'Consider bundling services for discounts'
      ],
      healthcare: [
        'Use preventive care to avoid bigger costs',
        'Compare prices for medications and procedures',
        'Use generic medications when available',
        'Maximize your insurance benefits'
      ],
      education: [
        'Look for free online courses and resources',
        'Buy used textbooks or rent them',
        'Apply for scholarships and grants',
        'Take advantage of employer education benefits'
      ],
      other: [
        'Categorize expenses to identify patterns',
        'Set a monthly limit for miscellaneous spending',
        'Review recurring charges regularly',
        'Question the necessity of each purchase'
      ]
    };

    return actionMap[category] || [];
  }

  private static getMonthlyExpenses(expenses: Expense[]): number {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return expenses
      .filter(e => e.date.startsWith(currentMonth))
      .reduce((sum, e) => sum + e.amount, 0);
  }

  private static getPreviousMonthExpenses(expenses: Expense[]): number {
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const previousMonthStr = previousMonth.toISOString().slice(0, 7);
    
    return expenses
      .filter(e => e.date.startsWith(previousMonthStr))
      .reduce((sum, e) => sum + e.amount, 0);
  }

  private static getCategorySpending(expenses: Expense[]): Record<string, number> {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
    
    return monthlyExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  }
}