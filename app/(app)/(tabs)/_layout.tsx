import React, { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { RunexTabBar } from '@/components/navigation/RunexTabBar';
import { useTheme } from '@/contexts/ThemeContext';

export default function AppTabsLayout() {
  const { colors } = useTheme();

  const tabBarStyle = useMemo(
    () => ({
      position: 'absolute' as const,
      left: 0,
      right: 0,
      bottom: 0,
      /** Android/React Navigation: transparent deixa o fundo nativo branco; usar o BG do tema. */
      backgroundColor: colors.background,
      borderTopWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
    }),
    [colors.background]
  );

  return (
    <Tabs
      initialRouteName="index"
      tabBar={(props) => <RunexTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Início',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Meu Perfil',
          tabBarLabel: 'Perfil',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Histórico',
          tabBarLabel: 'Histórico',
        }}
      />
    </Tabs>
  );
}
