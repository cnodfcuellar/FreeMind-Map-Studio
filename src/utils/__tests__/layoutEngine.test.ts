import { describe, it, expect } from 'vitest';
import { estimateNodeSize, computeMindMapLayout, generateEdgePath, generateRibbonEdgePath } from '../layoutEngine';
import { MindMap, MindNode, CalculatedNodeLayout } from '../../types/mindmap';

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

  it('adjusts rotated square (rombo 45°) to an adaptive horizontal diamond (aspect ratio ~1.55) enclosing content', () => {
    const normalSquare: MindNode = {
      id: 'sq1',
      parentId: null,
      text: '¿Es viable?',
      shape: 'square',
      squareRotation: 0,
      children: [],
      fontSize: 14,
    };

    const diamondNode: MindNode = {
      ...normalSquare,
      id: 'sq2',
      squareRotation: 45,
    };

    const normalSize = estimateNodeSize(normalSquare);
    const diamondSize = estimateNodeSize(diamondNode);

    // Standard square maintains 1:1 aspect ratio
    expect(normalSize.width).toBe(normalSize.height);

    // Rotated square adapts to a horizontal decision diamond (w > h, ~1.55 ratio)
    expect(diamondSize.width).toBeGreaterThan(diamondSize.height);
    expect(diamondSize.width / diamondSize.height).toBeCloseTo(1.55, 1);

    // Bounding diamond safely encloses text with room to spare
    expect(diamondSize.width).toBeGreaterThanOrEqual(normalSize.width);
    expect(diamondSize.height).toBeGreaterThanOrEqual(48);
  });

  describe('generateEdgePath - bracket style (45° chamfered bracket)', () => {
    const createTestLayout = (
      id: string,
      x: number,
      y: number,
      width: number,
      height: number,
      side: 'right' | 'left' | 'top' | 'bottom' | 'radial'
    ): CalculatedNodeLayout => ({
      id,
      x,
      y,
      width,
      height,
      depth: 0,
      side,
      branchIndex: 0,
      bounds: { minX: x, maxX: x + width, minY: y, maxY: y + height },
    });

    const parentLayout = createTestLayout('parent', 100, 200, 120, 60, 'right');

    it('generates direct horizontal line when child is vertically aligned (dy <= 3)', () => {
      const childLayout = createTestLayout('child-center', 350, 200, 100, 60, 'right');
      const path = generateEdgePath(parentLayout, childLayout, 'bracket');
      // Parent right center: (220, 230), Child left center: (350, 230)
      expect(path).toBe('M 220 230 L 350 230');
    });

    it('generates 45° chamfer cusp, vertical bus, and 45° arrival chamfer for children above or below', () => {
      const childAbove = createTestLayout('child-above', 350, 80, 100, 60, 'right');
      const path = generateEdgePath(parentLayout, childAbove, 'bracket');
      expect(path.startsWith('M 220 230')).toBe(true);
      expect(path.endsWith('L 350 110')).toBe(true);

      // Verify intermediate 45° chamfer points are present
      const commands = path.split(' L ');
      expect(commands.length).toBe(6); // M x1 y1, L xSplit y1, L xBus yCh1, L xBus yCh2, L xEntry y2, L x2 y2
    });

    it('handles left-sided trees symmetrically', () => {
      const childLeft = createTestLayout('child-left', -150, 80, 100, 60, 'left');
      const path = generateEdgePath(parentLayout, childLeft, 'bracket');
      // Parent left center: (100, 230)
      expect(path.startsWith('M 100 230')).toBe(true);
      expect(path.endsWith('L -50 110')).toBe(true);
    });

    it('handles vertical bottom and top layouts with 45° chamfers', () => {
      const bottomChild = createTestLayout('child-bottom', 250, 400, 100, 60, 'bottom');
      const pathBottom = generateEdgePath(parentLayout, bottomChild, 'bracket');
      expect(pathBottom.startsWith('M 160 260')).toBe(true);
      expect(pathBottom.endsWith('L 300 400')).toBe(true);
    });

    it('generates exact 45° chamfered bracket path for bracket-bevel-45', () => {
      const childAbove = createTestLayout('child-above', 350, 80, 100, 60, 'right');
      const path = generateEdgePath(parentLayout, childAbove, 'bracket-bevel-45');
      expect(path.startsWith('M 220 230')).toBe(true);
      expect(path.endsWith('L 350 110')).toBe(true);
      const points = path.split(' L ');
      expect(points.length).toBe(6);
    });

    it('generates pure 90° orthogonal bracket path for bracket-square', () => {
      const childAbove = createTestLayout('child-above', 350, 80, 100, 60, 'right');
      const path = generateEdgePath(parentLayout, childAbove, 'bracket-square');
      expect(path.startsWith('M 220 230')).toBe(true);
      expect(path.endsWith('L 350 110')).toBe(true);
      const points = path.split(' L ');
      expect(points.length).toBe(4); // M x1 y1, L xBus y1, L xBus y2, L x2 y2
    });
  });

  describe('generateRibbonEdgePath - variable thickness ribbon across all edge styles', () => {
    const createTestLayout = (
      id: string,
      x: number,
      y: number,
      width: number,
      height: number,
      side: 'right' | 'left' | 'top' | 'bottom' | 'radial'
    ): CalculatedNodeLayout => ({
      id,
      x,
      y,
      width,
      height,
      depth: 0,
      side,
      branchIndex: 0,
      bounds: { minX: x, maxX: x + width, minY: y, maxY: y + height },
    });

    const parent = createTestLayout('p', 100, 200, 120, 60, 'right');
    const child = createTestLayout('c', 350, 80, 100, 60, 'right');

    it('returns null when profile is uniform or edgeStyle is hidden', () => {
      expect(generateRibbonEdgePath(parent, child, 'bracket', 'bubble', 'uniform')).toBeNull();
      expect(generateRibbonEdgePath(parent, child, 'hidden', 'bubble', 'tapered')).toBeNull();
    });

    it('generates closed ribbon polygon for bracket + tapered', () => {
      const ribbon = generateRibbonEdgePath(parent, child, 'bracket', 'bubble', 'tapered', 3);
      expect(ribbon).not.toBeNull();
      expect(ribbon?.startsWith('M')).toBe(true);
      expect(ribbon?.endsWith('Z')).toBe(true);
    });

    it('generates closed ribbon polygon for horizontal + spindle', () => {
      const ribbon = generateRibbonEdgePath(parent, child, 'horizontal', 'bubble', 'spindle', 3);
      expect(ribbon).not.toBeNull();
      expect(ribbon?.startsWith('M')).toBe(true);
      expect(ribbon?.endsWith('Z')).toBe(true);
    });

    it('generates closed ribbon polygon for sharp + hourglass', () => {
      const ribbon = generateRibbonEdgePath(parent, child, 'sharp', 'bubble', 'hourglass', 3);
      expect(ribbon).not.toBeNull();
      expect(ribbon?.startsWith('M')).toBe(true);
      expect(ribbon?.endsWith('Z')).toBe(true);
    });
  });
});
