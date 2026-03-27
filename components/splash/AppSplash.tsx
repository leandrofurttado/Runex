import React, { useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Fonts } from '@/constants/fonts';
import { LoadingGif } from '@/components/ui/LoadingGif';

const PRIMARY = '#00E373';
const BG = '#0a0a0a';

/** Tempo mínimo visível (ms). */
const MIN_MS = 2800;
/** Duração do fade-out (ms). */
const FADE_MS = 500;

type Props = { onDone: () => void };

export function AppSplash({ onDone }: Props) {
  const { width: W, height: H } = useWindowDimensions();

  // Overlay
  const screenOp = useSharedValue(1);

  // Textos
  const titleOp = useSharedValue(0);
  const titleY = useSharedValue(20);
  const sepWidth = useSharedValue(0);
  const tag1Op = useSharedValue(0);
  const tag1Y = useSharedValue(12);
  const tag2Op = useSharedValue(0);
  const tag2Y = useSharedValue(10);

  // Barra de progresso
  const barW = useSharedValue(0);

  useEffect(() => {
    // Título
    titleOp.value = withDelay(400, withTiming(1, { duration: 420 }));
    titleY.value = withDelay(400, withTiming(0, { duration: 420, easing: Easing.out(Easing.quad) }));

    // Separador
    sepWidth.value = withDelay(640, withTiming(180, { duration: 380, easing: Easing.out(Easing.quad) }));

    // Tagline 1
    tag1Op.value = withDelay(740, withTiming(1, { duration: 380 }));
    tag1Y.value = withDelay(740, withTiming(0, { duration: 380, easing: Easing.out(Easing.quad) }));

    // Tagline 2
    tag2Op.value = withDelay(920, withTiming(1, { duration: 360 }));
    tag2Y.value = withDelay(920, withTiming(0, { duration: 360, easing: Easing.out(Easing.quad) }));

    // Barra de progresso
    barW.value = withDelay(300, withTiming(W, { duration: MIN_MS - 300, easing: Easing.inOut(Easing.quad) }));

    // Fade-out após mínimo
    const t = setTimeout(() => {
      screenOp.value = withTiming(0, { duration: FADE_MS }, (done) => {
        if (done) runOnJS(onDone)();
      });
    }, MIN_MS);

    return () => clearTimeout(t);
  }, []);

  const screenStyle = useAnimatedStyle(() => ({ opacity: screenOp.value }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOp.value, transform: [{ translateY: titleY.value }] }));
  const sepStyle = useAnimatedStyle(() => ({ width: sepWidth.value }));
  const tag1Style = useAnimatedStyle(() => ({ opacity: tag1Op.value, transform: [{ translateY: tag1Y.value }] }));
  const tag2Style = useAnimatedStyle(() => ({ opacity: tag2Op.value, transform: [{ translateY: tag2Y.value }] }));
  const barStyle = useAnimatedStyle(() => ({ width: barW.value }));

  const GIF_SIZE = Math.min(200, W * 0.5);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, screenStyle]}>

      {/* Círculos de radar estáticos */}
      {[0.3, 0.5, 0.72].map((r, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: W * r * 2,
            height: W * r * 2,
            borderRadius: W * r,
            borderWidth: 1,
            borderColor: `rgba(0,227,115,${0.06 - i * 0.015})`,
            top: H * 0.42 - W * r,
          }}
        />
      ))}

      {/* Glow central */}
      <View
        pointerEvents="none"
        style={[
          styles.bgGlow,
          { width: W * 0.8, height: W * 0.8, borderRadius: W * 0.4, top: H * 0.42 - W * 0.4 },
        ]}
      />

      {/* Conteúdo central */}
      <View style={styles.center}>

        {/* GIF de loading */}
        <LoadingGif size={GIF_SIZE} />

        {/* Separador */}
        <Animated.View style={[styles.separator, sepStyle]} />

        {/* RUNEX */}
        <Animated.Text style={[styles.title, titleStyle]}>
          RUNEX
        </Animated.Text>

        {/* Tagline 1 */}
        <Animated.Text style={[styles.tag1, tag1Style]}>
          CORRA · EVOLUA · CONQUISTE
        </Animated.Text>

        {/* Tagline 2 */}
        <Animated.Text style={[styles.tag2, tag2Style]}>
          SAÚDE COM DIVERSÃO E COMPETITIVIDADE
        </Animated.Text>
      </View>

      {/* Barra de progresso */}
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, barStyle]} />
      </View>

      {/* Versão */}
      <Text style={styles.version}>v1.0.0</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  bgGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,227,115,0.04)',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 100,
  },
  center: {
    alignItems: 'center',
    marginBottom: 20,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0,227,115,0.45)',
    marginTop: 16,
    alignSelf: 'center',
  },
  title: {
    marginTop: 10,
    fontSize: 54,
    letterSpacing: 10,
    color: PRIMARY,
    fontFamily: Fonts.bold,
    textShadowColor: PRIMARY,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22,
  },
  tag1: {
    marginTop: 10,
    fontSize: 12,
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.45)',
    fontFamily: Fonts.medium,
    textTransform: 'uppercase',
  },
  tag2: {
    marginTop: 6,
    fontSize: 10,
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.22)',
    fontFamily: Fonts.regular,
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  barTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(0,227,115,0.07)',
  },
  barFill: {
    height: 4,
    backgroundColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  version: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    fontSize: 10,
    color: 'rgba(255,255,255,0.16)',
    fontFamily: Fonts.regular,
    letterSpacing: 1,
  },
});
