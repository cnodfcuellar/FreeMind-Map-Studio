import { describe, it, expect, beforeEach } from 'vitest';
import { getNextTheme, resolveInitialTheme, applyUiTheme } from '../uiTheme';

describe('uiTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
  });

  it('cicla claro → oscuro → sepia → claro', () => {
    expect(getNextTheme('claro')).toBe('oscuro');
    expect(getNextTheme('oscuro')).toBe('sepia');
    expect(getNextTheme('sepia')).toBe('claro');
  });

  it('respeta lo guardado y si no el SO', () => {
    expect(resolveInitialTheme('sepia', false)).toBe('sepia');
    expect(resolveInitialTheme('loco', true)).toBe('oscuro');
    expect(resolveInitialTheme(null, false)).toBe('claro');
  });

  it('aplica data-theme, clase dark y persiste', () => {
    applyUiTheme('oscuro');
    expect(document.documentElement.dataset.theme).toBe('oscuro');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('freemind_ui_theme_v1')).toBe('oscuro');
    applyUiTheme('sepia');
    expect(document.documentElement.dataset.theme).toBe('sepia');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
