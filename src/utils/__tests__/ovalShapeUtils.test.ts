import { describe, it, expect } from 'vitest';
import {
  resolveOvalConfig,
  isOvalSvgShape,
  computeOvalPadding,
  computeOvalSvgTransform,
} from '../ovalShapeUtils';
import { MindNode } from '../../types/mindmap';

const createNode = (overrides?: Partial<MindNode>): MindNode => ({
  id: 'node-1',
  text: 'Test Node',
  parentId: null,
  children: [],
  shape: 'oval',
  ...overrides,
});

describe('ovalShapeUtils', () => {
  describe('resolveOvalConfig', () => {
    it('defaults to 0 rotation, keepTextHorizontal true and classic ratio', () => {
      const node = createNode();
      const config = resolveOvalConfig(node);
      expect(config.rotation).toBe(0);
      expect(config.keepTextHorizontal).toBe(true);
      expect(config.ratio).toBe('classic');
    });

    it('respects custom rotation, preset and ratio overrides', () => {
      const node = createNode({
        ovalRotation: 45,
        ovalKeepTextHorizontal: false,
        ovalPreset: 'tilted',
        ovalRatio: 'slender',
      });
      const config = resolveOvalConfig(node);
      expect(config.rotation).toBe(45);
      expect(config.keepTextHorizontal).toBe(false);
      expect(config.preset).toBe('tilted');
      expect(config.ratio).toBe('slender');
    });
  });

  describe('isOvalSvgShape', () => {
    it('returns true only when oval is rotated AND keepTextHorizontal is true', () => {
      expect(isOvalSvgShape(createNode({ ovalRotation: 15, ovalKeepTextHorizontal: true }))).toBe(true);
      expect(isOvalSvgShape(createNode({ ovalRotation: 90 }))).toBe(true);
      // If rotation is 0, native CSS border-radius is used
      expect(isOvalSvgShape(createNode({ ovalRotation: 0 }))).toBe(false);
      // If keepTextHorizontal is false, entire container is rotated with CSS transform
      expect(isOvalSvgShape(createNode({ ovalRotation: 15, ovalKeepTextHorizontal: false }))).toBe(false);
      // If not oval shape
      expect(isOvalSvgShape(createNode({ shape: 'rectangle', ovalRotation: 15 }))).toBe(false);
    });
  });

  describe('computeOvalPadding', () => {
    it('returns wider padding for slender ratio', () => {
      const slenderPadding = computeOvalPadding(createNode({ ovalRatio: 'slender' }));
      expect(slenderPadding.paddingLeft).toBe('34px');
      expect(slenderPadding.paddingRight).toBe('34px');
    });

    it('returns taller padding for capsule ratio', () => {
      const capsulePadding = computeOvalPadding(createNode({ ovalRatio: 'capsule' }));
      expect(capsulePadding.paddingTop).toBe('10px');
      expect(capsulePadding.paddingLeft).toBe('14px');
    });

    it('returns standard padding for classic ratio', () => {
      const classicPadding = computeOvalPadding(createNode({ ovalRatio: 'classic' }));
      expect(classicPadding.paddingLeft).toBe('22px');
      expect(classicPadding.paddingTop).toBe('6px');
    });
  });

  describe('computeOvalSvgTransform', () => {
    it('computes correct SVG rotate string with center coordinates', () => {
      const transform = computeOvalSvgTransform(120, 60, 15);
      expect(transform).toBe('rotate(15 60 30)');
    });
  });
});
