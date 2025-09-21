// Example unit tests for the new services
import { getCurrentStreak, getLongestStreak, recordSavingActivity } from '../services/streakService';
import { createChallenge, evaluateChallenges } from '../services/challengeService';
import { generateTips } from '../services/tipsService';
import { exportTransactionsCSV } from '../services/exportService';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('Streak Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should calculate current streak correctly', () => {
    // Record saving activities for consecutive days
    recordSavingActivity(50, false);
    expect(getCurrentStreak()).toBe(1);
    
    recordSavingActivity(25, false);
    expect(getCurrentStreak()).toBe(2);
  });

  test('should track longest streak', () => {
    recordSavingActivity(100, false);
    recordSavingActivity(50, false);
    expect(getLongestStreak()).toBe(2);
  });
});

describe('Challenge Service', () => {
  test('should create challenge with correct properties', () => {
    const challenge = createChallenge({
      name: 'Test Challenge',
      description: 'Test Description',
      type: 'save-amount',
      targetAmount: 100,
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      status: 'active',
      progress: 0
    });

    expect(challenge.name).toBe('Test Challenge');
    expect(challenge.type).toBe('save-amount');
    expect(challenge.targetAmount).toBe(100);
    expect(challenge.id).toBeDefined();
  });

  test('should evaluate challenge progress', () => {
    const challenges = evaluateChallenges();
    expect(Array.isArray(challenges)).toBe(true);
  });
});

describe('Tips Service', () => {
  test('should generate tips based on spending', async () => {
    const tips = await generateTips();
    expect(Array.isArray(tips)).toBe(true);
    expect(tips.length).toBeLessThanOrEqual(5);
  });
});

describe('Export Service', () => {
  test('should format CSV export correctly', () => {
    const mockExpenses = [
      { id: '1', amount: 50, category: 'food', description: 'Lunch', date: '2024-01-01', createdAt: '2024-01-01' }
    ];
    
    // Mock DOM methods
    const mockLink = { setAttribute: jest.fn(), click: jest.fn(), style: {} };
    document.createElement = jest.fn(() => mockLink as any);
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    URL.createObjectURL = jest.fn(() => 'mock-url');
    URL.revokeObjectURL = jest.fn();

    exportTransactionsCSV(mockExpenses as any);
    expect(document.createElement).toHaveBeenCalledWith('a');
  });
});