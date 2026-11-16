import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  computeMapBoundingBox,
  calculatePaginationGrid,
  resolveEffectiveOrientation,
  generateMindMapVectorSvg,
  generatePrintHtml,
  downloadVectorSvg,
  PdfExportOptions,
} from '../pdfExporter';
import { BLANK_MAP } from '../sampleMaps';
import { MindMap } from '../../types/mindmap';

describe('pdfExporter', () => {
  const sampleMap: MindMap = {
    ...BLANK_MAP,
    title: 'Mapa de Prueba Vectorial',
    nodes: {
      root: {
        id: 'root',
        text: 'Nodo Central',
        parentId: null,
        children: ['n1', 'n2'],
      },
      n1: {
        id: 'n1',
        text: 'Rama Izquierda',
        parentId: 'root',
        side: 'left',
        children: [],
        shape: 'bubble',
        nodeShadow: true,
      },
      n2: {
        id: 'n2',
        text: 'Rama Derecha',
        parentId: 'root',
        side: 'right',
        children: [],
        shape: 'hexagon',
        color: '#10b981',
      },
    },
  };

  const defaultOptions: PdfExportOptions = {
    paperSize: 'A4',
    orientation: 'landscape',
    paginationMode: 'single',
    includeBackground: true,
    includeHeaderFooter: true,
    includeCropMarks: false,
    authorName: 'Diseñador',
    marginMm: 8,
  };

  it('computeMapBoundingBox calcula dimensiones válidas y positivas', () => {
    const { box, nodesList } = computeMapBoundingBox(sampleMap);
    expect(nodesList.length).toBe(3);
    expect(box.width).toBeGreaterThan(100);
    expect(box.height).toBeGreaterThan(50);
    expect(box.maxX).toBeGreaterThan(box.minX);
    expect(box.maxY).toBeGreaterThan(box.minY);
  });

  it('calculatePaginationGrid genera 1 sola página para modo single', () => {
    const grid = calculatePaginationGrid(sampleMap, defaultOptions);
    expect(grid.totalPages).toBe(1);
    expect(grid.cols).toBe(1);
    expect(grid.rows).toBe(1);
    expect(grid.tiles.length).toBe(1);
    expect(grid.paperWidthMm).toBe(297); // A4 landscape width
    expect(grid.paperHeightMm).toBe(210); // A4 landscape height
    expect(grid.tiles[0].label).toContain('1 Sola Hoja');
  });

  it('resolveEffectiveOrientation detecta landscape o portrait según dimensiones', () => {
    const horizontalBox = { minX: 0, minY: 0, maxX: 800, maxY: 400, width: 800, height: 400, centerX: 400, centerY: 200 };
    const verticalBox = { minX: 0, minY: 0, maxX: 300, maxY: 700, width: 300, height: 700, centerX: 150, centerY: 350 };

    expect(resolveEffectiveOrientation(horizontalBox, 'auto')).toBe('landscape');
    expect(resolveEffectiveOrientation(verticalBox, 'auto')).toBe('portrait');
    expect(resolveEffectiveOrientation(horizontalBox, 'portrait')).toBe('portrait');
    expect(resolveEffectiveOrientation(verticalBox, 'landscape')).toBe('landscape');
  });

  it('calculatePaginationGrid con orientación auto detecta formato óptimo', () => {
    const autoGrid = calculatePaginationGrid(sampleMap, {
      ...defaultOptions,
      orientation: 'auto',
    });
    expect(autoGrid.effectiveOrientation).toBe('landscape');
    expect(autoGrid.paperWidthMm).toBe(297);
    expect(autoGrid.paperHeightMm).toBe(210);
  });

  it('calculatePaginationGrid genera cuadrícula 2x2 de 4 páginas con coordenadas individuales', () => {
    const grid = calculatePaginationGrid(sampleMap, {
      ...defaultOptions,
      paginationMode: 'grid-2x2',
    });
    expect(grid.totalPages).toBe(4);
    expect(grid.cols).toBe(2);
    expect(grid.rows).toBe(2);
    expect(grid.tiles.length).toBe(4);
    expect(grid.tiles[0].label).toContain('Hoja 1 de 4');
    expect(grid.tiles[3].label).toContain('Hoja 4 de 4');
  });

  it('generateMindMapVectorSvg genera SVG válido con ramas, nodos y estilos', () => {
    const svg = generateMindMapVectorSvg(sampleMap);
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('viewBox=');
    expect(svg).toContain('Nodo');
    expect(svg).toContain('Central');
    expect(svg).toContain('tspan');
    expect(svg).toContain('Rama Izquierda');
    expect(svg).toContain('Rama Derecha');
    expect(svg).toContain('id="pdf-edges"');
    expect(svg).toContain('id="pdf-nodes"');
    expect(svg).toContain('</svg>');
  });

  it('generateMindMapVectorSvg envuelve texto largo y no sobresale del nodo', () => {
    const longTextMap: MindMap = {
      ...BLANK_MAP,
      title: 'Mapa con Texto Largo',
      nodes: {
        root: {
          id: 'root',
          text: 'Estrategia Corporativa Integral de Transformación Digital y Crecimiento 2026',
          parentId: null,
          children: ['n1'],
        },
        n1: {
          id: 'n1',
          text: 'Implementación Ágil de Metodologías Scrum y Kanban con Equipos Distribuidos',
          body: 'Descripción detallada del proceso con múltiples líneas explicativas para documentar la arquitectura.',
          parentId: 'root',
          side: 'right',
          children: [],
          tags: ['Agile', 'Scrum'],
          shape: 'oval',
        },
      },
    };

    const svg = generateMindMapVectorSvg(longTextMap);
    expect(svg).toContain('<tspan');
    expect(svg).toContain('ellipse');
    expect(svg).toContain('#Agile');
    expect(svg).toContain('Scrum');
    expect(svg).toContain('Descripción detallada');
  });

  it('generateMindMapVectorSvg soporta formas avanzadas (star, arrow, fork, square)', () => {
    const shapesMap: MindMap = {
      ...BLANK_MAP,
      title: 'Mapa con Formas Variadas',
      nodes: {
        root: {
          id: 'root',
          text: 'Raíz',
          parentId: null,
          children: ['starNode', 'arrowNode', 'forkNode'],
        },
        starNode: {
          id: 'starNode',
          text: 'Estrella',
          parentId: 'root',
          side: 'right',
          children: [],
          shape: 'star',
        },
        arrowNode: {
          id: 'arrowNode',
          text: 'Flecha',
          parentId: 'root',
          side: 'right',
          children: [],
          shape: 'arrow',
        },
        forkNode: {
          id: 'forkNode',
          text: 'Horquilla',
          parentId: 'root',
          side: 'left',
          children: [],
          shape: 'fork',
        },
      },
    };

    const svg = generateMindMapVectorSvg(shapesMap);
    expect(svg).toContain('polygon');
    expect(svg).toContain('line');
  });

  it('generateMindMapVectorSvg respeta fondo blanco cuando includeBackground es false', () => {
    const svg = generateMindMapVectorSvg(sampleMap, undefined, { includeBackground: false });
    expect(svg).toContain('background-color: #ffffff');
  });

  it('generatePrintHtml compila documento HTML con @page válido y hojas de impresión', () => {
    const html = generatePrintHtml(sampleMap, {
      ...defaultOptions,
      paginationMode: 'grid-2x1',
      includeCropMarks: true,
    });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('@page {');
    // Valid standard CSS size syntax without invalid suffix
    expect(html).toContain('size: a4 landscape;');
    expect(html).toContain('margin: 0;');
    expect(html).toContain('class="page-sheet"');
    expect(html).toContain('.page-sheet:last-child');
    expect(html).toContain('break-after: avoid');
    expect(html).toContain('Mapa de Prueba Vectorial');
    expect(html).toContain('cut-mark');
  });

  it('generatePrintHtml para póster continuo genera medidas en mm sin sufijos erróneos', () => {
    const html = generatePrintHtml(sampleMap, {
      ...defaultOptions,
      paperSize: 'Poster',
    });
    expect(html).toMatch(/size: \d+mm \d+mm;/);
    expect(html).not.toMatch(/size: \d+mm \d+mm (landscape|portrait);/);
  });

  it('downloadVectorSvg crea y descarga el blob SVG con nombre seguro', () => {
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const removeSpy = vi.spyOn(document.body, 'removeChild');

    downloadVectorSvg(sampleMap);

    expect(appendSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
  });
});
