import { ReactNode, useState } from 'react';
import { Home, Target, CreditCard, PieChart, Settings, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MobileLayoutProps {
  children: ReactNode;
  currentTab: string;
  onTabChange: (tab: string) => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  title?: string;
}

const tabs = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'expenses', label: 'Expenses', icon: CreditCard },
  { id: 'budget', label: 'Budget', icon: PieChart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function MobileLayout({ 
  children, 
  currentTab, 
  onTabChange, 
  showBackButton, 
  onBackClick, 
  title 
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="gradient-hero text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBackClick}
                className="text-white hover:bg-white/20 -ml-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                {title || 'SmartSaver'}
              </h1>
              <p className="text-white/80 text-xs sm:text-sm">Smart money management</p>
            </div>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            💰
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 touch-pan-y">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border shadow-lg safe-area-padding-bottom">
        <div className="grid grid-cols-5 gap-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center py-2 sm:py-3 px-1 sm:px-2 text-xs transition-all duration-200 active:scale-95 touch-manipulation",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground active:text-primary"
                )}
              >
                <Icon 
                  className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 mb-1",
                    isActive && "text-primary"
                  )} 
                />
                <span className="text-[9px] sm:text-[10px] leading-tight">{tab.label}</span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 sm:w-8 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}