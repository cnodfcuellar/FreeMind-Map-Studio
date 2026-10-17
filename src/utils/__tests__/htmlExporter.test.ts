import { describe, it, expect } from 'vitest';
import { exportToStandaloneHTML } from '../htmlExporter';
import { BLANK_MAP } from '../sampleMaps';

describe('htmlExporter', () => {
  const html = exportToStandaloneHTML(structuredClone(BLANK_MAP));

  it('genera un documento HTML único autocontenido', () => {
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('</html>');
  });

  it('embebe el mapa (título y nodos) con JS inline', () => {
    expect(html).toContain('Nuevo Mapa Mental');
    expect(html).toContain('Idea Central');
    expect(html).toContain('Rama Principal 1');
    // Sin scripts externos: solo fuentes Google (degradan sin conexión)
    expect(html).not.toMatch(/<script\s+src="https?:\/\//);
  });

  it('incluye controles de visor (zoom/pan/búsqueda)', () => {
    expect(html.toLowerCase()).toMatch(/zoom/);
    expect(html.toLowerCase()).toMatch(/pan|drag|mover|arrastr/);
  });
});
