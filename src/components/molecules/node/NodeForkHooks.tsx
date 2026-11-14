import React from 'react';
import { MindNode, MindMapTheme, NodeSide } from '../../../types/mindmap';

interface NodeForkHooksProps {
  node: MindNode;
  layout: {
    width: number;
    height: number;
    side?: NodeSide;
  };
  theme: MindMapTheme;
  branchColor: string;
  isRoot?: boolean;
}

export const NodeForkHooks: React.FC<NodeForkHooksProps> = ({
  node,
  layout,
  theme,
  branchColor,
  isRoot = false,
}) => {
  if (node.shape !== 'fork') return null;

  const w = layout.width;
  const h = layout.height;
  const strokeWidth = node.borderWidth !== undefined && node.borderWidth > 0 ? node.borderWidth : 2.5;
  const borderStyle = node.borderDash || node.borderStyle || 'solid';
  const strokeDash = borderStyle === 'dashed' ? '5 3' : borderStyle === 'dotted' ? '2 2.5' : undefined;

  const fallbackColor = branchColor || theme.nodeBorder || '#3b82f6';
  const strokeColor = node.borderColor || (isRoot ? (node.borderWidth ? fallbackColor : 'transparent') : fallbackColor);

  const hooks = node.forkHooks || 'both';
  const hookHeight = node.forkHookHeight !== undefined ? node.forkHookHeight : 6;
  const cornerStyle = node.forkCornerStyle || 'sharp';

  const isLeftSide = layout.side === 'left';
  let hasLeftHook = false;
  let hasRightHook = false;

  if (hooks === 'both') {
    hasLeftHook = true;
    hasRightHook = true;
  } else if (hooks === 'parent') {
    hasLeftHook = !isLeftSide;
    hasRightHook = isLeftSide;
  } else if (hooks === 'children') {
    hasLeftHook = isLeftSide;
    hasRightHook = !isLeftSide;
  }

  // Si la altura del gancho es 0, no hay ganchos verticales
  if (hookHeight <= 0) {
    hasLeftHook = false;
    hasRightHook = false;
  }

  const yBase = +(Math.max(1, h - strokeWidth / 2)).toFixed(2);
  const yTop = +(Math.max(0, yBase - hookHeight)).toFixed(2);

  // Construcción del path según el estilo de codo / esquina
  let pathD = '';

  if (!hasLeftHook && !hasRightHook) {
    // Línea horizontal pura
    pathD = `M 0 ${yBase} L ${w} ${yBase}`;
  } else if (cornerStyle === 'rounded') {
    const r = +(Math.min(hookHeight * 0.8, 6, w / 4)).toFixed(2);
    const yr = +(yBase - r).toFixed(2);
    const wr = +(w - r).toFixed(2);
    if (hasLeftHook && hasRightHook) {
      pathD = `M 0 ${yTop} L 0 ${yr} Q 0 ${yBase} ${r} ${yBase} L ${wr} ${yBase} Q ${w} ${yBase} ${w} ${yr} L ${w} ${yTop}`;
    } else if (hasLeftHook) {
      pathD = `M 0 ${yTop} L 0 ${yr} Q 0 ${yBase} ${r} ${yBase} L ${w} ${yBase}`;
    } else {
      pathD = `M 0 ${yBase} L ${wr} ${yBase} Q ${w} ${yBase} ${w} ${yr} L ${w} ${yTop}`;
    }
  } else if (cornerStyle === 'bevel') {
    const b = +(Math.min(hookHeight * 0.6, 5, w / 4)).toFixed(2);
    const yb = +(yBase - b).toFixed(2);
    const wb = +(w - b).toFixed(2);
    if (hasLeftHook && hasRightHook) {
      pathD = `M 0 ${yTop} L 0 ${yb} L ${b} ${yBase} L ${wb} ${yBase} L ${w} ${yb} L ${w} ${yTop}`;
    } else if (hasLeftHook) {
      pathD = `M 0 ${yTop} L 0 ${yb} L ${b} ${yBase} L ${w} ${yBase}`;
    } else {
      pathD = `M 0 ${yBase} L ${wb} ${yBase} L ${w} ${yb} L ${w} ${yTop}`;
    }
  } else {
    // Recta 90° (Sharp)
    if (hasLeftHook && hasRightHook) {
      pathD = `M 0 ${yTop} L 0 ${yBase} L ${w} ${yBase} L ${w} ${yTop}`;
    } else if (hasLeftHook) {
      pathD = `M 0 ${yTop} L 0 ${yBase} L ${w} ${yBase}`;
    } else {
      pathD = `M 0 ${yBase} L ${w} ${yBase} L ${w} ${yTop}`;
    }
  }

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-1 overflow-visible"
      width={w}
      height={h}
      style={{ overflow: 'visible' }}
    >
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDash}
        strokeLinecap={cornerStyle === 'rounded' ? 'round' : 'square'}
        strokeLinejoin={cornerStyle === 'rounded' ? 'round' : 'miter'}
      />
    </svg>
  );
};
