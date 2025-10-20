import { Expense, SavingsGoal, Budget } from '@/types/financial';
import { t } from '@/lib/i18n';
import { expensesStorage, savingsGoalsStorage, budgetsStorage, languageStorage } from '@/lib/storage';
import { generateTips } from './tipsService';
import { formatCurrency } from '@/lib/categories';

export interface AIMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface AIConversation {
  id: string;
  messages: AIMessage[];
  createdAt: Date;
}

/**
 * AI Advisor Service - provides personalized financial advice based on user data
 */
export class AIAdvisorService {
  private static conversations: Map<string, AIConversation> = new Map();

  /**
   * Ask the AI advisor a question about saving plans
   */
  static async askQuestion(question: string, userId: string = 'default'): Promise<string> {
    // Get user's financial data for context
    const expenses = expensesStorage.get();
    const goals = savingsGoalsStorage.get();
    const budgets = budgetsStorage.get();
    const tips = await generateTips(userId);

    // Store the user's question
    this.addMessage(userId, 'user', question);

    // Generate AI response based on question type and user data
    const response = await this.generateResponse(question, expenses, goals, budgets, tips);
    
    // Store AI response
    this.addMessage(userId, 'ai', response);

    return response;
  }

  /**
   * Get conversation history for a user
   */
  static getConversation(userId: string = 'default'): AIMessage[] {
    const conversation = this.conversations.get(userId);
    return conversation?.messages || [];
  }

  /**
   * Clear conversation history
   */
  static clearConversation(userId: string = 'default'): void {
    this.conversations.delete(userId);
  }

  /**
   * Add a message to the conversation
   */
  private static addMessage(userId: string, type: 'user' | 'ai', content: string): void {
    let conversation = this.conversations.get(userId);
    
    if (!conversation) {
      conversation = {
        id: userId,
        messages: [],
        createdAt: new Date()
      };
      this.conversations.set(userId, conversation);
    }

    conversation.messages.push({
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    });
  }

  // Simple placeholder formatter for templates like '{key}'
  private static format(template: string, params: Record<string, string | number> = {}): string {
    return Object.keys(params).reduce((s, k) => s.split(`{${k}}`).join(String(params[k])), template);
  }

  /**
   * Generate AI response based on question and user data
   */
  private static async generateResponse(
    question: string, 
    expenses: Expense[], 
    goals: SavingsGoal[], 
    budgets: Budget[],
    tips: any[]
  ): Promise<string> {
  const lowerQuestion = question.toLowerCase();
  const lang = languageStorage.get();
  const questionToCheck = lang === 'zh' ? question : lowerQuestion;

    // Calculate key metrics
    const totalMonthlyExpenses = expenses
      .filter(e => new Date(e.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, e) => sum + e.amount, 0);
    
    const totalGoals = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const achievedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length;

    // Question categorization and responses
    const saveKeys = lang === 'zh' ? ['儲蓄', '多存', '增加儲蓄', '存更多'] : ['save more', 'increase savings', 'save', 'savings'];
    const budgetKeys = lang === 'zh' ? ['預算', '支出', '花費'] : ['budget', 'spending', 'expense'];
    const goalKeys = lang === 'zh' ? ['目標', '達成'] : ['goal', 'target'];
    const categoryKeys = lang === 'zh' ? ['類別', '支出項目'] : ['category', 'expense'];
    const planKeys = lang === 'zh' ? ['計畫', '策略', '方案'] : ['plan', 'strategy'];

    if (saveKeys.some(k => questionToCheck.includes(k))) {
      return this.generateSavingsAdvice(expenses, goals, tips);
    }
    if (budgetKeys.some(k => questionToCheck.includes(k))) {
      return this.generateBudgetAdvice(expenses, budgets, totalMonthlyExpenses);
    }
    if (goalKeys.some(k => questionToCheck.includes(k))) {
      return this.generateGoalAdvice(goals, totalMonthlyExpenses);
    }
    if (categoryKeys.some(k => questionToCheck.includes(k))) {
      return this.generateCategoryAdvice(expenses);
    }
    if (planKeys.some(k => questionToCheck.includes(k))) {
      return this.generatePlanAdvice(expenses, goals, totalMonthlyExpenses);
    }

    // General financial overview
    return this.generateGeneralAdvice(expenses, goals, budgets, totalMonthlyExpenses, achievedGoals);
  }

  private static generateSavingsAdvice(expenses: Expense[], goals: SavingsGoal[], tips: any[]): string {
    const topTip = tips[0];
    const categorySpending = this.getCategorySpending(expenses);
    const highestCategory = Object.entries(categorySpending).sort(([,a], [,b]) => b - a)[0];
    const category = highestCategory?.[0] || 'highest spending';
    const amount = highestCategory ? highestCategory[1].toFixed(2) : '0';
    const potential = highestCategory ? (Number(highestCategory[1]) * 0.1).toFixed(2) : '0';
    const annual = highestCategory ? (Number(highestCategory[1]) * 0.1 * 12).toFixed(2) : '0';

    return [
      this.format(this.t('ai_savings_intro'), { category, amount, tip: topTip ? topTip.text : this.t('ai_savings_default_tip') }),
      this.format(this.t('ai_savings_potential'), { potential, annual }),
      this.t('ai_savings_start_small')
    ].join('\n\n');
  }

