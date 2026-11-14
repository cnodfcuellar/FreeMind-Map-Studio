import { MindNode, RectangleCornerStyle, RectanglePreset } from '../types/mindmap';

export interface RectangleCornerConfig {
  style: RectangleCornerStyle;
  radius: number;
  preset?: RectanglePreset;
  topLeft: boolean;
  topRight: boolean;
  bottomRight: boolean;
  bottomLeft: boolean;
}

/**
 * Resolves rectangle / square corner configuration with defaults
 */
export const resolveRectangleCorners = (node: MindNode): RectangleCornerConfig => {
  const style: RectangleCornerStyle = node.rectCornerStyle || 'sharp';
  let defaultRadius = 0;
  if (style === 'rounded') defaultRadius = 8;
  else if (style === 'bevel') defaultRadius = 6;
  else if (style === 'concave') defaultRadius = 10;

  const radius = node.rectRadius !== undefined ? Math.max(0, node.rectRadius) : defaultRadius;

  return {
    style,
    radius,
    preset: node.rectPreset,
    topLeft: node.rectCornerTopLeft !== false,
    topRight: node.rectCornerTopRight !== false,
    bottomRight: node.rectCornerBottomRight !== false,
    bottomLeft: node.rectCornerBottomLeft !== false,
  };
};

/**
 * Returns true if the node is a rectangle or square requiring SVG path rendering (bevel or concave)
 */
export const isRectangleSvgShape = (node: MindNode): boolean => {
  const shape = node.shape;
  if (shape !== 'rectangle' && shape !== 'square') return false;
  const style = node.rectCornerStyle;
  return style === 'bevel' || style === 'concave';
};

/**
 * Computes standard CSS border-radius string for rounded rectangle/square nodes
 */
export const computeRectangleBorderRadius = (node: MindNode): string => {
  const config = resolveRectangleCorners(node);
  if (config.style === 'sharp' || config.radius === 0) {
    return '0px';
  }
  if (config.style === 'rounded') {
    const tl = config.topLeft ? config.radius : 0;
    const tr = config.topRight ? config.radius : 0;
    const br = config.bottomRight ? config.radius : 0;
    const bl = config.bottomLeft ? config.radius : 0;
    return `${tl}px ${tr}px ${br}px ${bl}px`;
  }
  return '0px';
};

/**
 * Computes SVG path 'd' string for beveled or concave corners with individual corner asymmetry
 */
export const computeRectangleSvgPath = (
  w: number,
  h: number,
  node: MindNode,
  borderWidth: number = 0
): string => {
  const pad = Math.max(borderWidth / 2, 0.5);
  const x0 = pad;
  const y0 = pad;
  const x1 = Math.max(x0, w - pad);
  const y1 = Math.max(y0, h - pad);

  const config = resolveRectangleCorners(node);
  const maxR = Math.max(0, Math.min((x1 - x0) / 2, (y1 - y0) / 2));
  const r = Math.max(0, Math.min(config.radius, maxR));

  if (r === 0 || config.style === 'sharp') {
    return `M ${+x0.toFixed(2)},${+y0.toFixed(2)} L ${+x1.toFixed(2)},${+y0.toFixed(2)} L ${+x1.toFixed(2)},${+y1.toFixed(2)} L ${+x0.toFixed(2)},${+y1.toFixed(2)} Z`;
  }

  const hasTL = config.topLeft;
  const hasTR = config.topRight;
  const hasBR = config.bottomRight;
  const hasBL = config.bottomLeft;
  const style = config.style;

  // Start from top edge (or after TL corner)
  let d = `M ${hasTL ? +(x0 + r).toFixed(2) : +x0.toFixed(2)},${+y0.toFixed(2)}`;

  // Top edge -> TR corner
  d += ` L ${hasTR ? +(x1 - r).toFixed(2) : +x1.toFixed(2)},${+y0.toFixed(2)}`;
  if (hasTR) {
    if (style === 'bevel') {
      d += ` L ${+x1.toFixed(2)},${+(y0 + r).toFixed(2)}`;
    } else if (style === 'concave') {
      d += ` A ${+r.toFixed(2)},${+r.toFixed(2)} 0 0,0 ${+x1.toFixed(2)},${+(y0 + r).toFixed(2)}`;
    } else {
      // Rounded arc
      d += ` A ${+r.toFixed(2)},${+r.toFixed(2)} 0 0,1 ${+x1.toFixed(2)},${+(y0 + r).toFixed(2)}`;
    }
  }

  // Right edge -> BR corner
  d += ` L ${+x1.toFixed(2)},${hasBR ? +(y1 - r).toFixed(2) : +y1.toFixed(2)}`;
  if (hasBR) {
    if (style === 'bevel') {
      d += ` L ${+(x1 - r).toFixed(2)},${+y1.toFixed(2)}`;
    } else if (style === 'concave') {
      d += ` A ${+r.toFixed(2)},${+r.toFixed(2)} 0 0,0 ${+(x1 - r).toFixed(2)},${+y1.toFixed(2)}`;
    } else {
      d += ` A ${+r.toFixed(2)},${+r.toFixed(2)} 0 0,1 ${+(x1 - r).toFixed(2)},${+y1.toFixed(2)}`;
    }
  }

  // Bottom edge -> BL corner
  d += ` L ${hasBL ? +(x0 + r).toFixed(2) : +x0.toFixed(2)},${+y1.toFixed(2)}`;
  if (hasBL) {
    if (style === 'bevel') {
      d += ` L ${+x0.toFixed(2)},${+(y1 - r).toFixed(2)}`;
    } else if (style === 'concave') {
      d += ` A ${+r.toFixed(2)},${+r.toFixed(2)} 0 0,0 ${+x0.toFixed(2)},${+(y1 - r).toFixed(2)}`;
    } else {
      d += ` A ${+r.toFixed(2)},${+r.toFixed(2)} 0 0,1 ${+x0.toFixed(2)},${+(y1 - r).toFixed(2)}`;
    }
  }

  // Left edge -> TL corner
  d += ` L ${+x0.toFixed(2)},${hasTL ? +(y0 + r).toFixed(2) : +y0.toFixed(2)}`;
  if (hasTL) {
    if (style === 'bevel') {
      d += ` L ${+(x0 + r).toFixed(2)},${+y0.toFixed(2)}`;
    } else if (style === 'concave') {
      d += ` A ${+r.toFixed(2)},${+r.toFixed(2)} 0 0,0 ${+(x0 + r).toFixed(2)},${+y0.toFixed(2)}`;
    } else {
      d += ` A ${+r.toFixed(2)},${+r.toFixed(2)} 0 0,1 ${+(x0 + r).toFixed(2)},${+y0.toFixed(2)}`;
    }
  }

  d += ' Z';
  return d;
};
