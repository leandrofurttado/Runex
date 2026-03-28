import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Fonts } from '@/constants/fonts';

type RouteName = 'index' | 'profile' | 'history';

const LABELS: Record<RouteName, string> = {
  index: 'Início',
  profile: 'Perfil',
  history: 'Histórico',
};

const TAGLINES: Record<RouteName, string> = {
  index: 'sua base',
  profile: 'você',
  history: 'suas runs',
};

function tabIcon(name: RouteName, focused: boolean, color: string, size: number) {
  switch (name) {
    case 'index':
      return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
    case 'profile':
      return (
        <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={size + 2} color={color} />
      );
    case 'history':
      return <Ionicons name={focused ? 'trophy' : 'trophy-outline'} size={size} color={color} />;
    default:
      return <Ionicons name="ellipse-outline" size={size} color={color} />;
  }
}

export function RunexTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const { colors, isDark } = useTheme();
  const bottomPad = Math.max(insets.bottom, 10);

  return (
    <View
      style={[styles.outer, { paddingBottom: bottomPad, backgroundColor: colors.background }]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.dock,
          {
            backgroundColor: isDark ? colors.surfaceElevated : 'rgba(255,255,255,0.96)',
            borderColor: colors.primaryBorder,
            shadowColor: isDark ? colors.primary : '#000',
          },
        ]}
      >
        {/* Brilho superior sutil (cultura neon Runex) */}
        <View style={[styles.dockGlow, { backgroundColor: colors.primary }]} pointerEvents="none" />

        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const routeName = route.name as RouteName;
          const label = (options.tabBarLabel as string) ?? LABELS[routeName] ?? route.name;
          const tagline = TAGLINES[routeName] ?? '';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const iconColor = focused ? colors.primary : colors.textMuted;
          const iconSize = focused ? 24 : 22;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [styles.tabPress, pressed && styles.tabPressPressed]}
              android_ripple={{ color: isDark ? 'rgba(0,227,115,0.15)' : 'rgba(0,227,115,0.22)' }}
            >
              <View
                style={[
                  styles.tabInner,
                  focused && {
                    backgroundColor: colors.primaryDim,
                    borderColor: colors.primary,
                  },
                ]}
              >
                <View style={styles.iconRow}>
                  {tabIcon(routeName, focused, iconColor, iconSize)}
                  {focused ? (
                    <View style={[styles.accentUnderline, { backgroundColor: colors.accent }]} />
                  ) : (
                    <View style={styles.accentUnderlinePlaceholder} />
                  )}
                </View>
                <Text
                  style={[
                    styles.label,
                    {
                      color: focused ? colors.primary : colors.textMuted,
                      fontFamily: focused ? Fonts.bold : Fonts.semiBold,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
                <Text
                  style={[styles.tagline, { color: focused ? colors.textMuted : colors.textDim }]}
                  numberOfLines={1}
                >
                  {tagline}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    borderRadius: 28,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 6,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.22,
        shadowRadius: 20,
      },
      android: {
        elevation: 14,
      },
    }),
  },
  dockGlow: {
    position: 'absolute',
    top: 0,
    left: '12%',
    right: '12%',
    height: 2,
    borderRadius: 2,
    opacity: 0.45,
  },
  tabPress: {
    flex: 1,
    maxWidth: '34%',
  },
  tabPressPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 72,
  },
  iconRow: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 30,
    marginBottom: 2,
  },
  accentUnderline: {
    marginTop: 5,
    width: 22,
    height: 3,
    borderRadius: 2,
    opacity: 0.95,
  },
  accentUnderlinePlaceholder: {
    marginTop: 5,
    height: 3,
    width: 22,
  },
  label: {
    fontSize: 12,
    letterSpacing: 0.2,
    marginTop: 2,
  },
  tagline: {
    fontSize: 9,
    letterSpacing: 0.4,
    marginTop: 2,
    textTransform: 'lowercase',
    fontFamily: Fonts.medium,
    opacity: 0.95,
  },
});
