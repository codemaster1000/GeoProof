// GeoProof Design System
// Yellow / Black / White Theme — Bold Professional Palette
// Inspired by construction safety & field operations color language

export const Colors = {
  // ─── Core Palette ─────────────────────────────────────────────────────
  bg: '#000000',              // Pure black background
  surface: '#111111',         // Slightly lifted surface
  surfaceElevated: '#1A1A1A', // Cards, modals
  surfaceBorder: '#2A2A2A',   // Borders and dividers

  // ─── Brand / Accent ───────────────────────────────────────────────────
  accent: '#F5C518',          // Vivid golden yellow
  accentDark: '#D4A800',      // Pressed / darker yellow
  accentGlow: 'rgba(245, 197, 24, 0.12)', // Yellow glow tint

  // ─── Text on Yellow ───────────────────────────────────────────────────
  textOnAccent: '#000000',    // Black text on yellow backgrounds

  // ─── Semantic ─────────────────────────────────────────────────────────
  success: '#22C55E',
  successDark: '#16A34A',
  warning: '#F59E0B',
  warningDark: '#D97706',
  danger: '#EF4444',
  dangerDark: '#DC2626',

  // ─── Text ─────────────────────────────────────────────────────────────
  textPrimary: '#FFFFFF',       // Pure white
  textSecondary: '#A0A0A0',     // Medium grey
  textMuted: '#555555',         // Dimmed grey
  textAccent: '#F5C518',        // Yellow for highlighted labels

  // ─── Overlays ─────────────────────────────────────────────────────────
  overlay: 'rgba(0,0,0,0.65)',
  overlayLight: 'rgba(0,0,0,0.35)',
  overlayDark: 'rgba(0,0,0,0.88)',

  // ─── Absolute ─────────────────────────────────────────────────────────
  white: '#FFFFFF',
  black: '#000000',

  // ─── Gold aliases (for premium UI) ────────────────────────────────────
  gold: '#F5C518',
  goldDark: '#92400E',
  goldGlow: 'rgba(245, 197, 24, 0.15)',
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
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  accent: {
    shadowColor: '#F5C518',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
};
