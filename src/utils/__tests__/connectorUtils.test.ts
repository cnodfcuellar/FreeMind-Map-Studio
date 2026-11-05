import { describe, it, expect } from 'vitest';
import { calculateConnectorGeometry, computeConnectorShadowFilter } from '../connectorUtils';
import { Connector } from '../../types/mindmap';

describe('connectorUtils', () => {
  const baseConnector: Connector = {
    id: 'conn-1',
    fromId: 'node-1',
    toId: 'node-2',
    color: '#3b82f6',
    shape: 'curved',
  };

  it('calculates curved quadratic bezier geometry correctly', () => {
    const geo = calculateConnectorGeometry(0, 0, 100, 100, baseConnector);
    expect(geo.pathD).toContain('M 0 0 Q');
    expect(geo.midX).toBe(50);
    expect(geo.midY).toBe(50);
    expect(typeof geo.labelX).toBe('number');
    expect(typeof geo.labelY).toBe('number');
  });

  it('calculates straight line geometry correctly', () => {
    const geo = calculateConnectorGeometry(0, 0, 100, 100, {
      ...baseConnector,
      shape: 'straight',
    });
    expect(geo.pathD).toBe('M 0 0 L 100 100');
    expect(geo.labelX).toBe(50);
    expect(geo.labelY).toBe(44);
  });

  it('calculates orthogonal step line geometry correctly', () => {
    const geo = calculateConnectorGeometry(0, 0, 100, 100, {
      ...baseConnector,
      shape: 'step',
    });
    expect(geo.pathD).toContain('M 0 0 L');
    expect(geo.pathD).toContain('L 100 100');
  });

  it('computes connector shadow filter correctly', () => {
    expect(computeConnectorShadowFilter(baseConnector)).toBeUndefined();

    const softConn: Connector = { ...baseConnector, shadow: true, shadowPreset: 'soft' };
    expect(computeConnectorShadowFilter(softConn)).toBe('drop-shadow(0 2px 4px rgba(0,0,0,0.20))');

    const deepConn: Connector = { ...baseConnector, shadow: true, shadowPreset: 'deep' };
    expect(computeConnectorShadowFilter(deepConn)).toBe('drop-shadow(0 4px 10px rgba(0,0,0,0.35))');

    const glowConn: Connector = { ...baseConnector, shadow: true, shadowPreset: 'glow' };
    expect(computeConnectorShadowFilter(glowConn)).toBe('drop-shadow(0 0 8px #3b82f6)');

    const customConn: Connector = {
      ...baseConnector,
      shadow: true,
      shadowBlur: 10,
      shadowOffsetY: 5,
      shadowColor: '#ec4899',
    };
    expect(computeConnectorShadowFilter(customConn)).toBe('drop-shadow(0 5px 10px #ec4899)');
  });
});
