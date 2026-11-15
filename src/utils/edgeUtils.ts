import { MindNode, MindMap, EdgeBorderStyle, EdgeDotShape } from '../types/mindmap';

export type EdgeShadowPreset = 'soft' | 'deep' | 'glow';

export interface Point2D {
  x: number;
  y: number;
}

export function dist(p1: Point2D, p2: Point2D): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

/**
 * Computes CSS drop-shadow filter string for a tree edge path.
 * Priority: childNode.edgeShadow (local override) -> mindMap.edgeShadow (global fallback)
 */
export function computeEdgeShadowFilter(
  childNode: MindNode,
  edgeColor: string,
  mindMap?: MindMap
): string | undefined {
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

/**
 * Parses an SVG edge path into an array of sequential 2D points.
 * Supports straight lines (M... L... L...), polylines, and cubic beziers (M... C...).
 */
export function parseEdgePathPoints(pathD: string): Point2D[] {
  if (!pathD || typeof pathD !== 'string') return [];

  // Check if it's a cubic bezier path (M x0 y0 C cx1 cy1, cx2 cy2, x1 y1)
  const bezierMatch = pathD.match(/M\s*([-\d.]+)\s+([-\d.]+)\s*C\s*([-\d.]+)\s+([-\d.]+)[,\s]+([-\d.]+)\s+([-\d.]+)[,\s]+([-\d.]+)\s+([-\d.]+)/i);
  if (bezierMatch) {
    const p0: Point2D = { x: parseFloat(bezierMatch[1]), y: parseFloat(bezierMatch[2]) };
    const c1: Point2D = { x: parseFloat(bezierMatch[3]), y: parseFloat(bezierMatch[4]) };
    const c2: Point2D = { x: parseFloat(bezierMatch[5]), y: parseFloat(bezierMatch[6]) };
    const p1: Point2D = { x: parseFloat(bezierMatch[7]), y: parseFloat(bezierMatch[8]) };

    const totalDist = dist(p0, p1) + dist(p0, c1) + dist(c2, p1);
    const steps = Math.max(12, Math.min(60, Math.round(totalDist / 12)));
    const points: Point2D[] = [];

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const mt = 1 - t;
      const x = mt * mt * mt * p0.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t * t * t * p1.x;
      const y = mt * mt * mt * p0.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t * t * t * p1.y;
      points.push({ x, y });
    }
    return points;
  }

  // Parse straight line segments M x y L x y L x y...
  const coordsRegex = /([-\d.]+)\s+([-\d.]+)/g;
  const points: Point2D[] = [];
  let match: RegExpExecArray | null;

  while ((match = coordsRegex.exec(pathD)) !== null) {
    points.push({
      x: parseFloat(match[1]),
      y: parseFloat(match[2]),
    });
  }

  // Deduplicate consecutive identical points
  const cleanPoints: Point2D[] = [];
  for (const pt of points) {
    if (cleanPoints.length === 0 || dist(cleanPoints[cleanPoints.length - 1], pt) > 0.5) {
      cleanPoints.push(pt);
    }
  }

  return cleanPoints;
}

/**
 * Generates two parallel offset paths for Double Edge rendering.
 */
export function generateDoubleEdgePaths(pathD: string, gap: number = 4): [string, string] {
  const points = parseEdgePathPoints(pathD);
  if (points.length < 2) return [pathD, pathD];

  const halfGap = gap / 2;
  const pathA: Point2D[] = [];
  const pathB: Point2D[] = [];

  for (let i = 0; i < points.length; i++) {
    const cur = points[i];
    let nx = 0;
    let ny = 0;

    if (i === 0) {
      // First segment
      const next = points[i + 1];
      const d = dist(cur, next);
      if (d > 0.001) {
        nx = -(next.y - cur.y) / d;
        ny = (next.x - cur.x) / d;
      }
    } else if (i === points.length - 1) {
      // Last segment
      const prev = points[i - 1];
      const d = dist(prev, cur);
      if (d > 0.001) {
        nx = -(cur.y - prev.y) / d;
        ny = (cur.x - prev.x) / d;
      }
    } else {
      // Average normal of adjacent segments
      const prev = points[i - 1];
      const next = points[i + 1];
      const d1 = dist(prev, cur);
      const d2 = dist(cur, next);
      const nx1 = d1 > 0.001 ? -(cur.y - prev.y) / d1 : 0;
      const ny1 = d1 > 0.001 ? (cur.x - prev.x) / d1 : 0;
      const nx2 = d2 > 0.001 ? -(next.y - cur.y) / d2 : 0;
      const ny2 = d2 > 0.001 ? (next.x - cur.x) / d2 : 0;

      const avgX = (nx1 + nx2) / 2;
      const avgY = (ny1 + ny2) / 2;
      const avgLen = Math.hypot(avgX, avgY);
      if (avgLen > 0.001) {
        nx = avgX / avgLen;
        ny = avgY / avgLen;
      } else {
        nx = nx1;
        ny = ny1;
      }
    }

    pathA.push({ x: cur.x + nx * halfGap, y: cur.y + ny * halfGap });
    pathB.push({ x: cur.x - nx * halfGap, y: cur.y - ny * halfGap });
  }

  const formatPath = (pts: Point2D[]) =>
    pts.reduce((acc, pt, idx) => `${acc}${idx === 0 ? 'M' : ' L'} ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`, '');

  return [formatPath(pathA), formatPath(pathB)];
}

