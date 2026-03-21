/**
 * Mapbox Standard — prédios e vegetação 3D (mais próximo de Pokémon GO / mapa “vivo”).
 *
 * Requer SDK Mapbox recente (v11). Se der erro ao carregar, volte para streets-v12.
 *
 * Outras opções:
 * - `mapbox://styles/mapbox/streets-v12` — vetorial clássico, sem Standard.
 * - `mapbox://styles/mapbox/outdoors-v12` — natureza/trilhas.
 */
export const MAPBOX_STYLE_URL = 'mapbox://styles/mapbox/standard' as const;

/** Estilo satélite para visão “Resumo da corrida” (foto de cima). */
export const MAPBOX_SUMMARY_STYLE_URL =
  'mapbox://styles/mapbox/dark-v11' as const;

/** Config do import `basemap` (valores em string — exigência do StyleImport no RN). */
export const MAPBOX_STANDARD_STYLE_IMPORT_CONFIG: Record<string, string> = {
  lightPreset: 'day',
  show3dObjects: 'true',
  showPointOfInterestLabels: 'true',
  showPlaceLabels: 'true',
  showRoadLabels: 'true',
};
