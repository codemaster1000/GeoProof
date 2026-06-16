// GeoProof Design System
// Dark Professional Theme

export const Colors = {
  // Backgrounds
  bg: '#0A0E1A',
  surface: '#131929',
  surfaceElevated: '#1A2236',
  surfaceBorder: '#1E2D45',

  // Brand / Accent
  accent: '#3D8BFF',
  accentDark: '#2870E0',
  accentGlow: 'rgba(61, 139, 255, 0.15)',

  // Semantic
  success: '#22C55E',
  successDark: '#16A34A',
  warning: '#F59E0B',
  warningDark: '#D97706',
  danger: '#EF4444',
  dangerDark: '#DC2626',

  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#475569',
  textAccent: '#3D8BFF',

  // Overlays
  overlay: 'rgba(0,0,0,0.6)',
  overlayLight: 'rgba(0,0,0,0.3)',
  overlayDark: 'rgba(0,0,0,0.85)',

  // White
  white: '#FFFFFF',
  black: '#000000',

  // Premium gold
  gold: '#F59E0B',
  goldDark: '#92400E',
  goldGlow: 'rgba(245, 158, 11, 0.2)',
};

export const Typography = {
  // Font families (loaded via expo-font + @expo-google-fonts/inter)
  fontRegular: 'Inter_400Regular',
  fontMedium: 'Inter_500Medium',
  fontSemiBold: 'Inter_600SemiBold',
  fontBold: 'Inter_700Bold',

  // Font sizes
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  accent: {
    shadowColor: '#3D8BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};
