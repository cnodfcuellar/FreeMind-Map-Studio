import { describe, it, expect } from 'vitest';
import {
  resolveRectangleCorners,
  isRectangleSvgShape,
  isSquareRotated,
  computeRectangleBorderRadius,
  computeRectangleSvgPath,
} from '../rectangleCornerUtils';
import { MindNode } from '../../types/mindmap';

const createNode = (overrides?: Partial<MindNode>): MindNode => ({
  id: 'node-1',
  text: 'Test Node',
  parentId: null,
  children: [],
  ...overrides,
});

describe('rectangleCornerUtils', () => {
  describe('resolveRectangleCorners', () => {
    it('defaults to sharp with 0 radius and all corners true', () => {
      const node = createNode({ shape: 'rectangle' });
      const config = resolveRectangleCorners(node);
      expect(config.style).toBe('sharp');
      expect(config.radius).toBe(0);
      expect(config.topLeft).toBe(true);
      expect(config.topRight).toBe(true);
      expect(config.bottomRight).toBe(true);
      expect(config.bottomLeft).toBe(true);
    });

    it('applies default radius 8 for rounded, 6 for bevel, 10 for concave', () => {
      expect(resolveRectangleCorners(createNode({ rectCornerStyle: 'rounded' })).radius).toBe(8);
      expect(resolveRectangleCorners(createNode({ rectCornerStyle: 'bevel' })).radius).toBe(6);
      expect(resolveRectangleCorners(createNode({ rectCornerStyle: 'concave' })).radius).toBe(10);
    });

    it('respects explicit rectRadius', () => {
      const node = createNode({ rectCornerStyle: 'rounded', rectRadius: 14 });
      expect(resolveRectangleCorners(node).radius).toBe(14);
    });

    it('respects asymmetric corner flags when set to false', () => {
      const node = createNode({
        rectCornerStyle: 'rounded',
        rectCornerTopRight: false,
        rectCornerBottomLeft: false,
      });
      const config = resolveRectangleCorners(node);
      expect(config.topLeft).toBe(true);
      expect(config.topRight).toBe(false);
      expect(config.bottomRight).toBe(true);
      expect(config.bottomLeft).toBe(false);
    });
  });

  describe('isSquareRotated', () => {
    it('detects rotated square when squareRotation is 45 or -45', () => {
      expect(isSquareRotated(createNode({ shape: 'square', squareRotation: 45 }))).toBe(true);
      expect(isSquareRotated(createNode({ shape: 'square', squareRotation: -45 }))).toBe(true);
      expect(isSquareRotated(createNode({ shape: 'square', squareRotation: 0 }))).toBe(false);
      expect(isSquareRotated(createNode({ shape: 'square' }))).toBe(false);
      expect(isSquareRotated(createNode({ shape: 'rectangle', squareRotation: 45 }))).toBe(false);
    });
  });

  describe('isRectangleSvgShape', () => {
    it('returns true for bevel/concave corners or rotated square (45° diamond)', () => {
      expect(isRectangleSvgShape(createNode({ shape: 'rectangle', rectCornerStyle: 'bevel' }))).toBe(true);
      expect(isRectangleSvgShape(createNode({ shape: 'square', rectCornerStyle: 'concave' }))).toBe(true);
      expect(isRectangleSvgShape(createNode({ shape: 'square', squareRotation: 45 }))).toBe(true);
      expect(isRectangleSvgShape(createNode({ shape: 'square', squareRotation: 0, rectCornerStyle: 'rounded' }))).toBe(false);
      expect(isRectangleSvgShape(createNode({ shape: 'rectangle', rectCornerStyle: 'rounded' }))).toBe(false);
      expect(isRectangleSvgShape(createNode({ shape: 'rectangle', rectCornerStyle: 'sharp' }))).toBe(false);
      expect(isRectangleSvgShape(createNode({ shape: 'bubble', rectCornerStyle: 'bevel' }))).toBe(false);
      expect(isRectangleSvgShape(createNode({ shape: 'hexagon', rectCornerStyle: 'bevel' }))).toBe(false);
    });
  });

  describe('computeRectangleBorderRadius', () => {
    it('returns 0px for sharp corners or 0 radius', () => {
      expect(computeRectangleBorderRadius(createNode({ shape: 'rectangle' }))).toBe('0px');
      expect(computeRectangleBorderRadius(createNode({ shape: 'rectangle', rectCornerStyle: 'sharp' }))).toBe('0px');
      expect(computeRectangleBorderRadius(createNode({ shape: 'rectangle', rectCornerStyle: 'rounded', rectRadius: 0 }))).toBe('0px');
    });

    it('returns uniform border-radius when all corners are active', () => {
      const node = createNode({ shape: 'rectangle', rectCornerStyle: 'rounded', rectRadius: 8 });
      expect(computeRectangleBorderRadius(node)).toBe('8px 8px 8px 8px');
    });

    it('returns asymmetric border-radius when some corners are disabled', () => {
      const node = createNode({
        shape: 'rectangle',
        rectCornerStyle: 'rounded',
        rectRadius: 12,
        rectCornerTopRight: false,
        rectCornerBottomLeft: false,
      });
      expect(computeRectangleBorderRadius(node)).toBe('12px 0px 12px 0px');
    });
  });

  describe('computeRectangleSvgPath', () => {
    it('generates a simple rectangle path for sharp or 0 radius', () => {
      const node = createNode({ shape: 'rectangle', rectCornerStyle: 'sharp' });
      const path = computeRectangleSvgPath(100, 50, node, 2);
      expect(path).toBe('M 1,1 L 99,1 L 99,49 L 1,49 Z');
    });

    it('generates beveled corners path', () => {
      const node = createNode({
        shape: 'rectangle',
        rectCornerStyle: 'bevel',
        rectRadius: 10,
      });
      const path = computeRectangleSvgPath(100, 50, node, 2);
      // TL (1+10, 1) -> TR (99-10, 1) -> (99, 1+10) -> BR (99, 49-10) -> (99-10, 49) -> BL (1+10, 49) -> (1, 49-10) -> TL (1, 1+10) -> (1+10, 1) Z
      expect(path).toContain('M 11,1');
      expect(path).toContain('L 89,1');
      expect(path).toContain('L 99,11');
      expect(path).toContain('L 99,39');
      expect(path).toContain('L 89,49');
      expect(path).toContain('L 11,49');
      expect(path).toContain('L 1,39');
      expect(path).toContain('L 1,11');
      expect(path).toContain('L 11,1 Z');
    });

    it('generates concave corners path with arc commands', () => {
      const node = createNode({
        shape: 'rectangle',
        rectCornerStyle: 'concave',
        rectRadius: 10,
      });
      const path = computeRectangleSvgPath(100, 50, node, 2);
      expect(path).toContain('M 11,1');
      expect(path).toContain('A 10,10 0 0,0 99,11');
      expect(path).toContain('A 10,10 0 0,0 89,49');
      expect(path).toContain('A 10,10 0 0,0 1,39');
      expect(path).toContain('A 10,10 0 0,0 11,1');
      expect(path).toContain('Z');
    });

    it('handles asymmetry in beveled corners', () => {
      const node = createNode({
        shape: 'rectangle',
        rectCornerStyle: 'bevel',
        rectRadius: 10,
        rectCornerTopRight: false, // sharp at TR
        rectCornerBottomLeft: false, // sharp at BL
      });
      const path = computeRectangleSvgPath(100, 50, node, 2);
      // TR has no bevel: goes to (99, 1) directly and stays there
      expect(path).toContain('L 99,1');
      expect(path).not.toContain('L 89,1');
      // BL has no bevel: goes to (1, 49) directly
      expect(path).toContain('L 1,49');
    });

    it('clamps radius to half of width/height', () => {
      const node = createNode({
        shape: 'rectangle',
        rectCornerStyle: 'bevel',
        rectRadius: 100, // too large for 100x50 with pad 1 => maxR is (49 - 1)/2 = 24
      });
      const path = computeRectangleSvgPath(100, 50, node, 2);
      expect(path).toContain('M 25,1');
    });
  });
});
