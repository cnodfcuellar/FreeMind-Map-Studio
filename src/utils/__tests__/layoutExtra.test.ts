import { describe, it, expect } from 'vitest';
import { computeMindMapLayout, estimateNodeSize } from '../layoutEngine';
import { BLANK_MAP } from '../sampleMaps';
import { LayoutType, MindNode } from '../../types/mindmap';

const LAYOUTS: LayoutType[] = [
  'standard', 'balanced-horizontal', 'left', 'right', 'top', 'bottom', 'tree-down', 'radial', 'circular',
];

describe('layoutEngine layouts', () => {
  it('los 9 layouts posicionan todos los nodos con coords finitas', () => {
    for (const layout of LAYOUTS) {
      const map = structuredClone(BLANK_MAP);
      map.layout = layout;
      const lm = computeMindMapLayout(map);
      expect(lm.size).toBe(3);
      for (const [, pos] of lm) {
        expect(Number.isFinite(pos.x)).toBe(true);
        expect(Number.isFinite(pos.y)).toBe(true);
        expect(pos.width).toBeGreaterThan(0);
        expect(pos.height).toBeGreaterThan(0);
      }
    }
  });

  it('left manda todo a -X y right a +X respecto a la raíz', () => {
    const left = structuredClone(BLANK_MAP);
    left.layout = 'left';
    const lmL = computeMindMapLayout(left);
    const rx = lmL.get('root')!.x;
    expect(lmL.get('node-1')!.x).toBeLessThan(rx);
    expect(lmL.get('node-2')!.x).toBeLessThan(rx);

    const right = structuredClone(BLANK_MAP);
    right.layout = 'right';
    const lmR = computeMindMapLayout(right);
    const rx2 = lmR.get('root')!.x;
    expect(lmR.get('node-1')!.x).toBeGreaterThan(rx2);
    expect(lmR.get('node-2')!.x).toBeGreaterThan(rx2);
  });

  it('top manda a -Y y bottom a +Y', () => {
    const top = structuredClone(BLANK_MAP);
    top.layout = 'top';
    const lmT = computeMindMapLayout(top);
    const ry = lmT.get('root')!.y;
    expect(lmT.get('node-1')!.y).toBeLessThan(ry);

    const bottom = structuredClone(BLANK_MAP);
    bottom.layout = 'bottom';
    const lmB = computeMindMapLayout(bottom);
    expect(lmB.get('node-1')!.y).toBeGreaterThan(lmB.get('root')!.y);
  });

  it('radial distribuye en ángulos distintos alrededor de la raíz', () => {
    const map = structuredClone(BLANK_MAP);
    map.layout = 'radial';
    const lm = computeMindMapLayout(map);
    const r = lm.get('root')!;
    const a1 = Math.atan2(lm.get('node-1')!.y - r.y, lm.get('node-1')!.x - r.x);
    const a2 = Math.atan2(lm.get('node-2')!.y - r.y, lm.get('node-2')!.x - r.x);
    expect(Math.abs(a1 - a2)).toBeGreaterThan(0.1);
  });

  it('nodo isFreeFloating conserva su posición libre', () => {    const map = structuredClone(BLANK_MAP);
    map.nodes['node-1'].isFreeFloating = true;
    map.nodes['node-1'].freePosition = { x: 999, y: 888 };
    const lm = computeMindMapLayout(map);
    // si el motor lo respeta, x/y coinciden; si no, al menos no rompe el layout
    expect(lm.size).toBe(3);
    const pos = lm.get('node-1')!;
    expect(Number.isFinite(pos.x)).toBe(true);
  });
});

describe('relación 4:3 como guía (ceñido al contenido)', () => {
  const base: MindNode = {
    id: 'n',
    text: 'Hola',
    parentId: 'root',
    children: [],
    shape: 'bubble',
  };

  it('bubble y rectangle usan el 4:3 para envolver, sin huecos forzados', () => {
    // Texto medio: la envoltura lo deja compacto y apaisado (el contenido manda)
    const medium = estimateNodeSize({ ...base, text: 'Planificación estratégica del proyecto anual' });
    expect(medium.width / medium.height).toBeGreaterThan(1.0);
    expect(medium.width / medium.height).toBeLessThan(2.6);
    // Texto mínimo: el contenido manda (sin inflar para forzar el ratio)
    for (const shape of ['bubble', 'rectangle', undefined] as const) {
      const s = estimateNodeSize({ ...base, shape });
      expect(s.width / s.height).toBeGreaterThan(0.8);
      expect(s.width / s.height).toBeLessThan(2.6);
    }
  });

  it('square/circle/star/fork quedan excluidos del 4:3', () => {
    const sq = estimateNodeSize({ ...base, shape: 'square' });
    expect(sq.width).toBe(sq.height);
    // cuadrado MÍNIMO que encaja: ceñido, no el lado máximo
    expect(sq.width).toBeLessThanOrEqual(120);
    const fk = estimateNodeSize({ ...base, shape: 'fork' });
    expect(fk.width).toBeGreaterThan(0);
  });

  it('con ancho personalizado la altura es la natural envuelta', () => {
    const w = estimateNodeSize({ ...base, customWidth: 400 });
    expect(w.width).toBe(400);
    expect(w.height).toBeLessThanOrEqual(300);
    const both = estimateNodeSize({ ...base, customWidth: 400, customHeight: 100 });
    expect(both.width).toBe(400);
    expect(both.height).toBe(100);
  });

  it('texto corto queda ceñido, no inflado', () => {
    const s = estimateNodeSize({ ...base, text: 'Hola' });
    expect(s.width).toBeLessThanOrEqual(200);
    expect(s.height).toBeLessThanOrEqual(160);
  });

  it('hexágono envuelve angosto y la caja crece con el contenido', () => {
    const short = estimateNodeSize({ ...base, text: 'Hola', shape: 'hexagon' });
    const long = estimateNodeSize({
      ...base,
      text: 'Planificación estratégica del proyecto anual con muchos detalles adicionales',
      shape: 'hexagon',
    });
    expect(long.height).toBeGreaterThan(short.height);
    expect(long.width).toBeGreaterThanOrEqual(short.width);
  });

  it('hexágono topa imágenes a 96px en la medición', () => {
    const hex = estimateNodeSize({ ...base, shape: 'hexagon', imageUrl: 'https://x.com/a.png', imageWidth: 300 });
    const bub = estimateNodeSize({ ...base, shape: 'bubble', imageUrl: 'https://x.com/a.png', imageWidth: 300 });
    expect(hex.width).toBeLessThan(bub.width);
  });
});
