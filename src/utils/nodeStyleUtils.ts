import React from 'react';
import { MindNode, MindMapTheme } from '../types/mindmap';
import {
  isRectangleSvgShape,
  isSquareRotated,
  computeRectangleBorderRadius,
} from './rectangleCornerUtils';
import {
  isOvalSvgShape,
  computeOvalPadding,
} from './ovalShapeUtils';
import {
  computeArrowContentPadding,
} from './arrowShapeUtils';

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

  const isCustomProceduralBorder =
    borderStyle === 'zigzag' ||
    borderStyle === 'wavy' ||
    borderStyle === 'double' ||
    (borderStyle === 'dashed' && (node.borderDashLength !== undefined || node.borderDashSpace !== undefined)) ||
    (borderStyle === 'dotted' && (node.borderDotShape === 'diamond' || node.borderDotShape === 'square' || node.borderDotSpacing !== undefined));

  const baseStyle: React.CSSProperties = {
    ...bgStyles,
    border: borderWidth > 0 && !isCustomProceduralBorder ? `${borderWidth}px ${borderStyle} ${borderColor}` : 'none',
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

