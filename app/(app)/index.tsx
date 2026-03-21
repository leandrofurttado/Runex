import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

function StatCard({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { profile, signOut } = useAuth();

  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;
  const xpForNext = level * 500;
  const xpPercent = Math.min((xp / xpForNext) * 100, 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.appTitle}>RUN QUEST</Text>
            <Text style={styles.appSubtitle}>DASHBOARD</Text>
          </View>
          <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>↪ Sair</Text>
          </TouchableOpacity>
        </View>

        {/* Player card */}
        <View style={styles.playerCard}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={48} color={Colors.neonGreen} />
          </View>
          <View style={styles.playerInfo}>
          <Text style={styles.nickname}>{profile?.nickname ?? 'Corredor'}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>🏆 Nível {level}</Text>
          </View>
          </View>
        </View>

        {/* XP bar */}
        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpTitle}>⚡ Experiência</Text>
            <Text style={styles.xpNumbers}>
              {xp} / {xpForNext} XP
            </Text>
          </View>
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: `${xpPercent}%` }]} />
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsRow}>
          <StatCard icon="🗺️" value={0} label="Corridas" />
          <StatCard icon="📍" value="0 km" label="Distância" />
          <StatCard icon="⏱️" value="0h" label="Tempo" />
        </View>

        {/* Start button */}
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => router.push('/(app)/run')}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnEmoji}>🏃</Text>
          <Text style={styles.startBtnText}>COMEÇAR A CORRER</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  appTitle: {
    color: Colors.neonGreen,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 3,
    textShadowColor: Colors.neonGreen,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  appSubtitle: {
    color: Colors.textMuted,
    fontSize: 10,
    letterSpacing: 3,
    marginTop: 2,
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoutText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.neonGreenBorder,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.neonGreenDim,
    borderWidth: 1,
    borderColor: Colors.neonGreenBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  playerInfo: {
    flex: 1,
  },
  nickname: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  levelBadge: {
    backgroundColor: Colors.neonGreenDim,
    borderWidth: 1,
    borderColor: Colors.neonGreenBorder,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  levelBadgeText: {
    color: Colors.neonYellow,
    fontWeight: 'bold',
    fontSize: 13,
  },
  xpCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.neonGreenBorder,
    marginBottom: 14,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  xpTitle: {
    color: Colors.textMuted,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  xpNumbers: {
    color: Colors.neonGreen,
    fontSize: 12,
    fontWeight: '700',
  },
  xpBarBg: {
    height: 10,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 5,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: Colors.neonYellow,
    borderRadius: 5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neonGreenBorder,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    color: Colors.neonGreen,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  startBtn: {
    backgroundColor: Colors.neonGreen,
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: Colors.neonGreen,
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
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
