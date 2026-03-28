import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Fonts } from '@/constants/fonts';
import { TAB_BAR_SCROLL_BOTTOM_PADDING } from '@/constants/tabBar';

export default function ProfileScreen() {
  const { profile, user, signOut } = useAuth();
  const { colors, isDark, toggleDark } = useTheme();
  const insets = useSafeAreaInsets();

  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;
  const xpForNext = level * 500;
  const xpPercent = Math.min((xp / xpForNext) * 100, 100);

  const horizontalPadding = Math.max(20, insets.left, insets.right);
  const topPadding = Math.max(20, insets.top + 16);
  const bottomPadding = Math.max(32, insets.bottom + 24) + TAB_BAR_SCROLL_BOTTOM_PADDING;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: topPadding,
          paddingBottom: bottomPadding,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.primary }]}>Meu perfil</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Dados da sua conta Runex</Text>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primaryBorder }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primaryDim, borderColor: colors.primaryBorder }]}>
            <Ionicons name="person" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.nickname, { color: colors.text }]}>{profile?.nickname ?? 'Corredor'}</Text>
          {user?.email ? (
            <Text style={[styles.email, { color: colors.textMuted }]}>{user.email}</Text>
          ) : null}
          <View style={[styles.badge, { backgroundColor: colors.primaryDim, borderColor: colors.primaryBorder }]}>
            <Text style={[styles.badgeText, { color: colors.accent }]}>Nível {level}</Text>
          </View>
        </View>

        <View style={[styles.xpCard, { backgroundColor: colors.surface, borderColor: colors.primaryBorder }]}>
          <View style={styles.xpRow}>
            <Text style={[styles.xpLabel, { color: colors.textMuted }]}>Experiência</Text>
            <Text style={[styles.xpNumbers, { color: colors.primary }]}>
              {xp} / {xpForNext} XP
            </Text>
          </View>
          <View style={[styles.xpBarBg, { backgroundColor: colors.surfaceElevated }]}>
            <View style={[styles.xpBarFill, { width: `${xpPercent}%`, backgroundColor: colors.accent }]} />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.rowBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={toggleDark}
          accessibilityLabel={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
        >
          <Ionicons name={isDark ? 'sunny' : 'moon'} size={22} color={colors.primary} />
          <Text style={[styles.rowBtnText, { color: colors.text }]}>Tema {isDark ? 'escuro' : 'claro'}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.signOut, { backgroundColor: colors.surfaceElevated, borderColor: colors.error }]}
          onPress={() => signOut()}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={[styles.signOutText, { color: colors.error }]}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontFamily: Fonts.bold,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 22,
    fontFamily: Fonts.medium,
  },
  card: {
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  nickname: {
    fontSize: 22,
    fontFamily: Fonts.bold,
  },
  email: {
    fontSize: 13,
    marginTop: 6,
    fontFamily: Fonts.regular,
  },
  badge: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
  },
  xpCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  xpLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: Fonts.medium,
  },
  xpNumbers: {
    fontSize: 12,
    fontFamily: Fonts.bold,
  },
  xpBarBg: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  rowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  rowBtnText: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
});
