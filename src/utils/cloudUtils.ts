import { NodeCloud } from '../types/mindmap';

export type CloudShadowPreset = 'soft' | 'island' | 'deep' | 'glow';

export interface CloudShadowConfig {
  enabled: boolean;
  blur: number;
  offsetY: number;
  opacity: number;
  color: string;
}

/**
 * Returns structured shadow configuration for cloud island shadows.
 * Fixes transparency dilution when cloud body opacity is very low (e.g. 0.08).
 */
export function getCloudShadowConfig(cloud?: NodeCloud): CloudShadowConfig | undefined {
  if (!cloud || !cloud.shadow) return undefined;

  const preset = cloud.shadowPreset || 'island';
  const blur =
    cloud.shadowBlur ??
    (preset === 'soft' ? 14 : preset === 'island' ? 24 : preset === 'deep' ? 36 : 18);
  const offsetY =
    cloud.shadowOffsetY ??
    (preset === 'soft' ? 4 : preset === 'island' ? 10 : preset === 'deep' ? 16 : 0);
  const opacity =
    cloud.shadowOpacity ??
    (preset === 'soft' ? 0.22 : preset === 'island' ? 0.38 : preset === 'deep' ? 0.58 : 0.65);

  const defaultColor =
    preset === 'glow'
      ? (cloud.borderColor || '#3b82f6')
      : '#0f172a'; // Tono profundo neutro
  const color = cloud.shadowColor || defaultColor;

  return {
    enabled: true,
    blur,
    offsetY,
    opacity,
    color,
  };
}

/**
 * Computes CSS drop-shadow filter string for SVG clouds (Islas Conceptuales)
 */
export function computeCloudShadowFilter(cloud?: NodeCloud): string | undefined {
  const cfg = getCloudShadowConfig(cloud);
  if (!cfg) return undefined;

  if (cloud?.shadowPreset === 'glow') {
    return `drop-shadow(0 0 ${cfg.blur}px ${cfg.color})`;
  }
  return `drop-shadow(0 ${cfg.offsetY}px ${cfg.blur}px ${cfg.color})`;
}
