import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

const GIF = require('@/assets/gifs/gif-loading-app.gif');

type Props = {
  size?: number;
  /**
   * Se `true`, preenche o ecrã inteiro com fundo escuro centrado.
   * Use para ecrãs de loading full-screen.
   */
  fullScreen?: boolean;
  backgroundColor?: string;
};

/**
 * Indicador de loading padrão do Runex.
 * Usa `gif-loading-app.gif` com fundo transparente.
 */
export function LoadingGif({
  size = 120,
  fullScreen = false,
  backgroundColor = 'transparent',
}: Props) {
  const gif = (
    <Image
      source={GIF}
      style={{ width: size, height: size }}
      contentFit="contain"
      autoplay
    />
  );

  if (!fullScreen) return gif;

  return (
    <View style={[styles.fullScreen, { backgroundColor }]}>
      {gif}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
