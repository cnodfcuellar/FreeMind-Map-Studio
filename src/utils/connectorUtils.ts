import { Connector } from '../types/mindmap';

export interface ConnectorGeometry {
  pathD: string;
  cpX: number;
  cpY: number;
  midX: number;
  midY: number;
  labelX: number;
  labelY: number;
}

/**
 * Calculates SVG path data and control point positions for cross connectors.
 */
export function calculateConnectorGeometry(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  conn: Connector
): ConnectorGeometry {
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const dist = Math.hypot(dx, dy) || 1;

  // Normal unit vector (perpendicular to direct line)
  const nx = -dy / dist;
  const ny = dx / dist;

  const curvature = conn.curvature !== undefined ? conn.curvature : -50;

  let cpX: number;
  let cpY: number;

  if (conn.controlPoint) {
    cpX = conn.controlPoint.x;
    cpY = conn.controlPoint.y;
  } else {
    cpX = midX + nx * curvature;
    cpY = midY + ny * curvature;
  }

  const shape = conn.shape || 'curved';
  let pathD = '';
  let labelX = midX;
  let labelY = midY;

  switch (shape) {
    case 'straight':
      pathD = `M ${fromX} ${fromY} L ${toX} ${toY}`;
      labelX = midX;
      labelY = midY - 6;
      break;

    case 'step': {
      // Orthogonal step line through control point or midX
      const cornerX = conn.controlPoint ? cpX : midX;
      pathD = `M ${fromX} ${fromY} L ${cornerX} ${fromY} L ${cornerX} ${toY} L ${toX} ${toY}`;
      labelX = cornerX;
      labelY = (fromY + toY) / 2 - 6;
      break;
    }

    case 'bezier': {
      // Cubic Bézier / S-Curve
      const cp1X = fromX + (cpX - fromX) * 0.75;
      const cp1Y = fromY + (cpY - fromY) * 0.75;
      const cp2X = toX + (cpX - toX) * 0.75;
      const cp2Y = toY + (cpY - toY) * 0.75;
      pathD = `M ${fromX} ${fromY} C ${cp1X} ${cp1Y} ${cp2X} ${cp2Y} ${toX} ${toY}`;
      // Point at t = 0.5 on cubic Bézier
      labelX = 0.125 * fromX + 0.375 * cp1X + 0.375 * cp2X + 0.125 * toX;
      labelY = 0.125 * fromY + 0.375 * cp1Y + 0.375 * cp2Y + 0.125 * toY - 6;
      break;
    }

    case 'curved':
    default: {
      // Quadratic Bézier curve
      pathD = `M ${fromX} ${fromY} Q ${cpX} ${cpY} ${toX} ${toY}`;
      // Point at t = 0.5 on quadratic Bézier: 0.25*P0 + 0.5*CP + 0.25*P1
      labelX = 0.25 * fromX + 0.5 * cpX + 0.25 * toX;
      labelY = 0.25 * fromY + 0.5 * cpY + 0.25 * toY - 6;
      break;
    }
  }

  return {
    pathD,
    cpX,
    cpY,
    midX,
    midY,
    labelX,
    labelY,
  };
}

export type ConnectorShadowPreset = 'soft' | 'deep' | 'glow';

/**
 * Computes CSS drop-shadow filter string for SVG connectors
 */
export function computeConnectorShadowFilter(conn?: Connector): string | undefined {
  if (!conn || !conn.shadow) return undefined;

  const preset: ConnectorShadowPreset = conn.shadowPreset || 'soft';
  const blur =
    conn.shadowBlur ??
    (preset === 'soft' ? 4 : preset === 'deep' ? 10 : 8);
  const offsetY =
    conn.shadowOffsetY ??
    (preset === 'soft' ? 2 : preset === 'deep' ? 4 : 0);
  const defaultColor =
    preset === 'glow'
      ? (conn.color || '#3b82f6')
      : preset === 'deep'
      ? 'rgba(0,0,0,0.35)'
      : 'rgba(0,0,0,0.20)';
  const color = conn.shadowColor || defaultColor;

  if (preset === 'glow') {
    return `drop-shadow(0 0 ${blur}px ${color})`;
  }
  return `drop-shadow(0 ${offsetY}px ${blur}px ${color})`;
}
