import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { Fonts } from '@/constants/fonts';
import { useUserRuns, type RunPeriod } from '@/hooks/useUserRuns';
import { aggregateRuns, formatDistanceKm, formatDurationHuman } from '@/lib/runs';
import { TAB_BAR_SCROLL_BOTTOM_PADDING } from '@/constants/tabBar';

const PERIODS: { key: RunPeriod; label: string }[] = [
  { key: '7d', label: '7 dias' },
  { key: '30d', label: '30 dias' },
  { key: '90d', label: '90 dias' },
  { key: 'all', label: 'Tudo' },
];

export default function HistoryScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<RunPeriod>('30d');
  const { data: runs = [], isLoading, isError, refetch, isRefetching } = useUserRuns(period);

  const stats = useMemo(() => aggregateRuns(runs), [runs]);

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
        <Text style={[styles.title, { color: colors.primary }]}>Histórico</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Corridas, distância e tempo por período
        </Text>

        <View style={styles.periodRow}>
          {PERIODS.map((p) => {
            const active = period === p.key;
            return (
              <TouchableOpacity
                key={p.key}
                onPress={() => setPeriod(p.key)}
                style={[
                  styles.periodChip,
                  {
                    backgroundColor: active ? colors.primaryDim : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.periodChipText,
                    { color: active ? colors.primary : colors.textMuted, fontFamily: active ? Fonts.bold : Fonts.medium },
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity onPress={() => refetch()} disabled={isRefetching} style={styles.refreshWrap}>
          {isRefetching ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.refreshText, { color: colors.primary }]}>Atualizar</Text>
          )}
        </TouchableOpacity>

        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.muted, { color: colors.textMuted }]}>Carregando corridas…</Text>
          </View>
        ) : isError ? (
          <View style={[styles.emptyCard, { borderColor: colors.error, backgroundColor: colors.surface }]}>
            <Text style={[styles.emptyTitle, { color: colors.error }]}>Não foi possível carregar</Text>
            <Text style={[styles.muted, { color: colors.textMuted }]}>Verifique a conexão e tente de novo.</Text>
          </View>
        ) : (
          <>
            <View style={[styles.summary, { backgroundColor: colors.surface, borderColor: colors.primaryBorder }]}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Corridas</Text>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>{stats.runCount}</Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Distância</Text>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>
                  {formatDistanceKm(stats.totalDistanceM)}
                </Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Tempo</Text>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>
                  {formatDurationHuman(stats.totalDurationSec)}
                </Text>
              </View>
            </View>

            {runs.length === 0 ? (
              <View style={[styles.emptyCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhuma corrida</Text>
                <Text style={[styles.muted, { color: colors.textMuted }]}>
                  Neste período ainda não há registros. Inicie uma corrida no mapa.
                </Text>
              </View>
            ) : (
              runs.map((r) => (
                <View
                  key={r.id}
                  style={[styles.runRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={styles.runRowTop}>
                    <Text style={[styles.runDate, { color: colors.text }]}>
                      {new Date(r.started_at).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    <Text style={[styles.runDist, { color: colors.primary }]}>
                      {formatDistanceKm(Number(r.distance_meters))}
                    </Text>
                  </View>
                  <Text style={[styles.runMeta, { color: colors.textMuted }]}>
                    {formatDurationHuman(r.duration_seconds)}
                    {r.route_geojson ? ' · rota salva' : ''}
                  </Text>
                </View>
              ))
            )}
          </>
        )}
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
    marginBottom: 18,
    fontFamily: Fonts.medium,
  },
  periodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  periodChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  periodChipText: {
    fontSize: 12,
    letterSpacing: 0.3,
  },
  refreshWrap: {
    alignSelf: 'flex-end',
    marginBottom: 14,
    minHeight: 24,
    justifyContent: 'center',
  },
  refreshText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
  },
  summary: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    alignSelf: 'stretch',
    opacity: 0.6,
  },
  summaryLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontFamily: Fonts.medium,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    textAlign: 'center',
  },
  runRow: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  runRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  runDate: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    textTransform: 'capitalize',
  },
  runDist: {
    fontSize: 15,
    fontFamily: Fonts.bold,
  },
  runMeta: {
    fontSize: 12,
    marginTop: 6,
    fontFamily: Fonts.regular,
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: Fonts.bold,
    marginBottom: 8,
  },
  muted: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    lineHeight: 20,
  },
  centerBox: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
});
