import { describe, it, expect } from 'vitest';
import {
  resolveBubbleTailSide,
  computeBubbleTailGeometry,
} from '../bubbleTailUtils';
import { MindNode } from '../../types/mindmap';

const createNode = (overrides: Partial<MindNode> = {}): MindNode => ({
  id: overrides.id || 'test-node',
  text: overrides.text || 'Test Bubble',
  parentId: null,
  children: [],
  ...overrides,
});

describe('bubbleTailUtils', () => {
  describe('resolveBubbleTailSide', () => {
    it('returns explicit tailSide when specified and not auto', () => {
      expect(resolveBubbleTailSide('bottom', 'left')).toBe('bottom');
      expect(resolveBubbleTailSide('top', 'right')).toBe('top');
      expect(resolveBubbleTailSide('left', 'left')).toBe('left');
      expect(resolveBubbleTailSide('right', 'right')).toBe('right');
    });

    it('resolves cardinal side automatically based on layoutSide when auto or undefined', () => {
      expect(resolveBubbleTailSide('auto', 'left')).toBe('right');
      expect(resolveBubbleTailSide('auto', 'right')).toBe('left');
      expect(resolveBubbleTailSide('auto', 'bottom')).toBe('top');
      expect(resolveBubbleTailSide('auto', 'top')).toBe('bottom');

      expect(resolveBubbleTailSide(undefined, 'left')).toBe('right');
      expect(resolveBubbleTailSide(undefined, 'right')).toBe('left');
      expect(resolveBubbleTailSide(undefined, undefined)).toBe('left');
    });
  });

  describe('computeBubbleTailGeometry', () => {
    it('returns null for non-bubble shapes', () => {
      const node = createNode({ shape: 'rectangle' });
      expect(computeBubbleTailGeometry({ node, layoutSide: 'right' })).toBeNull();

      const hexNode = createNode({ shape: 'hexagon' });
      expect(computeBubbleTailGeometry({ node: hexNode, layoutSide: 'right' })).toBeNull();
    });

    it('returns null when tailLength is 0 (tail disabled)', () => {
      const node = createNode({ shape: 'bubble', tailLength: 0 });
      expect(computeBubbleTailGeometry({ node, layoutSide: 'right' })).toBeNull();
    });

    it('uses defaults (length: 12, width: 14, offset: 50%, style: straight)', () => {
      const node = createNode({ shape: 'bubble' });
      const geom = computeBubbleTailGeometry({ node, layoutSide: 'right' });
      expect(geom).not.toBeNull();
      if (!geom) return;

      expect(geom.resolvedSide).toBe('left');
      expect(geom.svgWidth).toBe(12);
      expect(geom.svgHeight).toBe(14);
      expect(geom.viewBox).toBe('0 0 12 14');
      expect(geom.pathD).toBe('M 12,0 L 0,7 L 12,14 Z');
      expect(geom.coverLine).toEqual({ x1: 12, y1: 0, x2: 12, y2: 14 });
      expect(geom.containerStyle.top).toBe('50%');
      expect(geom.thoughtCircles).toBeUndefined();
    });

    it('computes right-pointing tail correctly', () => {
      const node = createNode({ shape: 'bubble', tailSide: 'right', tailLength: 16, tailWidth: 20 });
      const geom = computeBubbleTailGeometry({ node, layoutSide: 'right' });
      expect(geom).not.toBeNull();
      if (!geom) return;

      expect(geom.resolvedSide).toBe('right');
      expect(geom.svgWidth).toBe(16);
      expect(geom.svgHeight).toBe(20);
      expect(geom.pathD).toBe('M 0,0 L 16,10 L 0,20 Z');
      expect(geom.coverLine).toEqual({ x1: 0, y1: 0, x2: 0, y2: 20 });
    });

    it('computes bottom-pointing tail correctly', () => {
      const node = createNode({ shape: 'bubble', tailSide: 'bottom', tailLength: 18, tailWidth: 22, tailOffset: 30 });
      const geom = computeBubbleTailGeometry({ node, layoutSide: 'left' });
      expect(geom).not.toBeNull();
      if (!geom) return;

      expect(geom.resolvedSide).toBe('bottom');
      expect(geom.svgWidth).toBe(22);
      expect(geom.svgHeight).toBe(18);
      expect(geom.containerStyle.left).toBe('30%');
      expect(geom.pathD).toBe('M 0,0 L 11,18 L 22,0 Z');
      expect(geom.coverLine).toEqual({ x1: 0, y1: 0, x2: 22, y2: 0 });
    });

    it('computes top-pointing tail correctly', () => {
      const node = createNode({ shape: 'bubble', tailSide: 'top', tailLength: 10, tailWidth: 16, tailOffset: 70 });
      const geom = computeBubbleTailGeometry({ node, layoutSide: 'right' });
      expect(geom).not.toBeNull();
      if (!geom) return;

      expect(geom.resolvedSide).toBe('top');
      expect(geom.svgWidth).toBe(16);
      expect(geom.svgHeight).toBe(10);
      expect(geom.containerStyle.left).toBe('70%');
      expect(geom.pathD).toBe('M 0,10 L 8,0 L 16,10 Z');
      expect(geom.coverLine).toEqual({ x1: 0, y1: 10, x2: 16, y2: 10 });
    });

    it('computes curved style for left and bottom', () => {
      const leftNode = createNode({ shape: 'bubble', tailSide: 'left', tailStyle: 'curved' });
      const leftGeom = computeBubbleTailGeometry({ node: leftNode });
      expect(leftGeom?.pathD).toContain('Q');
      expect(leftGeom?.coverLine).toBeDefined();

      const bottomNode = createNode({ shape: 'bubble', tailSide: 'bottom', tailStyle: 'curved' });
      const bottomGeom = computeBubbleTailGeometry({ node: bottomNode });
      expect(bottomGeom?.pathD).toContain('Q');
      expect(bottomGeom?.coverLine).toBeDefined();
    });

    it('computes thought bubbles (3 decreasing circles) without cover line', () => {
      const thoughtNode = createNode({ shape: 'bubble', tailStyle: 'thought', tailLength: 20, tailWidth: 18 });
      const geom = computeBubbleTailGeometry({ node: thoughtNode, layoutSide: 'right' });
      expect(geom).not.toBeNull();
      if (!geom) return;

      expect(geom.thoughtCircles).toBeDefined();
      expect(geom.thoughtCircles?.length).toBe(3);
      expect(geom.coverLine).toBeUndefined();
      expect(geom.pathD).toBeUndefined();

      // Check decreasing radius
      const [c1, c2, c3] = geom.thoughtCircles!;
      expect(c1.r).toBeGreaterThan(c2.r);
      expect(c2.r).toBeGreaterThan(c3.r);
    });

    it('clamps tailOffset between 10% and 90%', () => {
      const lowNode = createNode({ shape: 'bubble', tailOffset: 2 });
      const lowGeom = computeBubbleTailGeometry({ node: lowNode });
      expect(lowGeom?.containerStyle.top).toBe('10%');

      const highNode = createNode({ shape: 'bubble', tailOffset: 98 });
      const highGeom = computeBubbleTailGeometry({ node: highNode });
      expect(highGeom?.containerStyle.top).toBe('90%');
    });
  });
});

