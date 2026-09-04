import React from 'react';
import { MindNode, CalculatedNodeLayout, MindMapTheme } from '../../../types/mindmap';

export interface NodeBackgroundProps {
  node: MindNode;
  layout: CalculatedNodeLayout;
  theme: MindMapTheme;
  branchColor: string;
  isRoot: boolean;
  isSelected?: boolean;
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

  const bgType = node.bgType || (node.bgImageUrl ? 'image' : 'color');

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
        backgroundImage: `linear-gradient(to bottom, ${patRgba} 1.5px, transparent 1.5px)`,
        backgroundSize: `100% ${size}px`,
      };
    }
    if (pat === 'squares') {
      return {
        backgroundColor: baseColor,
        backgroundImage: `linear-gradient(to right, ${patRgba} 1.5px, transparent 1.5px), linear-gradient(to bottom, ${patRgba} 1.5px, transparent 1.5px)`,
        backgroundSize: `${size}px ${size}px`,
      };
    }
    if (pat === 'stripes') {
      return {
        backgroundColor: baseColor,
        backgroundImage: `repeating-linear-gradient(45deg, ${patRgba} 0px, ${patRgba} 1.5px, transparent 1.5px, transparent ${size}px)`,
      };
    }
    if (pat === 'triangles') {
      const triW = size;
      const triH = Math.max(8, Math.round(size * 0.866));
      const triSvg = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${triW}" height="${triH}" viewBox="0 0 ${triW} ${triH}"><polygon points="0,${triH} ${triW / 2},0 ${triW},${triH}" fill="none" stroke="${patColor}" stroke-width="1.2" stroke-opacity="${opacity}"/></svg>`
      );
      return {
        backgroundColor: baseColor,
        backgroundImage: `url("data:image/svg+xml,${triSvg}")`,
        backgroundSize: `${triW}px ${triH}px`,
      };
    }
    if (pat === 'hexagons') {
      const hexW = size;
      const hexH = size;
      const hexSvg = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${hexW}" height="${hexH}" viewBox="0 0 ${hexW} ${hexH}"><polygon points="${hexW * 0.25},0 ${hexW * 0.75},0 ${hexW},${hexH * 0.5} ${hexW * 0.75},${hexH} ${hexW * 0.25},${hexH} 0,${hexH * 0.5}" fill="none" stroke="${patColor}" stroke-width="1.2" stroke-opacity="${opacity}"/></svg>`
      );
      return {
        backgroundColor: baseColor,
        backgroundImage: `url("data:image/svg+xml,${hexSvg}")`,
        backgroundSize: `${hexW}px ${hexH}px`,
      };
    }
    if (pat === 'cross') {
      const cLen = Math.max(3, Math.round(size * 0.35));
      const cMid = size / 2;
      const crossSvg = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><line x1="${cMid - cLen}" y1="${cMid}" x2="${cMid + cLen}" y2="${cMid}" stroke="${patColor}" stroke-width="1.5" stroke-opacity="${opacity}" stroke-linecap="round"/><line x1="${cMid}" y1="${cMid - cLen}" x2="${cMid}" y2="${cMid + cLen}" stroke="${patColor}" stroke-width="1.5" stroke-opacity="${opacity}" stroke-linecap="round"/></svg>`
      );
      return {
        backgroundColor: baseColor,
        backgroundImage: `url("data:image/svg+xml,${crossSvg}")`,
        backgroundSize: `${size}px ${size}px`,
      };
    }

    return {
      backgroundColor: baseColor,
      backgroundImage: `radial-gradient(${patRgba} 1.5px, transparent 1.5px)`,
      backgroundSize: `${size}px ${size}px`,
    };
  }

  if (bgType === 'image' && node.bgImageUrl) {
    const bgImg = node.bgImageUrl;
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

  return {
    backgroundColor: bgColor,
    backgroundImage: 'none',
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
  
  // Resuelve el color de borde predeterminado para evitar que sea invisible si el usuario cambia el grosor
  const fallbackBorderColor = branchColor || theme.nodeBorder || '#3b82f6';
  const borderColor = node.borderColor || (isRoot ? (node.borderWidth ? fallbackBorderColor : 'transparent') : fallbackBorderColor);
  const borderWidth = node.borderWidth !== undefined ? node.borderWidth : (isRoot ? 0 : 1.5);

  const baseStyle: React.CSSProperties = {
    ...bgStyles,
    border: borderWidth > 0 ? `${borderWidth}px ${borderStyle} ${borderColor}` : 'none',
  };

  if (shape === 'fork') {
    const underlineColor = borderColor || fallbackBorderColor;
    const underlineWidth = borderWidth !== undefined ? borderWidth : 2.5;
    return {
      ...bgStyles,
      border: 'none',
      borderBottom: underlineWidth > 0 ? `${underlineWidth}px ${borderStyle} ${underlineColor}` : 'none',
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
      boxShadow: 'none',
      paddingLeft: '32px',
      paddingRight: '32px',
    };
  }
  if (shape === 'arrow') {
    return {
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      paddingLeft: '24px',
      paddingRight: '36px',
    };
  }
  if (shape === 'star') {
    return {
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
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
  isSelected,
}) => {
  const shape = node.shape || 'bubble';
  const isSvgShape = shape === 'hexagon' || shape === 'arrow' || shape === 'star';
  if (!isSvgShape) return null;

  const w = layout.width;
  const h = layout.height;
  const borderStyle = node.borderDash || node.borderStyle || 'solid';
  const fallbackBorderColor = branchColor || theme.nodeBorder || '#3b82f6';
  const borderColor = node.borderColor || (isRoot ? (node.borderWidth ? fallbackBorderColor : 'transparent') : fallbackBorderColor);
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
  const baseColor = node.color || bgColor || '#ffffff';

  let fillAttr = baseColor;
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
    const pad = Math.max(effectiveBorderWidth / 2, 1);
    points = `${inset},${pad} ${w - inset},${pad} ${w - pad},${h / 2} ${w - inset},${h - pad} ${inset},${h - pad} ${pad},${h / 2}`;
  } else if (shape === 'arrow') {
    const arrowTip = Math.min(w * 0.32, Math.max(32, h * 0.70));
    const notch = Math.min(w * 0.16, Math.max(16, h * 0.40));
    const pad = Math.max(effectiveBorderWidth / 2, 1);
    points = `${pad},${pad} ${w - arrowTip},${pad} ${w - pad},${h / 2} ${w - arrowTip},${h - pad} ${pad},${h - pad} ${notch},${h / 2}`;
  } else if (shape === 'star') {
    const pad = Math.max(effectiveBorderWidth / 2, 1);
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

  const patSize = node.nodePatternSize || 16;
  const patColor = node.nodePatternColor || '#475569';
  const patOpacity = node.nodePatternOpacity ?? 0.4;
  const patStyle = node.nodePattern || 'dots';
  const patMid = patSize / 2;
  const patLen = Math.max(3, Math.round(patSize * 0.35));

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
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
          node.gradientDirection === 'radial' ? (
            <radialGradient
              id={gradId}
              cx="50%"
              cy="50%"
              r="60%"
              fx="50%"
              fy="50%"
            >
              <stop offset="0%" stopColor={node.gradientColor1 || node.color || bgColor || '#3b82f6'} />
              <stop offset="100%" stopColor={node.gradientColor2 || '#8b5cf6'} />
            </radialGradient>
          ) : (
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
          )
        )}
        {bgType === 'pattern' && (
          <pattern
            id={patternId}
            width={patSize}
            height={patSize}
            patternUnits="userSpaceOnUse"
          >
            <rect width="100%" height="100%" fill={baseColor} />
            {patStyle === 'dots' && (
              <circle
                cx={patMid}
                cy={patMid}
                r={1.5}
                fill={patColor}
                opacity={patOpacity}
              />
            )}
            {patStyle === 'lines' && (
              <line
                x1="0"
                y1={patMid}
                x2={patSize}
                y2={patMid}
                stroke={patColor}
                strokeWidth="1.5"
                strokeOpacity={patOpacity}
              />
            )}
            {patStyle === 'stripes' && (
              <>
                <line
                  x1="0"
                  y1={patSize}
                  x2={patSize}
                  y2="0"
                  stroke={patColor}
                  strokeWidth="1.5"
                  strokeOpacity={patOpacity}
                />
                <line
                  x1={-patSize / 2}
                  y1={patSize / 2}
                  x2={patSize / 2}
                  y2={-patSize / 2}
                  stroke={patColor}
                  strokeWidth="1.5"
                  strokeOpacity={patOpacity}
                />
                <line
                  x1={patSize / 2}
                  y1={patSize * 1.5}
                  x2={patSize * 1.5}
                  y2={patSize / 2}
                  stroke={patColor}
                  strokeWidth="1.5"
                  strokeOpacity={patOpacity}
                />
              </>
            )}
            {patStyle === 'squares' && (
              <rect
                x="0.75"
                y="0.75"
                width={patSize - 1.5}
                height={patSize - 1.5}
                fill="none"
                stroke={patColor}
                strokeWidth="1.5"
                strokeOpacity={patOpacity}
              />
            )}
            {patStyle === 'triangles' && (
              <polygon
                points={`0,${patSize} ${patSize / 2},0 ${patSize},${patSize}`}
                fill="none"
                stroke={patColor}
                strokeWidth="1.2"
                strokeOpacity={patOpacity}
              />
            )}
            {patStyle === 'hexagons' && (
              <polygon
                points={`${patSize * 0.25},0 ${patSize * 0.75},0 ${patSize},${patSize * 0.5} ${patSize * 0.75},${patSize} ${patSize * 0.25},${patSize} 0,${patSize * 0.5}`}
                fill="none"
                stroke={patColor}
                strokeWidth="1.2"
                strokeOpacity={patOpacity}
              />
            )}
            {patStyle === 'cross' && (
              <>
                <line
                  x1={patMid - patLen}
                  y1={patMid}
                  x2={patMid + patLen}
                  y2={patMid}
                  stroke={patColor}
                  strokeWidth="1.5"
                  strokeOpacity={patOpacity}
                  strokeLinecap="round"
                />
                <line
                  x1={patMid}
                  y1={patMid - patLen}
                  x2={patMid}
                  y2={patMid + patLen}
                  stroke={patColor}
                  strokeWidth="1.5"
                  strokeOpacity={patOpacity}
                  strokeLinecap="round"
                />
              </>
            )}
          </pattern>
        )}
      </defs>

      {/* Resplandor exterior de selección que sigue la geometría del polígono */}
      {isSelected && (
        <polygon
          points={points}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={Math.max(effectiveBorderWidth + 3.5, 4)}
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{
            filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.85))',
          }}
        />
      )}

      {/* Polígono principal con fondo y borde */}
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
 * Speech bubble tail rendering with synchronized border styling
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
  const fallbackBorderColor = branchColor || theme.nodeBorder || '#3b82f6';
  const borderColor = node.borderColor || (isRoot ? (node.borderWidth ? fallbackBorderColor : 'transparent') : fallbackBorderColor);
  const borderCol = borderWidth > 0 ? borderColor : 'transparent';
  const bWidth = borderWidth;
  const borderStyle = node.borderDash || node.borderStyle || 'solid';
  const strokeDash = borderStyle === 'dashed' ? '4 3' : borderStyle === 'dotted' ? '2 2' : undefined;

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
          strokeDasharray={strokeDash}
          strokeLinejoin="round"
        />
        {bWidth > 0 && (
          <line
            x1="12"
            y1="1"
            x2="12"
            y2="15"
            stroke={fillCol}
            strokeWidth={bWidth + 2}
          />
        )}
      </svg>
    </div>
  );
};

