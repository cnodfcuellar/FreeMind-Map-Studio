import { describe, it, expect } from 'vitest';
import {
  getNodeBackgroundStyles,
  getNodeShapeStyles,
  isDarkNodeBackground,
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
    expect(JSON.stringify(styles)).not.toContain('!important');

    const zeroForkNode = createNode({
      id: 'n2',
      text: 'Zero Fork',
      shape: 'fork',
      borderWidth: 0,
    });
    const zeroStyles = getNodeShapeStyles(zeroForkNode, mockTheme, '#3b82f6', false);
    expect(zeroStyles.borderBottom).toBe('none');
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
});
