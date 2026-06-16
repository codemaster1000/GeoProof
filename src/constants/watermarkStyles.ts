// Watermark Style Presets for GeoProof
// Three hardcoded layout styles per FR-014

import { TextStyle, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing, Radius } from './theme';

export type WatermarkPosition = 'TL' | 'TR' | 'BL' | 'BR';
export type WatermarkStyleId = 1 | 2 | 3;

export interface WatermarkStyle {
  id: WatermarkStyleId;
  name: string;
  description: string;
  containerStyle: ViewStyle;
  textStyle: TextStyle;
  labelStyle: TextStyle;
  dividerColor: string;
  showBackground: boolean;
  textShadow: boolean;
}

export const WATERMARK_STYLES: Record<WatermarkStyleId, WatermarkStyle> = {
  // Style 1: Industrial Badge
  // Semi-transparent black rectangular overlay anchored (position set at render time)
  1: {
    id: 1,
    name: 'Industrial Badge',
    description: 'Semi-transparent badge with structured metadata grid',
    containerStyle: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      borderRadius: Radius.sm,
      padding: Spacing.sm,
      minWidth: 200,
      borderLeftWidth: 3,
      borderLeftColor: '#F5C518',
    },
    textStyle: {
      color: Colors.white,
      fontSize: 11,
      fontFamily: 'Inter_500Medium',
      letterSpacing: 0.3,
    },
    labelStyle: {
      color: '#94A3B8',
      fontSize: 9,
      fontFamily: 'Inter_500Medium',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    dividerColor: 'rgba(255,255,255,0.15)',
    showBackground: true,
    textShadow: false,
  },

  // Style 2: Clean Inspector
  // Text directly on image with high-visibility color + drop shadow stroke
  2: {
    id: 2,
    name: 'Clean Inspector',
    description: 'High-visibility text with drop shadow for any background',
    containerStyle: {
      backgroundColor: 'transparent',
      padding: Spacing.sm,
    },
    textStyle: {
      color: Colors.white,
      fontSize: 12,
      fontFamily: 'Inter_600SemiBold',
      textShadowColor: 'rgba(0,0,0,0.95)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    labelStyle: {
      color: '#E2E8F0',
      fontSize: 9,
      fontFamily: 'Inter_500Medium',
      textShadowColor: 'rgba(0,0,0,0.95)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    dividerColor: 'rgba(255,255,255,0.4)',
    showBackground: false,
    textShadow: true,
  },

  // Style 3: Corporate Minimalist
  // Clean typography at bottom edge, white on subtle dark gradient strip
  3: {
    id: 3,
    name: 'Corporate Minimalist',
    description: 'Elegant bottom-edge typography with gradient background',
    containerStyle: {
      backgroundColor: 'rgba(0,0,0,0.55)',
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      minWidth: 220,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.08)',
    },
    textStyle: {
      color: Colors.white,
      fontSize: 11,
      fontFamily: 'Inter_400Regular',
      letterSpacing: 0.5,
    },
    labelStyle: {
      color: 'rgba(255,255,255,0.55)',
      fontSize: 8,
      fontFamily: 'Inter_500Medium',
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },
    dividerColor: 'rgba(255,255,255,0.12)',
    showBackground: true,
    textShadow: false,
  },
};

export function getPositionStyle(position: WatermarkPosition): ViewStyle {
  const base: ViewStyle = { position: 'absolute', margin: 8 };
  switch (position) {
    case 'TL': return { ...base, top: 0, left: 0 };
    case 'TR': return { ...base, top: 0, right: 0 };
    case 'BL': return { ...base, bottom: 0, left: 0 };
    case 'BR': return { ...base, bottom: 0, right: 0 };
  }
}
