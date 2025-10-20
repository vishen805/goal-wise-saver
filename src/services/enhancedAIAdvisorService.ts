import { Expense, SavingsGoal, Budget, MonthlyIncome, AIAdvice, ExpenseCategory } from '@/types/financial';
import { expensesStorage, savingsGoalsStorage, budgetsStorage, incomeStorage, aiAdviceStorage, languageStorage } from '@/lib/storage';
import { t } from '@/lib/i18n';

/**
 * Enhanced AI Advisor Service - provides sophisticated financial analysis and personalized advice
 */
export class EnhancedAIAdvisorService {
  
  /**
   * Generate comprehensive financial advice based on user's complete financial profile
   */
  static async generateAdvice(forceRefresh = false): Promise<AIAdvice[]> {
    const existingAdvice = aiAdviceStorage.getLatest();
    const cachedLang = aiAdviceStorage.getLang ? aiAdviceStorage.getLang() : undefined;
    const currentLang = languageStorage.get();

    // If language changed since advice was cached, force refresh
    const shouldForceRefresh = forceRefresh || (cachedLang && cachedLang !== currentLang);

    // Return cached advice if less than 1 hour old and not forcing refresh
    if (!shouldForceRefresh && existingAdvice.length > 0) {
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
      title: t('welcome_smart_planning_title'),
      message: t('welcome_smart_planning_msg'),
      impact: { monthlySavings: 0, yearlySavings: 0 },
      priority: 'medium',
      actionItems: [
        t('onboarding_action_1'),
        t('onboarding_action_2'),
        t('onboarding_action_3')
      ],
      createdAt: new Date().toISOString()
    }];
  }

  // Simple placeholder formatter for templates like '{key}'
  private static format(template: string, params: Record<string, string | number> = {}): string {
    return Object.keys(params).reduce((s, k) => s.split(`{${k}}`).join(String(params[k])), template);
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
        title: t('rec_boost_title'),
        message: this.format(t('rec_boost_msg'), {
          savings: savingsRate.toFixed(1),
          target: (20).toString(),
          needed: `$${neededReduction.toFixed(0)}`
        }),
        impact: {
          monthlySavings: neededReduction,
          yearlySavings: neededReduction * 12
        },
        priority: savingsRate < 10 ? 'high' : 'medium',
        actionItems: [
          t('action_review_largest_categories'),
          t('action_cancel_subscriptions'),
          t('action_cook_at_home'),
          t('action_auto_savings')
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
        title: t('rec_spending_increase_title'),
        message: this.format(t('rec_spending_increase_msg'), {
          increase: `$${increase.toFixed(0)}`,
          percent: (((monthlyExpenses / previousMonthExpenses) - 1) * 100).toFixed(1)
        }),
        impact: {
          monthlySavings: increase * 0.5,
          yearlySavings: increase * 0.5 * 12
        },
        priority: 'high',
        actionItems: [
          t('action_review_recent_purchases'),
          t('action_identify_one_time'),
          t('action_set_spending_alerts')
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
          title: this.format(t('rec_goal_timeline_title'), { name: goal.name }),
          message: this.format(t('rec_goal_timeline_msg'), {
            name: goal.name,
            date: new Date(goal.deadline).toLocaleDateString(),
            required: `$${requiredMonthlySavings.toFixed(0)}`,
            current: `$${currentMonthlySavings.toFixed(0)}`,
            shortfall: `$${shortfall.toFixed(0)}`
          }),
          impact: {
            monthlySavings: shortfall,
            yearlySavings: shortfall * 12,
            goalTimeReduction: 0
          },
          priority: monthsRemaining <= 6 ? 'high' : 'medium',
          actionItems: [
            this.format(t('action_reduce_shortfall'), { shortfall: `$${shortfall.toFixed(0)}` }),
            t('action_extend_deadline'),
            t('action_find_income'),
            t('action_auto_savings')
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
          title: this.format(t('rec_goal_ahead_title'), { name: goal.name }),
          message: this.format(t('rec_goal_ahead_msg'), { name: goal.name, monthsAhead: String(monthsAhead) }),
          impact: {
            monthlySavings: 0,
            yearlySavings: 0,
            goalTimeReduction: monthsAhead
          },
          priority: 'low',
          actionItems: [
            t('action_increase_goal_target'),
            t('action_set_new_goal'),
            t('action_consider_investing')
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
          title: this.format(t('rec_budget_exceeded_title'), { category: budget.category }),
          message: this.format(t('rec_budget_exceeded_msg'), {
            category: budget.category,
            overBudget: `$${overBudget.toFixed(0)}`,
            budget: `$${budget.monthlyLimit.toFixed(0)}`,
            spent: `$${spent.toFixed(0)}`
          }),
          impact: {
            monthlySavings: overBudget * 0.7,
            yearlySavings: overBudget * 0.7 * 12
          },
          priority: 'high',
          actionItems: [
            this.format(t('action_budget_set_alerts'), { category: budget.category }),
            t('action_reduce_nonessential'),
            t('action_find_cheaper_alternatives'),
            t('action_consider_increasing_budget')
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
        title: t('rec_budget_imbalance_title'),
        message: this.format(t('rec_budget_imbalance_msg'), {
          total: `$${totalBudget.toFixed(0)}`,
          percent: ((totalBudget / income) * 100).toFixed(0)
        }),
        impact: {
          monthlySavings: (totalBudget - income * 0.7),
          yearlySavings: (totalBudget - income * 0.7) * 12
        },
        priority: 'high',
        actionItems: [
          t('action_follow_50_30_20'),
          t('action_reduce_discretionary_budgets'),
          t('action_prioritize_essential')
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
      // localize category name for messages
      const categoryI18nMap: Record<string, string> = {
        food: 'food_and_dining',
        transport: 'transport',
        entertainment: 'entertainment',
        shopping: 'shopping',
        bills: 'bills_utilities',
        healthcare: 'healthcare',
        education: 'education',
        other: 'other'
      };
      const localizedCategory = t(categoryI18nMap[category] || category);
      const percentage = amount / income;
      const benchmark = categoryBenchmarks[categoryKey];
      
      if (percentage > benchmark * 1.5) { // 50% above benchmark
        const excess = amount - (income * benchmark);
        const potentialSavings = excess * 0.3; // Conservative 30% reduction
        
        advice.push({
          id: `category-high-${category}`,
          type: 'category-analysis',
      title: this.format(t('rec_category_high_title'), { category: localizedCategory }),
          message: this.format(t('rec_category_high_msg'), {
        category: localizedCategory,
            amount: `$${amount.toFixed(0)}`,
            percent: ((percentage / benchmark - 1) * 100).toFixed(0),
            reduction: '30',
            potential: `$${potentialSavings.toFixed(0)}`
          }),
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