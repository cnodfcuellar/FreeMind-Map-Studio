import React from 'react';
import { MindNode, CalculatedNodeLayout, MindMapTheme } from '../../../types/mindmap';
import { computeBubbleTailGeometry } from '../../../utils/bubbleTailUtils';
import {
  isRectangleSvgShape,
  isSquareRotated,
  resolveRectangleCorners,
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
import {
  generatePolygonZigzag,
  generatePolygonWavy,
  generateRadialZigzag,
  generateRadialWavy,
  getDoublePolygonPoints,
  generatePerimeterDiamonds,
  Point2D,
} from '../../../utils/borderPathUtils';
import { NodeBorderOverlay } from './NodeBorderOverlay';
export { NodeBorderOverlay };

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
// Funciones puras de cálculo de estilos extraídas a src/utils/nodeStyleUtils.ts (Fase 2)
import {
  isDarkNodeBackground,
  getNodeBackgroundStyles,
  getNodeShapeStyles,
  computeNodeShadowStyle,
} from '../../../utils/nodeStyleUtils';

export {
  isDarkNodeBackground,
  getNodeBackgroundStyles,
  getNodeShapeStyles,
  computeNodeShadowStyle,
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
  const strokeDash =
    borderStyle === 'dashed'
      ? `${node.borderDashLength || 10} ${node.borderDashSpace || 11}`
      : borderStyle === 'dotted'
      ? `${node.borderDotShape === 'square' ? borderWidth : 0.1} ${node.borderDotSpacing || 9}`
      : undefined;
  const strokeCap = borderStyle === 'dotted' ? (node.borderDotShape === 'square' ? 'butt' : 'round') : 'round';
  const effectiveBorderColor = borderWidth > 0 ? (borderStyle === 'double' ? (node.borderColorOuter || borderColor) : borderColor) : 'none';
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
    const pad = Math.max(effectiveBorderWidth / 2, 0.5);
    const cx = w / 2;
    const cy = h / 2;
    const x0 = pad;
    const x1 = Math.max(x0, w - pad);
    const y0 = pad;
    const y1 = Math.max(y0, h - pad);
    points = `${cx},${y0} ${x1},${cy} ${cx},${y1} ${x0},${cy}`;
  } else if (node.rectCornerStyle === 'bevel') {
    const pad = Math.max(effectiveBorderWidth / 2, 0.5);
    const x0 = pad;
    const y0 = pad;
    const x1 = Math.max(x0, w - pad);
    const y1 = Math.max(y0, h - pad);
    const config = resolveRectangleCorners(node);
    const maxR = Math.max(0, Math.min((x1 - x0) / 2, (y1 - y0) / 2));
    const r = Math.max(0, Math.min(config.radius, maxR));
    const rTL = config.topLeft ? r : 0;
    const rTR = config.topRight ? r : 0;
    const rBR = config.bottomRight ? r : 0;
    const rBL = config.bottomLeft ? r : 0;
    points = `${x0 + rTL},${y0} ${x1 - rTR},${y0} ${x1},${y0 + rTR} ${x1},${y1 - rBR} ${x1 - rBR},${y1} ${x0 + rBL},${y1} ${x0},${y1 - rBL} ${x0},${y0 + rTL}`;
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
        (() => {
          const cx = w / 2;
          const cy = h / 2;
          const rx = Math.max(2, (w - 2 * Math.max(effectiveBorderWidth / 2, 0.5)) / 2);
          const ry = Math.max(2, (h - 2 * Math.max(effectiveBorderWidth / 2, 0.5)) / 2);
          const transform = computeOvalSvgTransform(w, h, node.ovalRotation || 0);

          if (borderStyle === 'double' && borderWidth > 0) {
            const gap = node.borderGap !== undefined ? node.borderGap : 4;
            const colorInner = node.borderColorInner || borderColor;
            const colorOuter = node.borderColorOuter || borderColor;
            return (
              <g transform={transform}>
                <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fillAttr} stroke={colorOuter} strokeWidth={effectiveBorderWidth} />
                <ellipse cx={cx} cy={cy} rx={Math.max(1, rx - gap)} ry={Math.max(1, ry - gap)} fill="none" stroke={colorInner} strokeWidth={effectiveBorderWidth} />
              </g>
            );
          }

          if (borderStyle === 'zigzag' && borderWidth > 0) {
            const amp = node.borderZigzagHeight !== undefined ? node.borderZigzagHeight : 8;
            const freq = node.borderZigzagFreq !== undefined ? node.borderZigzagFreq : 16;
            const zzPath = generateRadialZigzag(cx, cy, rx, ry, amp, freq);
            return (
              <g transform={transform}>
                <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fillAttr} stroke="none" />
                <path d={zzPath} fill="none" stroke={effectiveBorderColor} strokeWidth={effectiveBorderWidth} strokeLinejoin="round" />
              </g>
            );
          }

          if (borderStyle === 'wavy' && borderWidth > 0) {
            const amp = node.borderWaveHeight !== undefined ? node.borderWaveHeight : 8;
            const waveW = node.borderWaveWidth !== undefined ? node.borderWaveWidth : 24;
            const wavePath = generateRadialWavy(cx, cy, rx, ry, amp, waveW);
            return (
              <g transform={transform}>
                <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fillAttr} stroke="none" />
                <path d={wavePath} fill="none" stroke={effectiveBorderColor} strokeWidth={effectiveBorderWidth} strokeLinecap="round" />
              </g>
            );
          }

          if (borderStyle === 'dotted' && node.borderDotShape === 'diamond' && borderWidth > 0) {
            const dSize = Math.max(3, borderWidth * 1.5);
            const diamonds = generatePerimeterDiamonds({
              shape: 'oval',
              w,
              h,
              spacing: node.borderDotSpacing !== undefined ? node.borderDotSpacing : 9,
              dSize,
            });
            return (
              <g transform={transform}>
                <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fillAttr} stroke="none" />
                {diamonds.map((pt, idx) => (
                  <rect
                    key={idx}
                    x={pt.x - dSize / 2}
                    y={pt.y - dSize / 2}
                    width={dSize}
                    height={dSize}
                    fill={effectiveBorderColor}
                    transform={`rotate(45 ${pt.x} ${pt.y})`}
                  />
                ))}
              </g>
            );
          }

          return (
            <ellipse
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              transform={transform}
              fill={fillAttr}
              stroke={effectiveBorderColor}
              strokeWidth={effectiveBorderWidth}
              strokeDasharray={strokeDash}
              strokeLinecap={strokeCap}
              style={node.nodeShadow ? { filter: computeNodeShadowStyle(node, true).filter } : undefined}
            />
          );
        })()
      ) : pathD ? (
        borderStyle === 'double' && borderWidth > 0 ? (
          (() => {
            const gap = node.borderGap !== undefined ? node.borderGap : 4;
            const colorInner = node.borderColorInner || borderColor;
            const colorOuter = node.borderColorOuter || borderColor;
            const innerPathD = computeRectangleSvgPath(w, h, node, effectiveBorderWidth + gap * 2);
            return (
              <>
                <path
                  d={pathD}
                  fill={fillAttr}
                  stroke={colorOuter}
                  strokeWidth={effectiveBorderWidth}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  style={node.nodeShadow ? { filter: computeNodeShadowStyle(node, true).filter } : undefined}
                />
                <path
                  d={innerPathD}
                  fill="none"
                  stroke={colorInner}
                  strokeWidth={effectiveBorderWidth}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </>
            );
          })()
        ) : (
          <path
            d={pathD}
            fill={fillAttr}
            stroke={effectiveBorderColor}
            strokeWidth={effectiveBorderWidth}
            strokeDasharray={strokeDash}
            strokeLinejoin="round"
            strokeLinecap={strokeCap}
            style={node.nodeShadow ? { filter: computeNodeShadowStyle(node, true).filter } : undefined}
          />
        )
      ) : (
        (() => {
          const pts: Point2D[] = points
            .split(' ')
            .filter(Boolean)
            .map((s) => {
              const [px, py] = s.split(',').map(Number);
              return { x: px, y: py };
            });

          if (borderStyle === 'double' && borderWidth > 0) {
            const gap = node.borderGap !== undefined ? node.borderGap : 4;
            const colorInner = node.borderColorInner || borderColor;
            const colorOuter = node.borderColorOuter || borderColor;
            const innerPts = getDoublePolygonPoints(pts, gap);
            const innerPointsStr = innerPts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

            return (
              <>
                <polygon
                  points={points}
                  fill={fillAttr}
                  stroke={colorOuter}
                  strokeWidth={effectiveBorderWidth}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  style={node.nodeShadow ? { filter: computeNodeShadowStyle(node, true).filter } : undefined}
                />
                <polygon
                  points={innerPointsStr}
                  fill="none"
                  stroke={colorInner}
                  strokeWidth={effectiveBorderWidth}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </>
            );
          }

          if (borderStyle === 'zigzag' && borderWidth > 0) {
            const amp = node.borderZigzagHeight !== undefined ? node.borderZigzagHeight : 8;
            const freq = node.borderZigzagFreq !== undefined ? node.borderZigzagFreq : 16;
            const zzPath = generatePolygonZigzag(pts, amp, freq);

            return (
              <>
                <polygon
                  points={points}
                  fill={fillAttr}
                  stroke="none"
                  style={node.nodeShadow ? { filter: computeNodeShadowStyle(node, true).filter } : undefined}
                />
                <path
                  d={zzPath}
                  fill="none"
                  stroke={effectiveBorderColor}
                  strokeWidth={effectiveBorderWidth}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </>
            );
          }

          if (borderStyle === 'wavy' && borderWidth > 0) {
            const amp = node.borderWaveHeight !== undefined ? node.borderWaveHeight : 8;
            const waveW = node.borderWaveWidth !== undefined ? node.borderWaveWidth : 24;
            const wavePath = generatePolygonWavy(pts, amp, waveW);

            return (
              <>
                <polygon
                  points={points}
                  fill={fillAttr}
                  stroke="none"
                  style={node.nodeShadow ? { filter: computeNodeShadowStyle(node, true).filter } : undefined}
                />
                <path
                  d={wavePath}
                  fill="none"
                  stroke={effectiveBorderColor}
                  strokeWidth={effectiveBorderWidth}
                  strokeLinecap="round"
                />
              </>
            );
          }

          if (borderStyle === 'dotted' && node.borderDotShape === 'diamond' && borderWidth > 0) {
            const dSize = Math.max(3, borderWidth * 1.5);
            const diamonds = generatePerimeterDiamonds({
              w,
              h,
              spacing: node.borderDotSpacing !== undefined ? node.borderDotSpacing : 9,
              dSize,
              polygonPts: pts,
            });

            return (
              <>
                <polygon
                  points={points}
                  fill={fillAttr}
                  stroke="none"
                  style={node.nodeShadow ? { filter: computeNodeShadowStyle(node, true).filter } : undefined}
                />
                {diamonds.map((pt, idx) => (
                  <rect
                    key={idx}
                    x={pt.x - dSize / 2}
                    y={pt.y - dSize / 2}
                    width={dSize}
                    height={dSize}
                    fill={effectiveBorderColor}
                    transform={`rotate(45 ${pt.x} ${pt.y})`}
                  />
                ))}
              </>
            );
          }

          return (
            <polygon
              points={points}
              fill={fillAttr}
              stroke={effectiveBorderColor}
              strokeWidth={effectiveBorderWidth}
              strokeDasharray={strokeDash}
              strokeLinejoin="round"
              strokeLinecap={strokeCap}
              style={node.nodeShadow ? { filter: computeNodeShadowStyle(node, true).filter } : undefined}
            />
          );
        })()
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

