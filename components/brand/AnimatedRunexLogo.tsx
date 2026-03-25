import React, { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { RunexLogo } from '@/components/brand/RunexLogo';

type Props = {
  size?: number;
  containerStyle?: StyleProp<ViewStyle>;
};

/**
 * Logo SVG do login com movimento suave (flutuar + respiração em escala).
 */
export function AnimatedRunexLogo({ size = 180, containerStyle }: Props) {
  const driftY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    driftY.value = withRepeat(
      withSequence(
        withTiming(-8, {
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(8, {
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
        })
      ),
      -1,
      false
    );

    scale.value = withRepeat(
      withTiming(1.06, {
        duration: 2600,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: driftY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, containerStyle]}>
      <RunexLogo size={size} />
    </Animated.View>
  );
}
