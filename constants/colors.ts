/** Paleta principal Runex */
export const Palette = {
  primary: '#00E373', // verde neon Runex (universal)
  neutral: '#E8E8E8', // cinza claro
} as const;

/** Cores para tema escuro */
export const DarkColors = {
  background: '#0a0a0a',
  surface: '#111111',
  surfaceElevated: '#1a1a1a',
  primary: Palette.primary,
  primaryDim: 'rgba(0,227,115,0.08)',
  primaryBorder: 'rgba(0,227,115,0.2)',
  accent: '#ffaa00',
  error: '#ef4444',
  text: '#ffffff',
  textMuted: 'rgba(255,255,255,0.45)',
  textDim: 'rgba(255,255,255,0.2)',
  border: 'rgba(255,255,255,0.08)',
  cardBg: 'rgba(17,17,17,0.95)',
} as const;

/** Cores para tema claro */
export const LightColors = {
  background: '#DEDEDE',
  surface: '#F2F2F2',
  surfaceElevated: '#F2F2F2',
  primary: Palette.primary,
  primaryDim: 'rgba(0,227,115,0.12)',
  primaryBorder: 'rgba(0,227,115,0.35)',
  accent: '#e69500',
  error: '#d32f2f',
  text: '#1a1a1a',
  textMuted: 'rgba(0,0,0,0.55)',
  textDim: 'rgba(0,0,0,0.25)',
  border: 'rgba(0,0,0,0.1)',
  cardBg: 'rgba(255,255,255,0.98)',
} as const;

/** @deprecated Use ThemeContext ou Colors do tema ativo */
export const Colors = {
  ...DarkColors,
  neonGreen: Palette.primary,
  neonGreenDim: DarkColors.primaryDim,
  neonGreenBorder: DarkColors.primaryBorder,
  neonYellow: DarkColors.accent,
  neonRed: DarkColors.error,
} as const;
