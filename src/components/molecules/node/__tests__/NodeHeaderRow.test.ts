import { describe, it, expect } from 'vitest';
import { computeNodeTextShadow, computeNodeImageShadow } from '../NodeHeaderRow';
import { MindNode } from '../../../../types/mindmap';

const baseNode: MindNode = {
  id: 'node-1',
  text: 'Test Node',
  parentId: null,
  children: [],
};

describe('computeNodeTextShadow', () => {
  it('returns undefined when textShadow is false or undefined', () => {
    expect(computeNodeTextShadow(baseNode)).toBeUndefined();
    expect(computeNodeTextShadow({ ...baseNode, textShadow: false })).toBeUndefined();
  });

  it('computes soft shadow by default when textShadow is true', () => {
    const shadow = computeNodeTextShadow({ ...baseNode, textShadow: true });
    expect(shadow).toBe('0px 1px 3px rgba(0,0,0,0.65)');
  });

  it('computes medium shadow preset correctly', () => {
    const shadow = computeNodeTextShadow({
      ...baseNode,
      textShadow: true,
      textShadowPreset: 'medium',
    });
    expect(shadow).toBe('0px 1px 4px rgba(0,0,0,0.75)');
  });

  it('computes deep shadow preset correctly', () => {
    const shadow = computeNodeTextShadow({
      ...baseNode,
      textShadow: true,
      textShadowPreset: 'deep',
    });
    expect(shadow).toBe('0px 2px 6px rgba(0,0,0,0.85)');
  });

  it('computes glow shadow preset correctly with cyan default glow', () => {
    const shadow = computeNodeTextShadow({
      ...baseNode,
      textShadow: true,
      textShadowPreset: 'glow',
    });
    expect(shadow).toContain('0 0 8px #38bdf8');
    expect(shadow).toContain('rgba(255,255,255,0.85)');
  });

  it('respects custom color, blur and offsets', () => {
    const shadow = computeNodeTextShadow({
      ...baseNode,
      textShadow: true,
      textShadowColor: '#ff0000',
      textShadowBlur: 10,
      textShadowOffsetX: 2,
      textShadowOffsetY: 3,
    });
    expect(shadow).toBe('2px 3px 10px #ff0000');
  });
});

describe('computeNodeImageShadow', () => {
  it('returns undefined when imageShadow is false or undefined', () => {
    expect(computeNodeImageShadow(baseNode)).toBeUndefined();
    expect(computeNodeImageShadow({ ...baseNode, imageShadow: false })).toBeUndefined();
  });

  it('computes soft drop-shadow by default when imageShadow is true', () => {
    const shadow = computeNodeImageShadow({ ...baseNode, imageShadow: true });
    expect(shadow).toBe('drop-shadow(0px 2px 4px rgba(0,0,0,0.25))');
  });

  it('computes medium drop-shadow preset', () => {
    const shadow = computeNodeImageShadow({
      ...baseNode,
      imageShadow: true,
      imageShadowPreset: 'medium',
    });
    expect(shadow).toBe('drop-shadow(0px 3px 8px rgba(0,0,0,0.38))');
  });

  it('computes deep drop-shadow preset', () => {
    const shadow = computeNodeImageShadow({
      ...baseNode,
      imageShadow: true,
      imageShadowPreset: 'deep',
    });
    expect(shadow).toBe('drop-shadow(0px 6px 14px rgba(0,0,0,0.55))');
  });

  it('computes glow drop-shadow preset', () => {
    const shadow = computeNodeImageShadow({
      ...baseNode,
      imageShadow: true,
      imageShadowPreset: 'glow',
    });
    expect(shadow).toBe('drop-shadow(0px 0px 12px #38bdf8)');
  });

  it('respects custom color and blur', () => {
    const shadow = computeNodeImageShadow({
      ...baseNode,
      imageShadow: true,
      imageShadowBlur: 20,
      imageShadowColor: '#ec4899',
    });
    expect(shadow).toBe('drop-shadow(0px 2px 20px #ec4899)');
  });
});

