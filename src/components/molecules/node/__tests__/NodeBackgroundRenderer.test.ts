import { describe, it, expect } from 'vitest';
import {
  getNodeBackgroundStyles,
  getNodeShapeStyles,
  isDarkNodeBackground,
  computeNodeShadowStyle,
} from '../NodeBackgroundRenderer';
import { MindNode, MindMapTheme } from '../../../../types/mindmap';

const mockTheme: MindMapTheme = {
  id: 'classic_blue',
  name: 'Clásico Azul',
  background: '#0f172a',
  rootBg: '#1e3a8a',
  rootText: '#ffffff',
  nodeBg: '#ffffff',
  nodeText: '#1e293b',
  nodeBorder: '#93c5fd',
  branchColors: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'],
  edgeStyle: 'bezier',
  fontFamily: 'Inter, sans-serif',
};

const createNode = (overrides: Partial<MindNode>): MindNode => ({
  id: overrides.id || 'test-node',
  text: overrides.text || 'Node text',
  parentId: null,
  children: [],
  ...overrides,
});

describe('NodeBackgroundRenderer - Backgrounds and Shapes', () => {
  it('correctly calculates perceived luminance for dark backgrounds', () => {
    expect(isDarkNodeBackground('#000000', false)).toBe(true);
    expect(isDarkNodeBackground('#1e293b', false)).toBe(true);
    expect(isDarkNodeBackground('#ffffff', false)).toBe(false);
    expect(isDarkNodeBackground('#f8fafc', false)).toBe(false);
  });

  it('generates solid background styles and clears backgroundImage', () => {
    const node = createNode({
      id: 'n1',
      text: 'Test Solid',
      color: '#3b82f6',
      bgType: 'color',
    });
    const styles = getNodeBackgroundStyles(node, mockTheme, false);
    expect(styles.backgroundColor).toBe('#3b82f6');
    expect(styles.backgroundImage).toBe('none');
  });

  it('generates transparent background styles', () => {
    const node = createNode({
      id: 'n1',
      text: 'Test Transparent',
      bgType: 'transparent',
    });
    const styles = getNodeBackgroundStyles(node, mockTheme, false);
    expect(styles.backgroundColor).toBe('transparent');
    expect(styles.backgroundImage).toBe('none');
  });

  it('generates linear and radial gradients properly', () => {
    const linearNode = createNode({
      id: 'n1',
      text: 'Test Linear',
      bgType: 'gradient',
      gradientColor1: '#ff0000',
      gradientColor2: '#0000ff',
      gradientDirection: 'to-r',
    });
    const linearStyles = getNodeBackgroundStyles(linearNode, mockTheme, false);
    expect(linearStyles.background).toContain('linear-gradient(to right');

    const radialNode = createNode({
      id: 'n2',
      text: 'Test Radial',
      bgType: 'gradient',
      gradientColor1: '#ff0000',
      gradientColor2: '#0000ff',
      gradientDirection: 'radial',
    });
    const radialStyles = getNodeBackgroundStyles(radialNode, mockTheme, false);
    expect(radialStyles.background).toContain('radial-gradient(circle');
  });

  it('generates all 7 pattern styles cleanly without unencoded hash characters', () => {
    const patterns: Array<'dots' | 'lines' | 'stripes' | 'squares' | 'triangles' | 'hexagons' | 'cross'> = [
      'dots',
      'lines',
      'stripes',
      'squares',
      'triangles',
      'hexagons',
      'cross',
    ];

    for (const pat of patterns) {
      const node = createNode({
        id: `pat-${pat}`,
        text: `Test ${pat}`,
        bgType: 'pattern',
        nodePattern: pat,
        nodePatternColor: '#3b82f6',
        color: '#ffffff',
      });
      const styles = getNodeBackgroundStyles(node, mockTheme, false);
      expect(styles.backgroundColor).toBe('#ffffff');
      expect(styles.backgroundImage).toBeDefined();
      expect(typeof styles.backgroundImage).toBe('string');
      // If data:image/svg+xml is used (like in triangles, hexagons, cross), ensure no raw unencoded '#' remains
      if (styles.backgroundImage?.includes('data:image/svg+xml')) {
        expect(styles.backgroundImage).not.toContain('stroke="#');
      }
    }
  });

  it('ensures root node has visible border when borderWidth > 0', () => {
    const rootNode = createNode({
      id: 'root',
      text: 'Root Node',
      borderWidth: 3,
      borderDash: 'solid',
    });
    const styles = getNodeShapeStyles(rootNode, mockTheme, '#3b82f6', true);
    expect(styles.border).not.toContain('transparent');
    expect(styles.border).toContain('3px solid');
  });

  it('renders fork shape cleanly without !important in React styles and allows border removal', () => {
    const forkNode = createNode({
      id: 'n1',
      text: 'Fork Node',
      shape: 'fork',
      borderWidth: 2,
    });
    const styles = getNodeShapeStyles(forkNode, mockTheme, '#3b82f6', false);
    expect(styles.border).toBe('none');
    expect(styles.borderBottom).toContain('2px solid');
    expect(styles.background).toBe('transparent');
    expect(styles.backgroundColor).toBe('transparent');
    expect(styles.backgroundImage).toBe('none');
    expect(JSON.stringify(styles)).not.toContain('!important');

    const zeroForkNode = createNode({
      id: 'n2',
      text: 'Zero Fork',
      shape: 'fork',
      borderWidth: 0,
    });
    const zeroStyles = getNodeShapeStyles(zeroForkNode, mockTheme, '#3b82f6', false);
    expect(zeroStyles.borderBottom).toContain('2.5px solid');
  });

  it('renders SVG shape containers (hexagon, arrow, star) without rectangular borders', () => {
    for (const svgShape of ['hexagon', 'arrow', 'star'] as const) {
      const node = createNode({
        id: `svg-${svgShape}`,
        text: 'SVG Shape',
        shape: svgShape,
        borderWidth: 3,
        borderColor: '#ef4444',
      });
      const styles = getNodeShapeStyles(node, mockTheme, '#3b82f6', false);
      expect(styles.border).toBe('none');
      expect(styles.background).toBe('transparent');
    }
  });

  it('renders bubble shape with boxShadow none when nodeShadow is explicitly false', () => {
    const bubbleOff = createNode({
      id: 'b-off',
      text: 'Bubble Off',
      shape: 'bubble',
      nodeShadow: false,
    });
    const styles = getNodeShapeStyles(bubbleOff, mockTheme, '#3b82f6', false);
    expect(styles.boxShadow).toBe('none');

    const bubbleDefault = createNode({
      id: 'b-def',
      text: 'Bubble Default',
      shape: 'bubble',
    });
    const defStyles = getNodeShapeStyles(bubbleDefault, mockTheme, '#3b82f6', false);
    expect(defStyles.boxShadow).toContain('0 4px 14px');
  });

  it('renders rectangle and square with custom corners (sharp, rounded, bevel, concave)', () => {
    // Sharp rectangle
    const sharpRect = createNode({ id: 'r1', text: 'Sharp', shape: 'rectangle', rectCornerStyle: 'sharp' });
    expect(getNodeShapeStyles(sharpRect, mockTheme, '#3b82f6', false).borderRadius).toBe('0px');

    // Rounded rectangle
    const roundedRect = createNode({ id: 'r2', text: 'Rounded', shape: 'rectangle', rectCornerStyle: 'rounded', rectRadius: 10 });
    expect(getNodeShapeStyles(roundedRect, mockTheme, '#3b82f6', false).borderRadius).toBe('10px 10px 10px 10px');

    // Asymmetric rounded square
    const asymSquare = createNode({
      id: 's1',
      text: 'Asym Square',
      shape: 'square',
      rectCornerStyle: 'rounded',
      rectRadius: 12,
      rectCornerTopRight: false,
      rectCornerBottomLeft: false,
    });
    expect(getNodeShapeStyles(asymSquare, mockTheme, '#3b82f6', false).borderRadius).toBe('12px 0px 12px 0px');

    // Bevel & concave (delegates to SVG path, clear CSS box borders)
    const bevelRect = createNode({ id: 'r3', text: 'Bevel', shape: 'rectangle', rectCornerStyle: 'bevel' });
    const bevelStyles = getNodeShapeStyles(bevelRect, mockTheme, '#3b82f6', false);
    expect(bevelStyles.border).toBe('none');
    expect(bevelStyles.background).toBe('transparent');

    const concaveSquare = createNode({ id: 's2', text: 'Concave', shape: 'square', rectCornerStyle: 'concave' });
    const concaveStyles = getNodeShapeStyles(concaveSquare, mockTheme, '#3b82f6', false);
    expect(concaveStyles.border).toBe('none');
    expect(concaveStyles.background).toBe('transparent');
  });

  it('renders oval shape with custom rotation and ratio', () => {
    // Normal horizontal oval (0 rotation)
    const normalOval = createNode({ id: 'o1', text: 'Normal', shape: 'oval' });
    const normalStyles = getNodeShapeStyles(normalOval, mockTheme, '#3b82f6', false);
    expect(normalStyles.borderRadius).toBe('50%');
    expect(normalStyles.paddingLeft).toBe('22px');

    // Rotated oval with keepTextHorizontal true (delegates to SVG ellipse)
    const svgOval = createNode({ id: 'o2', text: 'Rotated SVG', shape: 'oval', ovalRotation: 15, ovalKeepTextHorizontal: true });
    const svgStyles = getNodeShapeStyles(svgOval, mockTheme, '#3b82f6', false);
    expect(svgStyles.border).toBe('none');
    expect(svgStyles.background).toBe('transparent');

    // Rotated oval with keepTextHorizontal false (CSS transform rotate on box)
    const tiltedBox = createNode({ id: 'o3', text: 'Tilted Box', shape: 'oval', ovalRotation: 45, ovalKeepTextHorizontal: false });
    const tiltedStyles = getNodeShapeStyles(tiltedBox, mockTheme, '#3b82f6', false);
    expect(tiltedStyles.transform).toBe('rotate(45deg)');

    // Slender and capsule ratios
    const slenderOval = createNode({ id: 'o4', text: 'Slender', shape: 'oval', ovalRatio: 'slender' });
    expect(getNodeShapeStyles(slenderOval, mockTheme, '#3b82f6', false).paddingLeft).toBe('34px');

    const capsuleOval = createNode({ id: 'o5', text: 'Capsule', shape: 'oval', ovalRatio: 'capsule' });
    expect(getNodeShapeStyles(capsuleOval, mockTheme, '#3b82f6', false).paddingLeft).toBe('14px');
  });

  describe('computeNodeShadowStyle', () => {
    it('returns empty object when nodeShadow is undefined or false', () => {
      const nodeOff = createNode({ id: 'n1', text: 'Off' });
      expect(computeNodeShadowStyle(nodeOff, false)).toEqual({});
      expect(computeNodeShadowStyle(nodeOff, true)).toEqual({});

      const nodeFalse = createNode({ id: 'n2', text: 'False', nodeShadow: false });
      expect(computeNodeShadowStyle(nodeFalse, false)).toEqual({});
      expect(computeNodeShadowStyle(nodeFalse, true)).toEqual({});
    });

    it('computes box-shadow for standard shapes with presets', () => {
      const softNode = createNode({ id: 's1', text: 'Soft', nodeShadow: true, nodeShadowPreset: 'soft' });
      const softRes = computeNodeShadowStyle(softNode, false);
      expect(softRes.boxShadow).toBeDefined();
      expect(softRes.boxShadow).toContain('0 3px 8px');
      expect(softRes.boxShadow).toContain('rgba(0,0,0,0.12)');

      const medNode = createNode({ id: 'm1', text: 'Med', nodeShadow: true, nodeShadowPreset: 'medium' });
      const medRes = computeNodeShadowStyle(medNode, false);
      expect(medRes.boxShadow).toContain('0 6px 14px');
      expect(medRes.boxShadow).toContain('rgba(0,0,0,0.22)');

      const deepNode = createNode({ id: 'd1', text: 'Deep', nodeShadow: true, nodeShadowPreset: 'deep' });
      const deepRes = computeNodeShadowStyle(deepNode, false);
      expect(deepRes.boxShadow).toContain('0 10px 24px 2px');
      expect(deepRes.boxShadow).toContain('rgba(0,0,0,0.35)');

      const glowNode = createNode({ id: 'g1', text: 'Glow', nodeShadow: true, nodeShadowPreset: 'glow' });
      const glowRes = computeNodeShadowStyle(glowNode, false);
      expect(glowRes.boxShadow).toContain('0 0 16px');
      expect(glowRes.boxShadow).toContain('#38bdf8');
    });

    it('computes filter: drop-shadow for polygon shapes with presets', () => {
      const polySoft = createNode({ id: 'p1', text: 'Poly Soft', nodeShadow: true, nodeShadowPreset: 'soft' });
      const polyRes = computeNodeShadowStyle(polySoft, true);
      expect(polyRes.filter).toBeDefined();
      expect(polyRes.filter).toContain('drop-shadow(0 3px 8px');
      expect(polyRes.filter).toContain('rgba(0,0,0,0.12)');

      const polyGlow = createNode({ id: 'p2', text: 'Poly Glow', nodeShadow: true, nodeShadowPreset: 'glow' });
      const glowRes = computeNodeShadowStyle(polyGlow, true);
      expect(glowRes.filter).toContain('drop-shadow(0 0 16px');
      expect(glowRes.filter).toContain('#38bdf8');
    });

    it('respects custom blur, offsetY, and color overrides', () => {
      const customNode = createNode({
        id: 'c1',
        text: 'Custom',
        nodeShadow: true,
        nodeShadowBlur: 20,
        nodeShadowOffsetY: 8,
        nodeShadowColor: '#f43f5e',
      });
      const boxRes = computeNodeShadowStyle(customNode, false);
      expect(boxRes.boxShadow).toBe('0 8px 20px #f43f5e');

      const dropRes = computeNodeShadowStyle(customNode, true);
      expect(dropRes.filter).toBe('drop-shadow(0 8px 20px #f43f5e)');
    });
  });
});
