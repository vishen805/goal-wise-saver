import { useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import DashboardScreen from '@/components/dashboard/DashboardScreen';
import GoalsScreen from '@/components/goals/GoalsScreen';
import ExpensesScreen from '@/components/expenses/ExpensesScreen';
import BudgetScreen from '@/components/budget/BudgetScreen';
import SettingsScreen from '@/components/settings/SettingsScreen';
import AIAdvisorScreen from '@/components/ai/AIAdvisorScreen';

type NavigationState = {
  tab: string;
  showBack: boolean;
  title?: string;
};

export default function SmartSaver() {
  const [navState, setNavState] = useState<NavigationState>({
    tab: 'dashboard',
    showBack: false,
    title: undefined
  });

  const handleTabChange = (tab: string) => {
    setNavState({
      tab,
      showBack: false,
      title: undefined
    });
  };

  const handleNavigateWithBack = (tab: string, title?: string) => {
    setNavState({
      tab,
      showBack: true,
      title
    });
  };

  const handleBackClick = () => {
    setNavState({
      tab: 'dashboard',
      showBack: false,
      title: undefined
    });
  };

  const renderScreen = () => {
    switch (navState.tab) {
      case 'dashboard':
        return <DashboardScreen onNavigate={handleNavigateWithBack} />;
      case 'goals':
        return <GoalsScreen onNavigate={handleNavigateWithBack} />;
      case 'expenses':
        return <ExpensesScreen onNavigate={handleNavigateWithBack} />;
      case 'budget':
        return <BudgetScreen onNavigate={handleNavigateWithBack} />;
      case 'ai-advisor':
        return <AIAdvisorScreen onNavigate={handleNavigateWithBack} />;
      case 'settings':
        return <SettingsScreen onNavigate={handleNavigateWithBack} />;
      default:
        return <DashboardScreen onNavigate={handleNavigateWithBack} />;
    }
  };

  return (
    <MobileLayout 
      currentTab={navState.tab} 
      onTabChange={handleTabChange}
      showBackButton={navState.showBack}
      onBackClick={handleBackClick}
      title={navState.title}
    >
      {renderScreen()}
    </MobileLayout>
  );
}