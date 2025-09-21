import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { SavingActivity, SavingsGoal } from '@/types/financial';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface SavingsLineChartProps {
  /** Array of saving activities */
  savingActivities: SavingActivity[];
  /** Array of savings goals for target tracking */
  savingsGoals?: SavingsGoal[];
  /** Chart display mode */
  mode?: 'daily' | 'monthly' | 'cumulative';
  /** Optional title for the chart */
  title?: string;
  /** Height of the chart container */
  height?: number;
  /** Time period to display (in days from today) */
  periodDays?: number;
}

interface ChartDataPoint {
  date: string;
  displayDate: string;
  savings: number;
  cumulative: number;
  target?: number;
}

/**
 * Transforms saving activities into chart data
 * @param activities - Array of saving activities
 * @param mode - Chart display mode
 * @param periodDays - Number of days to include
 * @returns Transformed data for chart
 */
const transformSavingsData = (
  activities: SavingActivity[],
  mode: 'daily' | 'monthly' | 'cumulative',
  periodDays: number
): ChartDataPoint[] => {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - periodDays);

  if (mode === 'monthly') {
    return transformMonthlyData(activities, startDate, endDate);
  }

  return transformDailyData(activities, startDate, endDate, mode === 'cumulative');
};

/**
 * Transforms activities into daily data points
 */
const transformDailyData = (
  activities: SavingActivity[],
  startDate: Date,
  endDate: Date,
  cumulative: boolean
): ChartDataPoint[] => {
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  let runningTotal = 0;

  return dateRange.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayActivities = activities.filter(a => a.date === dateStr);
    const daySavings = dayActivities.reduce((sum, a) => sum + Math.max(0, a.netSavings), 0);
    
    if (cumulative) {
      runningTotal += daySavings;
    }

    return {
      date: dateStr,
      displayDate: format(date, 'MMM dd'),
      savings: daySavings,
      cumulative: cumulative ? runningTotal : daySavings
    };
  });
};

/**
 * Transforms activities into monthly data points
 */
const transformMonthlyData = (
  activities: SavingActivity[],
  startDate: Date,
  endDate: Date
): ChartDataPoint[] => {
  const monthlyData: Record<string, number> = {};
  
  activities.forEach(activity => {
    const month = activity.date.substring(0, 7); // YYYY-MM
    if (activity.date >= format(startDate, 'yyyy-MM-dd') && 
        activity.date <= format(endDate, 'yyyy-MM-dd')) {
      monthlyData[month] = (monthlyData[month] || 0) + Math.max(0, activity.netSavings);
    }
  });

  return Object.entries(monthlyData)
    .map(([month, savings]) => ({
      date: month,
      displayDate: format(parseISO(month + '-01'), 'MMM yyyy'),
      savings,
      cumulative: savings
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Custom tooltip component for the line chart
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
        <p className="font-semibold text-card-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: ${entry.value.toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * SavingsLineChart component displays savings progress over time
 * 
 * Features:
 * - Multiple display modes (daily, monthly, cumulative)
 * - Responsive design
 * - Custom tooltips
 * - Target line overlay (optional)
 * - Smooth animations
 */
export const SavingsLineChart: React.FC<SavingsLineChartProps> = ({
  savingActivities,
  savingsGoals = [],
  mode = 'cumulative',
  title = "Savings Progress",
  height = 300,
  periodDays = 30
}) => {
  const chartData = transformSavingsData(savingActivities, mode, periodDays);
  
  // Calculate target line if goals are provided
  const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const dataWithTarget = totalTarget > 0 ? chartData.map(point => ({
    ...point,
    target: totalTarget
  })) : chartData;

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <p>No savings data available</p>
            <p className="text-sm">Start saving money to see your progress</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...chartData.map(d => d.cumulative));
  const chartTitle = `${title} (${mode === 'daily' ? 'Daily' : mode === 'monthly' ? 'Monthly' : 'Cumulative'})`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {chartTitle}
          <span className="text-sm font-normal text-muted-foreground">
            {mode === 'cumulative' ? `Total: $${maxValue.toFixed(2)}` : `Max: $${maxValue.toFixed(2)}`}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={dataWithTarget}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="displayDate" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Savings area */}
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.1}
              strokeWidth={2}
              name="Savings"
            />
            
            {/* Target line if available */}
            {totalTarget > 0 && (
              <Line
                type="monotone"
                dataKey="target"
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="5 5"
                strokeWidth={1}
                dot={false}
                name="Target"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Period</p>
            <p className="font-semibold">{periodDays} days</p>
          </div>
          <div>
            <p className="text-muted-foreground">Average Daily</p>
            <p className="font-semibold">
              ${(maxValue / periodDays).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Data Points</p>
            <p className="font-semibold">{chartData.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};