  private static generateBudgetAdvice(expenses: Expense[], budgets: Budget[], totalMonthly: number): string {
    const budgetTotal = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
    const isOverBudget = totalMonthly > budgetTotal;

    if (isOverBudget) {
      const overage = totalMonthly - budgetTotal;
      return this.format(this.t('ai_budget_overage'), {
        overage: `$${overage.toFixed(2)}`,
        budgetTotal: `$${budgetTotal.toFixed(2)}`,
        daily: `$${(overage / 30).toFixed(2)}`
      });
    }

    return this.format(this.t('ai_budget_within'), {
      budgetTotal: `$${budgetTotal.toFixed(2)}`,
      totalMonthly: `$${totalMonthly.toFixed(2)}`,
      surplus: `$${(budgetTotal - totalMonthly).toFixed(2)}`
    });
  }

  private static generateGoalAdvice(goals: SavingsGoal[], totalMonthly: number): string {
    if (goals.length === 0) {
      return this.format(this.t('ai_goal_none'), { emergency: `$${(totalMonthly * 3).toFixed(2)}` });
    }

    const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount);
    const totalNeeded = activeGoals.reduce((sum, g) => sum + (g.targetAmount - g.currentAmount), 0);
    
    if (activeGoals.length > 0) {
      const monthsToGoal = Math.ceil(totalNeeded / (totalMonthly * 0.2)); // Assuming 20% savings rate
      
      const pct = ((goals.reduce((sum, g) => sum + g.currentAmount, 0) / goals.reduce((sum, g) => sum + g.targetAmount, 0)) * 100).toFixed(1);
      return this.format(this.t('ai_goal_active'), {
        count: String(activeGoals.length),
        totalNeeded: `$${totalNeeded.toFixed(2)}`,
        monthlySavings: `$${(totalMonthly * 0.2).toFixed(2)}`,
        monthsToGoal: String(monthsToGoal),
        pct
      });
    }

    return this.t('ai_goal_completed');
  }

  private static generateCategoryAdvice(expenses: Expense[]): string {
    const categorySpending = this.getCategorySpending(expenses);
    const sortedCategories = Object.entries(categorySpending).sort(([,a], [,b]) => b - a);
    
    if (sortedCategories.length === 0) {
      return this.t('ai_category_no_data');
    }

    const top3 = sortedCategories.slice(0, 3);
    const topList = top3.map(([category, amount], index) => `${index + 1}. ${category}: $${amount.toFixed(2)}`).join('\n');
    const tips = [
      `• ${top3[0]?.[0]}: ${this.t('ai_cat_tip_1')}`,
      `• ${top3[1]?.[0]}: ${this.t('ai_cat_tip_2')}`,
      `• ${top3[2]?.[0]}: ${this.t('ai_cat_tip_3')}`
    ].join('\n');

    return this.format(this.t('ai_category_summary'), {
      topList,
      tips,
      savings: `$${((top3[0]?.[1] || 0) * 0.1).toFixed(2)}`
    });
  }

  private static generatePlanAdvice(expenses: Expense[], goals: SavingsGoal[], totalMonthly: number): string {
    const hasGoals = goals.length > 0;
    const totalGoalAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    return this.format(this.t('ai_plan_intro'), {
      monthlyTarget: `$${(totalMonthly * 0.2).toFixed(2)}`,
      emergency: `$${(totalMonthly * 3).toFixed(2)}`,
      yourGoals: hasGoals ? `$${totalGoalAmount.toFixed(2)}` : this.t('ai_plan_no_goals')
    });
  }

  private static generateGeneralAdvice(
    expenses: Expense[], 
    goals: SavingsGoal[], 
    budgets: Budget[],
    totalMonthly: number,
    achievedGoals: number
  ): string {
    const hasData = expenses.length > 0;

    if (!hasData) {
      return [
        '👋 ' + t('ai_welcome'),
        '',
        '🚀 ' + t('welcome_smart_planning_msg'),
        '',
        '💬 ' + t('try_asking'),
        `• ${t('suggested_q_1')}`,
        `• ${t('suggested_q_2')}`,
        `• ${t('suggested_q_3')}`,
        '',
        t('welcome_smart_planning_msg')
      ].join('\n');
    }

    return this.format(this.t('ai_general_overview'), {
      totalMonthly: `$${totalMonthly.toFixed(2)}`,
      goalsCount: String(goals.length),
      achievedGoals: String(achievedGoals),
      budgetsCount: String(budgets.length),
      emergency: `$${(totalMonthly * 3).toFixed(2)}`
    });
  }

  private static t(key: string) {
    return t(key);
  }

  private static getCategorySpending(expenses: Expense[]): Record<string, number> {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    const recentExpenses = expenses.filter(expense => new Date(expense.date) >= oneMonthAgo);
    
    return recentExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  }
}