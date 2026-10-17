import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MenuBar } from '../MenuBar';
import { BLANK_MAP } from '../../utils/sampleMaps';
import { THEMES } from '../../utils/themes';

const baseProps = {
  mindMap: structuredClone(BLANK_MAP),
  canUndo: false,
  canRedo: false,
  onNewMap: vi.fn(),
  onOpenTemplates: vi.fn(),
  onOpenSavedMaps: vi.fn(),
  onSaveMap: vi.fn(),
  onOpenExportModal: vi.fn(),
  onOpenImportModal: vi.fn(),
  onUndo: vi.fn(),
  onRedo: vi.fn(),
  onAddChild: vi.fn(),
  onAddSibling: vi.fn(),
  onDeleteNode: vi.fn(),
  onToggleOutline: vi.fn(),
  onStartPresentation: vi.fn(),
  onOpenShortcuts: vi.fn(),
  onToggleFullscreen: vi.fn(),
  onFoldAll: vi.fn(),
  onUnfoldAll: vi.fn(),
  onOpenConnectorModal: vi.fn(),
  onToggleCloud: vi.fn(),
  onTitleChange: vi.fn(),
};

describe('MenuBar tema de interfaz', () => {
  it('muestra el icono al final y cicla al hacer clic', () => {
    const onCycleTheme = vi.fn();
    render(<MenuBar {...baseProps} uiTheme="oscuro" onCycleTheme={onCycleTheme} />);
    const btn = screen.getByTitle(/Tema de interfaz: oscuro/);
    expect(btn).toBeDefined();
    fireEvent.click(btn);
    expect(onCycleTheme).toHaveBeenCalledTimes(1);
  });

  it('sin handler no muestra el botón', () => {
    const { container } = render(<MenuBar {...baseProps} />);
    expect(container.querySelector('[title^="Tema de interfaz"]')).toBeNull();
  });
});

describe('MenuBar Formato → Temas Visuales (regresión de ids inválidos)', () => {
  // Antes del fix 2026-10-17 estos items enviaban 'purple'/'warm' (no existen en THEMES)
  const items: [string, string][] = [
    ['Clásico Freeplane', 'default'],
    ['Bosque Esmeralda', 'forest'],
    ['Arcoiris Vibrante', 'rainbow'],
    ['Atardecer Cálido', 'sunset'],
    ['Modo Oscuro', 'dark'],
  ];

  it('cada item llama a onChangeTheme con un id existente en THEMES', () => {
    const onChangeTheme = vi.fn();
    render(<MenuBar {...baseProps} onChangeTheme={onChangeTheme} />);
    for (const [label, expectedId] of items) {
      fireEvent.click(screen.getByText('Formato'));
      fireEvent.click(screen.getByText(label));
      expect(onChangeTheme).toHaveBeenLastCalledWith(expectedId);
    }
    // Ninguna llamada con un id que no exista en el catálogo real
    for (const call of onChangeTheme.mock.calls) {
      expect(Object.keys(THEMES)).toContain(call[0]);
    }
  });

  it('el menú Formato no ofrece ningún id fuera de THEMES', () => {
    render(<MenuBar {...baseProps} onChangeTheme={vi.fn()} />);
    fireEvent.click(screen.getByText('Formato'));
    const labels = ['Clásico Freeplane', 'Bosque Esmeralda', 'Arcoiris Vibrante', 'Atardecer Cálido', 'Modo Oscuro'];
    for (const l of labels) expect(screen.getByText(l)).toBeDefined();
    expect(screen.queryByText('Creativo Púrpura')).toBeNull();
  });
});
