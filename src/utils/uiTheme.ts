export type UiTheme = 'claro' | 'oscuro' | 'sepia';

export const UI_THEMES: UiTheme[] = ['claro', 'oscuro', 'sepia'];
const STORAGE_KEY = 'freemind_ui_theme_v1';

export function getNextTheme(theme: UiTheme): UiTheme {
  const idx = UI_THEMES.indexOf(theme);
  return UI_THEMES[(idx + 1) % UI_THEMES.length];
}

export function resolveInitialTheme(stored: string | null, prefersDark: boolean): UiTheme {
  if (stored === 'claro' || stored === 'oscuro' || stored === 'sepia') return stored;
  return prefersDark ? 'oscuro' : 'claro';
}

export function loadUiTheme(): UiTheme {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    // sin almacenamiento: decide por el SO
  }
  const prefersDark =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return resolveInitialTheme(stored, prefersDark);
}

/** Aplica el tema al <html>: data-theme + clase .dark (solo en oscuro). Persiste. */
export function applyUiTheme(theme: UiTheme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('dark', theme === 'oscuro');
  }
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // sin almacenamiento: el tema vive solo en memoria
  }
}
