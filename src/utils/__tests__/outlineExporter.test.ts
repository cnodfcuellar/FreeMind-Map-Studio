import { describe, it, expect } from 'vitest';
import { exportToMarkdown, exportToOPML } from '../outlineExporter';
import { MindMap } from '../../types/mindmap';
import { BLANK_MAP } from '../sampleMaps';

describe('outlineExporter', () => {
  const testMap: MindMap = {
    ...BLANK_MAP,
    title: 'Plan de Estudio Anual',
    nodes: {
      root: {
        id: 'root',
        parentId: null,
        text: 'Curso de Ciencias',
        body: 'Plan curricular interactivo para el semestre',
        note: 'Revisar bibliografía antes de iniciar',
        children: ['node-1', 'node-2'],
      },
      'node-1': {
        id: 'node-1',
        parentId: 'root',
        text: 'Biología Celular',
        body: 'Estructura celular y orgánulos',
        tags: ['ciencias', 'examen'],
        progress: 100,
        link: 'https://biologia.ejemplo.com',
        children: ['node-1-1'],
      },
      'node-1-1': {
        id: 'node-1-1',
        parentId: 'node-1',
        text: 'Mitocondrias y Energía',
        note: 'Enfocarse en la respiración aeróbica',
        progress: 50,
        children: [],
      },
      'node-2': {
        id: 'node-2',
        parentId: 'root',
        text: 'Química Orgánica',
        progress: 0,
        children: [],
      },
    },
    connectors: [
      {
        id: 'conn-1',
        fromId: 'node-1',
        toId: 'node-2',
        label: 'Afinidad molecular',
      },
    ],
  };

  it('exportToMarkdown genera formato viñetas por defecto', () => {
    const md = exportToMarkdown(testMap, { mode: 'bullets' });

    expect(md).toContain('# Curso de Ciencias');
    expect(md).toContain('- **Biología Celular**');
    expect(md).toContain('- **Mitocondrias y Energía**');
    expect(md).toContain('[100%]');
    expect(md).toContain('[50%]');
    expect(md).toContain('[Enlace](https://biologia.ejemplo.com)');
    expect(md).toContain('#ciencias #examen');
    expect(md).toContain('Relaciones y Conexiones Libres');
    expect(md).toContain('Afinidad molecular');
  });

  it('exportToMarkdown genera formato encabezados (#, ##, ###) para Obsidian/Notion', () => {
    const md = exportToMarkdown(testMap, { mode: 'headers' });

    expect(md).toContain('# Curso de Ciencias');
    expect(md).toContain('## Biología Celular');
    expect(md).toContain('### Mitocondrias y Energía');
    expect(md).toContain('## Química Orgánica');
  });

  it('exportToMarkdown genera listas de tareas (- [ ] / - [x])', () => {
    const md = exportToMarkdown(testMap, { mode: 'tasks' });

    // 100% progreso marcado como completado
    expect(md).toContain('- [x] Biología Celular');
    // < 100% progreso marcado como pendiente
    expect(md).toContain('- [ ] Mitocondrias y Energía');
    expect(md).toContain('- [ ] Química Orgánica');
  });

  it('exportToOPML genera un XML OPML 2.0 válido y bien estructurado', () => {
    const opml = exportToOPML(testMap);

    expect(opml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(opml).toContain('<opml version="2.0">');
    expect(opml).toContain('<title>Plan de Estudio Anual</title>');
    expect(opml).toContain('<outline text="Curso de Ciencias"');
    expect(opml).toContain('text="Biología Celular"');
    expect(opml).toContain('text="Mitocondrias y Energía"');
    expect(opml).toContain('_status="checked"');
    expect(opml).toContain('_status="unchecked"');
    expect(opml).toContain('category="ciencias,examen"');
    expect(opml).toContain('url="https://biologia.ejemplo.com"');
    expect(opml).toContain('</opml>');
  });
});
