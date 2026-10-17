import { describe, it, expect } from 'vitest';
import { THEMES, BACKGROUND_PRESET_THEMES } from '../themes';

const THEME_IDS = ['default', 'rainbow', 'dark', 'forest', 'sunset', 'minimal', 'blueprint', 'honeycomb'];

describe('themes', () => {
  it('existen exactamente 8 temas con ids conocidos', () => {
    expect(Object.keys(THEMES).sort()).toEqual([...THEME_IDS].sort());
  });

  it('cada tema tiene tokens completos y no vacíos', () => {
    for (const t of Object.values(THEMES)) {
      expect(t.rootBg).toBeTruthy();
      expect(t.rootText).toBeTruthy();
      expect(t.nodeBg).toBeTruthy();
      expect(t.nodeText).toBeTruthy();
      expect(t.branchColors.length).toBeGreaterThan(0);
      expect(t.fontFamily).toBe('Plus Jakarta Sans');
    }
  });

  it('default es Clásico Azul con raíz #2563eb', () => {
    expect(THEMES.default.name).toBe('Clásico Azul');
    expect(THEMES.default.rootBg).toBe('#2563eb');
    expect(THEMES.default.branchColors.length).toBe(7);
  });

  it('rainbow tiene 8 colores de rama', () => {
    expect(THEMES.rainbow.branchColors.length).toBe(8);
  });

  it('hay 12 fondos preset con categorías válidas', () => {
    expect(BACKGROUND_PRESET_THEMES.length).toBe(12);
    const cats = new Set(BACKGROUND_PRESET_THEMES.map((b) => b.category));
    for (const c of cats) {
      expect(['light', 'dark', 'paper', 'technical', 'creative']).toContain(c);
    }
  });

  it('cada fondo tiene patrón, color y tamaño positivos', () => {
    for (const b of BACKGROUND_PRESET_THEMES) {
      expect(b.id).toBeTruthy();
      expect(b.backgroundColor).toBeTruthy();
      expect(b.patternColor).toBeTruthy();
      expect(b.patternSize).toBeGreaterThan(0);
      expect(b.patternOpacity).toBeGreaterThan(0);
    }
  });
});
