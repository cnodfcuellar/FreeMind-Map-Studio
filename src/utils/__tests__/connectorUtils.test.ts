import { describe, it, expect } from 'vitest';
import { calculateConnectorGeometry } from '../connectorUtils';
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
});
