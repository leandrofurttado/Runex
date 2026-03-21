import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Fonts } from '@/constants/fonts';

function StatCard({
  icon,
  value,
  label,
  colors,
}: {
  icon: string;
  value: string | number;
  label: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.primaryBorder }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color: colors.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { profile, signOut } = useAuth();
  const { colors, isDark, toggleDark } = useTheme();
  const insets = useSafeAreaInsets();

  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;
  const xpForNext = level * 500;
  const xpPercent = Math.min((xp / xpForNext) * 100, 100);

  const horizontalPadding = Math.max(20, insets.left, insets.right);
  const bottomPadding = Math.max(40, insets.bottom + 24);
  const topPadding = Math.max(16, insets.top);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: horizontalPadding,
            paddingTop: topPadding,
            paddingBottom: bottomPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.appTitle, { color: colors.primary, textShadowColor: colors.primary }]}>
              RUNEX
            </Text>
            <Text style={[styles.appSubtitle, { color: colors.textMuted }]}>DASHBOARD</Text>
          </View>
          <View style={styles.topBarActions}>
            <TouchableOpacity
              onPress={toggleDark}
              style={[styles.themeBtn, { borderColor: colors.border }]}
            >
              <Text style={styles.themeBtnText}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={signOut}
              style={[styles.logoutBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.logoutText, { color: colors.textMuted }]}>↪ Sair</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Player card */}
        <View style={[styles.playerCard, { backgroundColor: colors.surface, borderColor: colors.primaryBorder }]}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primaryDim, borderColor: colors.primaryBorder }]}>
            <Ionicons name="person" size={48} color={colors.primary} />
          </View>
          <View style={styles.playerInfo}>
            <Text style={[styles.nickname, { color: colors.text }]}>{profile?.nickname ?? 'Corredor'}</Text>
            <View style={[styles.levelBadge, { backgroundColor: colors.primaryDim, borderColor: colors.primaryBorder }]}>
              <Text style={[styles.levelBadgeText, { color: colors.accent }]}>🏆 Nível {level}</Text>
            </View>
          </View>
        </View>

        {/* XP bar */}
        <View style={[styles.xpCard, { backgroundColor: colors.surface, borderColor: colors.primaryBorder }]}>
          <View style={styles.xpHeader}>
            <Text style={[styles.xpTitle, { color: colors.textMuted }]}>⚡ Experiência</Text>
            <Text style={[styles.xpNumbers, { color: colors.primary }]}>
              {xp} / {xpForNext} XP
            </Text>
          </View>
          <View style={[styles.xpBarBg, { backgroundColor: colors.surfaceElevated }]}>
            <View style={[styles.xpBarFill, { width: `${xpPercent}%`, backgroundColor: colors.accent }]} />
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsRow}>
          <StatCard icon="🗺️" value={0} label="Corridas" colors={colors} />
          <StatCard icon="📍" value="0 km" label="Distância" colors={colors} />
          <StatCard icon="⏱️" value="0h" label="Tempo" colors={colors} />
        </View>

        {/* Start button */}
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
          onPress={() => router.push('/(app)/run')}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnEmoji}>🏃</Text>
          <Text style={styles.startBtnText}>COMEÇAR A CORRER</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appTitle: {
    fontSize: 24,
    letterSpacing: 3,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    fontFamily: Fonts.bold,
  },
  appSubtitle: {
    fontSize: 10,
    letterSpacing: 3,
    marginTop: 2,
    fontFamily: Fonts.medium,
  },
  themeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  themeBtnText: {
    fontSize: 18,
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  playerInfo: {
    flex: 1,
  },
  nickname: {
    fontSize: 20,
    marginBottom: 6,
    fontFamily: Fonts.bold,
  },
  levelBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  levelBadgeText: {
    fontWeight: 'bold',
    fontSize: 13,
    fontFamily: Fonts.bold,
  },
  xpCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  xpTitle: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
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
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontFamily: Fonts.bold,
  },
  statLabel: {
    fontSize: 10,
    marginTop: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: Fonts.medium,
  },
  startBtn: {
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 22,
    elevation: 10,
  },
  startBtnEmoji: {
    fontSize: 22,
  },
  startBtnText: {
    color: '#000000',
    fontSize: 17,
    letterSpacing: 2,
    fontFamily: Fonts.bold,
  },
});
