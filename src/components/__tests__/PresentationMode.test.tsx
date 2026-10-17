import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PresentationMode } from '../PresentationMode';
import type { MindMap } from '../../types/mindmap';

const testMap: MindMap = {
  id: 'm-test',
  title: 'Mapa Test',
  rootId: 'root',
  connectors: [],
  layout: 'standard',
  themeId: 'default',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  nodes: {
    root: { id: 'root', text: 'Raíz', parentId: null, children: ['c1', 'c2'] },
    c1: { id: 'c1', text: 'Hijo Uno', parentId: 'root', children: [] },
    c2: { id: 'c2', text: 'Hijo Dos', parentId: 'root', children: [] },
  },
};

describe('PresentationMode teclado (regresión del Espacio)', () => {
  it("Espacio (' ') avanza de diapositiva (antes: e.key === 'Space' nunca casaba)", () => {
    render(<PresentationMode mindMap={testMap} onClose={vi.fn()} />);
    expect(screen.getByText(/^1 \/ \d+$/)).toBeDefined();

    fireEvent.keyDown(window, { key: ' ' });
    expect(screen.getByText(/^2 \/ \d+$/)).toBeDefined();
  });

  it('Enter avanza y ArrowLeft retrocede', () => {
    render(<PresentationMode mindMap={testMap} onClose={vi.fn()} />);

    fireEvent.keyDown(window, { key: 'Enter' });
    expect(screen.getByText(/^2 \/ \d+$/)).toBeDefined();

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText(/^1 \/ \d+$/)).toBeDefined();
  });

  it('Escape cierra la presentación (onClose)', () => {
    const onClose = vi.fn();
    render(<PresentationMode mindMap={testMap} onClose={onClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
