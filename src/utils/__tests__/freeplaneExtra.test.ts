import { describe, it, expect } from 'vitest';
import { exportToMarkdown, escapeXML, exportToFreeplaneXML } from '../freeplaneConverter';
import { BLANK_MAP } from '../sampleMaps';

describe('freeplaneConverter extra', () => {
  it('exportToMarkdown serializa jerarquía como encabezados', () => {
    const md = exportToMarkdown(structuredClone(BLANK_MAP));
    expect(md).toContain('# Idea Central');
    expect(md).toContain('Rama Principal 1');
    expect(md).toContain('Rama Principal 2');
  });

  it('escapeXML escapa los 5 caracteres', () => {
    expect(escapeXML('<a href="x&y">\'z\'')).toBe('&lt;a href=&quot;x&amp;y&quot;&gt;&apos;z&apos;');
  });

  it('export incluye FOLDED y LINK cuando existen', () => {
    const map = structuredClone(BLANK_MAP);
    map.nodes['node-1'].folded = true;
    map.nodes['node-1'].link = 'https://ejemplo.com';
    const xml = exportToFreeplaneXML(map);
    expect(xml).toContain('FOLDED="true"');
    expect(xml).toContain('LINK="https://ejemplo.com"');
  });
});
