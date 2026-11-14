import { describe, it, expect } from 'vitest';
import {
  resolveArrowConfig,
  computeArrowPolygonPoints,
  computeArrowContentPadding,
  DEFAULT_ARROW_TIP_RATIO,
} from '../arrowShapeUtils';
import { MindNode } from '../../types/mindmap';

const createNode = (overrides?: Partial<MindNode>): MindNode => ({
  id: 'node-arrow-1',
  text: 'Arrow Node',
  parentId: null,
  children: [],
  shape: 'arrow',
  ...overrides,
});

describe('arrowShapeUtils', () => {
  describe('resolveArrowConfig', () => {
    it('returns default config when no arrow properties are set', () => {
      const node = createNode();
      const config = resolveArrowConfig(node);
      expect(config.direction).toBe('right');
      expect(config.effectiveDirection).toBe('right');
      expect(config.autoOrient).toBe(false);
      expect(config.tailStyle).toBe('notch');
      expect(config.isBidirectional).toBe(false);
      expect(config.tipRatio).toBe(DEFAULT_ARROW_TIP_RATIO);
    });

    it('resolves effectiveDirection to left when autoOrient is true and node.side is left', () => {
      const node = createNode({
        arrowAutoOrient: true,
        arrowDirection: 'right',
        side: 'left',
      });
      const config = resolveArrowConfig(node);
      expect(config.autoOrient).toBe(true);
      expect(config.direction).toBe('right');
      expect(config.effectiveDirection).toBe('left');
    });

    it('resolves effectiveDirection to right when autoOrient is true and node.side is right', () => {
      const node = createNode({
        arrowAutoOrient: true,
        arrowDirection: 'left',
        side: 'right',
      });
      const config = resolveArrowConfig(node);
      expect(config.effectiveDirection).toBe('right');
    });

    it('retains manual direction when autoOrient is false', () => {
      const node = createNode({
        arrowAutoOrient: false,
        arrowDirection: 'up',
        side: 'left',
      });
      const config = resolveArrowConfig(node);
      expect(config.effectiveDirection).toBe('up');
    });

    it('clamps tipRatio between 0.15 and 0.50', () => {
      const nodeLow = createNode({ arrowTipRatio: 0.05 });
      expect(resolveArrowConfig(nodeLow).tipRatio).toBe(0.15);

      const nodeHigh = createNode({ arrowTipRatio: 0.9 });
      expect(resolveArrowConfig(nodeHigh).tipRatio).toBe(0.5);
    });
  });

  describe('computeArrowPolygonPoints', () => {
    const w = 150;
    const h = 50;

    it('calculates polygon for right arrow with notch', () => {
      const node = createNode({ arrowDirection: 'right', arrowTailStyle: 'notch' });
      const pts = computeArrowPolygonPoints(w, h, node);
      expect(pts).toBeDefined();
      expect(pts.split(' ').length).toBe(6); // 6 points for chevron arrow
    });

    it('calculates polygon for right arrow with flat tail', () => {
      const node = createNode({ arrowDirection: 'right', arrowTailStyle: 'flat' });
      const pts = computeArrowPolygonPoints(w, h, node);
      expect(pts.split(' ').length).toBe(5); // 5 points for flat-tailed arrow
    });

    it('calculates polygon for left arrow with notch and flat tail', () => {
      const nodeNotch = createNode({ arrowDirection: 'left', arrowTailStyle: 'notch' });
      const ptsNotch = computeArrowPolygonPoints(w, h, nodeNotch);
      expect(ptsNotch.split(' ').length).toBe(6);

      const nodeFlat = createNode({ arrowDirection: 'left', arrowTailStyle: 'flat' });
      const ptsFlat = computeArrowPolygonPoints(w, h, nodeFlat);
      expect(ptsFlat.split(' ').length).toBe(5);
    });

    it('calculates polygon for vertical arrows (up and down)', () => {
      const nodeUp = createNode({ arrowDirection: 'up', arrowTailStyle: 'notch' });
      const ptsUp = computeArrowPolygonPoints(w, h, nodeUp);
      expect(ptsUp.split(' ').length).toBe(6);

      const nodeDown = createNode({ arrowDirection: 'down', arrowTailStyle: 'flat' });
      const ptsDown = computeArrowPolygonPoints(w, h, nodeDown);
      expect(ptsDown.split(' ').length).toBe(5);
    });

    it('calculates symmetric polygon for bidirectional arrow', () => {
      const nodeBidi = createNode({ arrowBidirectional: true });
      const ptsBidi = computeArrowPolygonPoints(w, h, nodeBidi);
      expect(ptsBidi.split(' ').length).toBe(6);
    });
  });

  describe('computeArrowContentPadding', () => {
    it('provides asymmetric horizontal padding for right vs left arrows', () => {
      const nodeRight = createNode({ arrowDirection: 'right', arrowTailStyle: 'notch' });
      const padRight = computeArrowContentPadding(nodeRight);
      expect(padRight.paddingRight).toBe('36px');
      expect(padRight.paddingLeft).toBe('24px');

      const nodeLeft = createNode({ arrowDirection: 'left', arrowTailStyle: 'notch' });
      const padLeft = computeArrowContentPadding(nodeLeft);
      expect(padLeft.paddingLeft).toBe('36px');
      expect(padLeft.paddingRight).toBe('24px');
    });

    it('provides asymmetric vertical padding for up vs down arrows', () => {
      const nodeUp = createNode({ arrowDirection: 'up', arrowTailStyle: 'flat' });
      const padUp = computeArrowContentPadding(nodeUp);
      expect(padUp.paddingTop).toBe('32px');
      expect(padUp.paddingBottom).toBe('8px');

      const nodeDown = createNode({ arrowDirection: 'down', arrowTailStyle: 'flat' });
      const padDown = computeArrowContentPadding(nodeDown);
      expect(padDown.paddingBottom).toBe('32px');
      expect(padDown.paddingTop).toBe('8px');
    });

    it('provides balanced padding for bidirectional arrows', () => {
      const nodeBidi = createNode({ arrowBidirectional: true });
      const padBidi = computeArrowContentPadding(nodeBidi);
      expect(padBidi.paddingLeft).toBe('36px');
      expect(padBidi.paddingRight).toBe('36px');
    });
  });
});
