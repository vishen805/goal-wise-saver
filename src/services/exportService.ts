import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { Expense, SavingsGoal, Budget } from '@/types/financial';

/**
 * Exports transactions to CSV format
 * @param transactions - Array of expenses to export
 * @param filename - Optional filename (defaults to current date)
 */
export const exportTransactionsCSV = (
  transactions: Expense[],
  filename?: string
): void => {
  const csvFilename = filename || `smartsaver-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  
  // Prepare CSV headers
  const headers = ['Date', 'Amount', 'Category', 'Description'];
  
  // Prepare CSV data
  const csvData = transactions.map(transaction => [
    transaction.date,
    transaction.amount.toString(),
    transaction.category,
    transaction.description
  ]);
  
  // Combine headers and data
  const csvContent = [headers, ...csvData]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', csvFilename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Exports data to Excel format using XLSX
 * @param expenses - Array of expenses
 * @param savingsGoals - Array of savings goals
 * @param budgets - Array of budgets
 * @param filename - Optional filename
 */
export const exportToExcel = (
  expenses: Expense[],
  savingsGoals: SavingsGoal[],
  budgets: Budget[],
  filename?: string
): void => {
  const excelFilename = filename || `smartsaver-data-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  
  // Expenses worksheet
  const expensesData = expenses.map(expense => ({
    Date: expense.date,
    Amount: expense.amount,
    Category: expense.category,
    Description: expense.description,
    'Created At': expense.createdAt
  }));
  const expensesSheet = XLSX.utils.json_to_sheet(expensesData);
  XLSX.utils.book_append_sheet(workbook, expensesSheet, 'Expenses');
  
  // Savings Goals worksheet
  const goalsData = savingsGoals.map(goal => ({
    Name: goal.name,
    'Target Amount': goal.targetAmount,
    'Current Amount': goal.currentAmount,
    'Progress (%)': ((goal.currentAmount / goal.targetAmount) * 100).toFixed(2),
    Deadline: goal.deadline,
    Category: goal.category,
    'Created At': goal.createdAt
  }));
  const goalsSheet = XLSX.utils.json_to_sheet(goalsData);
  XLSX.utils.book_append_sheet(workbook, goalsSheet, 'Savings Goals');
  
  // Budgets worksheet
  const budgetsData = budgets.map(budget => ({
    Category: budget.category,
    'Monthly Limit': budget.monthlyLimit,
    'Current Spent': budget.currentSpent,
    'Remaining': budget.monthlyLimit - budget.currentSpent,
    'Usage (%)': ((budget.currentSpent / budget.monthlyLimit) * 100).toFixed(2),
    Month: budget.month
  }));
  const budgetsSheet = XLSX.utils.json_to_sheet(budgetsData);
  XLSX.utils.book_append_sheet(workbook, budgetsSheet, 'Budgets');
  
  // Summary worksheet
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalSavings = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.monthlyLimit, 0);
  
  const summaryData = [
    { Metric: 'Total Expenses', Value: totalExpenses },
    { Metric: 'Total Savings', Value: totalSavings },
    { Metric: 'Monthly Budget', Value: totalBudget },
    { Metric: 'Number of Goals', Value: savingsGoals.length },
    { Metric: 'Number of Expenses', Value: expenses.length },
    { Metric: 'Export Date', Value: format(new Date(), 'yyyy-MM-dd HH:mm:ss') }
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Save file
  XLSX.writeFile(workbook, excelFilename);
};

/**
 * Prepares data for Google Sheets import (CSV format with specific structure)
 * @param expenses - Array of expenses
 * @param savingsGoals - Array of savings goals
 * @param budgets - Array of budgets
 * @returns CSV string ready for Google Sheets
 */
export const prepareGoogleSheetsData = (
  expenses: Expense[],
  savingsGoals: SavingsGoal[],
  budgets: Budget[]
): string => {
  // Create comprehensive data structure
  const sheetsData = [
    // Header row
    ['Type', 'Date', 'Amount', 'Category', 'Description', 'Target Amount', 'Current Amount', 'Progress %', 'Deadline'],
    
    // Expenses data
    ...expenses.map(expense => [
      'Expense',
      expense.date,
      expense.amount,
      expense.category,
      expense.description,
      '', '', '', ''
    ]),
    
    // Savings goals data
    ...savingsGoals.map(goal => [
      'Savings Goal',
      goal.createdAt,
      '',
      goal.category,
      goal.name,
      goal.targetAmount,
      goal.currentAmount,
      ((goal.currentAmount / goal.targetAmount) * 100).toFixed(2),
      goal.deadline
    ]),
    
    // Budgets data
    ...budgets.map(budget => [
      'Budget',
      budget.month,
      budget.currentSpent,
      budget.category,
      `Monthly limit: $${budget.monthlyLimit}`,
      budget.monthlyLimit,
      budget.currentSpent,
      ((budget.currentSpent / budget.monthlyLimit) * 100).toFixed(2),
      ''
    ])
  ];
  
  // Convert to CSV
  return sheetsData
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
};

/**
 * Downloads Google Sheets compatible CSV
 * @param expenses - Array of expenses
 * @param savingsGoals - Array of savings goals
 * @param budgets - Array of budgets
 * @param filename - Optional filename
 */
export const exportForGoogleSheets = (
  expenses: Expense[],
  savingsGoals: SavingsGoal[],
  budgets: Budget[],
  filename?: string
): void => {
  const csvFilename = filename || `smartsaver-googlesheets-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  const csvContent = prepareGoogleSheetsData(expenses, savingsGoals, budgets);
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', csvFilename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Generates Google Sheets import instructions
 * @returns Instructions string
 */
export const getGoogleSheetsInstructions = (): string => {
  return `
Instructions for importing to Google Sheets:

1. Download the CSV file using the "Export for Google Sheets" button
2. Open Google Sheets (sheets.google.com)
3. Create a new spreadsheet or open an existing one
4. Go to File > Import
5. Choose "Upload" tab and select your downloaded CSV file
6. In import settings:
   - Separator type: Comma
   - Convert text to numbers: Yes
   - Convert dates and times: Yes
7. Click "Import data"

Your SmartSaver data will be organized with:
- Column A: Data type (Expense/Savings Goal/Budget)
- Column B: Date
- Column C: Amount
- Column D: Category
- Column E: Description
- Columns F-I: Additional goal/budget specific data

You can then create charts, pivot tables, and analysis in Google Sheets!
  `;
};