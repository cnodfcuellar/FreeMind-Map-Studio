import React from 'react';
import { MindNode, CalculatedNodeLayout, MindMapTheme } from '../../../types/mindmap';
import { computeBubbleTailGeometry } from '../../../utils/bubbleTailUtils';
import {
  isRectangleSvgShape,
  isSquareRotated,
  computeRectangleSvgPath,
  computeRhombusSvgPath,
  computeRectangleBorderRadius,
} from '../../../utils/rectangleCornerUtils';
import {
  isOvalSvgShape,
  computeOvalPadding,
  computeOvalSvgTransform,
} from '../../../utils/ovalShapeUtils';
import {
  computeArrowPolygonPoints,
  computeArrowContentPadding,
} from '../../../utils/arrowShapeUtils';

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
      const r = Math.max(1, Math.round(size * 0.08 * 10) / 10);
      const dotSvg = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size * 0.25}" cy="${size * 0.25}" r="${r}" fill="${patColor}" opacity="${opacity}"/><circle cx="${size * 0.75}" cy="${size * 0.75}" r="${r}" fill="${patColor}" opacity="${opacity}"/></svg>`
      );
      return {
        backgroundColor: baseColor,
        backgroundImage: `url("data:image/svg+xml,${dotSvg}")`,
        backgroundSize: `${size}px ${size}px`,
      };
    }
    if (pat === 'lines') {
      return {
        backgroundColor: baseColor,
        backgroundImage: `linear-gradient(to bottom, transparent calc(50% - 0.75px), ${patRgba} calc(50% - 0.75px), ${patRgba} calc(50% + 0.75px), transparent calc(50% + 0.75px))`,
        backgroundSize: `100% ${Math.max(6, Math.round(size * 0.75))}px`,
      };
    }
    if (pat === 'stripes') {
      const strSvg = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><line x1="0" y1="${size}" x2="${size}" y2="0" stroke="${patColor}" stroke-width="1.5" stroke-opacity="${opacity}"/><line x1="${-size * 0.5}" y1="${size * 0.5}" x2="${size * 0.5}" y2="${-size * 0.5}" stroke="${patColor}" stroke-width="1.5" stroke-opacity="${opacity}"/><line x1="${size * 0.5}" y1="${size * 1.5}" x2="${size * 1.5}" y2="${size * 0.5}" stroke="${patColor}" stroke-width="1.5" stroke-opacity="${opacity}"/></svg>`
      );
      return {
        backgroundColor: baseColor,
        backgroundImage: `url("data:image/svg+xml,${strSvg}")`,
        backgroundSize: `${size}px ${size}px`,
      };
    }
    if (pat === 'squares' || pat === 'grid') {
      const gridSvg = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><path d="M ${size} 0 L 0 0 L 0 ${size}" fill="none" stroke="${patColor}" stroke-width="1.2" stroke-opacity="${opacity}"/></svg>`
      );
      return {
        backgroundColor: baseColor,
        backgroundImage: `url("data:image/svg+xml,${gridSvg}")`,
        backgroundSize: `${size}px ${size}px`,
      };
    }
    if (pat === 'triangles' || pat === 'isometric') {
      const wIso = Math.round(size * Math.sqrt(3) * 10) / 10;
      const hIso = size;
      const xMid = Math.round((wIso / 2) * 10) / 10;
      const isoSvg = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${wIso}" height="${hIso}"><line x1="0" y1="0" x2="0" y2="${hIso}" stroke="${patColor}" stroke-width="1.2" stroke-opacity="${opacity}"/><line x1="${xMid}" y1="0" x2="${xMid}" y2="${hIso}" stroke="${patColor}" stroke-width="1.2" stroke-opacity="${opacity}"/><line x1="0" y1="0" x2="${wIso}" y2="${hIso}" stroke="${patColor}" stroke-width="1.2" stroke-opacity="${opacity}"/><line x1="0" y1="${hIso}" x2="${wIso}" y2="0" stroke="${patColor}" stroke-width="1.2" stroke-opacity="${opacity}"/></svg>`
      );
      return {
        backgroundColor: baseColor,
        backgroundImage: `url("data:image/svg+xml,${isoSvg}")`,
        backgroundSize: `${wIso}px ${hIso}px`,
      };
    }
    if (pat === 'diamonds') {
      const wDia = size;
      const hDia = Math.round(size * Math.sqrt(3) * 10) / 10;
      const diaSvg = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${wDia}" height="${hDia}"><polygon points="${wDia / 2},0 ${wDia},${hDia / 2} ${wDia / 2},${hDia} 0,${hDia / 2}" fill="none" stroke="${patColor}" stroke-width="1.2" stroke-opacity="${opacity}"/></svg>`
      );
      return {
        backgroundColor: baseColor,
        backgroundImage: `url("data:image/svg+xml,${diaSvg}")`,
        backgroundSize: `${wDia}px ${hDia}px`,
      };
    }
    if (pat === 'hexagons' || pat === 'honeycomb') {
      const sHex = Math.max(6, Math.round(size * 0.5));
      const wHex = 3 * sHex;
      const hHex = Number((sHex * Math.sqrt(3)).toFixed(2));
      const hHalf = Number((hHex / 2).toFixed(2));
      const s05 = Number((sHex * 0.5).toFixed(2));
      const s15 = Number((sHex * 1.5).toFixed(2));
      const s2 = 2 * sHex;
      const hexSvg = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${wHex}" height="${hHex}"><path d="M ${s05},${hHex} L 0,${hHalf} L ${s05},0 L ${s15},0 L ${s2},${hHalf} L ${wHex},${hHalf} M ${s15},${hHex} L ${s2},${hHalf}" fill="none" stroke="${patColor}" stroke-width="1.2" stroke-opacity="${opacity}"/></svg>`
      );
      return {
        backgroundColor: baseColor,
        backgroundImage: `url("data:image/svg+xml,${hexSvg}")`,
        backgroundSize: `${wHex}px ${hHex}px`,
      };
    }
    if (pat === 'cross' || pat === 'crosses') {
      const armLen = Math.max(2.5, Math.round(size * 0.28 * 10) / 10);
      const cMid = size / 2;
      const crossSvg = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><line x1="${cMid - armLen}" y1="${cMid}" x2="${cMid + armLen}" y2="${cMid}" stroke="${patColor}" stroke-width="1.4" stroke-opacity="${opacity}" stroke-linecap="round"/><line x1="${cMid}" y1="${cMid - armLen}" x2="${cMid}" y2="${cMid + armLen}" stroke="${patColor}" stroke-width="1.4" stroke-opacity="${opacity}" stroke-linecap="round"/></svg>`
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
    // El subrayado es la forma: siempre visible (2.5px por defecto),
    // independiente de que el borde de caja sea 0.
    const underlineWidth = borderWidth && borderWidth > 0 ? borderWidth : 2.5;
    return {
      ...bgStyles,
      background: 'transparent',
      backgroundColor: 'transparent',
      backgroundImage: 'none',
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
      paddingLeft: '10px',
      paddingRight: '10px',
      paddingTop: '5px',
      paddingBottom: '5px',
      boxShadow: node.nodeShadow === false ? 'none' : '0 4px 14px -2px rgba(0,0,0,0.10), 0 2px 6px -1px rgba(0,0,0,0.06)',
    };
  }
  if (shape === 'square' || shape === 'rectangle') {
    if (isRectangleSvgShape(node)) {
      const isRotated = isSquareRotated(node);
      return {
        background: 'transparent',
        backgroundColor: 'transparent',
        backgroundImage: 'none',
        border: 'none',
        boxShadow: 'none',
        borderRadius: '0px',
        paddingLeft: isRotated ? '0px' : '14px',
        paddingRight: isRotated ? '0px' : '14px',
        paddingTop: isRotated ? '0px' : '6px',
        paddingBottom: isRotated ? '0px' : '6px',
        textAlign: isRotated ? 'center' : undefined,
      };
    }
    return {
      ...baseStyle,
      borderRadius: computeRectangleBorderRadius(node),
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
    const ovalPadding = computeOvalPadding(node);
    if (isOvalSvgShape(node)) {
      return {
        background: 'transparent',
        backgroundColor: 'transparent',
        backgroundImage: 'none',
        border: 'none',
        boxShadow: 'none',
        borderRadius: '0px',
        ...ovalPadding,
      };
    }
    const hasRotation = Boolean(node.ovalRotation && node.ovalRotation !== 0);
    return {
      ...baseStyle,
      borderRadius: '50%',
      ...ovalPadding,
      ...(hasRotation && node.ovalKeepTextHorizontal === false ? { transform: `rotate(${node.ovalRotation}deg)` } : {}),
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
    const arrowPadding = computeArrowContentPadding(node);
    return {
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      ...arrowPadding,
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
 * Computes custom node shape shadow styling (box-shadow for standard shapes, drop-shadow for SVG polygons)
 */
export const computeNodeShadowStyle = (
  node: MindNode,
  isPolygonShape: boolean
): { boxShadow?: string; filter?: string } => {
  if (!node.nodeShadow) return {};

  const preset = node.nodeShadowPreset || 'soft';
  const blur =
    node.nodeShadowBlur ??
    (preset === 'soft' ? 8 : preset === 'medium' ? 14 : preset === 'deep' ? 24 : 16);
  const offsetY =
    node.nodeShadowOffsetY ??
    (preset === 'soft' ? 3 : preset === 'medium' ? 6 : preset === 'deep' ? 10 : 0);
  const defaultColor =
    preset === 'glow'
      ? '#38bdf8'
      : preset === 'deep'
      ? 'rgba(0,0,0,0.35)'
      : preset === 'medium'
      ? 'rgba(0,0,0,0.22)'
      : 'rgba(0,0,0,0.12)';
  const color = node.nodeShadowColor || defaultColor;

  if (isPolygonShape) {
    if (preset === 'glow') {
      return {
        filter: `drop-shadow(0 0 ${blur}px ${color})`,
      };
    }
    return {
      filter: `drop-shadow(0 ${offsetY}px ${blur}px ${color})`,
    };
  }

  // Standard CSS container shapes
  if (preset === 'glow') {
    return {
      boxShadow: `0 0 ${blur}px ${color}`,
    };
  }
  const spread = preset === 'deep' ? 2 : 0;
  return {
    boxShadow: `0 ${offsetY}px ${blur}px ${spread > 0 ? `${spread}px ` : ''}${color}`,
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
  const isRectSvg = isRectangleSvgShape(node);
  const isOvalSvg = isOvalSvgShape(node);
  const isSvgShape = shape === 'hexagon' || shape === 'arrow' || shape === 'star' || isRectSvg || isOvalSvg;
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
  let pathD: string | null = null;

  if (isSquareRotated(node)) {
    pathD = computeRhombusSvgPath(w, h, node, effectiveBorderWidth);
  } else if (isRectSvg) {
    pathD = computeRectangleSvgPath(w, h, node, effectiveBorderWidth);
  } else if (shape === 'hexagon') {
    const inset = Math.min(w * 0.28, Math.max(28, h * 0.58));
    const pad = Math.max(effectiveBorderWidth / 2, 1);
    points = `${inset},${pad} ${w - inset},${pad} ${w - pad},${h / 2} ${w - inset},${h - pad} ${inset},${h - pad} ${pad},${h / 2}`;
  } else if (shape === 'arrow') {
    points = computeArrowPolygonPoints(w, h, node, effectiveBorderWidth);
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

  // Dimensiones matemáticas exactas de teselación por familia (§6.3)
  let patW = patSize;
  let patH = patSize;
  if (patStyle === 'lines') {
    patW = patSize;
    patH = Math.max(6, Math.round(patSize * 0.75));
  } else if (patStyle === 'triangles' || patStyle === 'isometric') {
    patW = Math.round(patSize * Math.sqrt(3) * 10) / 10;
    patH = patSize;
  } else if (patStyle === 'diamonds') {
    patW = patSize;
    patH = Math.round(patSize * Math.sqrt(3) * 10) / 10;
  } else if (patStyle === 'hexagons' || patStyle === 'honeycomb') {
    const sHex = Math.max(6, Math.round(patSize * 0.5));
    patW = 3 * sHex;
    patH = Number((sHex * Math.sqrt(3)).toFixed(2));
  }

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
            width={node.bgImageMode === 'tile' ? `${Math.max(20, Math.round(w * 0.4))}px` : '100%'}
            height={node.bgImageMode === 'tile' ? `${Math.max(20, Math.round(h * 0.4))}px` : '100%'}
            patternUnits={node.bgImageMode === 'tile' ? 'userSpaceOnUse' : 'objectBoundingBox'}
            patternContentUnits={node.bgImageMode === 'tile' ? 'userSpaceOnUse' : 'objectBoundingBox'}
          >
            <image
              href={bgImg}
              width={node.bgImageMode === 'tile' ? Math.max(20, Math.round(w * 0.4)) : '1'}
              height={node.bgImageMode === 'tile' ? Math.max(20, Math.round(h * 0.4)) : '1'}
              preserveAspectRatio={
                node.bgImageMode === 'fit' || node.bgImageMode === 'contain'
                  ? 'xMidYMid meet'
                  : node.bgImageMode === 'tile'
                  ? 'none'
                  : 'xMidYMid slice'
              }
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
            width={patW}
            height={patH}
            patternUnits="userSpaceOnUse"
          >
            <rect width="100%" height="100%" fill={baseColor} />
            {patStyle === 'dots' && (
              <>
                <circle
                  cx={patW * 0.25}
                  cy={patH * 0.25}
                  r={Math.max(1, Math.round(patSize * 0.08 * 10) / 10)}
                  fill={patColor}
                  opacity={patOpacity}
                />
                <circle
                  cx={patW * 0.75}
                  cy={patH * 0.75}
                  r={Math.max(1, Math.round(patSize * 0.08 * 10) / 10)}
                  fill={patColor}
                  opacity={patOpacity}
                />
              </>
            )}
            {patStyle === 'lines' && (
              <line
                x1="0"
                y1={patH * 0.5}
                x2={patW}
                y2={patH * 0.5}
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
                  x1={-patSize * 0.5}
                  y1={patSize * 0.5}
                  x2={patSize * 0.5}
                  y2={-patSize * 0.5}
                  stroke={patColor}
                  strokeWidth="1.5"
                  strokeOpacity={patOpacity}
                />
                <line
                  x1={patSize * 0.5}
                  y1={patSize * 1.5}
                  x2={patSize * 1.5}
                  y2={patSize * 0.5}
                  stroke={patColor}
                  strokeWidth="1.5"
                  strokeOpacity={patOpacity}
                />
              </>
            )}
            {(patStyle === 'squares' || patStyle === 'grid') && (
              <path
                d={`M ${patW} 0 L 0 0 L 0 ${patH}`}
                fill="none"
                stroke={patColor}
                strokeWidth="1.2"
                strokeOpacity={patOpacity}
              />
            )}
            {(patStyle === 'triangles' || patStyle === 'isometric') && (
              <>
                {/* 1. Vertical en x = 0 */}
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2={patH}
                  stroke={patColor}
                  strokeWidth="1.2"
                  strokeOpacity={patOpacity}
                />
                {/* 2. Vertical en x = patW / 2 */}
                <line
                  x1={patW / 2}
                  y1="0"
                  x2={patW / 2}
                  y2={patH}
                  stroke={patColor}
                  strokeWidth="1.2"
                  strokeOpacity={patOpacity}
                />
                {/* 3. Diagonal descendente de (0,0) a (patW, patH) a +30° */}
                <line
                  x1="0"
                  y1="0"
                  x2={patW}
                  y2={patH}
                  stroke={patColor}
                  strokeWidth="1.2"
                  strokeOpacity={patOpacity}
                />
                {/* 4. Diagonal ascendente de (0,patH) a (patW, 0) a -30° */}
                <line
                  x1="0"
                  y1={patH}
                  x2={patW}
                  y2="0"
                  stroke={patColor}
                  strokeWidth="1.2"
                  strokeOpacity={patOpacity}
                />
              </>
            )}
            {patStyle === 'diamonds' && (
              <polygon
                points={`${patW / 2},0 ${patW},${patH / 2} ${patW / 2},${patH} 0,${patH / 2}`}
                fill="none"
                stroke={patColor}
                strokeWidth="1.2"
                strokeOpacity={patOpacity}
              />
            )}
            {(patStyle === 'hexagons' || patStyle === 'honeycomb') && (() => {
              const sHex = Math.max(6, Math.round(patSize * 0.5));
              const hHalf = Number((patH / 2).toFixed(2));
              const s05 = Number((sHex * 0.5).toFixed(2));
              const s15 = Number((sHex * 1.5).toFixed(2));
              const s2 = 2 * sHex;
              return (
                <path
                  d={`M ${s05},${patH} L 0,${hHalf} L ${s05},0 L ${s15},0 L ${s2},${hHalf} L ${patW},${hHalf} M ${s15},${patH} L ${s2},${hHalf}`}
                  fill="none"
                  stroke={patColor}
                  strokeWidth="1.2"
                  strokeOpacity={patOpacity}
                />
              );
            })()}
            {(patStyle === 'cross' || patStyle === 'crosses') && (
              <>
                <line
                  x1={patW / 2 - Math.max(2.5, Math.round(patSize * 0.28 * 10) / 10)}
                  y1={patH / 2}
                  x2={patW / 2 + Math.max(2.5, Math.round(patSize * 0.28 * 10) / 10)}
                  y2={patH / 2}
                  stroke={patColor}
                  strokeWidth="1.4"
                  strokeOpacity={patOpacity}
                  strokeLinecap="round"
                />
                <line
                  x1={patW / 2}
                  y1={patH / 2 - Math.max(2.5, Math.round(patSize * 0.28 * 10) / 10)}
                  x2={patW / 2}
                  y2={patH / 2 + Math.max(2.5, Math.round(patSize * 0.28 * 10) / 10)}
                  stroke={patColor}
                  strokeWidth="1.4"
                  strokeOpacity={patOpacity}
                  strokeLinecap="round"
                />
              </>
            )}
          </pattern>
        )}
      </defs>

      {/* Resplandor exterior de selección que sigue la geometría del polígono / trazado / elipse */}
      {isSelected && (
        isOvalSvg ? (
          <ellipse
            cx={w / 2}
            cy={h / 2}
            rx={Math.max(2, (w - 2 * Math.max(effectiveBorderWidth / 2, 0.5)) / 2)}
            ry={Math.max(2, (h - 2 * Math.max(effectiveBorderWidth / 2, 0.5)) / 2)}
            transform={computeOvalSvgTransform(w, h, node.ovalRotation || 0)}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={Math.max(effectiveBorderWidth + 3.5, 4)}
            style={{
              filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.85))',
            }}
          />
        ) : pathD ? (
          <path
            d={pathD}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={Math.max(effectiveBorderWidth + 3.5, 4)}
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{
              filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.85))',
            }}
          />
        ) : (
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
        )
      )}

      {/* Forma principal con fondo y borde (con sombra perimetral SVG) */}
      {isOvalSvg ? (
        <ellipse
          cx={w / 2}
          cy={h / 2}
          rx={Math.max(2, (w - 2 * Math.max(effectiveBorderWidth / 2, 0.5)) / 2)}
          ry={Math.max(2, (h - 2 * Math.max(effectiveBorderWidth / 2, 0.5)) / 2)}
          transform={computeOvalSvgTransform(w, h, node.ovalRotation || 0)}
          fill={fillAttr}
          stroke={effectiveBorderColor}
          strokeWidth={effectiveBorderWidth}
          strokeDasharray={strokeDash}
          style={node.nodeShadow ? { filter: computeNodeShadowStyle(node, true).filter } : undefined}
        />
      ) : pathD ? (
        <path
          d={pathD}
          fill={fillAttr}
          stroke={effectiveBorderColor}
          strokeWidth={effectiveBorderWidth}
          strokeDasharray={strokeDash}
          strokeLinejoin="round"
          strokeLinecap="round"
          style={node.nodeShadow ? { filter: computeNodeShadowStyle(node, true).filter } : undefined}
        />
      ) : (
        <polygon
          points={points}
          fill={fillAttr}
          stroke={effectiveBorderColor}
          strokeWidth={effectiveBorderWidth}
          strokeDasharray={strokeDash}
          strokeLinejoin="round"
          strokeLinecap="round"
          style={node.nodeShadow ? { filter: computeNodeShadowStyle(node, true).filter } : undefined}
        />
      )}
    </svg>
  );
};

/**
 * Speech bubble tail rendering with synchronized border styling and shadow
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

  const geom = computeBubbleTailGeometry({ node, layoutSide: layout.side });
  if (!geom) return null;

  const bgColor = isRoot ? (node.color || theme.rootBg) : (node.color || theme.nodeBg);
  const fillCol = node.color || bgColor || '#ffffff';
  const borderWidth = node.borderWidth !== undefined ? node.borderWidth : (isRoot ? 0 : 1.5);
  const fallbackBorderColor = branchColor || theme.nodeBorder || '#3b82f6';
  const borderColor = node.borderColor || (isRoot ? (node.borderWidth ? fallbackBorderColor : 'transparent') : fallbackBorderColor);
  const borderCol = borderWidth > 0 ? borderColor : 'transparent';
  const bWidth = borderWidth;
  const borderStyle = node.borderDash || node.borderStyle || 'solid';
  const strokeDash = borderStyle === 'dashed' ? '4 3' : borderStyle === 'dotted' ? '2 2' : undefined;

  // Heredar sombra del nodo
  const tailShadowFilter = node.nodeShadow
    ? computeNodeShadowStyle(node, true).filter
    : node.nodeShadow === false
    ? undefined
    : 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))';

  return (
    <div
      style={{
        ...geom.containerStyle,
        filter: tailShadowFilter,
      }}
    >
      <svg
        width={geom.svgWidth}
        height={geom.svgHeight}
        viewBox={geom.viewBox}
        className="overflow-visible"
      >
        {geom.thoughtCircles ? (
          geom.thoughtCircles.map((circle, idx) => (
            <circle
              key={idx}
              cx={circle.cx}
              cy={circle.cy}
              r={circle.r}
              fill={fillCol}
              stroke={borderCol}
              strokeWidth={bWidth}
              strokeDasharray={strokeDash}
            />
          ))
        ) : (
          <>
            {geom.pathD && (
              <path
                d={geom.pathD}
                fill={fillCol}
                stroke={borderCol}
                strokeWidth={bWidth}
                strokeDasharray={strokeDash}
                strokeLinejoin="round"
              />
            )}
            {bWidth > 0 && geom.coverLine && (
              <line
                x1={geom.coverLine.x1}
                y1={geom.coverLine.y1}
                x2={geom.coverLine.x2}
                y2={geom.coverLine.y2}
                stroke={fillCol}
                strokeWidth={bWidth + 2}
              />
            )}
          </>
        )}
      </svg>
    </div>
  );
};

