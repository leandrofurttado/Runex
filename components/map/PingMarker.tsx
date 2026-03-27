import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const MARKER_IMG = require('@/assets/icon-marker.png');

/** Duração de cada ciclo de ping (ms). */
const CYCLE = 1800;
/** Tempo de expansão + fade do anel (ms). */
const EXPAND = 1100;

type Props = {
  size?: number;
  pingColor?: string;
  label?: string;
  onPress?: () => void;
};

/**
 * Marcador de mapa com animação de ping GPS.
 * Dois anéis sonar desfasados + bounce suave sincronizado.
 */
export function PingMarker({
  size = 48,
  pingColor = '#00E373',
  label,
  onPress,
}: Props) {
  const r1Scale = useSharedValue(0.2);
  const r1Opacity = useSharedValue(0);
  const r2Scale = useSharedValue(0.2);
  const r2Opacity = useSharedValue(0);
  const bounce = useSharedValue(0);

  useEffect(() => {
    // Anel 1
    r1Scale.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 0 }),
        withTiming(1.6, { duration: EXPAND, easing: Easing.out(Easing.quad) }),
        withTiming(1.6, { duration: CYCLE - EXPAND }),
      ),
      -1,
      false
    );
    r1Opacity.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 0 }),
        withTiming(0, { duration: EXPAND, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: CYCLE - EXPAND }),
      ),
      -1,
      false
    );

    // Anel 2 — desfasado em meio ciclo
    r2Scale.value = withDelay(
      CYCLE / 2,
      withRepeat(
        withSequence(
          withTiming(0.3, { duration: 0 }),
          withTiming(1.3, { duration: EXPAND, easing: Easing.out(Easing.quad) }),
          withTiming(1.3, { duration: CYCLE - EXPAND }),
        ),
        -1,
        false
      )
    );
    r2Opacity.value = withDelay(
      CYCLE / 2,
      withRepeat(
        withSequence(
          withTiming(0.22, { duration: 0 }),
          withTiming(0, { duration: EXPAND, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: CYCLE - EXPAND }),
        ),
        -1,
        false
      )
    );

    // Bounce do marcador sincronizado com o ping
    bounce.value = withRepeat(
      withSequence(
        withTiming(0, { duration: CYCLE - 320 }),
        withTiming(-7, { duration: 100, easing: Easing.out(Easing.quad) }),
        withTiming(2, { duration: 120, easing: Easing.in(Easing.quad) }),
        withTiming(0, { duration: 100, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false
    );
  }, []);

  const ring1Style = useAnimatedStyle(() => ({
    opacity: r1Opacity.value,
    transform: [{ scale: r1Scale.value }],
  }));
  const ring2Style = useAnimatedStyle(() => ({
    opacity: r2Opacity.value,
    transform: [{ scale: r2Scale.value }],
  }));
  const markerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  const ringSize = size * 0.28;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.wrapper}
    >
      {/* Anéis sonar no chão */}
      <View style={[styles.ringBase, { bottom: 0, width: ringSize, height: ringSize * 0.4 }]}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ring,
            { width: ringSize, height: ringSize * 0.4, borderRadius: ringSize, backgroundColor: pingColor },
            ring1Style,
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ring,
            { width: ringSize, height: ringSize * 0.4, borderRadius: ringSize, backgroundColor: pingColor },
            ring2Style,
          ]}
        />
      </View>

      {/* Ícone com bounce */}
      <Animated.View style={markerStyle}>
        <Image
          source={MARKER_IMG}
          style={{ width: size, height: size }}
          contentFit="contain"
          accessibilityLabel="player marker"
        />
      </Animated.View>

      {/* Label */}
      {label ? (
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  ringBase: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  label: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    maxWidth: 72,
    textAlign: 'center',
  },
});
