import { SavingsGoal, Expense, Budget } from '@/types/financial';

const STORAGE_KEYS = {
  SAVINGS_GOALS: 'smartsaver_savings_goals',
  EXPENSES: 'smartsaver_expenses', 
  BUDGETS: 'smartsaver_budgets',
  SETTINGS: 'smartsaver_settings',
} as const;

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