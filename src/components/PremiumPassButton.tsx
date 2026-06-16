// PremiumPassButton Component
// Tier 2: User-triggered rewarded ad to unlock 24-hour premium pass

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../constants/theme';
import { usePremiumStatus } from '../hooks/usePremiumStatus';

interface PremiumPassButtonProps {
  style?: object;
}

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export const PremiumPassButton: React.FC<PremiumPassButtonProps> = ({ style }) => {
  const { isPremium, isLifetimePro, premiumHoursRemaining, activatePremiumPass } = usePremiumStatus();
  const [isLoading, setIsLoading] = useState(false);

  if (isLifetimePro) return null; // No need to show for Lifetime Pro users

  const handleWatchAd = async () => {
    Alert.alert(
      '🎯 24-Hour Premium Pass',
      'Watch a short 30-second ad to unlock premium features for 24 hours:\n\n✓ No GeoProof watermarks on photos\n✓ Unlimited PDF reports\n✓ Advanced report layouts\n✓ Full CSV export',
      [
        { text: 'Maybe Later', style: 'cancel' },
        {
          text: 'Watch Ad',
          onPress: async () => {
            setIsLoading(true);
            try {
              // In production: show AdMob rewarded ad here
              // For now: simulate a brief delay then activate
              // Replace with: await rewardedAd.show()
              await new Promise(resolve => setTimeout(resolve, 1500));

              const expiryTimestamp = Date.now() + TWENTY_FOUR_HOURS_MS;
              await activatePremiumPass(expiryTimestamp);

              Alert.alert(
                '✅ Premium Unlocked!',
                'You now have 24-hour access to all premium features. Enjoy!',
                [{ text: 'Great!' }]
              );
            } catch {
              Alert.alert('Error', 'Could not load ad. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  if (isPremium) {
    return (
      <View style={[styles.activeContainer, style]}>
        <Text style={styles.activeEmoji}>⭐</Text>
        <View>
          <Text style={styles.activeTitle}>Premium Pass Active</Text>
          <Text style={styles.activeSubtitle}>
            {premiumHoursRemaining != null
              ? `${premiumHoursRemaining}h remaining`
              : 'Active now'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handleWatchAd}
      disabled={isLoading}
      activeOpacity={0.85}
      accessibilityLabel="Watch ad for 24-hour premium pass"
      accessibilityRole="button"
    >
      {isLoading ? (
        <ActivityIndicator color={Colors.black} size="small" />
      ) : (
        <>
          <Text style={styles.emoji}>📺</Text>
          <View style={styles.textContainer}>
            <Text style={styles.title}>24-Hour Premium Pass</Text>
            <Text style={styles.subtitle}>Watch 1 ad · Unlock all features</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>FREE</Text>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  emoji: {
    fontSize: 22,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
    color: Colors.black,
  },
  subtitle: {
    fontSize: Typography.xs,
    color: 'rgba(0,0,0,0.6)',
    fontFamily: Typography.fontMedium,
  },
  badge: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: Typography.fontBold,
    color: Colors.black,
    letterSpacing: 1,
  },
  activeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.goldGlow,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  activeEmoji: {
    fontSize: 22,
  },
  activeTitle: {
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
    color: Colors.gold,
  },
  activeSubtitle: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontMedium,
  },
});
