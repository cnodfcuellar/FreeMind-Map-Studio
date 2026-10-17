import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagManager } from '../TagManager';
import { ShapeSelector } from '../ShapeSelector';

describe('TagManager', () => {
  it('renderiza chips y añade por botón (trim, sin duplicados)', () => {
    const onAdd = vi.fn();
    const onRemove = vi.fn();
    render(<TagManager tags={['a']} onAddTag={onAdd} onRemoveTag={onRemove} />);
    expect(screen.getByText('a')).toBeDefined();

    const input = screen.getByPlaceholderText('Añadir etiqueta...') as HTMLInputElement;
    const addBtn = screen.getAllByRole('button')[0];
    fireEvent.change(input, { target: { value: '  b  ' } });
    fireEvent.click(addBtn);
    expect(onAdd).toHaveBeenCalledWith('b');

    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.click(addBtn);
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('Enter añade y X elimina', () => {
    const onAdd = vi.fn();
    const onRemove = vi.fn();
    render(<TagManager tags={['x']} onAddTag={onAdd} onRemoveTag={onRemove} />);
    const input = screen.getByPlaceholderText('Añadir etiqueta...');
    fireEvent.change(input, { target: { value: 'nuevo' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onAdd).toHaveBeenCalledWith('nuevo');
    // botón X del chip (segundo botón: [añadir, quitar])
    fireEvent.click(screen.getAllByRole('button')[1]);
    expect(onRemove).toHaveBeenCalledWith('x');
  });
});

describe('ShapeSelector', () => {
  it('renderiza las 10 formas y marca la actual', () => {
    const onSelect = vi.fn();
    const { container } = render(<ShapeSelector currentShape="bubble" onSelectShape={onSelect} />);
    expect(container.querySelectorAll('button').length).toBe(10);
    fireEvent.click(screen.getByTitle('Estrella'));
    expect(onSelect).toHaveBeenCalledWith('star');
  });
});
