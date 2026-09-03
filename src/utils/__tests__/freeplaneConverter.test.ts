import { describe, it, expect } from 'vitest';
import { exportToFreeplaneXML, importFromFreeplaneXML } from '../freeplaneConverter';
import { MindMap } from '../../types/mindmap';

describe('freeplaneConverter', () => {
  const sampleMap: MindMap = {
    id: 'test-map-1',
    title: 'Mapa de Prueba',
    rootId: 'root',
    themeId: 'default',
    layout: 'standard',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    connectors: [],
    nodes: {
      root: {
        id: 'root',
        parentId: null,
        text: 'Nodo Central',
        children: ['child-1'],
        fontSize: 18,
        shape: 'bubble',
      },
      'child-1': {
        id: 'child-1',
        parentId: 'root',
        text: 'Idea Secundaria',
        children: [],
        fontSize: 14,
        shape: 'rectangle',
        side: 'right',
      },
    },
  };

  it('exports a MindMap to valid Freeplane XML format', () => {
    const xml = exportToFreeplaneXML(sampleMap);
    expect(xml).toContain('<map version="freeplane 1.7.0">');
    expect(xml).toContain('TEXT="Nodo Central"');
    expect(xml).toContain('TEXT="Idea Secundaria"');
    expect(xml).toContain('</map>');
  });

  it('parses FreeMind/Freeplane XML back to a MindMap data structure', () => {
    const xml = exportToFreeplaneXML(sampleMap);
    const parsed = importFromFreeplaneXML(xml);
    expect(parsed.title).toBe('Nodo Central');
    expect(parsed.nodes[parsed.rootId]).toBeDefined();
    expect(parsed.nodes[parsed.rootId].text).toBe('Nodo Central');
    expect(parsed.nodes[parsed.rootId].children.length).toBe(1);
    const childId = parsed.nodes[parsed.rootId].children[0];
    expect(parsed.nodes[childId].text).toBe('Idea Secundaria');
  });
});
