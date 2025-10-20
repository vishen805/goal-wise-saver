import { calculateFutureValue, generateRecommendation } from '@/services/projectionService';
import { languageStorage } from '@/lib/storage';

describe('projectionService', () => {
  test('example: 500000 principal, 20000/month, 5% annual, 5 years ≈ 2,048,000', () => {
    const res = calculateFutureValue({ currentPrincipal: 500000, monthlyContribution: 20000, annualRate: 0.05, years: 5 });
    // Allow small tolerance due to rounding
    expect(res.futureValue).toBeGreaterThan(2000000);
    expect(res.futureValue).toBeLessThan(2100000);
  });

  test('edge case: 0 years should return principal only', () => {
    const res = calculateFutureValue({ currentPrincipal: 100000, monthlyContribution: 1000, annualRate: 0.05, years: 0 });
    expect(res.futureValue).toBe(100000);
  });

  test('generateRecommendation includes warnings for low savings rate', () => {
    // ensure language set to Chinese
    languageStorage.set('zh');
    const msg = generateRecommendation(50000, 200000, 0.1, 3, 20000);
    expect(msg).toContain('儲蓄率偏低');
    expect(msg).toContain('建議優先補足緊急備用金');
  });
});