/**
 * Generates a zigzag path along the edge trajectory.
 */
export function generateZigzagEdgePath(
  pathD: string,
  amplitude: number = 8,
  frequency: number = 16
): string {
  const points = parseEdgePathPoints(pathD);
  if (points.length < 2) return pathD;

  const halfAmp = amplitude / 2;
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  let globalCycle = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const segLen = dist(p1, p2);

    if (segLen < 6) {
      d += ` L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
      continue;
    }

    const tx = (p2.x - p1.x) / segLen;
    const ty = (p2.y - p1.y) / segLen;
    const nx = -ty;
    const ny = tx;

    const numCycles = Math.max(1, Math.round(segLen / Math.max(6, frequency)));
    const step = segLen / numCycles;

    for (let c = 0; c < numCycles; c++) {
      const midDist = (c + 0.5) * step;
      const endDist = (c + 1) * step;
      const sign = globalCycle % 2 === 0 ? 1 : -1;
      globalCycle++;

      const peakX = p1.x + tx * midDist + nx * sign * halfAmp;
      const peakY = p1.y + ty * midDist + ny * sign * halfAmp;

      const endX = p1.x + tx * endDist;
      const endY = p1.y + ty * endDist;

      d += ` L ${peakX.toFixed(2)} ${peakY.toFixed(2)} L ${endX.toFixed(2)} ${endY.toFixed(2)}`;
    }
  }

  return d;
}

/**
 * Generates a smooth sinusoidal wavy path along the edge trajectory.
 */
export function generateWavyEdgePath(
  pathD: string,
  amplitude: number = 8,
  waveWidth: number = 24
): string {
  const points = parseEdgePathPoints(pathD);
  if (points.length < 2) return pathD;

  const halfAmp = amplitude / 2;
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  let globalCycle = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const segLen = dist(p1, p2);

    if (segLen < 6) {
      d += ` L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
      continue;
    }

    const tx = (p2.x - p1.x) / segLen;
    const ty = (p2.y - p1.y) / segLen;
    const nx = -ty;
    const ny = tx;

    const numCycles = Math.max(1, Math.round(segLen / Math.max(8, waveWidth)));
    const step = segLen / numCycles;

    for (let c = 0; c < numCycles; c++) {
      const midDist = (c + 0.5) * step;
      const endDist = (c + 1) * step;
      const sign = globalCycle % 2 === 0 ? 1 : -1;
      globalCycle++;

      const ctrlX = p1.x + tx * midDist + nx * sign * halfAmp * 1.4;
      const ctrlY = p1.y + ty * midDist + ny * sign * halfAmp * 1.4;

      const endX = p1.x + tx * endDist;
      const endY = p1.y + ty * endDist;

      d += ` Q ${ctrlX.toFixed(2)} ${ctrlY.toFixed(2)} ${endX.toFixed(2)} ${endY.toFixed(2)}`;
    }
  }

  return d;
}

/**
 * Samples sequential positions along the edge for Diamond dots (◆).
 */
export function generateDiamondPoints(pathD: string, spacing: number = 10): Point2D[] {
  const points = parseEdgePathPoints(pathD);
  if (points.length < 2) return [];

  const diamonds: Point2D[] = [];
  let remaining = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const segLen = dist(p1, p2);
    if (segLen < 0.001) continue;

    const tx = (p2.x - p1.x) / segLen;
    const ty = (p2.y - p1.y) / segLen;

    let traveled = remaining;
    while (traveled <= segLen) {
      diamonds.push({
        x: p1.x + tx * traveled,
        y: p1.y + ty * traveled,
      });
      traveled += Math.max(4, spacing);
    }
    remaining = traveled - segLen;
  }

  return diamonds;
}
