import { describe, it, expect } from 'vitest';
import {
  computeEdgeShadowFilter,
  parseEdgePathPoints,
  generateDoubleEdgePaths,
  generateZigzagEdgePath,
  generateWavyEdgePath,
  generateDiamondPoints,
} from '../edgeUtils';
import { MindNode, MindMap } from '../../types/mindmap';

const createNode = (overrides: Partial<MindNode> = {}): MindNode => ({
  id: 'node-1',
  text: 'Node',
  parentId: 'root',
  children: [],
  ...overrides,
});

const createMap = (overrides: Partial<MindMap> = {}): MindMap => ({
  id: 'map-1',
  title: 'Test Map',
  rootId: 'root',
  nodes: {},
  connectors: [],
  layout: 'standard',
  themeId: 'default',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

describe('edgeUtils - computeEdgeShadowFilter', () => {
  it('returns undefined when neither node nor map has shadow enabled', () => {
    const node = createNode();
    const map = createMap();
    expect(computeEdgeShadowFilter(node, '#3b82f6', map)).toBeUndefined();
  });

  it('uses global map shadow when node has no override', () => {
    const node = createNode();
    const map = createMap({ edgeShadow: true, edgeShadowPreset: 'soft' });
    const filter = computeEdgeShadowFilter(node, '#3b82f6', map);
    expect(filter).toBeDefined();
    expect(filter).toContain('drop-shadow(0 2px 4px');
    expect(filter).toContain('rgba(0,0,0,0.20)');
  });

  it('allows node to disable shadow locally even if map has global shadow enabled', () => {
    const node = createNode({ edgeShadow: false });
    const map = createMap({ edgeShadow: true });
    expect(computeEdgeShadowFilter(node, '#3b82f6', map)).toBeUndefined();
  });

  it('allows node to enable shadow locally even if map has it disabled', () => {
    const node = createNode({ edgeShadow: true, edgeShadowPreset: 'deep' });
    const map = createMap({ edgeShadow: false });
    const filter = computeEdgeShadowFilter(node, '#3b82f6', map);
    expect(filter).toBeDefined();
    expect(filter).toContain('drop-shadow(0 4px 8px');
    expect(filter).toContain('rgba(0,0,0,0.35)');
  });

  it('computes glow preset using edge color dynamically when glow preset is chosen', () => {
    const node = createNode({ edgeShadow: true, edgeShadowPreset: 'glow' });
    const filter = computeEdgeShadowFilter(node, '#10b981');
    expect(filter).toBe('drop-shadow(0 0 6px #10b981)');
  });

  it('honors custom blur, offsetY and color overrides', () => {
    const node = createNode({
      edgeShadow: true,
      edgeShadowBlur: 10,
      edgeShadowOffsetY: 3,
      edgeShadowColor: '#f59e0b',
    });
    const filter = computeEdgeShadowFilter(node, '#3b82f6');
    expect(filter).toBe('drop-shadow(0 3px 10px #f59e0b)');
  });
});

describe('edgeUtils - advanced edge line paths', () => {
  const linePath = 'M 0 0 L 100 0';
  const polylinePath = 'M 0 0 L 50 0 L 60 10 L 60 50 L 70 60 L 120 60';
  const bezierPath = 'M 0 0 C 40 0, 60 100, 100 100';

  it('parseEdgePathPoints parses straight lines and deduplicates points', () => {
    const pts = parseEdgePathPoints(linePath);
    expect(pts.length).toBe(2);
    expect(pts[0]).toEqual({ x: 0, y: 0 });
    expect(pts[1]).toEqual({ x: 100, y: 0 });
  });

  it('parseEdgePathPoints samples cubic bezier curves into sequential points', () => {
    const pts = parseEdgePathPoints(bezierPath);
    expect(pts.length).toBeGreaterThan(10);
    expect(pts[0].x).toBeCloseTo(0);
    expect(pts[0].y).toBeCloseTo(0);
    expect(pts[pts.length - 1].x).toBeCloseTo(100);
    expect(pts[pts.length - 1].y).toBeCloseTo(100);
  });

  it('generateDoubleEdgePaths produces two offset parallel paths with specified gap', () => {
    const [pathA, pathB] = generateDoubleEdgePaths(linePath, 6);
    expect(pathA).toContain('M');
    expect(pathB).toContain('M');
    // Horizontal line along X: normal is perpendicular along Y
    // One line should be at Y = 3, other at Y = -3
    expect(pathA).toContain('3.00');
    expect(pathB).toContain('-3.00');
  });

  it('generateZigzagEdgePath produces alternating peaks along segments', () => {
    const zigzag = generateZigzagEdgePath(linePath, 8, 20);
    expect(zigzag.startsWith('M')).toBe(true);
    expect(zigzag).toContain('L');
    // Multiple teeth should be present
    const segments = zigzag.split('L');
    expect(segments.length).toBeGreaterThan(4);
  });

  it('generateWavyEdgePath produces smooth quadratic bezier curves along segments', () => {
    const wavy = generateWavyEdgePath(linePath, 8, 25);
    expect(wavy.startsWith('M')).toBe(true);
    expect(wavy).toContain('Q');
    const curves = wavy.split('Q');
    expect(curves.length).toBeGreaterThan(3);
  });

  it('generateDiamondPoints samples diamond coordinate centers along path', () => {
    const diamonds = generateDiamondPoints(polylinePath, 15);
    expect(diamonds.length).toBeGreaterThan(5);
    expect(diamonds[0].x).toBe(0);
    expect(diamonds[0].y).toBe(0);
  });
});

