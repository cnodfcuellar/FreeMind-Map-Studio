import { describe, it, expect } from 'vitest';
import {
  generateZigzagPath,
  generateWavyPath,
  generateRadialZigzag,
  generateRadialWavy,
  generatePolygonZigzag,
  generatePolygonWavy,
  getDoublePolygonPoints,
  generateHorizontalZigzag,
  generateHorizontalWavy,
  generatePillZigzagPath,
  generatePillWavyPath,
  generatePerimeterDiamonds,
  getDoubleBorderRects,
} from '../borderPathUtils';

describe('borderPathUtils', () => {
  it('generates valid closed SVG path for zigzag border', () => {
    const path = generateZigzagPath(160, 80, 8, 8, 16);
    expect(path).toBeDefined();
    expect(path.startsWith('M ')).toBe(true);
    expect(path.endsWith('Z')).toBe(true);
    expect(path).toContain('L ');
    expect(path).toContain('Q ');
  });

  it('generates valid closed SVG path for wavy border with cubic Bézier curves', () => {
    const path = generateWavyPath(160, 80, 8, 8, 24);
    expect(path).toBeDefined();
    expect(path.startsWith('M ')).toBe(true);
    expect(path.endsWith('Z')).toBe(true);
    expect(path).toContain('C ');
    expect(path).toContain('Q ');
  });

  it('calculates concentric outer and inner rectangles for double border', () => {
    const rects = getDoubleBorderRects(100, 50, 10, 4, 2);
    expect(rects.outer.w).toBe(104);
    expect(rects.outer.h).toBe(54);
    expect(rects.outer.x).toBe(-2);
    expect(rects.outer.y).toBe(-2);
    expect(rects.outer.r).toBe(12);

    expect(rects.inner.w).toBe(96);
    expect(rects.inner.h).toBe(46);
    expect(rects.inner.x).toBe(2);
    expect(rects.inner.y).toBe(2);
    expect(rects.inner.r).toBe(8);
  });

  it('generates radial zigzag and wavy paths for circles and ovals', () => {
    const radialZz = generateRadialZigzag(50, 50, 40, 30, 6, 14);
    expect(radialZz.startsWith('M ')).toBe(true);
    expect(radialZz.endsWith('Z')).toBe(true);
    expect(radialZz).toContain('L ');

    const radialWavy = generateRadialWavy(50, 50, 40, 30, 6, 20);
    expect(radialWavy.startsWith('M ')).toBe(true);
    expect(radialWavy.endsWith('Z')).toBe(true);
    expect(radialWavy).toContain('Q ');
  });

  it('generates polygon zigzag and wavy paths following polygonal faces (rhombus, hexagon)', () => {
    const rhombusPts = [
      { x: 100, y: 10 },
      { x: 190, y: 60 },
      { x: 100, y: 110 },
      { x: 10, y: 60 },
    ];
    const polyZz = generatePolygonZigzag(rhombusPts, 6, 16);
    expect(polyZz.startsWith('M ')).toBe(true);
    expect(polyZz.endsWith('Z')).toBe(true);
    expect(polyZz).toContain('L ');

    const polyWavy = generatePolygonWavy(rhombusPts, 6, 20);
    expect(polyWavy.startsWith('M ')).toBe(true);
    expect(polyWavy.endsWith('Z')).toBe(true);
    expect(polyWavy).toContain('C ');

    const doublePts = getDoublePolygonPoints(rhombusPts, 4);
    expect(doublePts.length).toBe(4);
    // Vértice superior contraído hacia adentro
    expect(doublePts[0].y).toBeGreaterThan(10);
  });

  it('generates horizontal zigzag and wavy paths for fork underlines', () => {
    const forkZz = generateHorizontalZigzag(0, 120, 20, 6, 12);
    expect(forkZz.startsWith('M ')).toBe(true);
    expect(forkZz).toContain('L ');

    const forkWavy = generateHorizontalWavy(0, 120, 20, 6, 20);
    expect(forkWavy.startsWith('M ')).toBe(true);
    expect(forkWavy).toContain('C ');
  });

  it('generates continuous radial capsule paths for pill shape (zigzag and wavy)', () => {
    const pillZz = generatePillZigzagPath(160, 48, 8, 16);
    expect(pillZz.startsWith('M ')).toBe(true);
    expect(pillZz.endsWith('Z')).toBe(true);
    expect(pillZz).toContain('L ');

    const pillWavy = generatePillWavyPath(160, 48, 8, 24);
    expect(pillWavy.startsWith('M ')).toBe(true);
    expect(pillWavy.endsWith('Z')).toBe(true);
    expect(pillWavy).toContain('C ');
    expect(pillWavy).toContain('Q ');
  });

  it('generates diamond points along exact perimeters of all shapes', () => {
    // Circle
    const circleDiamonds = generatePerimeterDiamonds({ shape: 'circle', w: 100, h: 100, spacing: 9, dSize: 6 });
    expect(circleDiamonds.length).toBeGreaterThanOrEqual(8);

    // Oval
    const ovalDiamonds = generatePerimeterDiamonds({ shape: 'oval', w: 140, h: 70, spacing: 9, dSize: 6 });
    expect(ovalDiamonds.length).toBeGreaterThanOrEqual(8);

    // Fork
    const forkDiamonds = generatePerimeterDiamonds({ shape: 'fork', w: 120, h: 40, spacing: 9, dSize: 6 });
    expect(forkDiamonds.length).toBeGreaterThanOrEqual(4);

    // Pill
    const pillDiamonds = generatePerimeterDiamonds({ shape: 'pill', w: 160, h: 48, r: 24, spacing: 9, dSize: 6 });
    expect(pillDiamonds.length).toBeGreaterThanOrEqual(10);

    // Rhombus / Polygon
    const rhombusDiamonds = generatePerimeterDiamonds({
      w: 120,
      h: 120,
      spacing: 9,
      dSize: 6,
      polygonPts: [
        { x: 60, y: 0 },
        { x: 120, y: 60 },
        { x: 60, y: 120 },
        { x: 0, y: 60 },
      ],
    });
    expect(rhombusDiamonds.length).toBeGreaterThanOrEqual(8);
  });
});
