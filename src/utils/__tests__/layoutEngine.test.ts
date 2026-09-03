import { describe, it, expect } from 'vitest';
import { estimateNodeSize, computeMindMapLayout } from '../layoutEngine';
import { MindMap, MindNode } from '../../types/mindmap';

describe('layoutEngine', () => {
  it('estimates node size appropriately based on text and padding', () => {
    const node: MindNode = {
      id: 'n1',
      parentId: null,
      text: 'Texto Corto',
      children: [],
      fontSize: 14,
    };
    const size = estimateNodeSize(node);
    expect(size.width).toBeGreaterThan(40);
    expect(size.height).toBeGreaterThan(20);
  });

  it('computes complete node layout coordinates for a simple mindmap', () => {
    const map: MindMap = {
      id: 'test-layout-map',
      title: 'Mapa Test',
      rootId: 'root',
      themeId: 'default',
      layout: 'standard',
      connectors: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      nodes: {
        root: {
          id: 'root',
          parentId: null,
          text: 'Raíz',
          children: ['child-right', 'child-left'],
          fontSize: 18,
        },
        'child-right': {
          id: 'child-right',
          parentId: 'root',
          text: 'Rama Derecha',
          children: [],
          side: 'right',
        },
        'child-left': {
          id: 'child-left',
          parentId: 'root',
          text: 'Rama Izquierda',
          children: [],
          side: 'left',
        },
      },
    };

    const layout = computeMindMapLayout(map);
    expect(layout.size).toBe(3);
    const rootPos = layout.get('root');
    const rightPos = layout.get('child-right');
    const leftPos = layout.get('child-left');

    expect(rootPos).toBeDefined();
    expect(rightPos).toBeDefined();
    expect(leftPos).toBeDefined();

    // Right child should have x > root.x
    expect(rightPos!.x).toBeGreaterThan(rootPos!.x);
    // Left child should have x < root.x
    expect(leftPos!.x).toBeLessThan(rootPos!.x);
  });
});
