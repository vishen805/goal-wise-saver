import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { calculateFutureValue, generateRecommendation } from '@/services/projectionService';
import { t } from '@/lib/i18n';
import { formatCurrency, formatDate } from '@/lib/categories';

export default function ProjectionPanel() {
  const [principal, setPrincipal] = useState<number>(500000);
  const [monthly, setMonthly] = useState<number>(20000);
  const [rate, setRate] = useState<number>(0.05);
  const [years, setYears] = useState<number>(5);
  const [goalAmount, setGoalAmount] = useState<number | undefined>(undefined);
  const [savingsRate, setSavingsRate] = useState<number | undefined>(undefined);
  const [emergencyMonths, setEmergencyMonths] = useState<number | undefined>(undefined);
  const [monthlyLiving, setMonthlyLiving] = useState<number | undefined>(undefined);

  const [result, setResult] = useState<any>(null);

  const runProjection = () => {
    const res = calculateFutureValue({ currentPrincipal: principal, monthlyContribution: monthly, annualRate: rate, years });
    const recommendation = generateRecommendation(res.futureValue, goalAmount ?? 0, savingsRate, emergencyMonths, monthlyLiving);
    setResult({ ...res, recommendation });
  };

  return (
    <Card className="p-4 mb-4">
      <h3 className="text-lg font-semibold mb-2">{t('projection_title')}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{t('principal')}</Label>
          <Input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} />
        </div>
        <div>
          <Label>{t('monthly')}</Label>
          <Input type="number" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} />
        </div>
        <div>
          <Label>{t('rate')}</Label>
          <Input type="number" step="0.001" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
        </div>
        <div>
          <Label>{t('years')}</Label>
          <Input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} />
        </div>
        <div>
          <Label>{t('goal_amount')}</Label>
          <Input type="number" value={goalAmount ?? ''} onChange={(e) => setGoalAmount(e.target.value ? Number(e.target.value) : undefined)} />
        </div>
        <div>
          <Label>{t('savings_rate')}</Label>
          <Input type="number" step="0.01" value={savingsRate ?? ''} onChange={(e) => setSavingsRate(e.target.value ? Number(e.target.value) : undefined)} />
        </div>
        <div>
          <Label>{t('emergency_months')}</Label>
          <Input type="number" value={emergencyMonths ?? ''} onChange={(e) => setEmergencyMonths(e.target.value ? Number(e.target.value) : undefined)} />
        </div>
        <div>
          <Label>{t('monthly_living')}</Label>
          <Input type="number" value={monthlyLiving ?? ''} onChange={(e) => setMonthlyLiving(e.target.value ? Number(e.target.value) : undefined)} />
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button onClick={runProjection}>{t('run')}</Button>
      </div>

      {result && (
        <div className="mt-4">
          <div className="text-sm text-muted-foreground">{t('formula')}：{result.formula}</div>
          <div className="mt-2">
            <div className="text-lg font-bold">{t('estimated_future_value')}：{formatCurrency(result.futureValue)}</div>
              <div className="text-sm mt-1">{t('generated_at')}：{formatDate(result.generatedAt || new Date().toISOString())}</div>
            <div className="mt-2 text-sm">{t('recommendation')}：{result.recommendation}</div>
          </div>
        </div>
      )}
    </Card>
  );
}
