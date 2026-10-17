import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NodeComponent } from '../NodeComponent';
import { THEMES } from '../../utils/themes';
import type { MindNode, CalculatedNodeLayout } from '../../types/mindmap';

const baseLayout: CalculatedNodeLayout = {
  id: 'n1',
  x: 0,
  y: 0,
  width: 140,
  height: 44,
  side: 'right',
  depth: 1,
  branchIndex: 0,
  bounds: { minX: 0, maxX: 140, minY: 0, maxY: 44 },
};

const makeNode = (text: string): MindNode => ({
  id: 'n1',
  text,
  parentId: 'root',
  children: [],
});

const baseProps = {
  layout: baseLayout,
  isSelected: false,
  isEditing: false,
  theme: THEMES.default,
  branchColor: '#3b82f6',
  onSelect: vi.fn(),
  onDoubleClick: vi.fn(),
  onTextChange: vi.fn(),
  onFinishEditing: vi.fn(),
  onToggleFold: vi.fn(),
  onAddChild: vi.fn(),
  onOpenNote: vi.fn(),
  onDragStart: vi.fn(),
  onDropOnNode: vi.fn(),
};

describe('NodeComponent edición inline (regresión del editText desfasado)', () => {
  it('el textarea muestra el texto ACTUAL del nodo al entrar en edición', () => {
    const onTextChange = vi.fn();
    const props = { ...baseProps, onTextChange };
    const { rerender } = render(<NodeComponent {...props} node={makeNode('Original')} />);

    // node.text cambia por fuera (outline, undo/redo, plantilla, pegar) sin remontar (key={node.id})
    rerender(<NodeComponent {...props} node={makeNode('Cambiado por fuera')} />);
    rerender(<NodeComponent {...props} node={makeNode('Cambiado por fuera')} isEditing />);

    const textarea = screen.getByDisplayValue('Cambiado por fuera') as HTMLTextAreaElement;
    expect(textarea.tagName).toBe('TEXTAREA');

    // Confirmar (Enter) sin teclear extra debe enviar el texto ACTUAL (antes: revierte al del montaje)
    fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(onTextChange).toHaveBeenCalledWith('n1', 'Cambiado por fuera');
    expect(onTextChange).not.toHaveBeenCalledWith('n1', 'Original');
  });

  it('editar y escribir envía lo tecleado', () => {
    const onTextChange = vi.fn();
    const props = { ...baseProps, onTextChange };
    const { rerender } = render(<NodeComponent {...props} node={makeNode('Uno')} />);
    rerender(<NodeComponent {...props} node={makeNode('Uno')} isEditing />);

    const textarea = screen.getByDisplayValue('Uno');
    fireEvent.change(textarea, { target: { value: 'Uno editado' } });
    fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(onTextChange).toHaveBeenCalledWith('n1', 'Uno editado');
  });
});
