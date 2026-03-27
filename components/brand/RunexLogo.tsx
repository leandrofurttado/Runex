import React from 'react';
import { Image, type ImageProps } from 'expo-image';
import type { ImageStyle, StyleProp } from 'react-native';

const LOGO_SOURCE = require('@/assets/icon-marker.png');

type Props = {
  size?: number;
  style?: StyleProp<ImageStyle>;
} & Omit<ImageProps, 'source' | 'style'>;

/**
 * Logótipo do app (`assets/icon-marker.png`) — fundo transparente.
 */
export function RunexLogo({ size = 88, style, ...rest }: Props) {
  return (
    <Image
      source={LOGO_SOURCE}
      style={[{ width: size, height: size }, style]}
      contentFit="contain"
      accessibilityRole="image"
      accessibilityLabel="Runex"
      {...rest}
    />
  );
}
