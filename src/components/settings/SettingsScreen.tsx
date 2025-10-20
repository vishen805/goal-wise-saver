import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Settings, 
  Download, 
  Upload, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  Database,
  Trash2,
  AlertTriangle,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dataStorage, savingsGoalsStorage, expensesStorage, budgetsStorage } from '@/lib/storage';
import { languageStorage } from '@/lib/storage';
import { t, setLanguage } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';

interface SettingsScreenProps {
  onNavigate?: (tab: string, title?: string) => void;
}

export default function SettingsScreen({ onNavigate }: SettingsScreenProps) {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const showThemeToggle = true;

  // initialize theme on mount to respect saved preference or system preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const enabled = saved === 'dark' || (!saved && prefersDark);
      setIsDarkMode(enabled);
      if (enabled) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    } catch (e) {
      // ignore
    }
  }, []);

  const handleToggleDarkMode = (enabled: boolean) => {
    setIsDarkMode(enabled);
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', enabled ? 'dark' : 'light');
  };

  const handleExportData = () => {
    try {
      dataStorage.exportData();
      toast({
        title: "Data Exported! 📥",
        description: "Your SmartSaver data has been downloaded as a backup file.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await dataStorage.importData(file);
      toast({
        title: "Data Imported! 📤",
        description: "Your backup has been restored successfully.",
      });
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import data.",
        variant: "destructive",
      });
    }
    
    // Clear the input
    event.target.value = '';
  };

  const handleDeleteAllData = () => {
    localStorage.clear();
    toast({
      title: "All Data Deleted",
      description: "Your SmartSaver data has been permanently deleted.",
      variant: "destructive",
    });
    setIsDeleteDialogOpen(false);
    // Refresh to show empty state
    window.location.reload();
  };

  const getDataStats = () => {
    const goals = savingsGoalsStorage.get().length;
    const expenses = expensesStorage.get().length;
    const budgets = budgetsStorage.get().length;
    return { goals, expenses, budgets };
  };

  const stats = getDataStats();

  const [language, setLang] = useState<'en' | 'zh'>(() => languageStorage.get());
  const [currency, setCurrency] = useState<string>(() => {
    try { return (localStorage.getItem('smartsaver-currency') || 'USD'); } catch { return 'USD'; }
  });

  const handleLanguageChange = (lang: 'en' | 'zh') => {
    setLang(lang);
    languageStorage.set(lang);
    setLanguage(lang);
    toast({ title: t('language_updated') || 'Language updated' });
  };

  const handleCurrencyChange = (c: string) => {
    setCurrency(c);
    try { localStorage.setItem('smartsaver-currency', c); } catch { /* ignore */ }
    toast({ title: t('Money updated') || 'Money updated' });
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold">{t('settings_title')}</h2>
        <p className="text-sm sm:text-base text-muted-foreground">{t('track_milestones')}</p>
      </div>

      {/* Appearance (temporarily hidden) */}
      {showThemeToggle && (
        <Card className="financial-card">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              Appearance
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode" className="text-sm font-medium">
                      {t('dark_mode')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('dark_mode_desc')}
                    </p>
              </div>
              <Switch
                id="dark-mode"
                checked={isDarkMode}
                onCheckedChange={handleToggleDarkMode}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Notifications */}
      {/* Language */}
      <Card className="financial-card">
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t('settings_language')}
          </h3>

          <div className="flex items-center gap-4">
            <Button variant={language === 'en' ? 'financial' : 'ghost'} onClick={() => handleLanguageChange('en')}>
              {t('language_en')}
            </Button>
            <Button variant={language === 'zh' ? 'financial' : 'ghost'} onClick={() => handleLanguageChange('zh')}>
              {t('language_zh')}
            </Button>
          </div>
        </div>
      </Card>
      <Card className="financial-card">
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t('Money Type')}
          </h3>

          <div className="flex items-center gap-4">
            <Button variant={currency === 'USD' ? 'financial' : 'ghost'} onClick={() => handleCurrencyChange('USD')}>USD</Button>
            <Button variant={currency === 'TWD' ? 'financial' : 'ghost'} onClick={() => handleCurrencyChange('TWD')}>TWD</Button>
            <Button variant={currency === 'EUR' ? 'financial' : 'ghost'} onClick={() => handleCurrencyChange('EUR')}>EUR</Button>
            <Button variant={currency === 'JPY' ? 'financial' : 'ghost'} onClick={() => handleCurrencyChange('JPY')}>JPY</Button>
          </div>
        </div>
      </Card>
      <Card className="financial-card">
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
                <Label htmlFor="notifications" className="text-sm font-medium">
                  {t('notifications_title')}
                </Label>
                <p className="text-sm text-muted-foreground">
                {t('notifications_desc')}
                </p>
            </div>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
          
          {notificationsEnabled && (
            <div className="pl-4 border-l-2 border-primary/20">
              <p className="text-sm text-muted-foreground">
                💡 Tip: Enable browser notifications to get spending reminders and goal celebrations!
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Data Management */}
      <Card className="financial-card">
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Database className="w-5 h-5" />
            {t('data_management')}
          </h3>
          
          {/* Data Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.goals}</p>
              <p className="text-xs text-muted-foreground">{t('savings_goals')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">{stats.expenses}</p>
              <p className="text-xs text-muted-foreground">Expenses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{stats.budgets}</p>
              <p className="text-xs text-muted-foreground">Budgets</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              variant="success" 
              className="w-full justify-start" 
              onClick={handleExportData}
            >
              <Download className="w-4 h-4 mr-2" />
              {t('export_backup')}
            </Button>
            
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="import-file"
              />
              <Button 
                variant="outline" 
                className="w-full justify-start"
                asChild
              >
                  <label htmlFor="import-file" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  {t('import_backup')}
                </label>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Privacy & Security */}
      <Card className="financial-card">
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Security
          </h3>
          
          <div className="space-y-3">
            <div className="p-4 bg-success/10 rounded-lg border border-success/20">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-medium text-success">Your Data is Safe</h4>
                  <p className="text-sm text-muted-foreground">
                    All your financial data is stored locally on your device. 
                    We never collect or share your personal information.
                  </p>
                </div>
              </div>
            </div>
            
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('delete_all_data')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    {t('delete_confirm_title')}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    {t('delete_confirm_body')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Consider exporting your data first as a backup.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setIsDeleteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={handleDeleteAllData}
                    >
                      Delete Everything
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Card>

      {/* Help & Support */}
      <Card className="financial-card">
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Help & Support
          </h3>
          
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/how-to-use')}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              {t('help_support')}
            </Button>
            
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground">
                💡 New to Smart Saver? Check out our complete guide to get started with tracking expenses, setting goals, and building better financial habits.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card className="financial-card">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-white">
            💰
          </div>
          <h3 className="font-semibold text-lg mb-2">{t('app_title')}</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {t('built_with')}
          </p>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{t('version_label')} 1.0.0</p>
            <p className="text-xs text-muted-foreground">
              Built with ❤️ for better financial habits
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}