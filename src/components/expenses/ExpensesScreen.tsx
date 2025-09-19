import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, CreditCard, Calendar, Trash2, Filter } from 'lucide-react';
import { expensesStorage } from '@/lib/storage';
import { formatCurrency, formatDate, getCategoryIcon } from '@/lib/categories';
import { Expense, ExpenseCategory } from '@/types/financial';
import { useToast } from '@/hooks/use-toast';

interface ExpensesScreenProps {
  onNavigate?: (tab: string, title?: string) => void;
}

export default function ExpensesScreen({ onNavigate }: ExpensesScreenProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'all'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = () => {
    const savedExpenses = expensesStorage.get();
    setExpenses(savedExpenses);
  };

  const handleAddExpense = (formData: FormData) => {
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      amount: parseFloat(formData.get('amount') as string),
      category: formData.get('category') as ExpenseCategory,
      description: formData.get('description') as string,
      date: formData.get('date') as string,
      createdAt: new Date().toISOString(),
    };

    expensesStorage.add(newExpense);
    setExpenses(prev => [newExpense, ...prev]);
    setIsAddDialogOpen(false);
    
    toast({
      title: "Expense Logged! 💳",
      description: `${formatCurrency(newExpense.amount)} for ${newExpense.description}`,
    });
  };

  const handleDeleteExpense = (expenseId: string) => {
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) return;

    expensesStorage.delete(expenseId);
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
    
    toast({
      title: "Expense Deleted",
      description: `${expense.description} has been removed.`,
      variant: "destructive",
    });
  };

  const filteredExpenses = filterCategory === 'all' 
    ? expenses 
    : expenses.filter(e => e.category === filterCategory);

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const currentMonthExpenses = filteredExpenses.filter(e => 
    e.date.startsWith(new Date().toISOString().slice(0, 7))
  ).reduce((sum, expense) => sum + expense.amount, 0);

  const ExpenseForm = () => (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleAddExpense(new FormData(e.currentTarget));
    }} className="space-y-4">
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          placeholder="e.g., Lunch at cafe"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          required
        />
      </div>
      
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
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
          required
        />
      </div>
      
      <Button type="submit" className="w-full" variant="expense">
        Add Expense
      </Button>
    </form>
  );

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Expense Tracking</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Monitor your spending patterns</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="expense" size="icon">
              <Plus className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <ExpenseForm />
          </DialogContent>
        </Dialog>
      </div>

          {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card className="financial-card gradient-secondary text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-xs sm:text-sm">This Month</p>
              <p className="text-lg sm:text-2xl font-bold break-all">{formatCurrency(currentMonthExpenses)}</p>
            </div>
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white/80 flex-shrink-0" />
          </div>
        </Card>
        
        <Card className="financial-card gradient-accent text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-xs sm:text-sm">Total Filtered</p>
              <p className="text-lg sm:text-2xl font-bold break-all">{formatCurrency(totalExpenses)}</p>
            </div>
            <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-white/80 flex-shrink-0" />
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card className="financial-card">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value as ExpenseCategory | 'all')}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
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
      </Card>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <Card className="financial-card text-center py-12">
          <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No expenses found</h3>
          <p className="text-muted-foreground mb-6">
            {filterCategory === 'all' 
              ? "Start tracking your expenses to see where your money goes!"
              : `No expenses found in the ${filterCategory} category.`
            }
          </p>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="expense">Add Your First Expense</Button>
            </DialogTrigger>
          </Dialog>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => {
            const categoryIcon = getCategoryIcon(expense.category);
            
            return (
              <Card key={expense.id} className="financial-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-lg ${categoryIcon.color}`}>
                      {categoryIcon.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{expense.description}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {expense.category} • {formatDate(expense.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-destructive text-lg">
                      -{formatCurrency(expense.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          className="py-6"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
        <Button variant="ghost" className="py-6">
          <Calendar className="w-4 h-4 mr-2" />
          View History
        </Button>
      </div>
    </div>
  );
}