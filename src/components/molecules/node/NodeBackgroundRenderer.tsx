import React from 'react';
import { MindNode, CalculatedNodeLayout, MindMapTheme } from '../../../types/mindmap';

export interface NodeBackgroundProps {
  node: MindNode;
  layout: CalculatedNodeLayout;
  theme: MindMapTheme;
  branchColor: string;
  isRoot: boolean;
}

/**
 * Calculates perceived luminance (ITU-R BT.709) to detect if background is dark
 */
export const isDarkNodeBackground = (color: string | undefined, isRoot: boolean): boolean => {
  const rawCol = (color || (isRoot ? '#1d4ed8' : '#ffffff')).replace('#', '');
  if (rawCol.length === 3 || rawCol.length === 6) {
    const r = parseInt(rawCol.length === 3 ? rawCol[0] + rawCol[0] : rawCol.substring(0, 2), 16);
    const g = parseInt(rawCol.length === 3 ? rawCol[1] + rawCol[1] : rawCol.substring(2, 4), 16);
    const b = parseInt(rawCol.length === 3 ? rawCol[2] + rawCol[2] : rawCol.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.52;
  }
  return isRoot;
};

/**
 * Computes CSS background properties for solid, transparent, gradient, pattern or image
 */
export const getNodeBackgroundStyles = (
  node: MindNode,
  theme: MindMapTheme,
  isRoot: boolean
): React.CSSProperties => {
  const bgColor = isRoot
    ? (node.color || theme.rootBg)
    : (node.color || theme.nodeBg);

  const bgType = node.bgType || 'color';

  if (bgType === 'transparent') {
    return {
      backgroundColor: 'transparent',
      backgroundImage: 'none',
    };
  }

  if (bgType === 'gradient') {
    const c1 = node.gradientColor1 || node.color || bgColor || '#3b82f6';
    const c2 = node.gradientColor2 || '#8b5cf6';
    const dir = node.gradientDirection || 'to-br';
    let grad = `linear-gradient(135deg, ${c1}, ${c2})`;
    if (dir === 'to-r') grad = `linear-gradient(to right, ${c1}, ${c2})`;
    else if (dir === 'to-b') grad = `linear-gradient(to bottom, ${c1}, ${c2})`;
    else if (dir === 'radial') grad = `radial-gradient(circle, ${c1}, ${c2})`;

    return {
      background: grad,
    };
  }

  if (bgType === 'pattern') {
    const baseColor = node.color || bgColor || '#ffffff';
    const pat = node.nodePattern || 'dots';
    const patColor = node.nodePatternColor || '#475569';
    const opacity = node.nodePatternOpacity ?? 0.4;
    const size = node.nodePatternSize || 16;

    const hexToRgba = (hex: string, op: number) => {
      const cleanHex = hex.replace('#', '');
      let r = 71, g = 85, b = 105;
      if (cleanHex.length === 3) {
        r = parseInt(cleanHex[0] + cleanHex[0], 16);
        g = parseInt(cleanHex[1] + cleanHex[1], 16);
        b = parseInt(cleanHex[2] + cleanHex[2], 16);
      } else if (cleanHex.length === 6) {
        r = parseInt(cleanHex.substring(0, 2), 16);
        g = parseInt(cleanHex.substring(2, 4), 16);
        b = parseInt(cleanHex.substring(4, 6), 16);
      }
      return `rgba(${r}, ${g}, ${b}, ${op})`;
    };

    const patRgba = hexToRgba(patColor, opacity);

    if (pat === 'dots') {
      return {
        backgroundColor: baseColor,
        backgroundImage: `radial-gradient(${patRgba} 1.5px, transparent 1.5px)`,
        backgroundSize: `${size}px ${size}px`,
      };
    }
    if (pat === 'lines') {
      return {
        backgroundColor: baseColor,
        backgroundImage: `linear-gradient(to bottom, transparent calc(100% - 1px), ${patRgba} 1px)`,
        backgroundSize: `100% ${size}px`,
      };
    }
    if (pat === 'squares') {
      return {
        backgroundColor: baseColor,
        backgroundImage: `linear-gradient(to right, ${patRgba} 1px, transparent 1px), linear-gradient(to bottom, ${patRgba} 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
      };
    }
    if (pat === 'stripes') {
      return {
        backgroundColor: baseColor,
        backgroundImage: `repeating-linear-gradient(45deg, ${patRgba}, ${patRgba} 1.5px, transparent 1.5px, transparent ${size}px)`,
      };
    }
    if (pat === 'triangles') {
      const triW = size;
      const triH = Math.round(size * 1.7320508);
      const triH2 = Math.round(triH / 2);
      const triW2 = Math.round(triW / 2);
      const triPath = `M 0 0 L ${triW} 0 M 0 ${triH2} L ${triW} ${triH2} M 0 0 L ${triW} ${triH} M ${triW2} 0 L ${triW} ${triH2} M 0 ${triH2} L ${triW2} ${triH} M ${triW} 0 L 0 ${triH} M ${triW2} 0 L 0 ${triH2} M ${triW} ${triH2} L ${triW2} ${triH}`;
      const triSvg = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${triW}" height="${triH}" viewBox="0 0 ${triW} ${triH}"><path d="${triPath}" fill="none" stroke="${patColor}" stroke-width="1" stroke-opacity="${opacity}"/></svg>`
      );
      return {
        backgroundColor: baseColor,
        backgroundImage: `url("data:image/svg+xml,${triSvg}")`,
        backgroundSize: `${triW}px ${triH}px`,
      };
    }
    if (pat === 'hexagons') {
      const R = size;
      const W = Number((R * 1.7320508).toFixed(2));
      const H = Number((R * 3).toFixed(2));
      const W2 = Number((W / 2).toFixed(2));
      const r05 = Number((R * 0.5).toFixed(2));
      const r10 = Number((R * 1.0).toFixed(2));
      
      const d = `M 0,0 v ${r05} l ${W2},${r05} v ${r10} l -${W2},${r05} v ${r05} M ${W},0 v ${r05} l -${W2},${r05} v ${r10} l ${W2},${r05} v ${r05} M 0,${R * 1.5} h 0`;
      const hexSvg = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
          <path d="${d}" fill="none" stroke="${patColor}" stroke-width="1.2" stroke-opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round" />
        </svg>`
      );
      return {
        backgroundColor: baseColor,
        backgroundImage: `url("data:image/svg+xml,${hexSvg}")`,
        backgroundSize: `${W}px ${H}px`,
      };
    }
    if (pat === 'cross') {
      return {
        backgroundColor: baseColor,
        backgroundImage: `radial-gradient(circle, ${patRgba} 1.5px, transparent 1.5px), radial-gradient(circle, ${patRgba} 1.5px, transparent 1.5px)`,
        backgroundSize: `${size}px ${size}px`,
        backgroundPosition: `0 0, ${size / 2}px ${size / 2}px`,
      };
    }

    return {
      backgroundColor: baseColor,
      backgroundImage: `radial-gradient(${patRgba} 1.5px, transparent 1.5px)`,
      backgroundSize: `${size}px ${size}px`,
    };
  }

  if (bgType === 'image' || node.bgImageUrl) {
    const bgImg = node.bgImageUrl;
    if (bgImg) {
      const mode = node.bgImageMode || 'cover';
      const bgSize = mode === 'fit' || mode === 'contain' ? 'contain' : mode === 'tile' ? 'auto' : 'cover';
      const bgRepeat = mode === 'tile' ? 'repeat' : 'no-repeat';
      const bgPos = 'center';
      return {
        backgroundColor: node.color || bgColor || '#ffffff',
        backgroundImage: `url("${bgImg}")`,
        backgroundSize: bgSize,
        backgroundRepeat: bgRepeat,
        backgroundPosition: bgPos,
      };
    }
  }

  return {
    backgroundColor: bgColor,
  };
};

/**
 * Computes the container shape CSS styles
 */
export const getNodeShapeStyles = (
  node: MindNode,
  theme: MindMapTheme,
  branchColor: string,
  isRoot: boolean
): React.CSSProperties => {
  const bgStyles = getNodeBackgroundStyles(node, theme, isRoot);
  const shape = node.shape || 'bubble';
  const borderStyle = node.borderDash || node.borderStyle || 'solid';
  const borderColor = node.borderColor || (isRoot ? 'transparent' : branchColor || theme.nodeBorder);
  const borderWidth = node.borderWidth !== undefined ? node.borderWidth : (isRoot ? 0 : 1.5);

  const baseStyle: React.CSSProperties = {
    ...bgStyles,
    border: borderWidth > 0 ? `${borderWidth}px ${borderStyle} ${borderColor}` : 'none',
  };

  if (shape === 'fork') {
    const underlineColor = borderColor || branchColor || '#3b82f6';
    const underlineWidth = Math.max(2.5, borderWidth || 2.5);
    return {
      ...bgStyles,
      borderTop: 'none !important',
      borderLeft: 'none !important',
      borderRight: 'none !important',
      borderBottom: `${underlineWidth}px ${borderStyle} ${underlineColor}`,
      borderRadius: '0px',
      boxShadow: 'none',
      paddingBottom: '4px',
    };
  }
  if (shape === 'bubble') {
    return {
      ...baseStyle,
      borderRadius: isRoot ? '24px' : '16px',
      paddingLeft: '16px',
      paddingRight: '16px',
      paddingTop: '8px',
      paddingBottom: '8px',
      boxShadow: '0 4px 14px -2px rgba(0,0,0,0.10), 0 2px 6px -1px rgba(0,0,0,0.06)',
    };
  }
  if (shape === 'square') {
    return {
      ...baseStyle,
      borderRadius: '0px',
    };
  }
  if (shape === 'circle') {
    return {
      ...baseStyle,
      borderRadius: '9999px',
    };
  }
  if (shape === 'pill') {
    return {
      ...baseStyle,
      borderRadius: '9999px',
      paddingLeft: '20px',
      paddingRight: '20px',
    };
  }
  if (shape === 'oval') {
    return {
      ...baseStyle,
      borderRadius: '50%',
      paddingLeft: '20px',
      paddingRight: '20px',
    };
  }
  if (shape === 'rectangle') {
    return {
      ...baseStyle,
      borderRadius: '0px',
    };
  }
  if (shape === 'hexagon') {
    return {
      background: 'transparent',
      border: 'none',
      paddingLeft: '32px',
      paddingRight: '32px',
    };
  }
  if (shape === 'arrow') {
    return {
      background: 'transparent',
      border: 'none',
      paddingLeft: '24px',
      paddingRight: '36px',
    };
  }
  if (shape === 'star') {
    return {
      background: 'transparent',
      border: 'none',
      padding: '24px 28px',
      textAlign: 'center',
    };
  }

  return {
    ...baseStyle,
    borderRadius: isRoot ? '20px' : '14px',
  };
};

/**
 * Renders SVG overlay polygon/path background for Hexagon, Arrow, Star
 */
export const NodeSvgPolygonBackground: React.FC<NodeBackgroundProps> = ({
  node,
  layout,
  theme,
  branchColor,
  isRoot,
}) => {
  const shape = node.shape || 'bubble';
  const isSvgShape = shape === 'hexagon' || shape === 'arrow' || shape === 'star';
  if (!isSvgShape) return null;

  const w = layout.width;
  const h = layout.height;
  const borderStyle = node.borderDash || node.borderStyle || 'solid';
  const borderColor = node.borderColor || (isRoot ? 'transparent' : branchColor || theme.nodeBorder);
  const borderWidth = node.borderWidth !== undefined ? node.borderWidth : (isRoot ? 0 : 1.5);
  const strokeDash = borderStyle === 'dashed' ? '6 4' : borderStyle === 'dotted' ? '2.5 3' : undefined;
  const effectiveBorderColor = borderWidth > 0 ? borderColor : 'none';
  const effectiveBorderWidth = borderWidth;

  const bgType = node.bgType || (node.bgImageUrl ? 'image' : 'color');
  const gradId = `grad-${node.id}`;
  const patternId = `pat-${node.id}`;
  const bgImgId = `bg-img-${node.id}`;
  const bgImg = node.bgImageUrl;
  const bgColor = isRoot ? (node.color || theme.rootBg) : (node.color || theme.nodeBg);

  let fillAttr = node.color || bgColor || '#ffffff';
  if (bgType === 'transparent') {
    fillAttr = 'transparent';
  } else if (bgType === 'image' && bgImg) {
    fillAttr = `url(#${bgImgId})`;
  } else if (bgType === 'gradient') {
    fillAttr = `url(#${gradId})`;
  } else if (bgType === 'pattern') {
    fillAttr = `url(#${patternId})`;
  }

  let points = '';

  if (shape === 'hexagon') {
    const inset = Math.min(w * 0.28, Math.max(28, h * 0.58));
    const pad = effectiveBorderWidth / 2;
    points = `${inset},${pad} ${w - inset},${pad} ${w - pad},${h / 2} ${w - inset},${h - pad} ${inset},${h - pad} ${pad},${h / 2}`;
  } else if (shape === 'arrow') {
    const arrowTip = Math.min(w * 0.32, Math.max(32, h * 0.70));
    const notch = Math.min(w * 0.16, Math.max(16, h * 0.40));
    const pad = effectiveBorderWidth / 2;
    points = `${pad},${pad} ${w - arrowTip},${pad} ${w - pad},${h / 2} ${w - arrowTip},${h - pad} ${pad},${h - pad} ${notch},${h / 2}`;
  } else if (shape === 'star') {
    const pad = effectiveBorderWidth / 2;
    const cx = w / 2;
    const cy = h / 2;
    const Rx = Math.max((w - 2 * pad) / 2, 10);
    const Ry = Math.max((h - 2 * pad) / 2, 10);
    const rx = Rx * 0.44;
    const ry = Ry * 0.44;
    const starPts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const angle = -Math.PI / 2 + (i * Math.PI) / 5;
      const rCurrX = i % 2 === 0 ? Rx : rx;
      const rCurrY = i % 2 === 0 ? Ry : ry;
      starPts.push(`${cx + rCurrX * Math.cos(angle)},${cy + rCurrY * Math.sin(angle)}`);
    }
    points = starPts.join(' ');
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
    >
      <defs>
        {bgImg && (
          <pattern
            id={bgImgId}
            width="100%"
            height="100%"
            patternContentUnits="objectBoundingBox"
          >
            <image
              href={bgImg}
              width="1"
              height="1"
              preserveAspectRatio={node.bgImageMode === 'fit' || node.bgImageMode === 'contain' ? 'xMidYMid meet' : 'xMidYMid slice'}
            />
          </pattern>
        )}
        {bgType === 'gradient' && (
          <linearGradient
            id={gradId}
            x1={node.gradientDirection === 'to-r' ? '0%' : '0%'}
            y1={node.gradientDirection === 'to-b' ? '0%' : '0%'}
            x2={node.gradientDirection === 'to-r' ? '100%' : node.gradientDirection === 'to-br' ? '100%' : '0%'}
            y2={node.gradientDirection === 'to-b' ? '100%' : node.gradientDirection === 'to-br' ? '100%' : '100%'}
          >
            <stop offset="0%" stopColor={node.gradientColor1 || node.color || bgColor || '#3b82f6'} />
            <stop offset="100%" stopColor={node.gradientColor2 || '#8b5cf6'} />
          </linearGradient>
        )}
        {bgType === 'pattern' && (
          <pattern
            id={patternId}
            width={node.nodePatternSize || 16}
            height={node.nodePatternSize || 16}
            patternUnits="userSpaceOnUse"
          >
            <rect width="100%" height="100%" fill={node.color || bgColor || '#ffffff'} />
            <circle
              cx={(node.nodePatternSize || 16) / 2}
              cy={(node.nodePatternSize || 16) / 2}
              r={2}
              fill={node.nodePatternColor || '#475569'}
              opacity={node.nodePatternOpacity ?? 0.4}
            />
          </pattern>
        )}
      </defs>
      <polygon
        points={points}
        fill={fillAttr}
        stroke={effectiveBorderColor}
        strokeWidth={effectiveBorderWidth}
        strokeDasharray={strokeDash}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};

/**
 * Speech bubble tail rendering
 */
export const NodeBubbleTail: React.FC<NodeBackgroundProps> = ({
  node,
  layout,
  theme,
  branchColor,
  isRoot,
}) => {
  const shape = node.shape || 'bubble';
  if (shape !== 'bubble') return null;

  const tailSide = layout.side === 'left' ? 'right' : 'left';
  const bgColor = isRoot ? (node.color || theme.rootBg) : (node.color || theme.nodeBg);
  const fillCol = node.color || bgColor || '#ffffff';
  const borderWidth = node.borderWidth !== undefined ? node.borderWidth : (isRoot ? 0 : 1.5);
  const borderColor = node.borderColor || (isRoot ? 'transparent' : branchColor || theme.nodeBorder);
  const borderCol = borderWidth > 0 ? borderColor : 'transparent';
  const bWidth = borderWidth || 1.5;

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 pointer-events-none z-0"
      style={{
        [tailSide === 'left' ? 'left' : 'right']: '-10px',
        width: '12px',
        height: '16px',
      }}
    >
      <svg
        viewBox="0 0 12 16"
        className="w-full h-full overflow-visible"
        style={{
          transform: tailSide === 'right' ? 'scaleX(-1)' : 'none',
        }}
      >
        <path
          d="M 12 0 L 0 8 L 12 16 Z"
          fill={fillCol}
          stroke={borderCol}
          strokeWidth={bWidth}
          strokeLinejoin="round"
        />
        <line
          x1="12"
          y1="1"
          x2="12"
          y2="15"
          stroke={fillCol}
          strokeWidth={bWidth + 2}
        />
      </svg>
    </div>
  );
};
