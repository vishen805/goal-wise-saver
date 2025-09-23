import { SavingsGoal, Expense, Budget, Badge, UserStreak, Challenge, SavingActivity, Tip, MonthlyIncome, AIAdvice } from '@/types/financial';

const STORAGE_KEYS = {
  SAVINGS_GOALS: 'smartsaver-goals',
  EXPENSES: 'smartsaver-expenses',
  BUDGETS: 'smartsaver-budgets',
  BADGES: 'smartsaver-badges',
  STREAKS: 'smartsaver-streaks',
  CHALLENGES: 'smartsaver-challenges',
  SAVING_ACTIVITIES: 'smartsaver-activities',
  TIPS: 'smartsaver-tips',
  INCOME: 'smartsaver-income',
  AI_ADVICE: 'smartsaver-ai-advice'
};

// Savings Goals Storage
export const savingsGoalsStorage = {
  get: (): SavingsGoal[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS);
    return stored ? JSON.parse(stored) : [];
  },
  
  set: (goals: SavingsGoal[]): void => {
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(goals));
  },
  
  add: (goal: SavingsGoal): void => {
    const goals = savingsGoalsStorage.get();
    goals.push(goal);
    savingsGoalsStorage.set(goals);
  },
  
  update: (id: string, updates: Partial<SavingsGoal>): void => {
    const goals = savingsGoalsStorage.get();
    const index = goals.findIndex(g => g.id === id);
    if (index !== -1) {
      goals[index] = { ...goals[index], ...updates };
      savingsGoalsStorage.set(goals);
    }
  },
  
  delete: (id: string): void => {
    const goals = savingsGoalsStorage.get().filter(g => g.id !== id);
    savingsGoalsStorage.set(goals);
  }
};

// Expenses Storage
export const expensesStorage = {
  get: (): Expense[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return stored ? JSON.parse(stored) : [];
  },
  
  set: (expenses: Expense[]): void => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  },
  
  add: (expense: Expense): void => {
    const expenses = expensesStorage.get();
    expenses.unshift(expense); // Add to beginning for latest first
    expensesStorage.set(expenses);
  },
  
  delete: (id: string): void => {
    const expenses = expensesStorage.get().filter(e => e.id !== id);
    expensesStorage.set(expenses);
  }
};

// Budgets Storage
export const budgetsStorage = {
  get: (): Budget[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return stored ? JSON.parse(stored) : [];
  },
  
  set: (budgets: Budget[]): void => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  },
  
  add: (budget: Budget): void => {
    const budgets = budgetsStorage.get();
    budgets.push(budget);
    budgetsStorage.set(budgets);
  },
  
  update: (id: string, updates: Partial<Budget>): void => {
    const budgets = budgetsStorage.get();
    const index = budgets.findIndex(b => b.id === id);
    if (index !== -1) {
      budgets[index] = { ...budgets[index], ...updates };
      budgetsStorage.set(budgets);
    }
  }
};

