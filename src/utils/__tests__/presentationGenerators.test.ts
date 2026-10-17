import { describe, it, expect } from 'vitest';
import { generateDefaultPresentationSlides } from '../presentationGenerator';
import { generateDefaultSpatialSlides } from '../spatialPresentationGenerator';
import { computeMindMapLayout } from '../layoutEngine';
import { BLANK_MAP } from '../sampleMaps';

describe('presentationGenerator', () => {
  const layoutMap = computeMindMapLayout(structuredClone(BLANK_MAP));

  it('devuelve vacío si la raíz no está en el layout', () => {
    expect(generateDefaultPresentationSlides(structuredClone(BLANK_MAP), new Map())).toEqual([]);
  });

  it('primera slide es overview con pad 120 y segunda el nodo raíz', () => {
    const slides = generateDefaultPresentationSlides(structuredClone(BLANK_MAP), layoutMap);
    expect(slides[0].type).toBe('overview');
    expect(slides[0].id).toBe('slide-overview');
    expect(slides[0].bounds.width).toBeGreaterThanOrEqual(400);
    expect(slides[1].type).toBe('node');
    expect(slides[1].nodeId).toBe('root');
  });

  it('genera slides por rama con orden creciente', () => {
    const slides = generateDefaultPresentationSlides(structuredClone(BLANK_MAP), layoutMap);
    expect(slides.length).toBeGreaterThan(2);
    const orders = slides.map((s) => s.order);
    expect([...orders].sort((a, b) => a - b)).toEqual(orders);
  });
});

describe('spatialPresentationGenerator', () => {
  it('devuelve vacío sin raíz válida', () => {
    const bad = structuredClone(BLANK_MAP);
    bad.rootId = 'fantasma';
    expect(generateDefaultSpatialSlides(bad)).toEqual([]);
  });

  it('genera tarjetas 720x440 en espiral por defecto', () => {
    const slides = generateDefaultSpatialSlides(structuredClone(BLANK_MAP));
    expect(slides.length).toBeGreaterThan(0);
    for (const s of slides) {
      expect(s.spatial.width).toBe(720);
      expect(s.spatial.height).toBe(440);
    }
  });

  it('soporta constellation y grid con posiciones distintas', () => {
    const spiral = generateDefaultSpatialSlides(structuredClone(BLANK_MAP), 'spiral');
    const grid = generateDefaultSpatialSlides(structuredClone(BLANK_MAP), 'grid');
    const constellation = generateDefaultSpatialSlides(structuredClone(BLANK_MAP), 'constellation');
    expect(spiral.length).toBe(grid.length);
    expect(constellation.length).toBe(spiral.length);
    const pos = (s: typeof spiral) => s.map((c) => `${c.spatial.x},${c.spatial.y}`).join('|');
    expect(pos(grid)).not.toBe(pos(spiral));
  });

  it('las tarjetas extraen contenido del nodo (título y subitems)', () => {
    const slides = generateDefaultSpatialSlides(structuredClone(BLANK_MAP));
    const root = slides.find((s) => s.content.nodeId === 'root');
    expect(root?.content.titleText).toBe('Idea Central');
    expect(root?.content.subItems?.length).toBe(2);
  });
});
