import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  computeMapBoundingBox,
  calculatePaginationGrid,
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
    expect(grid.tiles[0].label).toContain('Página Única');
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
    expect(svg).toContain('Nodo Central');
    expect(svg).toContain('Rama Izquierda');
    expect(svg).toContain('Rama Derecha');
    expect(svg).toContain('id="pdf-edges"');
    expect(svg).toContain('id="pdf-nodes"');
    expect(svg).toContain('</svg>');
  });

  it('generateMindMapVectorSvg respeta fondo blanco cuando includeBackground es false', () => {
    const svg = generateMindMapVectorSvg(sampleMap, undefined, { includeBackground: false });
    expect(svg).toContain('background-color: #ffffff');
  });

  it('generatePrintHtml compila documento HTML con @page y hojas de impresión', () => {
    const html = generatePrintHtml(sampleMap, {
      ...defaultOptions,
      paginationMode: 'grid-2x1',
      includeCropMarks: true,
    });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('@page {');
    expect(html).toContain('size: 297mm 210mm landscape;');
    expect(html).toContain('class="page-sheet"');
    expect(html).toContain('Mapa de Prueba Vectorial');
    expect(html).toContain('cut-mark');
  });

  it('downloadVectorSvg crea y descarga el blob SVG con nombre seguro', () => {
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const removeSpy = vi.spyOn(document.body, 'removeChild');

    downloadVectorSvg(sampleMap);

    expect(appendSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
  });
});