// Data Export/Import
export const dataStorage = {
  exportData: () => {
    const data = {
      savingsGoals: savingsGoalsStorage.get(),
      expenses: expensesStorage.get(),
      budgets: budgetsStorage.get(),
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartsaver-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
  
  importData: (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          
          if (data.savingsGoals) savingsGoalsStorage.set(data.savingsGoals);
          if (data.expenses) expensesStorage.set(data.expenses);
          if (data.budgets) budgetsStorage.set(data.budgets);
          if (data.badges) badgesStorage.set(data.badges);
          if (data.streaks) streaksStorage.set(data.streaks);
          if (data.challenges) challengesStorage.set(data.challenges);
          if (data.savingActivities) savingActivitiesStorage.set(data.savingActivities);
          
          resolve();
        } catch (error) {
          reject(new Error('Invalid backup file format'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
};

// Badges Storage
export const badgesStorage = {
  get: (): Badge[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.BADGES);
    return stored ? JSON.parse(stored) : [];
  },
  
  set: (badges: Badge[]): void => {
    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
  },
  
  add: (badge: Badge): void => {
    const badges = badgesStorage.get();
    if (!badges.find(b => b.id === badge.id)) {
      badges.push(badge);
      badgesStorage.set(badges);
    }
  },
  
  getByCategory: (category: Badge['category']): Badge[] => {
    return badgesStorage.get().filter(b => b.category === category);
  }
};

// Streaks Storage
export const streaksStorage = {
  get: (): UserStreak => {
    const stored = localStorage.getItem(STORAGE_KEYS.STREAKS);
    return stored ? JSON.parse(stored) : {
      userId: 'default',
      currentStreak: 0,
      longestStreak: 0,
      lastSavingDay: '',
      streakHistory: []
    };
  },
  
  set: (streak: UserStreak): void => {
    localStorage.setItem(STORAGE_KEYS.STREAKS, JSON.stringify(streak));
  },
  
  update: (updates: Partial<UserStreak>): void => {
    const streak = streaksStorage.get();
    streaksStorage.set({ ...streak, ...updates });
  }
};

// Challenges Storage
export const challengesStorage = {
  get: (): Challenge[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
    return stored ? JSON.parse(stored) : [];
  },
  
  set: (challenges: Challenge[]): void => {
    localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));
  },
  
  add: (challenge: Challenge): void => {
    const challenges = challengesStorage.get();
    challenges.push(challenge);
    challengesStorage.set(challenges);
  },
  
  update: (id: string, updates: Partial<Challenge>): void => {
    const challenges = challengesStorage.get();
    const index = challenges.findIndex(c => c.id === id);
    if (index !== -1) {
      challenges[index] = { ...challenges[index], ...updates };
      challengesStorage.set(challenges);
    }
  },
  
  getActive: (): Challenge[] => {
    return challengesStorage.get().filter(c => c.status === 'active');
  }
};

// Saving Activities Storage
export const savingActivitiesStorage = {
  get: (): SavingActivity[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.SAVING_ACTIVITIES);
    return stored ? JSON.parse(stored) : [];
  },
  
  set: (activities: SavingActivity[]): void => {
    localStorage.setItem(STORAGE_KEYS.SAVING_ACTIVITIES, JSON.stringify(activities));
  },
  
  add: (activity: SavingActivity): void => {
    const activities = savingActivitiesStorage.get();
    activities.unshift(activity);
    savingActivitiesStorage.set(activities);
  },
  
  getByDateRange: (startDate: string, endDate: string): SavingActivity[] => {
    return savingActivitiesStorage.get().filter(a => 
      a.date >= startDate && a.date <= endDate
    );
  }
};

// Tips storage
export const tipsStorage = {
  get(): Tip[] {
    const stored = localStorage.getItem(STORAGE_KEYS.TIPS);
    return stored ? JSON.parse(stored) : [];
  },
  
  set(tips: Tip[]): void {
    localStorage.setItem(STORAGE_KEYS.TIPS, JSON.stringify(tips));
  },
  
  update(tips: Tip[]): void {
    this.set(tips);
  }
};

// Income storage
export const incomeStorage = {
  get(): MonthlyIncome[] {
    const stored = localStorage.getItem(STORAGE_KEYS.INCOME);
    return stored ? JSON.parse(stored) : [];
  },

  set(income: MonthlyIncome[]): void {
    localStorage.setItem(STORAGE_KEYS.INCOME, JSON.stringify(income));
  },

  add(income: MonthlyIncome): void {
    const current = this.get();
    current.push(income);
    this.set(current);
  },

  update(id: string, updates: Partial<MonthlyIncome>): void {
    const current = this.get();
    const index = current.findIndex(i => i.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...updates };
      this.set(current);
    }
  },

  delete(id: string): void {
    const current = this.get();
    const filtered = current.filter(i => i.id !== id);
    this.set(filtered);
  },

  getCurrentMonthIncome(): number {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const current = this.get();
    return current
      .filter(i => i.month === currentMonth)
      .reduce((sum, i) => sum + i.amount, 0);
  }
};

// AI Advice storage
export const aiAdviceStorage = {
  get(): AIAdvice[] {
    const stored = localStorage.getItem(STORAGE_KEYS.AI_ADVICE);
    return stored ? JSON.parse(stored) : [];
  },

  set(advice: AIAdvice[]): void {
    localStorage.setItem(STORAGE_KEYS.AI_ADVICE, JSON.stringify(advice));
  },

  add(advice: AIAdvice): void {
    const current = this.get();
    current.unshift(advice); // Add to beginning
    // Keep only latest 10 pieces of advice
    if (current.length > 10) {
      current.splice(10);
    }
    this.set(current);
  },

  clear(): void {
    this.set([]);
  },

  getLatest(limit = 3): AIAdvice[] {
    return this.get().slice(0, limit);
  }
};