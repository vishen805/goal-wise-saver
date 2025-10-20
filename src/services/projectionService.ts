import { format } from 'date-fns';
import { t } from '@/lib/i18n';

export interface ProjectionParams {
  currentPrincipal: number; // 目前本金
  monthlyContribution: number; // 每月投入
  annualRate: number; // 年化報酬率（0.05 = 5%）
  years: number; // 投資年限（年）
}

export interface ProjectionResult {
  futureValue: number;
  achievementPercent?: number; // 若提供 goalAmount
  formula?: string; // 可顯示的 FV 公式字串
  generatedAt: string;
}

/**
 * 計算以每月複利與每月定期投入的未來值
 * FV = PMT * ((1+r)^n -1)/r + PV*(1+r)^n
 * 其中 r = monthly rate, n = months, PMT 為月投入（假設在期初或期末可調整 sign），
 * 為保持簡單，我們採用期末投入（Excel 的 FV 函數 behaviour when type=0）。
 */
export const calculateFutureValue = ({ currentPrincipal, monthlyContribution, annualRate, years }: ProjectionParams): ProjectionResult => {
  const monthlyRate = annualRate / 12;
  const months = Math.max(0, Math.round(years * 12));

  // Handle edge cases
  if (months === 0) {
    return {
      futureValue: Math.round((currentPrincipal) * 100) / 100,
      generatedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX"),
      formula: `=FV(${(annualRate * 100).toFixed(2)}%/12, ${months}, -${monthlyContribution}, -${currentPrincipal}, 0)`
    };
  }

  let fvOfContributions = 0;
  if (monthlyRate === 0) {
    fvOfContributions = monthlyContribution * months;
  } else {
    fvOfContributions = monthlyContribution * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
  }

  const fvOfPrincipal = currentPrincipal * Math.pow(1 + monthlyRate, months);
  const futureValue = Math.round((fvOfContributions + fvOfPrincipal) * 100) / 100;

  const formula = `=FV(${(annualRate * 100).toFixed(2)}%/12, ${months}, -${monthlyContribution}, -${currentPrincipal}, 0)`;

  return {
    futureValue,
    formula,
    generatedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX"),
  };
};

/**
 * 根據目標金額與結果生成建議文字（類似 IF）
 */
export const generateRecommendation = (futureValue: number, goalAmount: number, savingsRatePercent?: number, emergencyFundMonths?: number, monthlyLivingExpense?: number): string => {
  const parts: string[] = [];

  const percent = goalAmount > 0 ? Math.round((futureValue / goalAmount) * 100) : 0;
  const overview = t('rec_overview').replace('{value}', futureValue.toLocaleString()).replace('{percent}', `${percent}%`);
  parts.push(overview);

  if (savingsRatePercent !== undefined) {
    if (savingsRatePercent < 0.2) parts.push(t('rec_savings_low'));
    else parts.push(t('rec_savings_ok'));
  }

  if (emergencyFundMonths !== undefined && monthlyLivingExpense !== undefined) {
    if (emergencyFundMonths < 6) parts.push(t('rec_emergency_low'));
    else parts.push(t('rec_emergency_ok'));
  }

  return parts.join(' ');
};

export default { calculateFutureValue, generateRecommendation };
