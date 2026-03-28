import type { LineString } from 'geojson';
import { supabase } from '@/lib/supabase';

export type RunRow = {
  id: string;
  user_id: string;
  distance_meters: number;
  duration_seconds: number;
  started_at: string;
  ended_at: string;
  route_geojson: LineString | null;
  created_at: string;
};

export type RunPeriod = '7d' | '30d' | '90d' | 'all';

export function periodStartIso(period: RunPeriod): string | null {
  if (period === 'all') return null;
  const d = new Date();
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export type RunStatsAggregate = {
  runCount: number;
  totalDistanceM: number;
  totalDurationSec: number;
};

export function aggregateRuns(runs: RunRow[]): RunStatsAggregate {
  let totalDistanceM = 0;
  let totalDurationSec = 0;
  for (const r of runs) {
    totalDistanceM += Number(r.distance_meters) || 0;
    totalDurationSec += Number(r.duration_seconds) || 0;
  }
  return {
    runCount: runs.length,
    totalDistanceM,
    totalDurationSec,
  };
}

export function formatDistanceKm(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

export function formatDurationHuman(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

export async function fetchRunsForUser(userId: string, fromIso: string | null): Promise<RunRow[]> {
  let q = supabase
    .from('runs')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false });
  if (fromIso) q = q.gte('started_at', fromIso);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as RunRow[];
}

export type SaveRunInput = {
  userId: string;
  distanceMeters: number;
  durationSeconds: number;
  startedAt: Date;
  endedAt: Date;
  routeCoordinates: [number, number][];
};

export async function saveRun(input: SaveRunInput): Promise<void> {
  const route_geojson: LineString | null =
    input.routeCoordinates.length >= 2
      ? { type: 'LineString', coordinates: input.routeCoordinates }
      : null;

  const { error } = await supabase.from('runs').insert({
    user_id: input.userId,
    distance_meters: Math.round(input.distanceMeters * 100) / 100,
    duration_seconds: Math.max(0, Math.round(input.durationSeconds)),
    started_at: input.startedAt.toISOString(),
    ended_at: input.endedAt.toISOString(),
    route_geojson,
  });
  if (error) throw error;
}
