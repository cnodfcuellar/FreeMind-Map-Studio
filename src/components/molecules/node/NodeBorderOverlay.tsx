import React from 'react';
import type { MindNode } from '../../../types/mindmap';
import {
  generateZigzagPath,
  generateWavyPath,
  generateRadialZigzag,
  generateRadialWavy,
  generateHorizontalZigzag,
  generateHorizontalWavy,
  generatePillZigzagPath,
  generatePillWavyPath,
  generatePerimeterDiamonds,
  getDoubleBorderRects,
} from '../../../utils/borderPathUtils';

export interface NodeBorderOverlayProps {
  node: MindNode;
  width: number;
  height: number;
  borderRadius?: number;
  borderColor: string;
  isRoot?: boolean;
}

/**
 * NodeBorderOverlay
 * Renderiza trazados vectoriales perimetrales de alta precisión adaptados a la
 * forma real del nodo: Círculo, Óvalo, Píldora, Burbuja, Rectángulo y Horquilla.
 */
export const NodeBorderOverlay: React.FC<NodeBorderOverlayProps> = ({
  node,
  width,
  height,
  borderRadius = 14,
  borderColor,
}) => {
  const shape = node.shape || 'bubble';
  const borderStyle = node.borderDash || node.borderStyle || 'solid';
  const borderWidth = node.borderWidth !== undefined ? node.borderWidth : 1.5;

  if (borderWidth <= 0) return null;

  const needsOverlay =
    borderStyle === 'double' ||
    borderStyle === 'zigzag' ||
    borderStyle === 'wavy' ||
    (borderStyle === 'dashed' && (node.borderDashLength !== undefined || node.borderDashSpace !== undefined)) ||
    (borderStyle === 'dotted' && (node.borderDotShape === 'diamond' || node.borderDotShape === 'square' || node.borderDotSpacing !== undefined));

  if (!needsOverlay) return null;

  const w = width;
  const h = height;

  // ========================================================
  // 1. FORMA: CÍRCULO
  // ========================================================
  if (shape === 'circle') {
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.max(2, Math.min(w, h) / 2);

    if (borderStyle === 'double') {
      const gap = node.borderGap !== undefined ? node.borderGap : 4;
      const colorInner = node.borderColorInner || borderColor;
      const colorOuter = node.borderColorOuter || borderColor;
      const rInner = Math.max(1, R - gap);

      return (
        <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }} width={w} height={h}>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke={colorOuter} strokeWidth={borderWidth} />
          <circle cx={cx} cy={cy} r={rInner} fill="none" stroke={colorInner} strokeWidth={borderWidth} />
        </svg>
      );
    }

    if (borderStyle === 'zigzag') {
      const amp = node.borderZigzagHeight !== undefined ? node.borderZigzagHeight : 8;
      const freq = node.borderZigzagFreq !== undefined ? node.borderZigzagFreq : 16;
      const path = generateRadialZigzag(cx, cy, R, R, amp, freq);
      return (
        <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }} width={w} height={h}>
          <path d={path} fill="none" stroke={borderColor} strokeWidth={borderWidth} strokeLinejoin="round" />
        </svg>
      );
    }

    if (borderStyle === 'wavy') {
      const amp = node.borderWaveHeight !== undefined ? node.borderWaveHeight : 8;
      const waveW = node.borderWaveWidth !== undefined ? node.borderWaveWidth : 24;
      const path = generateRadialWavy(cx, cy, R, R, amp, waveW);
      return (
        <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }} width={w} height={h}>
          <path d={path} fill="none" stroke={borderColor} strokeWidth={borderWidth} strokeLinecap="round" />
        </svg>
      );
    }

    if (borderStyle === 'dotted' && node.borderDotShape === 'diamond') {
      const dSize = Math.max(3, borderWidth * 1.5);
      const diamonds = generatePerimeterDiamonds({
        shape: 'circle',
        w,
        h,
        spacing: node.borderDotSpacing !== undefined ? node.borderDotSpacing : 9,
        dSize,
      });
      return (
        <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }} width={w} height={h}>
          {diamonds.map((pt, idx) => (
            <rect
              key={idx}
              x={pt.x - dSize / 2}
              y={pt.y - dSize / 2}
              width={dSize}
              height={dSize}
              fill={borderColor}
              transform={`rotate(45 ${pt.x} ${pt.y})`}
            />
          ))}
        </svg>
      );
    }

    if (borderStyle === 'dotted' && node.borderDotShape === 'diamond') {
      const dSize = Math.max(3, borderWidth * 1.5);
      const diamonds = generatePerimeterDiamonds({
        shape: 'circle',
        w,
        h,
        spacing: node.borderDotSpacing !== undefined ? node.borderDotSpacing : 9,
        dSize,
      });
      return (
        <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }} width={w} height={h}>
          {diamonds.map((pt, idx) => (
            <rect
              key={idx}
              x={pt.x - dSize / 2}
              y={pt.y - dSize / 2}
              width={dSize}
              height={dSize}
              fill={borderColor}
              transform={`rotate(45 ${pt.x} ${pt.y})`}
            />
          ))}
        </svg>
      );
    }

    if (borderStyle === 'dashed' || borderStyle === 'dotted') {
      const isDashed = borderStyle === 'dashed';
      const dash = isDashed
        ? `${node.borderDashLength || 10} ${node.borderDashSpace || 11}`
        : `${node.borderDotShape === 'square' ? borderWidth : 0.1} ${node.borderDotSpacing || 9}`;
      const cap = isDashed ? 'round' : node.borderDotShape === 'square' ? 'butt' : 'round';
      return (
        <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }} width={w} height={h}>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke={borderColor} strokeWidth={borderWidth} strokeDasharray={dash} strokeLinecap={cap} />
        </svg>
      );
    }
  }

  // ========================================================
  // 2. FORMA: ÓVALO / ELIPSE
  // ========================================================
  if (shape === 'oval') {
    const cx = w / 2;
    const cy = h / 2;
    const rx = Math.max(2, w / 2);
    const ry = Math.max(2, h / 2);

    if (borderStyle === 'double') {
      const gap = node.borderGap !== undefined ? node.borderGap : 4;
      const colorInner = node.borderColorInner || borderColor;
      const colorOuter = node.borderColorOuter || borderColor;
      const rxInner = Math.max(1, rx - gap);
      const ryInner = Math.max(1, ry - gap);

      return (
        <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }} width={w} height={h}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={colorOuter} strokeWidth={borderWidth} />
          <ellipse cx={cx} cy={cy} rx={rxInner} ry={ryInner} fill="none" stroke={colorInner} strokeWidth={borderWidth} />
        </svg>
      );
    }

    if (borderStyle === 'zigzag') {
      const amp = node.borderZigzagHeight !== undefined ? node.borderZigzagHeight : 8;
      const freq = node.borderZigzagFreq !== undefined ? node.borderZigzagFreq : 16;
      const path = generateRadialZigzag(cx, cy, rx, ry, amp, freq);
      return (
        <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }} width={w} height={h}>
          <path d={path} fill="none" stroke={borderColor} strokeWidth={borderWidth} strokeLinejoin="round" />
        </svg>
      );
    }

    if (borderStyle === 'wavy') {
      const amp = node.borderWaveHeight !== undefined ? node.borderWaveHeight : 8;
      const waveW = node.borderWaveWidth !== undefined ? node.borderWaveWidth : 24;
      const path = generateRadialWavy(cx, cy, rx, ry, amp, waveW);
      return (
        <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }} width={w} height={h}>
          <path d={path} fill="none" stroke={borderColor} strokeWidth={borderWidth} strokeLinecap="round" />
        </svg>
      );
    }

    if (borderStyle === 'dotted' && node.borderDotShape === 'diamond') {
      const dSize = Math.max(3, borderWidth * 1.5);
      const diamonds = generatePerimeterDiamonds({
        shape: 'oval',
        w,
        h,
        spacing: node.borderDotSpacing !== undefined ? node.borderDotSpacing : 9,
        dSize,
      });
      return (
        <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }} width={w} height={h}>
          {diamonds.map((pt, idx) => (
            <rect
              key={idx}
              x={pt.x - dSize / 2}
              y={pt.y - dSize / 2}
              width={dSize}
              height={dSize}
              fill={borderColor}
              transform={`rotate(45 ${pt.x} ${pt.y})`}
            />
          ))}
        </svg>
      );
    }

    if (borderStyle === 'dashed' || borderStyle === 'dotted') {
      const isDashed = borderStyle === 'dashed';
      const dash = isDashed
        ? `${node.borderDashLength || 10} ${node.borderDashSpace || 11}`
        : `${node.borderDotShape === 'square' ? borderWidth : 0.1} ${node.borderDotSpacing || 9}`;
      const cap = isDashed ? 'round' : node.borderDotShape === 'square' ? 'butt' : 'round';
      return (
        <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }} width={w} height={h}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={borderColor} strokeWidth={borderWidth} strokeDasharray={dash} strokeLinecap={cap} />
        </svg>
      );
    }
  }

  // ========================================================
  // 3. FORMA: HORQUILLA (FORK)
  // ========================================================
  if (shape === 'fork') {
    const yLine = h - 2;

    if (borderStyle === 'double') {
      const gap = node.borderGap !== undefined ? node.borderGap : 3;
      const colorInner = node.borderColorInner || borderColor;
      const colorOuter = node.borderColorOuter || borderColor;
      return (
        <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }} width={w} height={h}>
          <line x1={0} y1={yLine - gap / 2} x2={w} y2={yLine - gap / 2} stroke={colorOuter} strokeWidth={borderWidth} strokeLinecap="round" />
          <line x1={0} y1={yLine + gap / 2} x2={w} y2={yLine + gap / 2} stroke={colorInner} strokeWidth={borderWidth} strokeLinecap="round" />
        </svg>
      );
    }

    if (borderStyle === 'zigzag') {
      const amp = node.borderZigzagHeight !== undefined ? node.borderZigzagHeight : 6;
      const freq = node.borderZigzagFreq !== undefined ? node.borderZigzagFreq : 14;
      const path = generateHorizontalZigzag(0, w, yLine, amp, freq);
      return (
        <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }} width={w} height={h}>
          <path d={path} fill="none" stroke={borderColor} strokeWidth={borderWidth} strokeLinejoin="round" />
        </svg>
      );
    }

    if (borderStyle === 'wavy') {
      const amp = node.borderWaveHeight !== undefined ? node.borderWaveHeight : 6;
      const waveW = node.borderWaveWidth !== undefined ? node.borderWaveWidth : 24;
      const path = generateHorizontalWavy(0, w, yLine, amp, waveW);
      return (
        <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }} width={w} height={h}>
          <path d={path} fill="none" stroke={borderColor} strokeWidth={borderWidth} strokeLinecap="round" />
        </svg>
      );
    }

    if (borderStyle === 'dotted' && node.borderDotShape === 'diamond') {
      const dSize = Math.max(3, borderWidth * 1.5);
      const diamonds = generatePerimeterDiamonds({
        shape: 'fork',
        w,
        h,
        spacing: node.borderDotSpacing !== undefined ? node.borderDotSpacing : 9,
        dSize,
      });
      return (
        <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }} width={w} height={h}>
          {diamonds.map((pt, idx) => (
            <rect
              key={idx}
              x={pt.x - dSize / 2}
              y={pt.y - dSize / 2}
              width={dSize}
              height={dSize}
              fill={borderColor}
              transform={`rotate(45 ${pt.x} ${pt.y})`}
            />
          ))}
        </svg>
      );
    }

    if (borderStyle === 'dashed' || borderStyle === 'dotted') {
      const isDashed = borderStyle === 'dashed';
      const dash = isDashed
        ? `${node.borderDashLength || 10} ${node.borderDashSpace || 11}`
        : `${node.borderDotShape === 'square' ? borderWidth : 0.1} ${node.borderDotSpacing || 9}`;
      const cap = isDashed ? 'round' : node.borderDotShape === 'square' ? 'butt' : 'round';
      return (
        <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }} width={w} height={h}>
          <line x1={0} y1={yLine} x2={w} y2={yLine} stroke={borderColor} strokeWidth={borderWidth} strokeDasharray={dash} strokeLinecap={cap} />
        </svg>
      );
    }
  }

  // ========================================================
  // 4. FORMAS: BURBUJA, PÍLDORA, RECTÁNGULO, CUADRADO
  // ========================================================
  // Píldora: radio exacto = h / 2
  const r = shape === 'pill' ? Math.max(2, h / 2) : borderRadius;

  // Doble borde con separación y colores independientes
  if (borderStyle === 'double') {
    const gap = node.borderGap !== undefined ? node.borderGap : 4;
    const colorInner = node.borderColorInner || borderColor;
    const colorOuter = node.borderColorOuter || borderColor;
    const { outer, inner } = getDoubleBorderRects(w, h, r, gap, borderWidth);

    return (
      <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }} width={w} height={h}>
        <rect x={outer.x} y={outer.y} width={outer.w} height={outer.h} rx={outer.r} ry={outer.r} fill="none" stroke={colorOuter} strokeWidth={borderWidth} />
        <rect x={inner.x} y={inner.y} width={inner.w} height={inner.h} rx={inner.r} ry={inner.r} fill="none" stroke={colorInner} strokeWidth={borderWidth} />
      </svg>
    );
  }

  // Zigzag perimetral continuo
  if (borderStyle === 'zigzag') {
    const amplitude = node.borderZigzagHeight !== undefined ? node.borderZigzagHeight : 9.5;
    const freq = node.borderZigzagFreq !== undefined ? node.borderZigzagFreq : 19;
    const path = shape === 'pill'
      ? generatePillZigzagPath(w, h, amplitude, freq)
      : generateZigzagPath(w, h, r, amplitude, freq);

    return (
      <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }} width={w} height={h}>
        <path d={path} fill="none" stroke={borderColor} strokeWidth={borderWidth} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    );
  }

  // Ondulado sinusoidal continuo
  if (borderStyle === 'wavy') {
    const amplitude = node.borderWaveHeight !== undefined ? node.borderWaveHeight : 10;
    const waveWidth = node.borderWaveWidth !== undefined ? node.borderWaveWidth : 36;
    const path = shape === 'pill'
      ? generatePillWavyPath(w, h, amplitude, waveWidth)
      : generateWavyPath(w, h, r, amplitude, waveWidth);

    return (
      <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }} width={w} height={h}>
        <path d={path} fill="none" stroke={borderColor} strokeWidth={borderWidth} strokeLinecap="round" />
      </svg>
    );
  }

  // Guiones personalizados
  if (borderStyle === 'dashed') {
    const dashLen = node.borderDashLength !== undefined ? node.borderDashLength : 10;
    const dashSpace = node.borderDashSpace !== undefined ? node.borderDashSpace : 11;

    return (
      <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }} width={w} height={h}>
        <rect
          x={borderWidth / 2}
          y={borderWidth / 2}
          width={Math.max(1, w - borderWidth)}
          height={Math.max(1, h - borderWidth)}
          rx={Math.max(0, r - borderWidth / 2)}
          fill="none"
          stroke={borderColor}
          strokeWidth={borderWidth}
          strokeDasharray={`${dashLen} ${dashSpace}`}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Puntos geométricos (Esfera, Cuadrado o Rombo)
  if (borderStyle === 'dotted') {
    const dotShape = node.borderDotShape || 'circle';
    const spacing = node.borderDotSpacing !== undefined ? node.borderDotSpacing : 9;

    if (dotShape === 'diamond') {
      const dSize = Math.max(3, borderWidth * 1.5);
      const diamonds = generatePerimeterDiamonds({
        shape,
        w,
        h,
        r,
        spacing,
        dSize,
      });

      return (
        <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }} width={w} height={h}>
          {diamonds.map((pt, idx) => (
            <rect
              key={idx}
              x={pt.x - dSize / 2}
              y={pt.y - dSize / 2}
              width={dSize}
              height={dSize}
              fill={borderColor}
              transform={`rotate(45 ${pt.x} ${pt.y})`}
            />
          ))}
        </svg>
      );
    }

    const isSquare = dotShape === 'square';
    const dashLen = isSquare ? borderWidth : 0.1;
    const cap = isSquare ? 'butt' : 'round';

    return (
      <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }} width={w} height={h}>
        <rect
          x={borderWidth / 2}
          y={borderWidth / 2}
          width={Math.max(1, w - borderWidth)}
          height={Math.max(1, h - borderWidth)}
          rx={Math.max(0, r - borderWidth / 2)}
          fill="none"
          stroke={borderColor}
          strokeWidth={borderWidth}
          strokeDasharray={`${dashLen} ${spacing}`}
          strokeLinecap={cap}
        />
      </svg>
    );
  }

  return null;
};
