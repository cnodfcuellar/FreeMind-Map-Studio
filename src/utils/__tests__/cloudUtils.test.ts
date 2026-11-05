import { describe, it, expect } from 'vitest';
import { computeCloudShadowFilter, getCloudShadowConfig } from '../cloudUtils';
import { NodeCloud } from '../../types/mindmap';

const createCloud = (overrides: Partial<NodeCloud> = {}): NodeCloud => ({
  enabled: true,
  color: '#3b82f6',
  shape: 'cloud-scallop',
  ...overrides,
});

describe('cloudUtils - getCloudShadowConfig', () => {
  it('returns undefined if cloud is missing or shadow is false/undefined', () => {
    expect(getCloudShadowConfig(undefined)).toBeUndefined();
    expect(getCloudShadowConfig(createCloud({ shadow: false }))).toBeUndefined();
    expect(getCloudShadowConfig(createCloud({ shadow: undefined }))).toBeUndefined();
  });

  it('computes island preset configuration with rich opacity and neutral dark tone', () => {
    const cloud = createCloud({ shadow: true, shadowPreset: 'island' });
    const cfg = getCloudShadowConfig(cloud);
    expect(cfg).toBeDefined();
    expect(cfg?.blur).toBe(24);
    expect(cfg?.offsetY).toBe(10);
    expect(cfg?.opacity).toBe(0.38);
    expect(cfg?.color).toBe('#0f172a');
  });

  it('computes soft and deep preset configurations', () => {
    const softCloud = createCloud({ shadow: true, shadowPreset: 'soft' });
    const softCfg = getCloudShadowConfig(softCloud);
    expect(softCfg?.blur).toBe(14);
    expect(softCfg?.offsetY).toBe(4);
    expect(softCfg?.opacity).toBe(0.22);

    const deepCloud = createCloud({ shadow: true, shadowPreset: 'deep' });
    const deepCfg = getCloudShadowConfig(deepCloud);
    expect(deepCfg?.blur).toBe(36);
    expect(deepCfg?.offsetY).toBe(16);
    expect(deepCfg?.opacity).toBe(0.58);
  });

  it('computes glow preset configuration with zero offset and border color', () => {
    const glowCloud = createCloud({ shadow: true, shadowPreset: 'glow', borderColor: '#10b981' });
    const glowCfg = getCloudShadowConfig(glowCloud);
    expect(glowCfg?.offsetY).toBe(0);
    expect(glowCfg?.color).toBe('#10b981');
    expect(glowCfg?.opacity).toBe(0.65);
  });

  it('honors custom blur, offsetY, opacity, and color overrides', () => {
    const customCloud = createCloud({
      shadow: true,
      shadowBlur: 32,
      shadowOffsetY: 12,
      shadowOpacity: 0.75,
      shadowColor: '#ec4899',
    });
    const cfg = getCloudShadowConfig(customCloud);
    expect(cfg?.blur).toBe(32);
    expect(cfg?.offsetY).toBe(12);
    expect(cfg?.opacity).toBe(0.75);
    expect(cfg?.color).toBe('#ec4899');
  });

  it('generates fallback filter string correctly in computeCloudShadowFilter', () => {
    const cloud = createCloud({ shadow: true, shadowPreset: 'island', shadowBlur: 20, shadowOffsetY: 8, shadowColor: '#334155' });
    expect(computeCloudShadowFilter(cloud)).toBe('drop-shadow(0 8px 20px #334155)');
  });
});
