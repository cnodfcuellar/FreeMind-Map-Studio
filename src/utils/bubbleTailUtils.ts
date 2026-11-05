import { MindNode, NodeSide, BubbleTailSide, BubbleTailStyle } from '../types/mindmap';

export interface BubbleTailGeometry {
  resolvedSide: 'left' | 'right' | 'top' | 'bottom';
  containerStyle: React.CSSProperties;
  svgWidth: number;
  svgHeight: number;
  viewBox: string;
  pathD?: string;
  coverLine?: { x1: number; y1: number; x2: number; y2: number };
  thoughtCircles?: Array<{ cx: number; cy: number; r: number }>;
}

export const resolveBubbleTailSide = (
  tailSide: BubbleTailSide | undefined,
  layoutSide: NodeSide | undefined
): 'left' | 'right' | 'top' | 'bottom' => {
  if (tailSide && tailSide !== 'auto') {
    return tailSide;
  }
  if (layoutSide === 'left') return 'right';
  if (layoutSide === 'right') return 'left';
  if (layoutSide === 'bottom') return 'top';
  if (layoutSide === 'top') return 'bottom';
  return 'left';
};

export const computeBubbleTailGeometry = (params: {
  node: MindNode;
  layoutSide?: NodeSide;
}): BubbleTailGeometry | null => {
  const { node, layoutSide } = params;
  if ((node.shape || 'bubble') !== 'bubble') return null;

  const length = node.tailLength !== undefined ? node.tailLength : 12;
  // If tail length is 0, tail is disabled/hidden
  if (length <= 0) return null;

  const width = node.tailWidth !== undefined ? node.tailWidth : 14;
  const offset = Math.max(10, Math.min(90, node.tailOffset !== undefined ? node.tailOffset : 50));
  const style: BubbleTailStyle = node.tailStyle || 'straight';
  const resolvedSide = resolveBubbleTailSide(node.tailSide, layoutSide);

  const L = length;
  const W = width;

  if (resolvedSide === 'left') {
    const containerStyle: React.CSSProperties = {
      position: 'absolute',
      right: '100%',
      top: `${offset}%`,
      transform: 'translateY(-50%)',
      marginRight: '-1px',
      width: `${L}px`,
      height: `${W}px`,
      pointerEvents: 'none',
      zIndex: 0,
    };

    if (style === 'thought') {
      return {
        resolvedSide,
        containerStyle,
        svgWidth: L,
        svgHeight: W,
        viewBox: `0 0 ${L} ${W}`,
        thoughtCircles: [
          { cx: L * 0.72, cy: W * 0.5, r: Math.max(1.5, Math.min(W * 0.28, L * 0.24)) },
          { cx: L * 0.40, cy: W * 0.44, r: Math.max(1.2, Math.min(W * 0.20, L * 0.17)) },
          { cx: L * 0.14, cy: W * 0.38, r: Math.max(0.8, Math.min(W * 0.12, L * 0.11)) },
        ],
      };
    }

    if (style === 'curved') {
      return {
        resolvedSide,
        containerStyle,
        svgWidth: L,
        svgHeight: W,
        viewBox: `0 0 ${L} ${W}`,
        pathD: `M ${L},0 Q ${L * 0.4},${W * 0.15} 0,${W * 0.85} Q ${L * 0.35},${W * 0.65} ${L},${W} Z`,
        coverLine: { x1: L, y1: 0, x2: L, y2: W },
      };
    }

    // Straight
    return {
      resolvedSide,
      containerStyle,
      svgWidth: L,
      svgHeight: W,
      viewBox: `0 0 ${L} ${W}`,
      pathD: `M ${L},0 L 0,${W / 2} L ${L},${W} Z`,
      coverLine: { x1: L, y1: 0, x2: L, y2: W },
    };
  }

  if (resolvedSide === 'right') {
    const containerStyle: React.CSSProperties = {
      position: 'absolute',
      left: '100%',
      top: `${offset}%`,
      transform: 'translateY(-50%)',
      marginLeft: '-1px',
      width: `${L}px`,
      height: `${W}px`,
      pointerEvents: 'none',
      zIndex: 0,
    };

    if (style === 'thought') {
      return {
        resolvedSide,
        containerStyle,
        svgWidth: L,
        svgHeight: W,
        viewBox: `0 0 ${L} ${W}`,
        thoughtCircles: [
          { cx: L * 0.28, cy: W * 0.5, r: Math.max(1.5, Math.min(W * 0.28, L * 0.24)) },
          { cx: L * 0.60, cy: W * 0.44, r: Math.max(1.2, Math.min(W * 0.20, L * 0.17)) },
          { cx: L * 0.86, cy: W * 0.38, r: Math.max(0.8, Math.min(W * 0.12, L * 0.11)) },
        ],
      };
    }

    if (style === 'curved') {
      return {
        resolvedSide,
        containerStyle,
        svgWidth: L,
        svgHeight: W,
        viewBox: `0 0 ${L} ${W}`,
        pathD: `M 0,0 Q ${L * 0.6},${W * 0.15} ${L},${W * 0.85} Q ${L * 0.65},${W * 0.65} 0,${W} Z`,
        coverLine: { x1: 0, y1: 0, x2: 0, y2: W },
      };
    }

    // Straight
    return {
      resolvedSide,
      containerStyle,
      svgWidth: L,
      svgHeight: W,
      viewBox: `0 0 ${L} ${W}`,
      pathD: `M 0,0 L ${L},${W / 2} L 0,${W} Z`,
      coverLine: { x1: 0, y1: 0, x2: 0, y2: W },
    };
  }

  if (resolvedSide === 'bottom') {
    const containerStyle: React.CSSProperties = {
      position: 'absolute',
      top: '100%',
      left: `${offset}%`,
      transform: 'translateX(-50%)',
      marginTop: '-1px',
      width: `${W}px`,
      height: `${L}px`,
      pointerEvents: 'none',
      zIndex: 0,
    };

    if (style === 'thought') {
      return {
        resolvedSide,
        containerStyle,
        svgWidth: W,
        svgHeight: L,
        viewBox: `0 0 ${W} ${L}`,
        thoughtCircles: [
          { cx: W * 0.5, cy: L * 0.28, r: Math.max(1.5, Math.min(W * 0.28, L * 0.24)) },
          { cx: W * 0.44, cy: L * 0.60, r: Math.max(1.2, Math.min(W * 0.20, L * 0.17)) },
          { cx: W * 0.38, cy: L * 0.86, r: Math.max(0.8, Math.min(W * 0.12, L * 0.11)) },
        ],
      };
    }

    if (style === 'curved') {
      return {
        resolvedSide,
        containerStyle,
        svgWidth: W,
        svgHeight: L,
        viewBox: `0 0 ${W} ${L}`,
        pathD: `M 0,0 Q ${W * 0.35},${L * 0.65} ${-W * 0.15},${L} Q ${W * 0.55},${L * 0.60} ${W},0 Z`,
        coverLine: { x1: 0, y1: 0, x2: W, y2: 0 },
      };
    }

    // Straight
    return {
      resolvedSide,
      containerStyle,
      svgWidth: W,
      svgHeight: L,
      viewBox: `0 0 ${W} ${L}`,
      pathD: `M 0,0 L ${W / 2},${L} L ${W},0 Z`,
      coverLine: { x1: 0, y1: 0, x2: W, y2: 0 },
    };
  }

  // resolvedSide === 'top'
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '100%',
    left: `${offset}%`,
    transform: 'translateX(-50%)',
    marginBottom: '-1px',
    width: `${W}px`,
    height: `${L}px`,
    pointerEvents: 'none',
    zIndex: 0,
  };

  if (style === 'thought') {
    return {
      resolvedSide,
      containerStyle,
      svgWidth: W,
      svgHeight: L,
      viewBox: `0 0 ${W} ${L}`,
      thoughtCircles: [
        { cx: W * 0.5, cy: L * 0.72, r: Math.max(1.5, Math.min(W * 0.28, L * 0.24)) },
        { cx: W * 0.44, cy: L * 0.40, r: Math.max(1.2, Math.min(W * 0.20, L * 0.17)) },
        { cx: W * 0.38, cy: L * 0.14, r: Math.max(0.8, Math.min(W * 0.12, L * 0.11)) },
      ],
    };
  }

  if (style === 'curved') {
    return {
      resolvedSide,
      containerStyle,
      svgWidth: W,
      svgHeight: L,
      viewBox: `0 0 ${W} ${L}`,
      pathD: `M 0,${L} Q ${W * 0.35},${L * 0.35} ${-W * 0.15},0 Q ${W * 0.55},${L * 0.40} ${W},${L} Z`,
      coverLine: { x1: 0, y1: L, x2: W, y2: L },
    };
  }

  // Straight
  return {
    resolvedSide,
    containerStyle,
    svgWidth: W,
    svgHeight: L,
    viewBox: `0 0 ${W} ${L}`,
    pathD: `M 0,${L} L ${W / 2},0 L ${W},${L} Z`,
    coverLine: { x1: 0, y1: L, x2: W, y2: L },
  };
};

