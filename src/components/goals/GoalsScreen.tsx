import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Target, Calendar, DollarSign, Trash2, Edit } from 'lucide-react';
import { savingsGoalsStorage } from '@/lib/storage';
import { formatCurrency, formatDate, getCategoryIcon, getProgressColor } from '@/lib/categories';
import { SavingsGoal } from '@/types/financial';
import { useToast } from '@/hooks/use-toast';
import { t } from '@/lib/i18n';
import ProjectionPanel from './ProjectionPanel';

interface GoalsScreenProps {
  onNavigate?: (tab: string, title?: string) => void;
}

export default function GoalsScreen({ onNavigate }: GoalsScreenProps) {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = () => {
    const savedGoals = savingsGoalsStorage.get();
    setGoals(savedGoals);
  };

  const handleAddGoal = (formData: FormData) => {
    const newGoal: SavingsGoal = {
      id: crypto.randomUUID(),
      name: formData.get('name') as string,
      targetAmount: parseFloat(formData.get('targetAmount') as string),
      currentAmount: parseFloat(formData.get('currentAmount') as string) || 0,
      deadline: formData.get('deadline') as string,
      category: formData.get('category') as SavingsGoal['category'],
      createdAt: new Date().toISOString(),
    };

    savingsGoalsStorage.add(newGoal);
    setGoals(prev => [...prev, newGoal]);
    setIsAddDialogOpen(false);
    
    toast({
      title: t('goal_created_title') || 'Goal Created! 🎯',
      description: `"${newGoal.name}" ${t('goal_created_desc') || 'has been added to your savings goals.'}`,
    });
  };

  const handleUpdateProgress = (goalId: string, amount: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newAmount = goal.currentAmount + amount;
    if (newAmount < 0) return;

    savingsGoalsStorage.update(goalId, { currentAmount: newAmount });
    setGoals(prev => prev.map(g => 
      g.id === goalId ? { ...g, currentAmount: newAmount } : g
    ));

    const isCompleted = newAmount >= goal.targetAmount;
    toast({
      title: isCompleted ? t('goal_completed') || 'Goal Completed! 🎉' : t('progress_updated') || 'Progress Updated! 💰',
      description: isCompleted 
        ? t('congrats_reached')?.replace('{name}', goal.name) || `Congratulations! You've reached your "${goal.name}" goal!`
        : `${t('added_amount') || 'Added'} ${formatCurrency(amount)} ${t('to_goal') || 'to'} "${goal.name}"`,
    });
  };

  const handleDeleteGoal = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    savingsGoalsStorage.delete(goalId);
    setGoals(prev => prev.filter(g => g.id !== goalId));
    
    toast({
      title: t('goal_deleted_title') || 'Goal Deleted',
      description: `"${goal.name}" ${t('has_been_removed') || 'has been removed from your goals.'}`,
      variant: "destructive",
    });
  };

  const GoalForm = ({ goal, onSubmit }: { goal?: SavingsGoal; onSubmit: (data: FormData) => void }) => (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit(new FormData(e.currentTarget));
    }} className="space-y-4">
      <div>
  <Label htmlFor="name">{t('goal_name')}</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g., Vacation Fund"
          defaultValue={goal?.name}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="category">Category</Label>
        <Select name="category" defaultValue={goal?.category}>
          <SelectTrigger>
            <SelectValue placeholder={t('select_category')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vacation">✈️ Vacation</SelectItem>
            <SelectItem value="emergency">🛡️ Emergency Fund</SelectItem>
            <SelectItem value="home">🏠 Home</SelectItem>
            <SelectItem value="car">🚗 Car</SelectItem>
            <SelectItem value="education">🎓 Education</SelectItem>
            <SelectItem value="other">💰 Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
  <Label htmlFor="targetAmount">{t('target_amount')}</Label>
        <Input
          id="targetAmount"
          name="targetAmount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          defaultValue={goal?.targetAmount}
          required
        />
      </div>
      
      <div>
  <Label htmlFor="currentAmount">{t('current_amount')}</Label>
        <Input
          id="currentAmount"
          name="currentAmount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          defaultValue={goal?.currentAmount}
        />
      </div>
      
      <div>
  <Label htmlFor="deadline">{t('target_date')}</Label>
        <Input
          id="deadline"
          name="deadline"
          type="date"
          defaultValue={goal?.deadline}
          required
        />
      </div>
      
      <Button type="submit" className="w-full" variant="goal">
        {goal ? t('update_goal') || 'Update Goal' : t('create_goal') || 'Create Goal'}
      </Button>
    </form>
  );

  return (
    <div className="p-4 space-y-6">
      <ProjectionPanel />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">{t('savings_goals')}</h2>
          <p className="text-sm sm:text-base text-muted-foreground">{t('track_milestones')}</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="goal" size="icon">
              <Plus className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('add_new_goal')}</DialogTitle>
            </DialogHeader>
            <GoalForm onSubmit={handleAddGoal} />
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <Card className="financial-card text-center py-12">
          <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('no_savings_goals')}</h3>
          <p className="text-muted-foreground mb-6">
            {t('create_first_goal')}
          </p>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="goal">{t('create_first_goal')}</Button>
            </DialogTrigger>
          </Dialog>
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const percentage = (goal.currentAmount / goal.targetAmount) * 100;
            const isCompleted = percentage >= 100;
            const categoryIcon = getCategoryIcon(goal.category);
            const daysUntilDeadline = Math.ceil(
              (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <Card key={goal.id} className="financial-card">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{categoryIcon.icon}</div>
                      <div>
                        <h3 className="font-semibold">{goal.name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDate(goal.deadline)} • {daysUntilDeadline > 0 ? `${daysUntilDeadline} ${t('days_left').replace('{n}', String(daysUntilDeadline))}` : t('overdue')}
                                  </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingGoal(goal)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{t('progress')}</span>
                      <span className={`text-sm font-semibold ${getProgressColor(percentage)}`}>
                        {percentage.toFixed(1)}%
                        {isCompleted && " ✅"}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className={`w-full h-3 ${isCompleted ? 'success-pulse' : ''}`}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formatCurrency(goal.currentAmount)}</span>
                      <span>{formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                      <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleUpdateProgress(goal.id, 50)}
                      className="flex-1"
                    >
                      <DollarSign className="w-4 h-4" />
                      {t('add_50')}
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleUpdateProgress(goal.id, 100)}
                      className="flex-1"
                    >
                      <DollarSign className="w-4 h-4" />
                      {t('add_100')}
                    </Button>
                      <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const amount = prompt(t('add_amount_prompt') || 'Enter amount to add:');
                        if (amount) handleUpdateProgress(goal.id, parseFloat(amount));
                      }}
                      className="flex-1"
                    >
                      {t('custom')}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Goal Dialog */}
      {editingGoal && (
        <Dialog open={!!editingGoal} onOpenChange={() => setEditingGoal(null)}>
          <DialogContent>
                <DialogHeader>
              <DialogTitle>{t('update_goal')}</DialogTitle>
            </DialogHeader>
            <GoalForm
              goal={editingGoal}
              onSubmit={(formData) => {
                const updates = {
                  name: formData.get('name') as string,
                  targetAmount: parseFloat(formData.get('targetAmount') as string),
                  currentAmount: parseFloat(formData.get('currentAmount') as string),
                  deadline: formData.get('deadline') as string,
                  category: formData.get('category') as SavingsGoal['category'],
                };
                
                savingsGoalsStorage.update(editingGoal.id, updates);
                setGoals(prev => prev.map(g => 
                  g.id === editingGoal.id ? { ...g, ...updates } : g
                ));
                setEditingGoal(null);
                
                toast({
                  title: t('goal_updated_title') || 'Goal Updated! ✏️',
                  description: `"${updates.name}" ${t('has_been_updated') || 'has been updated successfully.'}`,
                });
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}