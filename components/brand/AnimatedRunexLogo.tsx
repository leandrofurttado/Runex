import React, { useEffect } from 'react';
import { View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { RunexLogo } from '@/components/brand/RunexLogo';

type Props = {
  size?: number;
  containerStyle?: StyleProp<ViewStyle>;
};

const CYCLE = 2800; // ms — intervalo entre pings
const EXPAND = 1400; // ms — expansão + fade do anel

/**
 * Logo do login com animação de GPS pin:
 * entrada (queda + bounce) + ping sonar contínuo sincronizado.
 */
export function AnimatedRunexLogo({ size = 180, containerStyle }: Props) {
  // Entrada
  const enterY = useSharedValue(-80);
  const enterScale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  // Bounce contínuo
  const bounce = useSharedValue(0);

  // Dois anéis sonar
  const r1Scale = useSharedValue(0.2);
  const r1Opacity = useSharedValue(0);
  const r2Scale = useSharedValue(0.2);
  const r2Opacity = useSharedValue(0);

  useEffect(() => {
    // ── Entrada ──────────────────────────────────────────────
    opacity.value = withTiming(1, { duration: 180 });

    enterY.value = withTiming(0, {
      duration: 520,
      easing: Easing.out(Easing.back(2.2)),
    });
    enterScale.value = withTiming(1, {
      duration: 520,
      easing: Easing.out(Easing.back(2.2)),
    });

    // ── Bounce contínuo após entrada ─────────────────────────
    bounce.value = withDelay(
      560,
      withRepeat(
        withSequence(
          withTiming(0, { duration: CYCLE - 400 }),
          withTiming(9, { duration: 110, easing: Easing.in(Easing.quad) }),
          withTiming(-5, { duration: 170, easing: Easing.out(Easing.quad) }),
          withTiming(2, { duration: 80, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: 130, easing: Easing.out(Easing.quad) }),
        ),
        -1,
        false
      )
    );

    // ── Anel 1 — dispara ao mesmo tempo que o bounce ─────────
    r1Scale.value = withDelay(
      540,
      withRepeat(
        withSequence(
          withTiming(0.3, { duration: 0 }),
          withTiming(1.7, { duration: EXPAND, easing: Easing.out(Easing.quad) }),
          withTiming(1.7, { duration: CYCLE - EXPAND }),
        ),
        -1,
        false
      )
    );
    r1Opacity.value = withDelay(
      540,
      withRepeat(
        withSequence(
          withTiming(0.3, { duration: 0 }),
          withTiming(0, { duration: EXPAND, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: CYCLE - EXPAND }),
        ),
        -1,
        false
      )
    );

    // ── Anel 2 — desfasado 420 ms ────────────────────────────
    r2Scale.value = withDelay(
      540 + 420,
      withRepeat(
        withSequence(
          withTiming(0.3, { duration: 0 }),
          withTiming(1.35, { duration: EXPAND, easing: Easing.out(Easing.quad) }),
          withTiming(1.35, { duration: CYCLE - EXPAND }),
        ),
        -1,
        false
      )
    );
    r2Opacity.value = withDelay(
      540 + 420,
      withRepeat(
        withSequence(
          withTiming(0.18, { duration: 0 }),
          withTiming(0, { duration: EXPAND, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: CYCLE - EXPAND }),
        ),
        -1,
        false
      )
    );
  }, []);

  const entryStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: enterY.value }, { scale: enterScale.value }],
  }));
  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));
  const ring1Style = useAnimatedStyle(() => ({
    opacity: r1Opacity.value,
    transform: [{ scale: r1Scale.value }],
  }));
  const ring2Style = useAnimatedStyle(() => ({
    opacity: r2Opacity.value,
    transform: [{ scale: r2Scale.value }],
  }));

  const ringW = size * 0.28;
  const ringH = ringW * 0.35;

  return (
    <View style={[{ alignItems: 'center' }, containerStyle]}>
      {/* Anéis sonar — na base do pin */}
      <View
        pointerEvents="none"
        style={{ position: 'absolute', bottom: 0, alignItems: 'center', justifyContent: 'center', width: ringW, height: ringH }}
      >
        <Animated.View
          style={[
            { position: 'absolute', width: ringW, height: ringH, borderRadius: ringW, backgroundColor: '#00E373' },
            ring1Style,
          ]}
        />
        <Animated.View
          style={[
            { position: 'absolute', width: ringW, height: ringH, borderRadius: ringW, backgroundColor: '#00E373' },
            ring2Style,
          ]}
        />
      </View>

      {/* Pin com entrada + bounce */}
      <Animated.View style={entryStyle}>
        <Animated.View style={bounceStyle}>
          <RunexLogo size={size} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}
