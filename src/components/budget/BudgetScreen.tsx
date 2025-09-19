import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, PieChart, AlertTriangle, CheckCircle } from 'lucide-react';
import { budgetsStorage, expensesStorage } from '@/lib/storage';
import { formatCurrency, getCategoryIcon } from '@/lib/categories';
import { Budget, ExpenseCategory } from '@/types/financial';
import { useToast } from '@/hooks/use-toast';

interface BudgetScreenProps {
  onNavigate?: (tab: string, title?: string) => void;
}

export default function BudgetScreen({ onNavigate }: BudgetScreenProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = () => {
    const savedBudgets = budgetsStorage.get();
    const expenses = expensesStorage.get();
    
    // Update current spent amounts
    const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
    
    const updatedBudgets = savedBudgets.map(budget => {
      const spent = currentMonthExpenses
        .filter(e => e.category === budget.category)
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      if (budget.currentSpent !== spent) {
        budgetsStorage.update(budget.id, { currentSpent: spent });
      }
      
      return { ...budget, currentSpent: spent };
    });
    
    setBudgets(updatedBudgets.filter(b => b.month === currentMonth));
  };

  const handleAddBudget = (formData: FormData) => {
    const category = formData.get('category') as ExpenseCategory;
    const monthlyLimit = parseFloat(formData.get('monthlyLimit') as string);
    
    // Check if budget already exists for this category and month
    const existingBudget = budgets.find(b => b.category === category);
    if (existingBudget) {
      toast({
        title: "Budget Already Exists",
        description: `You already have a budget for ${category} this month.`,
        variant: "destructive",
      });
      return;
    }

    const newBudget: Budget = {
      id: crypto.randomUUID(),
      category,
      monthlyLimit,
      currentSpent: 0,
      month: currentMonth,
    };

    budgetsStorage.add(newBudget);
    setBudgets(prev => [...prev, newBudget]);
    setIsAddDialogOpen(false);
    
    toast({
      title: "Budget Created! 💰",
      description: `${formatCurrency(monthlyLimit)} budget set for ${category}.`,
    });
  };

  const handleUpdateBudget = (budgetId: string, newLimit: number) => {
    budgetsStorage.update(budgetId, { monthlyLimit: newLimit });
    setBudgets(prev => prev.map(b => 
      b.id === budgetId ? { ...b, monthlyLimit: newLimit } : b
    ));
    
    toast({
      title: "Budget Updated! ✏️",
      description: "Your budget limit has been updated.",
    });
  };

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.monthlyLimit, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.currentSpent, 0);
  const overBudgetCount = budgets.filter(b => b.currentSpent > b.monthlyLimit).length;

  const BudgetForm = () => (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleAddBudget(new FormData(e.currentTarget));
    }} className="space-y-4">
      <div>
        <Label htmlFor="category">Category</Label>
        <Select name="category" required>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="food">🍽️ Food & Dining</SelectItem>
            <SelectItem value="transport">🚗 Transport</SelectItem>
            <SelectItem value="entertainment">🎬 Entertainment</SelectItem>
            <SelectItem value="shopping">🛍️ Shopping</SelectItem>
            <SelectItem value="bills">⚡ Bills & Utilities</SelectItem>
            <SelectItem value="healthcare">🏥 Healthcare</SelectItem>
            <SelectItem value="education">📚 Education</SelectItem>
            <SelectItem value="other">📋 Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="monthlyLimit">Monthly Budget Limit</Label>
        <Input
          id="monthlyLimit"
          name="monthlyLimit"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          required
        />
      </div>
      
      <Button type="submit" className="w-full" variant="budget">
        Create Budget
      </Button>
    </form>
  );

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Budget Management</h2>
          <p className="text-muted-foreground">Control your monthly spending</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="budget" size="icon">
              <Plus className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
            </DialogHeader>
            <BudgetForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="financial-card gradient-primary text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Total Budget</p>
              <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
            </div>
            <PieChart className="w-8 h-8 text-white/80" />
          </div>
        </Card>
        
        <Card className={`financial-card ${
          totalSpent > totalBudget ? 'bg-destructive' : 'gradient-secondary'
        } text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Total Spent</p>
              <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
            </div>
            {totalSpent > totalBudget ? (
              <AlertTriangle className="w-8 h-8 text-white/80" />
            ) : (
              <CheckCircle className="w-8 h-8 text-white/80" />
            )}
          </div>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card className="financial-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Overall Budget Progress</h3>
          <span className={`text-sm font-medium ${
            totalSpent <= totalBudget ? 'text-success' : 'text-destructive'
          }`}>
            {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}%
          </span>
        </div>
        <Progress 
          value={totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0} 
          className="w-full h-3 mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Spent: {formatCurrency(totalSpent)}</span>
          <span>Remaining: {formatCurrency(Math.max(totalBudget - totalSpent, 0))}</span>
        </div>
        {overBudgetCount > 0 && (
          <p className="text-destructive text-sm mt-2 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            {overBudgetCount} {overBudgetCount === 1 ? 'category is' : 'categories are'} over budget
          </p>
        )}
      </Card>

      {/* Budget Categories */}
      {budgets.length === 0 ? (
        <Card className="financial-card text-center py-12">
          <PieChart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No budgets set</h3>
          <p className="text-muted-foreground mb-6">
            Create your first budget to start managing your monthly spending!
          </p>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="budget">Create Your First Budget</Button>
            </DialogTrigger>
          </Dialog>
        </Card>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => {
            const percentage = (budget.currentSpent / budget.monthlyLimit) * 100;
            const isOverBudget = budget.currentSpent > budget.monthlyLimit;
            const categoryIcon = getCategoryIcon(budget.category);
            const remaining = budget.monthlyLimit - budget.currentSpent;

            return (
              <Card key={budget.id} className="financial-card">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl ${categoryIcon.color}`}>
                        {categoryIcon.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold capitalize">{budget.category}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(budget.monthlyLimit)} budget
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        isOverBudget ? 'text-destructive' : 'text-foreground'
                      }`}>
                        {formatCurrency(budget.currentSpent)}
                      </p>
                      <p className={`text-sm ${
                        isOverBudget ? 'text-destructive' : 'text-success'
                      }`}>
                        {isOverBudget ? 'Over by ' : 'Remaining: '}
                        {formatCurrency(Math.abs(remaining))}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Progress</span>
                      <span className={`text-sm font-semibold ${
                        isOverBudget ? 'text-destructive' : 
                        percentage >= 80 ? 'text-warning' : 'text-success'
                      }`}>
                        {percentage.toFixed(1)}%
                        {isOverBudget && " ⚠️"}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className="w-full h-3"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newLimit = prompt("Enter new budget limit:", budget.monthlyLimit.toString());
                        if (newLimit) handleUpdateBudget(budget.id, parseFloat(newLimit));
                      }}
                      className="flex-1"
                    >
                      Edit Budget
                    </Button>
                    {percentage >= 80 && !isOverBudget && (
                      <Button
                        variant="warning"
                        size="sm"
                        className="flex-1"
                      >
                        Almost There!
                      </Button>
                    )}
                    {isOverBudget && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                      >
                        Over Budget!
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <Button 
          variant="outline" 
          className="py-6"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Budget
        </Button>
        <Button variant="ghost" className="py-6">
          <PieChart className="w-4 h-4 mr-2" />
          View Reports
        </Button>
      </div>
    </div>
  );
}