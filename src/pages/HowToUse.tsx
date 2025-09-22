import React from 'react';
import { ArrowLeft, DollarSign, Target, TrendingUp, Award, BarChart3, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const HowToUse = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Track Expenses",
      description: "Add your daily expenses by category. Track where your money goes to identify spending patterns.",
      steps: [
        "Go to the Expenses tab",
        "Tap the '+' button to add a new expense",
        "Enter amount, select category, and add description",
        "View all your expenses in an organized list"
      ]
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Set Savings Goals",
      description: "Create specific savings targets and track your progress toward achieving them.",
      steps: [
        "Navigate to the Goals tab",
        "Tap 'Add New Goal' to create a savings target",
        "Set your goal amount and target date",
        "Add money to goals to track progress"
      ]
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "View Analytics",
      description: "Analyze your spending with interactive charts and detailed breakdowns.",
      steps: [
        "Check the Dashboard for overview charts",
        "View pie charts showing expense categories",
        "Track savings progress over time",
        "Monitor budget vs actual spending"
      ]
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Earn Badges",
      description: "Build saving streaks and earn badges for consistent financial habits.",
      steps: [
        "Save money daily to build streaks",
        "Earn badges for 7-day saving streaks",
        "View your badges in the dashboard",
        "Challenge yourself to maintain longer streaks"
      ]
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Take Challenges",
      description: "Participate in weekly and monthly challenges to improve your financial habits.",
      steps: [
        "View active challenges on the dashboard",
        "Join challenges like 'No-spend weekend'",
        "Track your progress throughout the challenge",
        "Earn rewards for completing challenges"
      ]
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Export Data",
      description: "Export your financial data to CSV or Excel for external analysis.",
      steps: [
        "Go to Settings",
        "Select 'Export Data'",
        "Choose format (CSV or Excel)",
        "Download your financial records"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">How to Use Smart Saver</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to Smart Saver! 🎉</CardTitle>
            <CardDescription className="text-base">
              Your personal finance companion designed to help you track expenses, 
              achieve savings goals, and build better financial habits.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">1</div>
              <p>Start by adding your first expense to see how easy tracking can be</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">2</div>
              <p>Set up your first savings goal to have something to work toward</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">3</div>
              <p>Check the dashboard daily to monitor your financial progress</p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Key Features</h2>
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {feature.icon}
                  </div>
                  {feature.title}
                </CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium text-sm">How to use:</p>
                  <ol className="space-y-1">
                    {feature.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary font-medium">{stepIndex + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tips */}
        <Card className="bg-gradient-to-r from-secondary/10 to-accent/10 border-secondary/20">
          <CardHeader>
            <CardTitle>💡 Pro Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">• Set up notifications to remember daily expense tracking</p>
            <p className="text-sm">• Review your spending patterns weekly to identify areas for improvement</p>
            <p className="text-sm">• Use categories consistently for better analytics</p>
            <p className="text-sm">• Set realistic savings goals that you can actually achieve</p>
            <p className="text-sm">• Take challenges to make saving more engaging and fun</p>
          </CardContent>
        </Card>

        {/* Get Started Button */}
        <div className="pt-4">
          <Button 
            onClick={() => navigate('/')} 
            className="w-full"
            size="lg"
          >
            Start Using Smart Saver
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HowToUse;