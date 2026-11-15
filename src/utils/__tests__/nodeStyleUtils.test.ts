import { describe, it, expect } from 'vitest';
import {
  isDarkNodeBackground,
  getNodeBackgroundStyles,
  getNodeShapeStyles,
  computeNodeShadowStyle,
} from '../nodeStyleUtils';
import { MindNode, MindMapTheme } from '../../types/mindmap';

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

const createNode = (overrides: Partial<MindNode> = {}): MindNode => ({
  id: overrides.id || 'test-node',
  text: overrides.text || 'Node text',
  parentId: null,
  children: [],
  ...overrides,
});

describe('nodeStyleUtils', () => {
  describe('isDarkNodeBackground', () => {
    it('detecta correctamente colores oscuros y claros por luminancia', () => {
      expect(isDarkNodeBackground('#000000', false)).toBe(true);
      expect(isDarkNodeBackground('#1e293b', false)).toBe(true);
      expect(isDarkNodeBackground('#ffffff', false)).toBe(false);
      expect(isDarkNodeBackground('#f8fafc', false)).toBe(false);
      expect(isDarkNodeBackground('#ffff00', false)).toBe(false);
    });

    it('respeta isRoot si no se proporciona color', () => {
      expect(isDarkNodeBackground(undefined, true)).toBe(true);
      expect(isDarkNodeBackground(undefined, false)).toBe(false);
    });
  });

  describe('getNodeBackgroundStyles', () => {
    it('genera estilos para fondo sólido estándar', () => {
      const node = createNode({ color: '#ff0000' });
      const styles = getNodeBackgroundStyles(node, mockTheme, false);
      expect(styles.backgroundColor).toBe('#ff0000');
    });

    it('genera fondo degradado linear', () => {
      const node = createNode({
        bgType: 'gradient',
        gradientColor1: '#ff0000',
        gradientColor2: '#0000ff',
        gradientDirection: 'to-r',
      });
      const styles = getNodeBackgroundStyles(node, mockTheme, false);
      expect(styles.background).toContain('linear-gradient');
      expect(styles.background).toContain('to right');
    });

    it('soporta fondo transparente', () => {
      const node = createNode({ bgType: 'transparent' });
      const styles = getNodeBackgroundStyles(node, mockTheme, false);
      expect(styles.backgroundColor).toBe('transparent');
    });
  });

  describe('computeNodeShadowStyle', () => {
    it('aplica boxShadow con preset glow', () => {
      const node = createNode({
        nodeShadow: true,
        nodeShadowPreset: 'glow',
        nodeShadowColor: 'rgba(59,130,246,0.5)',
      });
      const shadow = computeNodeShadowStyle(node, false);
      expect(shadow.boxShadow).toContain('rgba(59,130,246,0.5)');
    });

    it('aplica drop-shadow en formas poligonales', () => {
      const node = createNode({
        shape: 'hexagon',
        nodeShadow: true,
        nodeShadowPreset: 'soft',
      });
      const shadow = computeNodeShadowStyle(node, true);
      expect(shadow.filter).toContain('drop-shadow');
    });
  });

  describe('getNodeShapeStyles', () => {
    it('calcula border-radius y estilos geométricos de nodo', () => {
      const node = createNode({ shape: 'bubble', color: '#3b82f6' });
      const styles = getNodeShapeStyles(node, mockTheme, '#3b82f6', false);
      expect(styles).toBeDefined();
      expect(styles.backgroundColor).toBe('#3b82f6');
    });
  });
});
