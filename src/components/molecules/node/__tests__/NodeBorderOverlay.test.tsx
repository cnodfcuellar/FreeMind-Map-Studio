import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { NodeBorderOverlay } from '../NodeBorderOverlay';
import type { MindNode } from '../../../../types/mindmap';

const createMockNode = (overrides?: Partial<MindNode>): MindNode => ({
  id: 'node-test',
  text: 'Texto de prueba',
  parentId: null,
  children: [],
  ...overrides,
});

describe('NodeBorderOverlay', () => {
  it('returns null if borderWidth is 0', () => {
    const node = createMockNode({ borderWidth: 0, borderStyle: 'double' });
    const { container } = render(
      <NodeBorderOverlay node={node} width={150} height={60} borderColor="#3b82f6" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null for simple solid border (delegated to native CSS)', () => {
    const node = createMockNode({ borderWidth: 2, borderStyle: 'solid' });
    const { container } = render(
      <NodeBorderOverlay node={node} width={150} height={60} borderColor="#3b82f6" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders concentric outer and inner rectangles for double border with gap and custom colors', () => {
    const node = createMockNode({
      borderWidth: 2,
      borderStyle: 'double',
      borderGap: 4,
      borderColorInner: '#facc15',
      borderColorOuter: '#1e40af',
    });
    const { container } = render(
      <NodeBorderOverlay node={node} width={150} height={60} borderRadius={12} borderColor="#3b82f6" />
    );
    expect(container.querySelector('svg')).toBeDefined();
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBe(2);
    // Outer rect
    expect(rects[0].getAttribute('stroke')).toBe('#1e40af');
    // Inner rect
    expect(rects[1].getAttribute('stroke')).toBe('#facc15');
  });

  it('renders procedural zigzag path', () => {
    const node = createMockNode({
      borderWidth: 2.5,
      borderStyle: 'zigzag',
      borderZigzagHeight: 8,
      borderZigzagFreq: 16,
    });
    const { container } = render(
      <NodeBorderOverlay node={node} width={150} height={60} borderColor="#ef4444" />
    );
    const path = container.querySelector('path');
    expect(path).toBeDefined();
    expect(path?.getAttribute('stroke')).toBe('#ef4444');
    expect(path?.getAttribute('d')).toContain('M ');
    expect(path?.getAttribute('d')).toContain('Z');
  });

  it('renders procedural wavy path with cubic curves', () => {
    const node = createMockNode({
      borderWidth: 2.5,
      borderStyle: 'wavy',
      borderWaveHeight: 10,
      borderWaveWidth: 32,
    });
    const { container } = render(
      <NodeBorderOverlay node={node} width={150} height={60} borderColor="#10b981" />
    );
    const path = container.querySelector('path');
    expect(path).toBeDefined();
    expect(path?.getAttribute('stroke')).toBe('#10b981');
    expect(path?.getAttribute('d')).toContain('C ');
  });

  it('renders custom dashed border with dash length and space', () => {
    const node = createMockNode({
      borderWidth: 2,
      borderStyle: 'dashed',
      borderDashLength: 12,
      borderDashSpace: 6,
    });
    const { container } = render(
      <NodeBorderOverlay node={node} width={150} height={60} borderColor="#6366f1" />
    );
    const rect = container.querySelector('rect');
    expect(rect?.getAttribute('stroke-dasharray')).toBe('12 6');
  });

  it('renders diamond dotted markers when borderDotShape is diamond', () => {
    const node = createMockNode({
      borderWidth: 2,
      borderStyle: 'dotted',
      borderDotShape: 'diamond',
      borderDotSpacing: 8,
    });
    const { container } = render(
      <NodeBorderOverlay node={node} width={150} height={60} borderColor="#8b5cf6" />
    );
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThan(4);
    expect(rects[0].getAttribute('transform')).toContain('rotate(45');
  });

  it('renders concentric circles for circle shape with double border', () => {
    const node = createMockNode({
      shape: 'circle',
      borderWidth: 2,
      borderStyle: 'double',
      borderGap: 4,
    });
    const { container } = render(
      <NodeBorderOverlay node={node} width={100} height={100} borderColor="#3b82f6" />
    );
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(2);
  });

  it('renders concentric ellipses for oval shape with double border', () => {
    const node = createMockNode({
      shape: 'oval',
      borderWidth: 2,
      borderStyle: 'double',
      borderGap: 4,
    });
    const { container } = render(
      <NodeBorderOverlay node={node} width={140} height={80} borderColor="#3b82f6" />
    );
    const ellipses = container.querySelectorAll('ellipse');
    expect(ellipses.length).toBe(2);
  });

  it('renders horizontal zigzag for fork shape', () => {
    const node = createMockNode({
      shape: 'fork',
      borderWidth: 2,
      borderStyle: 'zigzag',
    });
    const { container } = render(
      <NodeBorderOverlay node={node} width={140} height={40} borderColor="#3b82f6" />
    );
    const path = container.querySelector('path');
    expect(path).toBeDefined();
    expect(path?.getAttribute('d')).toContain('M ');
  });

  it('renders diamond dots correctly for circle and fork shapes', () => {
    const circleNode = createMockNode({
      shape: 'circle',
      borderWidth: 2,
      borderStyle: 'dotted',
      borderDotShape: 'diamond',
    });
    const { container: circleC } = render(
      <NodeBorderOverlay node={circleNode} width={100} height={100} borderColor="#3b82f6" />
    );
    const circleDiamonds = circleC.querySelectorAll('rect');
    expect(circleDiamonds.length).toBeGreaterThanOrEqual(4);
    expect(circleDiamonds[0].getAttribute('transform')).toContain('rotate(45');

    const forkNode = createMockNode({
      shape: 'fork',
      borderWidth: 2,
      borderStyle: 'dotted',
      borderDotShape: 'diamond',
    });
    const { container: forkC } = render(
      <NodeBorderOverlay node={forkNode} width={100} height={30} borderColor="#3b82f6" />
    );
    const forkDiamonds = forkC.querySelectorAll('rect');
    expect(forkDiamonds.length).toBeGreaterThanOrEqual(2);
  });

  it('renders capsule radial zigzag for pill shape', () => {
    const node = createMockNode({
      shape: 'pill',
      borderWidth: 2,
      borderStyle: 'zigzag',
    });
    const { container } = render(
      <NodeBorderOverlay node={node} width={160} height={48} borderColor="#3b82f6" />
    );
    const path = container.querySelector('path');
    expect(path).toBeDefined();
    expect(path?.getAttribute('d')).toContain('M ');
    expect(path?.getAttribute('d')).toContain('Z');
  });
});
