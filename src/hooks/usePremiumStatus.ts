// Premium status hook — manages 24-hour token and Lifetime Pro status
// Tier 2: 24-hour rewarded ad token
// Tier 3: Lifetime Pro one-time purchase

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREMIUM_EXPIRY_KEY = '@geoproof/premium_expiry';
const LIFETIME_PRO_KEY = '@geoproof/lifetime_pro';

export interface PremiumStatus {
  isLifetimePro: boolean;
  isPremium: boolean;           // true if lifetime pro OR within 24hr window
  premiumExpiresAt: Date | null;
  premiumHoursRemaining: number | null;
  isLoading: boolean;
  activatePremiumPass: (expiryTimestamp: number) => Promise<void>;
  setLifetimePro: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePremiumStatus(): PremiumStatus {
  const [isLifetimePro, setIsLifetimePro] = useState(false);
  const [premiumExpiresAt, setPremiumExpiresAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const lifetimeVal = await AsyncStorage.getItem(LIFETIME_PRO_KEY);
      const expiryVal = await AsyncStorage.getItem(PREMIUM_EXPIRY_KEY);

      setIsLifetimePro(lifetimeVal === 'true');

      if (expiryVal) {
        const expiry = new Date(parseInt(expiryVal, 10));
        if (expiry > new Date()) {
          setPremiumExpiresAt(expiry);
        } else {
          // Expired — clean up
          setPremiumExpiresAt(null);
          await AsyncStorage.removeItem(PREMIUM_EXPIRY_KEY);
        }
      } else {
        setPremiumExpiresAt(null);
      }
    } catch {
      // Ignore storage errors — default to free tier
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activatePremiumPass = useCallback(async (expiryTimestamp: number) => {
    await AsyncStorage.setItem(PREMIUM_EXPIRY_KEY, expiryTimestamp.toString());
    setPremiumExpiresAt(new Date(expiryTimestamp));
  }, []);

  const activateLifetimePro = useCallback(async () => {
    await AsyncStorage.setItem(LIFETIME_PRO_KEY, 'true');
    setIsLifetimePro(true);
  }, []);

  const isPremium = isLifetimePro || (premiumExpiresAt !== null && premiumExpiresAt > new Date());

  let premiumHoursRemaining: number | null = null;
  if (premiumExpiresAt && premiumExpiresAt > new Date() && !isLifetimePro) {
    premiumHoursRemaining = Math.ceil(
      (premiumExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60)
    );
  }

  return {
    isLifetimePro,
    isPremium,
    premiumExpiresAt,
    premiumHoursRemaining,
    isLoading,
    activatePremiumPass,
    setLifetimePro: activateLifetimePro,
    refresh: load,
  };
}
