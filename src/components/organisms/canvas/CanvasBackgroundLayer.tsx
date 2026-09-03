import React from 'react';
import { BackgroundPatternStyle } from '../../../types/mindmap';

export interface CanvasBackgroundLayerProps {
  pattern?: BackgroundPatternStyle;
  patternColor?: string;
  patternSize?: number;
  patternOpacity?: number;
  canvasBounds?: { minX: number; maxX: number; minY: number; maxY: number };
}

export const CanvasBackgroundLayer: React.FC<CanvasBackgroundLayerProps> = ({
  pattern = 'none',
  patternColor = '#64748b',
  patternSize = 24,
  patternOpacity = 0.15,
  canvasBounds = { minX: -20000, maxX: 20000, minY: -20000, maxY: 20000 },
}) => {
  if (pattern === 'none') return null;

  // Triangles pattern dimensions
  const triangleW = patternSize * 2;
  const triangleH = Math.round(patternSize * 1.732);
  const triangleW2 = patternSize;
  const triangleH2 = Math.round((patternSize * 1.732) / 2);

  // Hexagon pattern dimensions
  const R = patternSize;
  const hexW = Number((R * 1.7320508).toFixed(2));
  const hexH = Number((R * 3).toFixed(2));
  const hexW2 = Number((hexW / 2).toFixed(2));
  const r05 = Number((R * 0.5).toFixed(2));
  const r10 = Number((R * 1.0).toFixed(2));
  const hexD = `M 0,0 v ${r05} l ${hexW2},${r05} v ${r10} l -${hexW2},${r05} v ${r05} M ${hexW},0 v ${r05} l -${hexW2},${r05} v ${r10} l ${hexW2},${r05} v ${r05}`;

  const width = canvasBounds.maxX - canvasBounds.minX;
  const height = canvasBounds.maxY - canvasBounds.minY;

  return (
    <>
      <defs>
        {/* Pattern: Dots */}
        {pattern === 'dots' && (
          <pattern
            id="canvas-bg-pattern"
            width={patternSize}
            height={patternSize}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={patternSize / 2}
              cy={patternSize / 2}
              r={1.5}
              fill={patternColor}
              fillOpacity={patternOpacity}
            />
          </pattern>
        )}

        {/* Pattern: Lines */}
        {pattern === 'lines' && (
          <pattern
            id="canvas-bg-pattern"
            width={patternSize}
            height={patternSize}
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1={patternSize}
              x2={patternSize}
              y2={patternSize}
              stroke={patternColor}
              strokeWidth="1"
              strokeOpacity={patternOpacity}
            />
          </pattern>
        )}

        {/* Pattern: Squares */}
        {pattern === 'squares' && (
          <pattern
            id="canvas-bg-pattern"
            width={patternSize}
            height={patternSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${patternSize} 0 L 0 0 0 ${patternSize}`}
              fill="none"
              stroke={patternColor}
              strokeWidth="1"
              strokeOpacity={patternOpacity}
            />
          </pattern>
        )}

        {/* Pattern: Triangles */}
        {pattern === 'triangles' && (
          <pattern
            id="canvas-bg-pattern"
            width={triangleW}
            height={triangleH}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M 0 0 L ${triangleW} 0 M 0 ${triangleH2} L ${triangleW} ${triangleH2} M 0 0 L ${triangleW} ${triangleH} M ${triangleW2} 0 L ${triangleW} ${triangleH2} M 0 ${triangleH2} L ${triangleW2} ${triangleH} M ${triangleW} 0 L 0 ${triangleH} M ${triangleW2} 0 L 0 ${triangleH2} M ${triangleW} ${triangleH2} L ${triangleW2} ${triangleH}`}
              fill="none"
              stroke={patternColor}
              strokeWidth="1"
              strokeOpacity={patternOpacity}
            />
          </pattern>
        )}

        {/* Pattern: Hexagons */}
        {pattern === 'hexagons' && (
          <pattern
            id="canvas-bg-pattern"
            width={hexW}
            height={hexH}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={hexD}
              fill="none"
              stroke={patternColor}
              strokeWidth="1.2"
              strokeOpacity={patternOpacity}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </pattern>
        )}
      </defs>

      <rect
        id="canvas-pattern-plane"
        x={canvasBounds.minX}
        y={canvasBounds.minY}
        width={width}
        height={height}
        fill="url(#canvas-bg-pattern)"
        pointerEvents="none"
      />
    </>
  );
};
