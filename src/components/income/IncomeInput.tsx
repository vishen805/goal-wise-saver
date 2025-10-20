import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DollarSign, Plus, Edit2, Trash2 } from 'lucide-react';
import { MonthlyIncome } from '@/types/financial';
import { incomeStorage } from '@/lib/storage';
import { formatCurrency } from '@/lib/categories';
import { toast } from 'sonner';
import { t } from '@/lib/i18n';

interface IncomeInputProps {
  onIncomeUpdate?: () => void;
}

export function IncomeInput({ onIncomeUpdate }: IncomeInputProps) {
  const [incomes, setIncomes] = useState<MonthlyIncome[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<MonthlyIncome | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    isRecurring: true
  });

  useEffect(() => {
    loadIncomes();
  }, []);

  const loadIncomes = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const allIncomes = incomeStorage.get();
    const currentMonthIncomes = allIncomes.filter(income => 
      income.month === currentMonth || income.isRecurring
    );
    setIncomes(currentMonthIncomes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.source) {
      toast.error(t('income_fill_all_fields'));
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      toast.error(t('income_amount_gt_zero'));
      return;
    }

    const currentMonth = new Date().toISOString().slice(0, 7);

    if (editingIncome) {
      incomeStorage.update(editingIncome.id, {
        amount,
        source: formData.source,
        isRecurring: formData.isRecurring
      });
      toast.success(t('income_updated'));
    } else {
      const newIncome: MonthlyIncome = {
        id: Date.now().toString(),
        amount,
        source: formData.source,
        month: currentMonth,
        isRecurring: formData.isRecurring,
        createdAt: new Date().toISOString()
      };
      
      incomeStorage.add(newIncome);
      toast.success(t('income_added'));
    }

    resetForm();
    loadIncomes();
    onIncomeUpdate?.();
  };

  const handleEdit = (income: MonthlyIncome) => {
    setEditingIncome(income);
    setFormData({
      amount: income.amount.toString(),
      source: income.source,
      isRecurring: income.isRecurring
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    incomeStorage.delete(id);
    toast.success(t('income_deleted'));
    loadIncomes();
    onIncomeUpdate?.();
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      source: '',
      isRecurring: true
    });
    setEditingIncome(null);
    setIsDialogOpen(false);
  };

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  return (
    <Card className="financial-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          {t('monthly_income_title')}
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              {t('add_income_button')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingIncome ? t('edit_income_title') : t('add_income_title')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="source">{t('income_source_label')}</Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder={t('source_placeholder')}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="amount">{t('monthly_amount_label')}</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder={t('amount_placeholder')}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
                />
                <Label htmlFor="recurring">{t('recurring_label')}</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  {t('cancel')}
                </Button>
                <Button type="submit">
                  {editingIncome ? t('update_income_action') : t('add_income_action')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {incomes.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              {t('income_empty_hint')}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-success/10 to-primary/10 rounded-lg p-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">{t('total_monthly_income')}</p>
                <p className="text-3xl font-bold text-success">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
            </div>

            {incomes.map((income) => (
              <div key={income.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{income.source}</span>
                    {income.isRecurring && (
                      <Badge variant="outline" className="text-xs">
                        {t('recurring_badge')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg font-semibold text-success">
                    {formatCurrency(income.amount)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(income)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(income.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </Card>
  );
}