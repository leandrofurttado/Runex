import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Fonts } from '@/constants/fonts';

/** Contorno preto no tema claro (simula stroke; RN não tem border em Text). */
const LIGHT_STROKE_OFFSETS = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
] as const;

type Props = {
  /** Alinhamento horizontal do bloco do título */
  align?: 'start' | 'center';
  accessibilityLabel?: string;
};

/**
 * Marca "RUNEX" com o mesmo tratamento do dashboard:
 * tema escuro — brilho verde; tema claro — letras verdes com contorno preto.
 */
export function RunexWordmark({ align = 'start', accessibilityLabel = 'RUNEX' }: Props) {
  const { colors, isDark } = useTheme();

  const wrapStyle = align === 'center' ? styles.wrapCenter : styles.wrapStart;

  if (isDark) {
    return (
      <View style={wrapStyle} accessible accessibilityLabel={accessibilityLabel}>
        <Text style={[styles.title, { color: colors.primary, textShadowColor: colors.primary }]}>RUNEX</Text>
      </View>
    );
  }

  return (
    <View style={wrapStyle} accessible accessibilityLabel={accessibilityLabel}>
      {LIGHT_STROKE_OFFSETS.map(([dx, dy], i) => (
        <Text
          key={i}
          pointerEvents="none"
          style={[
            styles.title,
            styles.strokeLayer,
            {
              left: dx,
              top: dy,
              color: '#000000',
            },
          ]}
        >
          RUNEX
        </Text>
      ))}
      <Text style={[styles.title, styles.foregroundLight, { color: colors.primary }]}>RUNEX</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapStart: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  wrapCenter: {
    position: 'relative',
    alignSelf: 'center',
  },
  strokeLayer: {
    position: 'absolute',
    textShadowRadius: 0,
  },
  foregroundLight: {
    textShadowRadius: 0,
  },
  title: {
    fontSize: 24,
    letterSpacing: 3,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    fontFamily: Fonts.bold,
  },
});
