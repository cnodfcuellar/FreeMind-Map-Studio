import { describe, it, expect } from 'vitest';
import { applyThemeRestyle, applyBackgroundUpdate } from '../mapTheme';
import { BLANK_MAP } from '../sampleMaps';

describe('mapTheme', () => {
  it('applyThemeRestyle cambia themeId y limpia overrides de color', () => {
    const out = applyThemeRestyle(structuredClone(BLANK_MAP), 'dark');
    expect(out.themeId).toBe('dark');
    for (const n of Object.values(out.nodes)) {
      expect(n.color).toBeUndefined();
      expect(n.textColor).toBeUndefined();
      expect(n.borderColor).toBeUndefined();
    }
    expect(out.backgroundColor).toBeUndefined();
    expect(out.backgroundPattern).toBeUndefined();
    expect(out.edgeColor).toBeUndefined();
  });

  it('applyThemeRestyle conserva formas, textos e imágenes', () => {
    const out = applyThemeRestyle(structuredClone(BLANK_MAP), 'forest');
    expect(out.nodes['root'].text).toBe('Idea Central');
    expect(out.nodes['root'].shape).toBe('bubble');
    expect(out.nodes['node-1'].body).toBeTruthy();
    expect(out.title).toBe(BLANK_MAP.title);
  });

  it('applyBackgroundUpdate fusiona solo el fondo', () => {
    const out = applyBackgroundUpdate(structuredClone(BLANK_MAP), {
      backgroundPattern: 'hexagons',
    });
    expect(out.backgroundPattern).toBe('hexagons');
    expect(out.themeId).toBe('default');
    expect(out.nodes['root'].text).toBe('Idea Central');
  });
});
