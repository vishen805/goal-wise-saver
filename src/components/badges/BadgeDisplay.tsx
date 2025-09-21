import React from 'react';
import { Badge as BadgeType } from '@/types/financial';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Target, TrendingUp } from 'lucide-react';

interface BadgeDisplayProps {
  /** Array of earned badges */
  badges: BadgeType[];
  /** Display mode */
  mode?: 'grid' | 'list' | 'compact';
  /** Maximum number of badges to show */
  limit?: number;
  /** Show badge categories */
  showCategories?: boolean;
}

/**
 * Gets appropriate icon for badge category
 */
const getCategoryIcon = (category: BadgeType['category']) => {
  switch (category) {
    case 'streak':
      return <Trophy className="h-4 w-4" />;
    case 'savings':
      return <Target className="h-4 w-4" />;
    case 'budget':
      return <TrendingUp className="h-4 w-4" />;
    case 'achievement':
      return <Star className="h-4 w-4" />;
    default:
      return <Star className="h-4 w-4" />;
  }
};

/**
 * Gets badge variant based on category
 */
const getBadgeVariant = (category: BadgeType['category']) => {
  switch (category) {
    case 'streak':
      return 'default';
    case 'savings':
      return 'secondary';
    case 'budget':
      return 'outline';
    case 'achievement':
      return 'destructive';
    default:
      return 'default';
  }
};

/**
 * Individual badge component
 */
const BadgeItem: React.FC<{ badge: BadgeType; mode: 'grid' | 'list' | 'compact' }> = ({ badge, mode }) => {
  if (mode === 'compact') {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
        <span className="text-lg">{badge.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{badge.name}</p>
        </div>
        <Badge variant={getBadgeVariant(badge.category)} className="text-xs">
          {badge.category}
        </Badge>
      </div>
    );
  }

  if (mode === 'list') {
    return (
      <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
            {badge.icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm">{badge.name}</h3>
            <Badge variant={getBadgeVariant(badge.category)} className="text-xs">
              {getCategoryIcon(badge.category)}
              <span className="ml-1">{badge.category}</span>
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{badge.description}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Earned {new Date(badge.earnedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  }

  // Grid mode
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl mb-3 mx-auto">
          {badge.icon}
        </div>
        <h3 className="font-semibold text-sm mb-1">{badge.name}</h3>
        <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
        <div className="flex flex-col gap-1">
          <Badge variant={getBadgeVariant(badge.category)} className="text-xs">
            {getCategoryIcon(badge.category)}
            <span className="ml-1">{badge.category}</span>
          </Badge>
          <p className="text-xs text-muted-foreground">
            {new Date(badge.earnedAt).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * BadgeDisplay component shows earned badges in various layouts
 * 
 * Features:
 * - Multiple display modes (grid, list, compact)
 * - Category filtering and icons
 * - Responsive design
 * - Earned date display
 * - Hover effects and transitions
 */
export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  badges,
  mode = 'grid',
  limit,
  showCategories = true
}) => {
  const displayBadges = limit ? badges.slice(0, limit) : badges;
  
  if (badges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-6xl mb-4">🏆</div>
          <p className="text-muted-foreground">No badges earned yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Keep saving money to earn your first badge!
          </p>
        </CardContent>
      </Card>
    );
  }

  const categoryCounts = badges.reduce((acc, badge) => {
    acc[badge.category] = (acc[badge.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {showCategories && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryCounts).map(([category, count]) => (
            <Badge key={category} variant="outline" className="text-xs">
              {getCategoryIcon(category as BadgeType['category'])}
              <span className="ml-1 capitalize">{category} ({count})</span>
            </Badge>
          ))}
        </div>
      )}

      {mode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayBadges.map(badge => (
            <BadgeItem key={badge.id} badge={badge} mode={mode} />
          ))}
        </div>
      )}

      {mode === 'list' && (
        <div className="space-y-3">
          {displayBadges.map(badge => (
            <BadgeItem key={badge.id} badge={badge} mode={mode} />
          ))}
        </div>
      )}

      {mode === 'compact' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {displayBadges.map(badge => (
            <BadgeItem key={badge.id} badge={badge} mode={mode} />
          ))}
        </div>
      )}

      {limit && badges.length > limit && (
        <p className="text-center text-sm text-muted-foreground">
          Showing {limit} of {badges.length} badges
        </p>
      )}
    </div>
  );
};