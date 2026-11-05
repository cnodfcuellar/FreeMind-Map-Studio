import { describe, it, expect } from 'vitest';
import { computeEdgeShadowFilter } from '../edgeUtils';
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

