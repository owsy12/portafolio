import manifest from '@/content/images.json';

const m = manifest as Record<string, { w: number; h: number }>;

/** Dimensiones reales de una imagen de public/ (registradas por el script de procesamiento). */
export function imageSize(src: string) {
  return m[src] ?? { w: 1600, h: 1000 };
}
