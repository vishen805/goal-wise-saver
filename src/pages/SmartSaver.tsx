import { useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import DashboardScreen from '@/components/dashboard/DashboardScreen';
import GoalsScreen from '@/components/goals/GoalsScreen';
import ExpensesScreen from '@/components/expenses/ExpensesScreen';
import BudgetScreen from '@/components/budget/BudgetScreen';
import SettingsScreen from '@/components/settings/SettingsScreen';

export default function SmartSaver() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  const renderScreen = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardScreen onNavigate={setCurrentTab} />;
      case 'goals':
        return <GoalsScreen />;
      case 'expenses':
        return <ExpensesScreen />;
      case 'budget':
        return <BudgetScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen onNavigate={setCurrentTab} />;
    }
  };

  return (
    <MobileLayout currentTab={currentTab} onTabChange={setCurrentTab}>
      {renderScreen()}
    </MobileLayout>
  );
}