import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface PlayerPosition {
  userId: string;
  nickname: string;
  level: number;
  lng: number;
  lat: number;
  heading: number;
  timestamp: number;
}

export interface OtherPlayer {
  userId: string;
  nickname: string;
  level: number;
  lng: number;
  lat: number;
  heading: number;
  lastSeen: number;
}

const BROADCAST_INTERVAL = 3000;
const PLAYER_TIMEOUT = 10000;
const PROXIMITY_KM = 5;

function haversineKm(a: [number, number], b: [number, number]): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function useMultiplayer(
  userLocation: [number, number] | null,
  heading: number
) {
  const { user, profile } = useAuth();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const playersRef = useRef<Map<string, OtherPlayer>>(new Map());
  const broadcastIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const cleanupIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const onPlayersChangeRef = useRef<((players: OtherPlayer[]) => void) | null>(null);
  const userLocationRef = useRef<[number, number] | null>(null);

  useEffect(() => {
    userLocationRef.current = userLocation;
  }, [userLocation]);

  const notifyChange = useCallback(() => {
    const loc = userLocationRef.current;
    if (!onPlayersChangeRef.current || !loc) return;
    const now = Date.now();
    const nearby: OtherPlayer[] = [];
    playersRef.current.forEach((p) => {
      if (now - p.lastSeen > PLAYER_TIMEOUT) {
        playersRef.current.delete(p.userId);
        return;
      }
      const dist = haversineKm(loc, [p.lng, p.lat]);
      if (dist <= PROXIMITY_KM) nearby.push(p);
    });
    onPlayersChangeRef.current(nearby);
  }, []);

  const notifyChangeRef = useRef(notifyChange);
  useEffect(() => {
    notifyChangeRef.current = notifyChange;
  }, [notifyChange]);

  const subscribe = useCallback(
    (onPlayersChange: (players: OtherPlayer[]) => void) => {
      onPlayersChangeRef.current = onPlayersChange;
      if (!user || channelRef.current) return;

      const channel = supabase.channel('player-positions', {
        config: { broadcast: { self: false } },
      });

      channel
        .on('broadcast', { event: 'position' }, ({ payload }) => {
          const pos = payload as PlayerPosition;
          if (pos.userId === user.id) return;
          playersRef.current.set(pos.userId, { ...pos, lastSeen: Date.now() });
          notifyChangeRef.current();
        })
        .subscribe();

      channelRef.current = channel;

      cleanupIntervalRef.current = setInterval(() => {
        notifyChangeRef.current();
      }, 5000);
    },
    [user]
  );

  // Broadcast own position
  useEffect(() => {
    if (!user || !profile || !userLocation || !channelRef.current) return;
    if (broadcastIntervalRef.current) clearInterval(broadcastIntervalRef.current);

    const broadcast = () => {
      const loc = userLocationRef.current;
      if (!channelRef.current || !loc) return;
      channelRef.current.send({
        type: 'broadcast',
        event: 'position',
        payload: {
          userId: user.id,
          nickname: profile.nickname,
          level: profile.level,
          lng: loc[0],
          lat: loc[1],
          heading,
          timestamp: Date.now(),
        } as PlayerPosition,
      });
    };

    broadcast();
    broadcastIntervalRef.current = setInterval(broadcast, BROADCAST_INTERVAL);

    return () => {
      if (broadcastIntervalRef.current) clearInterval(broadcastIntervalRef.current);
    };
  }, [user, profile, userLocation, heading]);

  useEffect(() => {
    return () => {
      channelRef.current?.unsubscribe();
      channelRef.current = null;
      if (broadcastIntervalRef.current) clearInterval(broadcastIntervalRef.current);
      if (cleanupIntervalRef.current) clearInterval(cleanupIntervalRef.current);
    };
  }, []);

  return { subscribe };
}
