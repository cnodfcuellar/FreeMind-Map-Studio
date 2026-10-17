import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolBar } from '../ToolBar';
import { BLANK_MAP } from '../../utils/sampleMaps';

const baseProps = {
  selectedNode: null,
  canUndo: false,
  canRedo: false,
  isFilterBarOpen: false,
  isToolPanelOpen: false,
  mindMap: structuredClone(BLANK_MAP),
  onAddChild: vi.fn(),
  onAddSibling: vi.fn(),
  onDeleteNode: vi.fn(),
  onUndo: vi.fn(),
  onRedo: vi.fn(),
  onToggleOutline: vi.fn(),
  onStartPresentation: vi.fn(),
  onToggleFilterBar: vi.fn(),
  onToggleToolPanel: vi.fn(),
  onOpenConnectorModal: vi.fn(),
  onToggleCloud: vi.fn(),
  onOpenExportModal: vi.fn(),
};

describe('ToolBar visibilidad global', () => {
  it('el toggle de cuerpos llama con hideAllBodies', () => {
    const onToggleGlobalVisibility = vi.fn();
    render(<ToolBar {...baseProps} onToggleGlobalVisibility={onToggleGlobalVisibility} />);
    fireEvent.click(screen.getByTitle(/Visibilidad de elementos/));
    fireEvent.click(screen.getByText('Cuerpos / Explicación'));
    expect(onToggleGlobalVisibility).toHaveBeenCalledWith('hideAllBodies');
  });

  it('muestra estado Visible/Oculto según el mapa', () => {
    const map = structuredClone(BLANK_MAP);
    map.hideAllImages = true;
    render(<ToolBar {...baseProps} mindMap={map} onToggleGlobalVisibility={vi.fn()} />);
    fireEvent.click(screen.getByTitle(/Visibilidad de elementos/));
    expect(screen.getByText('Oculto')).toBeDefined();
    expect(screen.getAllByText('Visible').length).toBe(4);
  });
});

describe('ToolBar grupo de tipografía (regresión del breakpoint xs)', () => {
  it('Negrita/Cursiva se muestran desde sm (antes: xs:flex con breakpoint xs inexistente)', () => {
    render(<ToolBar {...baseProps} />);
    const bold = screen.getByTitle('Negrita (Bold)');
    const italic = screen.getByTitle('Cursiva (Italic)');
    const group = bold.parentElement;
    expect(group).toBe(italic.parentElement);
    expect(group?.className).toContain('hidden');
    expect(group?.className).toContain('sm:flex');
    expect(group?.className).not.toContain('xs:');
  });
});
