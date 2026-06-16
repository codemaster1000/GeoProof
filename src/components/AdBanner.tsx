// AdBanner Component
// Tier 1: Silent, non-intrusive adaptive banner at bottom of project dashboard
// Uses react-native-google-mobile-ads BannerAd
// Only shown to free tier users (not Lifetime Pro)

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { Colors } from '../constants/theme';

// Production AdMob Unit IDs — replace with real IDs before publishing
// Test IDs are used during development
const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : Platform.select({
      android: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY', // TODO: Replace with real Android banner ad unit ID
      ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY',     // TODO: Replace with real iOS banner ad unit ID
    }) ?? TestIds.ADAPTIVE_BANNER;

interface AdBannerProps {
  isVisible?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({ isVisible = true }) => {
  if (!isVisible) return null;

  return (
    <View style={styles.container} accessibilityElementsHidden>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.bg,
    alignItems: 'center',
  },
});
