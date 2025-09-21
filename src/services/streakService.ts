import { differenceInDays, format } from 'date-fns';
import { streaksStorage, badgesStorage, savingActivitiesStorage } from '@/lib/storage';
import { UserStreak, Badge, SavingActivity } from '@/types/financial';

/**
 * Gets the current streak for a user
 * @param userId - User identifier (defaults to 'default')
 * @returns Current streak count
 */
export const getCurrentStreak = (userId: string = 'default'): number => {
  const streak = streaksStorage.get();
  return streak.currentStreak;
};

/**
 * Gets the longest streak for a user
 * @param userId - User identifier (defaults to 'default')
 * @returns Longest streak count
 */
export const getLongestStreak = (userId: string = 'default'): number => {
  const streak = streaksStorage.get();
  return streak.longestStreak;
};

/**
 * Records a saving activity and updates streak
 * @param netSavings - Amount saved (positive) or spent from savings (negative)
 * @param isManualSavingDay - User manually marked as saving day
 * @param goalContributions - Array of goal contributions
 */
export const recordSavingActivity = (
  netSavings: number,
  isManualSavingDay: boolean = false,
  goalContributions: Array<{ goalId: string; amount: number }> = []
): void => {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Create saving activity record
  const activity: SavingActivity = {
    id: `saving_${Date.now()}`,
    date: today,
    netSavings,
    isManualSavingDay,
    goalContributions
  };
  
  savingActivitiesStorage.add(activity);
  
  // Update streak if it's a saving day
  const isSavingDay = netSavings > 0 || isManualSavingDay;
  if (isSavingDay) {
    updateStreak(today);
  }
};

/**
 * Updates the user's streak based on saving activity
 * @param savingDate - Date of the saving activity (YYYY-MM-DD format)
 */
const updateStreak = (savingDate: string): void => {
  const streak = streaksStorage.get();
  const today = new Date();
  const savingDateObj = new Date(savingDate);
  
  // Add to streak history if not already present
  if (!streak.streakHistory.includes(savingDate)) {
    streak.streakHistory.push(savingDate);
    streak.streakHistory.sort();
  }
  
  // Calculate current streak
  let currentStreak = 0;
  const sortedHistory = [...streak.streakHistory].sort().reverse();
  
  for (let i = 0; i < sortedHistory.length; i++) {
    const daysDiff = differenceInDays(today, new Date(sortedHistory[i]));
    
    if (i === 0 && daysDiff <= 1) {
      // First day in history, within 1 day of today
      currentStreak = 1;
    } else if (i > 0) {
      const prevDaysDiff = differenceInDays(today, new Date(sortedHistory[i - 1]));
      if (daysDiff === prevDaysDiff + 1) {
        // Consecutive day
        currentStreak++;
      } else {
        // Streak broken
        break;
      }
    } else {
      // Too old, no current streak
      break;
    }
  }
  
  // Update streak data
  const updatedStreak: UserStreak = {
    ...streak,
    currentStreak,
    longestStreak: Math.max(streak.longestStreak, currentStreak),
    lastSavingDay: savingDate
  };
  
  streaksStorage.set(updatedStreak);
  
  // Check for badge eligibility
  awardBadgeIfEligible();
};

/**
 * Awards a badge if the user is eligible based on their current streak
 * @param userId - User identifier (defaults to 'default')
 */
export const awardBadgeIfEligible = (userId: string = 'default'): void => {
  const currentStreak = getCurrentStreak(userId);
  const existingBadges = badgesStorage.get();
  
  // Define streak badges
  const streakBadges = [
    { days: 7, name: '7-Day Saver', description: 'Saved money for 7 consecutive days' },
    { days: 14, name: '2-Week Champion', description: 'Saved money for 14 consecutive days' },
    { days: 30, name: 'Monthly Master', description: 'Saved money for 30 consecutive days' },
    { days: 60, name: '2-Month Mogul', description: 'Saved money for 60 consecutive days' },
    { days: 100, name: '100-Day Legend', description: 'Saved money for 100 consecutive days' }
  ];
  
  streakBadges.forEach(({ days, name, description }) => {
    const badgeId = `streak_${days}`;
    const alreadyEarned = existingBadges.some(b => b.id === badgeId);
    
    if (currentStreak >= days && !alreadyEarned) {
      const badge: Badge = {
        id: badgeId,
        name,
        description,
        icon: '🔥',
        category: 'streak',
        earnedAt: new Date().toISOString(),
        requirement: days
      };
      
      badgesStorage.add(badge);
      
      // Show notification (you can expand this with actual notification system)
      console.log(`🎉 Badge earned: ${name} - ${description}`);
    }
  });
};

/**
 * Gets streak statistics for display
 * @param userId - User identifier (defaults to 'default')
 * @returns Streak statistics object
 */
export const getStreakStats = (userId: string = 'default') => {
  const streak = streaksStorage.get();
  const activities = savingActivitiesStorage.get();
  
  const last7Days = activities
    .filter(a => {
      const daysDiff = differenceInDays(new Date(), new Date(a.date));
      return daysDiff <= 7;
    })
    .length;
  
  const last30Days = activities
    .filter(a => {
      const daysDiff = differenceInDays(new Date(), new Date(a.date));
      return daysDiff <= 30;
    })
    .length;
  
  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    totalSavingDays: streak.streakHistory.length,
    savingDaysLast7Days: last7Days,
    savingDaysLast30Days: last30Days,
    lastSavingDay: streak.lastSavingDay
  };
};