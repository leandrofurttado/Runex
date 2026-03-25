import type { ImageSource } from 'expo-image';

/**
 * Imagens raster em `assets/images/` (PNG, WebP, JPEG).
 * O Metro só aceita `require('@/assets/images/nome.png')` com caminho fixo — registe cada ficheiro aqui.
 *
 * Exemplo ao adicionar `assets/images/banner.png`:
 * `banner: require('@/assets/images/banner.png'),`
 */
export const rasterImages = {
  // banner: require('@/assets/images/banner.png'),
} as const satisfies Record<string, ImageSource>;

export type RasterImageKey = keyof typeof rasterImages;
