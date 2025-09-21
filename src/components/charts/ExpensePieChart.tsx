import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Expense, ExpenseCategory } from '@/types/financial';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCategoryIcon } from '@/lib/categories';

interface ExpensePieChartProps {
  /** Array of expenses to analyze */
  expenses: Expense[];
  /** Optional title for the chart */
  title?: string;
  /** Height of the chart container */
  height?: number;
}

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  icon: string;
}

/**
 * Transforms expense data for pie chart display
 * @param expenses - Array of expenses
 * @returns Transformed data for chart
 */
const transformExpenseData = (expenses: Expense[]): ChartDataItem[] => {
  const categoryTotals: Record<ExpenseCategory, number> = {
    food: 0,
    transport: 0,
    entertainment: 0,
    shopping: 0,
    bills: 0,
    healthcare: 0,
    education: 0,
    other: 0
  };

  // Calculate totals for each category
  expenses.forEach(expense => {
    categoryTotals[expense.category] += expense.amount;
  });

  // Transform to chart data format
  return Object.entries(categoryTotals)
    .filter(([_, amount]) => amount > 0) // Only include categories with spending
    .map(([category, amount]) => {
      const categoryInfo = getCategoryIcon(category as ExpenseCategory);
      return {
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: amount,
        color: categoryInfo.color,
        icon: categoryInfo.icon
      };
    })
    .sort((a, b) => b.value - a.value); // Sort by amount descending
};

/**
 * Custom tooltip component for the pie chart
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
        <p className="font-semibold text-card-foreground">
          {data.icon} {data.name}
        </p>
        <p className="text-primary">
          Amount: ${data.value.toFixed(2)}
        </p>
        <p className="text-muted-foreground text-sm">
          {((data.value / payload[0].payload.total) * 100).toFixed(1)}% of total
        </p>
      </div>
    );
  }
  return null;
};

/**
 * ExpensePieChart component displays expense distribution by category
 * 
 * Features:
 * - Interactive pie chart with hover effects
 * - Category icons and colors
 * - Responsive design
 * - Custom tooltips with percentages
 * - Legend with icons
 */
export const ExpensePieChart: React.FC<ExpensePieChartProps> = ({
  expenses,
  title = "Expense Categories",
  height = 300
}) => {
  const chartData = transformExpenseData(expenses);
  const totalAmount = chartData.reduce((sum, item) => sum + item.value, 0);

  // Add total to each data item for tooltip calculation
  const dataWithTotal = chartData.map(item => ({
    ...item,
    total: totalAmount
  }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <p>No expense data available</p>
            <p className="text-sm">Start logging expenses to see your spending breakdown</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <span className="text-sm font-normal text-muted-foreground">
            Total: ${totalAmount.toFixed(2)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={dataWithTotal}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {dataWithTotal.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value, entry: any) => 
                <span className="text-sm">{entry.payload.icon} {value}</span>
              }
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Summary stats below chart */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Categories</p>
            <p className="font-semibold">{chartData.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Largest Category</p>
            <p className="font-semibold">
              {chartData[0]?.icon} {chartData[0]?.name}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};