import { MindNode, MindMap } from '../types/mindmap';

export type EdgeShadowPreset = 'soft' | 'deep' | 'glow';

/**
 * Computes CSS drop-shadow filter string for a tree edge path.
 * Priority: childNode.edgeShadow (local override) -> mindMap.edgeShadow (global fallback)
 */
export function computeEdgeShadowFilter(
  childNode: MindNode,
  edgeColor: string,
  mindMap?: MindMap
): string | undefined {
  // Local override takes precedence if explicitly boolean
  const isEnabled =
    childNode.edgeShadow !== undefined
      ? childNode.edgeShadow
      : Boolean(mindMap?.edgeShadow);

  if (!isEnabled) return undefined;

  const preset: EdgeShadowPreset =
    childNode.edgeShadowPreset || mindMap?.edgeShadowPreset || 'soft';

  const blur =
    childNode.edgeShadowBlur ??
    mindMap?.edgeShadowBlur ??
    (preset === 'soft' ? 4 : preset === 'deep' ? 8 : 6);

  const offsetY =
    childNode.edgeShadowOffsetY ??
    mindMap?.edgeShadowOffsetY ??
    (preset === 'soft' ? 2 : preset === 'deep' ? 4 : 0);

  const defaultColor =
    preset === 'glow'
      ? edgeColor
      : preset === 'deep'
      ? 'rgba(0,0,0,0.35)'
      : 'rgba(0,0,0,0.20)';

  const color = childNode.edgeShadowColor || mindMap?.edgeShadowColor || defaultColor;

  if (preset === 'glow') {
    return `drop-shadow(0 0 ${blur}px ${color})`;
  }
  return `drop-shadow(0 ${offsetY}px ${blur}px ${color})`;
}

