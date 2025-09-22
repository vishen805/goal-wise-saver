import { Expense, SavingsGoal, Budget } from '@/types/financial';
import { expensesStorage, savingsGoalsStorage, budgetsStorage } from '@/lib/storage';
import { generateTips } from './tipsService';

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

    // Calculate key metrics
    const totalMonthlyExpenses = expenses
      .filter(e => new Date(e.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, e) => sum + e.amount, 0);
    
    const totalGoals = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const achievedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length;

    // Question categorization and responses
    if (lowerQuestion.includes('save more') || lowerQuestion.includes('increase savings')) {
      return this.generateSavingsAdvice(expenses, goals, tips);
    }
    
    if (lowerQuestion.includes('budget') || lowerQuestion.includes('spending')) {
      return this.generateBudgetAdvice(expenses, budgets, totalMonthlyExpenses);
    }
    
    if (lowerQuestion.includes('goal') || lowerQuestion.includes('target')) {
      return this.generateGoalAdvice(goals, totalMonthlyExpenses);
    }
    
    if (lowerQuestion.includes('category') || lowerQuestion.includes('expense')) {
      return this.generateCategoryAdvice(expenses);
    }

    if (lowerQuestion.includes('plan') || lowerQuestion.includes('strategy')) {
      return this.generatePlanAdvice(expenses, goals, totalMonthlyExpenses);
    }

    // General financial overview
    return this.generateGeneralAdvice(expenses, goals, budgets, totalMonthlyExpenses, achievedGoals);
  }

  private static generateSavingsAdvice(expenses: Expense[], goals: SavingsGoal[], tips: any[]): string {
    const topTip = tips[0];
    const categorySpending = this.getCategorySpending(expenses);
    const highestCategory = Object.entries(categorySpending).sort(([,a], [,b]) => b - a)[0];

    return `💰 To save more money, I recommend starting with your ${highestCategory?.[0] || 'highest spending'} category where you spend $${highestCategory?.[1]?.toFixed(2) || '0'} monthly. ${topTip ? topTip.text : 'Consider reducing discretionary spending by 10-15%.'} 

🎯 Based on your current spending patterns, you could potentially save an extra $${(highestCategory?.[1] || 0 * 0.1).toFixed(2)} per month by making small adjustments. This would add up to $${((highestCategory?.[1] || 0) * 0.1 * 12).toFixed(2)} annually!

📈 Start small - even saving $5-10 less per week in your top spending category can make a significant difference over time.`;
  }

  private static generateBudgetAdvice(expenses: Expense[], budgets: Budget[], totalMonthly: number): string {
    const budgetTotal = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
    const isOverBudget = totalMonthly > budgetTotal;

    if (isOverBudget) {
      const overage = totalMonthly - budgetTotal;
      return `⚠️ You're currently spending $${overage.toFixed(2)} over your monthly budget of $${budgetTotal.toFixed(2)}.

🔧 Here's how to get back on track:
• Review your largest expense categories and identify areas to cut back
• Set up spending alerts when you're 80% through each budget category
• Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings

💡 Small daily adjustments can help you save $${(overage / 30).toFixed(2)} per day to stay within budget.`;
    }

    return `✅ Great job staying within your $${budgetTotal.toFixed(2)} monthly budget! You're spending $${totalMonthly.toFixed(2)}, leaving you with $${(budgetTotal - totalMonthly).toFixed(2)} extra.

🚀 Consider allocating this surplus to:
• Emergency fund (aim for 3-6 months of expenses)
• Retirement savings
• Your highest priority savings goal

📊 You're showing excellent financial discipline - keep it up!`;
  }

  private static generateGoalAdvice(goals: SavingsGoal[], totalMonthly: number): string {
    if (goals.length === 0) {
      return `🎯 I notice you haven't set any savings goals yet! Setting clear, specific goals is crucial for financial success.

💭 Consider setting goals for:
• Emergency fund ($${(totalMonthly * 3).toFixed(2)} for 3 months of expenses)
• Vacation or major purchase
• Long-term investments
• Home down payment

📝 Start with one specific, time-bound goal and track your progress monthly.`;
    }

    const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount);
    const totalNeeded = activeGoals.reduce((sum, g) => sum + (g.targetAmount - g.currentAmount), 0);
    
    if (activeGoals.length > 0) {
      const monthsToGoal = Math.ceil(totalNeeded / (totalMonthly * 0.2)); // Assuming 20% savings rate
      
      return `🎯 You have ${activeGoals.length} active savings goal${activeGoals.length > 1 ? 's' : ''} totaling $${totalNeeded.toFixed(2)}.

⏰ At a 20% savings rate ($${(totalMonthly * 0.2).toFixed(2)}/month), you could achieve all goals in approximately ${monthsToGoal} months.

🚀 To reach your goals faster:
• Increase your savings rate to 25-30%
• Focus on one goal at a time for faster momentum
• Automate transfers to your savings account
• Celebrate milestones at 25%, 50%, and 75% completion

💪 You're ${((goals.reduce((sum, g) => sum + g.currentAmount, 0) / goals.reduce((sum, g) => sum + g.targetAmount, 0)) * 100).toFixed(1)}% of the way there!`;
    }

    return `🎉 Congratulations! You've achieved all your savings goals. Time to set new, bigger targets to continue your financial growth!`;
  }

  private static generateCategoryAdvice(expenses: Expense[]): string {
    const categorySpending = this.getCategorySpending(expenses);
    const sortedCategories = Object.entries(categorySpending).sort(([,a], [,b]) => b - a);
    
    if (sortedCategories.length === 0) {
      return `📊 I don't see any expense data yet. Start tracking your expenses to get personalized category advice!`;
    }

    const top3 = sortedCategories.slice(0, 3);
    
    return `📈 Your top spending categories this month:

${top3.map(([category, amount], index) => 
  `${index + 1}. ${category}: $${amount.toFixed(2)}`
).join('\n')}

💡 Category optimization tips:
• ${top3[0]?.[0]}: Look for alternatives or negotiate better rates
• ${top3[1]?.[0]}: Set a weekly spending limit to stay conscious
• ${top3[2]?.[0]}: Track each transaction to identify patterns

🎯 Focus on reducing your top category by 10% first - that's $${(top3[0]?.[1] * 0.1 || 0).toFixed(2)} in monthly savings!`;
  }

  private static generatePlanAdvice(expenses: Expense[], goals: SavingsGoal[], totalMonthly: number): string {
    const hasGoals = goals.length > 0;
    const totalGoalAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    
    return `📋 Here's your personalized savings plan strategy:

🎯 **Monthly Savings Target**: $${(totalMonthly * 0.2).toFixed(2)} (20% of expenses)

📊 **Priority Order**:
1. Emergency Fund: $${(totalMonthly * 3).toFixed(2)} (3 months expenses)
2. ${hasGoals ? `Your Goals: $${totalGoalAmount.toFixed(2)}` : 'Set specific savings goals'}
3. Long-term investments (retirement, index funds)

⚡ **Quick Wins**:
• Automate savings transfers on payday
• Use the 24-hour rule for purchases over $50
• Review and cancel unused subscriptions monthly
• Cook at home 1-2 extra times per week

🔄 **Monthly Review**: Track progress and adjust strategy based on what's working best for you.

Remember: The best savings plan is one you can stick to consistently! Start small and build momentum.`;
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
      return `👋 Welcome to your AI Financial Advisor! I'm here to help you create and optimize your saving strategy.

🚀 To get started:
1. Track your expenses for a few days
2. Set up your first savings goal
3. Create a monthly budget
4. Ask me specific questions about your finances

💬 Try asking me things like:
• "How can I save more money?"
• "Am I staying within my budget?"
• "What's the best strategy for my goals?"

I'll analyze your financial data and provide personalized advice to help you achieve financial success! 💪`;
    }

    return `📊 **Financial Health Overview**

💰 Monthly Spending: $${totalMonthly.toFixed(2)}
🎯 Savings Goals: ${goals.length} (${achievedGoals} completed)
📋 Active Budgets: ${budgets.length}

${achievedGoals > 0 ? `🎉 Congratulations on achieving ${achievedGoals} goal${achievedGoals > 1 ? 's' : ''}!` : ''}

💡 **Key Recommendations**:
• Maintain emergency fund of $${(totalMonthly * 3).toFixed(2)}
• Save 20-30% of income when possible
• Review spending monthly and adjust as needed
• Celebrate your financial wins, no matter how small!

Ask me anything specific about your finances, and I'll provide detailed advice based on your data! 🤝`;
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