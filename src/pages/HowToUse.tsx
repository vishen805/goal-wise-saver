import React from 'react';
import { ArrowLeft, DollarSign, Target, TrendingUp, Award, BarChart3, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { t } from '@/lib/i18n';

const HowToUse = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: t('howto_track_title'),
      description: t('howto_track_desc'),
      steps: [
        t('howto_track_step_1'),
        t('howto_track_step_2'),
        t('howto_track_step_3'),
        t('howto_track_step_4')
      ]
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: t('howto_goals_title'),
      description: t('howto_goals_desc'),
      steps: [
        t('howto_goals_step_1'),
        t('howto_goals_step_2'),
        t('howto_goals_step_3'),
        t('howto_goals_step_4')
      ]
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: t('howto_analytics_title'),
      description: t('howto_analytics_desc'),
      steps: [
        t('howto_analytics_step_1'),
        t('howto_analytics_step_2'),
        t('howto_analytics_step_3'),
        t('howto_analytics_step_4')
      ]
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: t('howto_badges_title'),
      description: t('howto_badges_desc'),
      steps: [
        t('howto_badges_step_1'),
        t('howto_badges_step_2'),
        t('howto_badges_step_3'),
        t('howto_badges_step_4')
      ]
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: t('howto_challenges_title'),
      description: t('howto_challenges_desc'),
      steps: [
        t('howto_challenges_step_1'),
        t('howto_challenges_step_2'),
        t('howto_challenges_step_3'),
        t('howto_challenges_step_4')
      ]
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: t('howto_export_title'),
      description: t('howto_export_desc'),
      steps: [
        t('howto_export_step_1'),
        t('howto_export_step_2'),
        t('howto_export_step_3'),
        t('howto_export_step_4')
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
          <h1 className="text-xl font-bold">{t('help_support')}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">{t('app_title')} 🎉</CardTitle>
            <CardDescription className="text-base">
              {t('built_with')}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t('help_support')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">1</div>
              <p>{t('getting_started_1')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">2</div>
              <p>{t('getting_started_2')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">3</div>
              <p>{t('getting_started_3')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('key_features')}</h2>
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
                  <p className="font-medium text-sm">{t('how_to_use') || 'How to use:'}</p>
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
            {t('app_title')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HowToUse;