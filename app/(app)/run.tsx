import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiplayer, type OtherPlayer } from '@/hooks/useMultiplayer';
import { Colors } from '@/constants/colors';
import {
  MAPBOX_STYLE_URL,
  MAPBOX_SUMMARY_STYLE_URL,
  MAPBOX_STANDARD_STYLE_IMPORT_CONFIG,
} from '@/constants/mapStyle';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';
MapboxGL.setAccessToken(MAPBOX_TOKEN);

/** Enquadramento quando parado (prévia). */
const MAP_IDLE_ZOOM = 16.5;
const MAP_IDLE_PITCH = 52;

/** Zoom moderado durante a corrida (um pouco mais perto, sem exagero). */
const MAP_RUN_ZOOM = 17.5;
const MAP_RUN_PITCH = 58;

function haversineM(a: [number, number], b: [number, number]): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Interpola ângulos em graus (evita saltos 359→1). */
function smoothHeading(prev: number, next: number, alpha: number): number {
  let diff = ((next - prev + 540) % 360) - 180;
  return (prev + alpha * diff + 360) % 360;
}

export default function RunMapScreen() {
  const { profile } = useAuth();
  const cameraRef = useRef<MapboxGL.Camera>(null);

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [heading, setHeading] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [nearbyPlayers, setNearbyPlayers] = useState<OtherPlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<OtherPlayer | null>(null);
  const [runSeconds, setRunSeconds] = useState(0);
  const [runDistanceM, setRunDistanceM] = useState(0);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [isRouteSummaryView, setIsRouteSummaryView] = useState(false);

  const isRunningRef = useRef(false);
  const routeCoordsRef = useRef<[number, number][]>([]);
  const lastHeadingRef = useRef(0);
  const lastPointRef = useRef<[number, number] | null>(null);
  const lastPreviewCenterRef = useRef<[number, number] | null>(null);
  const distanceAccRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runSecondsRef = useRef(0);

  const { subscribe } = useMultiplayer(userLocation, heading);

  useEffect(() => {
    subscribe(setNearbyPlayers);
  }, [subscribe]);

  const stopRunInternal = useCallback(() => {
    setIsRunning(false);
    isRunningRef.current = false;
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    lastPointRef.current = null;
  }, []);

  const startRun = useCallback(() => {
    if (!userLocation) {
      Alert.alert('GPS', 'Aguardando sua localização. Tente de novo em instantes.');
      return;
    }
    distanceAccRef.current = 0;
    lastPointRef.current = userLocation;
    routeCoordsRef.current = [userLocation];
    setRouteCoordinates([userLocation]);
    setRunDistanceM(0);
    setRunSeconds(0);
    runSecondsRef.current = 0;
    setIsRouteSummaryView(false);
    setIsRunning(true);
    isRunningRef.current = true;

    tickRef.current = setInterval(() => {
      runSecondsRef.current += 1;
      setRunSeconds(runSecondsRef.current);
    }, 1000);

    cameraRef.current?.setCamera({
      centerCoordinate: userLocation,
      zoomLevel: MAP_RUN_ZOOM,
      pitch: MAP_RUN_PITCH,
      heading: lastHeadingRef.current,
      animationMode: 'easeTo',
      animationDuration: 600,
    });
  }, [userLocation]);

  const stopRun = useCallback(() => {
    const route = routeCoordsRef.current;
    stopRunInternal();
    const dist = distanceAccRef.current;
    const secs = runSecondsRef.current;
    if (dist > 10 || secs > 5) {
      Alert.alert(
        'Corrida pausada',
        `Distância: ${dist < 1000 ? `${Math.round(dist)} m` : `${(dist / 1000).toFixed(2)} km`}\nTempo: ${formatDuration(secs)}`
      );
    }
    if (route.length >= 2) {
      const lngs = route.map((c) => c[0]);
      const lats = route.map((c) => c[1]);
      let minLng = Math.min(...lngs);
      let maxLng = Math.max(...lngs);
      let minLat = Math.min(...lats);
      let maxLat = Math.max(...lats);
      const minSpan = 0.0004;
      if (maxLng - minLng < minSpan) {
        const c = (minLng + maxLng) / 2;
        minLng = c - minSpan / 2;
        maxLng = c + minSpan / 2;
      }
      if (maxLat - minLat < minSpan) {
        const c = (minLat + maxLat) / 2;
        minLat = c - minSpan / 2;
        maxLat = c + minSpan / 2;
      }
      const ne: [number, number] = [maxLng, maxLat];
      const sw: [number, number] = [minLng, minLat];
      setIsRouteSummaryView(true);
      setTimeout(() => {
        cameraRef.current?.setCamera({
          bounds: { ne, sw },
          padding: { paddingTop: 80, paddingBottom: 80, paddingLeft: 80, paddingRight: 80 },
          pitch: 0,
          animationMode: 'easeTo',
          animationDuration: 900,
        });
      }, 150);
    } else if (userLocation) {
      cameraRef.current?.setCamera({
        centerCoordinate: userLocation,
        zoomLevel: MAP_IDLE_ZOOM,
        pitch: MAP_IDLE_PITCH,
        heading: lastHeadingRef.current,
        animationMode: 'easeTo',
        animationDuration: 700,
      });
    }
  }, [stopRunInternal, userLocation]);

  const recenterOnMe = useCallback(() => {
    if (!userLocation) {
      Alert.alert('GPS', 'Ainda sem posição. Aguarde o sinal do GPS.');
      return;
    }
    const h = lastHeadingRef.current;
    if (!isRunning) {
      lastPreviewCenterRef.current = userLocation;
      if (isRouteSummaryView) {
        setIsRouteSummaryView(false);
      }
    }
    cameraRef.current?.setCamera({
      centerCoordinate: userLocation,
      zoomLevel: isRunning ? MAP_RUN_ZOOM : MAP_IDLE_ZOOM,
      pitch: isRunning ? MAP_RUN_PITCH : MAP_IDLE_PITCH,
      heading: h,
      animationMode: 'flyTo',
      animationDuration: 500,
    });
  }, [userLocation, isRunning, isRouteSummaryView]);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'O app precisa da localização para a corrida.');
        return;
      }

      if (Platform.OS === 'android') {
        try {
          await MapboxGL.requestAndroidLocationPermissions();
        } catch {
          /* já concedido via Expo ou falha secundária */
        }
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 800,
          distanceInterval: 1,
        },
        (loc) => {
          const { longitude, latitude, heading: h } = loc.coords;
          const speed = loc.coords.speed;
          const coords: [number, number] = [longitude, latitude];
          setUserLocation(coords);

          const prev = lastPointRef.current;

          if (isRunningRef.current) {
            let proposed = lastHeadingRef.current;
            if (prev) {
              const step = haversineM(prev, coords);
              const movingFast = speed != null && speed > 0.55;
              if (movingFast && step > 0.15) {
                proposed = bearingDeg(prev, coords);
              } else if (step > 1.0) {
                proposed = bearingDeg(prev, coords);
              } else if (h != null && !Number.isNaN(h) && h >= 0) {
                proposed = h;
              }
            } else if (h != null && !Number.isNaN(h) && h >= 0) {
              proposed = h;
            }

            const smoothed = smoothHeading(lastHeadingRef.current, proposed, 0.45);
            lastHeadingRef.current = smoothed;
            setHeading(smoothed);

            if (prev) {
              const step = haversineM(prev, coords);
              if (step > 1 && step < 80) {
                distanceAccRef.current += step;
                setRunDistanceM(distanceAccRef.current);
              }
            }
            lastPointRef.current = coords;

            const route = routeCoordsRef.current;
            const lastRoute = route[route.length - 1];
            const shouldAddPoint = !lastRoute || haversineM(lastRoute, coords) > 2;
            if (shouldAddPoint) {
              routeCoordsRef.current = [...route, coords];
              setRouteCoordinates(routeCoordsRef.current);
            }

            cameraRef.current?.setCamera({
              centerCoordinate: coords,
              zoomLevel: MAP_RUN_ZOOM,
              pitch: MAP_RUN_PITCH,
              heading: smoothed,
              animationMode: 'linearTo',
              animationDuration: 240,
            });
          } else {
            let course = lastHeadingRef.current;
            if (h != null && !Number.isNaN(h) && h >= 0) {
              course = h;
              setHeading(h);
              lastHeadingRef.current = h;
            } else if (prev) {
              const d = haversineM(prev, coords);
              if (d > 3) {
                const bearing = bearingDeg(prev, coords);
                course = bearing;
                lastHeadingRef.current = bearing;
                setHeading(bearing);
              }
            }

            lastPointRef.current = coords;
            const prevC = lastPreviewCenterRef.current;
            const moved = !prevC || haversineM(prevC, coords) > 12;
            if (moved) {
              lastPreviewCenterRef.current = coords;
              cameraRef.current?.setCamera({
                centerCoordinate: coords,
                zoomLevel: MAP_IDLE_ZOOM,
                pitch: MAP_IDLE_PITCH,
                heading: course,
                animationMode: 'easeTo',
                animationDuration: 800,
              });
            }
          }
        }
      );
    };

    startTracking();
    return () => {
      subscription?.remove();
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={isRouteSummaryView ? MAPBOX_SUMMARY_STYLE_URL : MAPBOX_STYLE_URL}
        logoEnabled={false}
        attributionEnabled={false}
        compassEnabled
        compassViewPosition={3}
        scaleBarEnabled={false}
        surfaceView={Platform.OS === 'android'}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: userLocation ?? [-43.1729, -22.9068],
            zoomLevel: MAP_IDLE_ZOOM,
            pitch: MAP_IDLE_PITCH,
          }}
        />

        {!isRouteSummaryView && (
          <MapboxGL.StyleImport
            id="basemap"
            existing
            config={MAPBOX_STANDARD_STYLE_IMPORT_CONFIG}
          />
        )}

        {routeCoordinates.length >= 2 && (
          <MapboxGL.ShapeSource
            id="route-trail"
            shape={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: routeCoordinates,
              },
            }}
          >
            <MapboxGL.LineLayer
              id="route-trail-layer"
              style={{
                lineColor: Colors.neonGreen,
                lineWidth: 6,
                lineJoin: 'round',
                lineCap: 'round',
              }}
            />
          </MapboxGL.ShapeSource>
        )}

        {userLocation ? (
          <>
            <MapboxGL.CustomLocationProvider
              coordinate={userLocation}
              heading={heading}
            />
            <MapboxGL.LocationPuck
              visible
              pulsing={{
                isEnabled: true,
                color: Colors.neonGreen,
                radius: 28,
              }}
              puckBearingEnabled
              puckBearing="heading"
              scale={1.25}
            />
          </>
        ) : null}

        {nearbyPlayers.map((player) => (
          <MapboxGL.MarkerView
            key={player.userId}
            coordinate={[player.lng, player.lat]}
            id={`player-${player.userId}`}
          >
            <TouchableOpacity
              style={styles.playerMarker}
              onPress={() => setSelectedPlayer(player)}
            >
              <View style={styles.playerMarkerRing}>
                <Text style={styles.playerEmoji}>🏃</Text>
              </View>
              <Text style={styles.playerLabel} numberOfLines={1}>
                {player.nickname}
              </Text>
            </TouchableOpacity>
          </MapboxGL.MarkerView>
        ))}
      </MapboxGL.MapView>

      <SafeAreaView style={styles.backArea} pointerEvents="box-none">
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <SafeAreaView style={styles.hudArea} pointerEvents="box-none">
        <View style={styles.hudCard}>
          <Text style={styles.hudNick}>{profile?.nickname ?? 'Corredor'}</Text>
          <Text style={styles.hudSub}>
            Nv.{profile?.level ?? 1} · {nearbyPlayers.length} por perto
          </Text>
        </View>
      </SafeAreaView>

      {isRunning && (
        <View style={styles.statsRow} pointerEvents="none">
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>TEMPO</Text>
            <Text style={styles.statValue}>{formatDuration(runSeconds)}</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>DISTÂNCIA</Text>
            <Text style={styles.statValue}>
              {runDistanceM < 1000
                ? `${Math.round(runDistanceM)} m`
                : `${(runDistanceM / 1000).toFixed(2)} km`}
            </Text>
          </View>
        </View>
      )}

      {nearbyPlayers.length > 0 && !isRunning && (
        <SafeAreaView style={styles.playerListArea} pointerEvents="box-none">
          <View style={styles.playerList}>
            {nearbyPlayers.slice(0, 4).map((p) => (
              <TouchableOpacity
                key={p.userId}
                style={styles.playerListItem}
                onPress={() => setSelectedPlayer(p)}
              >
                <Text style={styles.playerListEmoji}>🏃</Text>
                <Text style={styles.playerListNick}>{p.nickname}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      )}

      <SafeAreaView style={styles.recenterArea} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.recenterBtn}
          onPress={recenterOnMe}
          activeOpacity={0.85}
          accessibilityLabel="Centralizar no meu local"
        >
          <Text style={styles.recenterEmoji}>📍</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <SafeAreaView style={styles.controlsArea} pointerEvents="box-none">
        <View style={styles.controlsInner}>
          {!isRunning ? (
            <TouchableOpacity style={styles.btnStart} onPress={startRun} activeOpacity={0.9}>
              <Text style={styles.btnStartIcon}>▶</Text>
              <Text style={styles.btnStartText}>INICIAR CORRIDA</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.btnStop} onPress={stopRun} activeOpacity={0.9}>
              <Text style={styles.btnStopIcon}>■</Text>
              <Text style={styles.btnStopText}>PARAR</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {selectedPlayer && (
        <View style={styles.modalOverlay}>
          <View style={styles.playerModal}>
            <Text style={styles.playerModalTitle}>🏃 {selectedPlayer.nickname}</Text>
            <View style={styles.playerModalRow}>
              <Text style={styles.playerModalRowLabel}>Nível</Text>
              <Text style={styles.playerModalRowValue}>Nv.{selectedPlayer.level}</Text>
            </View>
            {userLocation && (
              <View style={styles.playerModalRow}>
                <Text style={styles.playerModalRowLabel}>Distância</Text>
                <Text style={styles.playerModalRowValue}>
                  {(() => {
                    const d = haversineM(userLocation, [selectedPlayer.lng, selectedPlayer.lat]);
                    return d < 1000 ? `${Math.round(d)} m` : `${(d / 1000).toFixed(1)} km`;
                  })()}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.playerModalClose}
              onPress={() => setSelectedPlayer(null)}
            >
              <Text style={styles.playerModalCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

function bearingDeg(a: [number, number], b: [number, number]): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const toDeg = (x: number) => (x * 180) / Math.PI;
  const dLon = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  map: {
    flex: 1,
  },
  backArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'box-none',
  },
  backBtn: {
    margin: 14,
    marginTop: Platform.OS === 'ios' ? 6 : 14,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  hudArea: {
    position: 'absolute',
    top: 0,
    right: 0,
    pointerEvents: 'none',
  },
  hudCard: {
    margin: 14,
    marginTop: Platform.OS === 'ios' ? 6 : 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 2,
    borderColor: 'rgba(255,220,100,0.45)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'flex-end',
    shadowColor: '#ffcc00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  hudNick: {
    color: '#ffeb3b',
    fontWeight: '800',
    fontSize: 14,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  hudSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  statsRow: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 88 : 78,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  statPill: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: 'rgba(0,255,180,0.5)',
    minWidth: 120,
    alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  statValue: {
    color: '#00ffaa',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  playerListArea: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 88,
    right: 10,
    pointerEvents: 'box-none',
  },
  playerList: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    maxWidth: 140,
  },
  playerListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  playerListEmoji: {
    fontSize: 16,
  },
  playerListNick: {
    color: '#ffeb3b',
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  recenterArea: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    pointerEvents: 'box-none',
    paddingBottom: Platform.OS === 'ios' ? 118 : 102,
    paddingRight: 14,
  },
  recenterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.58)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 8,
  },
  recenterEmoji: {
    fontSize: 22,
  },
  controlsArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    pointerEvents: 'box-none',
  },
  controlsInner: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 28 : 20,
    paddingTop: 12,
  },
  btnStart: {
    backgroundColor: '#00c853',
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  btnStartIcon: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
  btnStartText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1,
  },
  btnStop: {
    backgroundColor: '#d32f2f',
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.45)',
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 12,
  },
  btnStopIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  btnStopText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 2,
  },
  playerMarker: {
    alignItems: 'center',
  },
  playerMarkerRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,235,59,0.95)',
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  playerEmoji: {
    fontSize: 22,
  },
  playerLabel: {
    marginTop: 2,
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    maxWidth: 72,
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  playerModal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 22,
    width: '100%',
    maxWidth: 300,
    borderWidth: 2,
    borderColor: 'rgba(255,235,59,0.5)',
  },
  playerModalTitle: {
    color: '#ffeb3b',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  playerModalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  playerModalRowLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  playerModalRowValue: {
    color: '#00ffaa',
    fontWeight: '800',
    fontSize: 14,
  },
  playerModalClose: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  playerModalCloseText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
