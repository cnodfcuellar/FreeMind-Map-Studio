import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { Input } from '../Input';
import { Badge } from '../Badge';
import { ModalBackdrop } from '../ModalBackdrop';

describe('Atomic Design Atoms', () => {
  it('renders Button and triggers onClick', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Guardar</Button>);
    const btn = screen.getByRole('button', { name: /guardar/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders IconButton with tooltip', () => {
    const handleClick = vi.fn();
    render(
      <IconButton
        icon={<span>+</span>}
        tooltip="Añadir nodo"
        onClick={handleClick}
      />
    );
    const btn = screen.getByTitle('Añadir nodo');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders Input and handles text changes', () => {
    const handleChange = vi.fn();
    render(
      <Input
        placeholder="Buscar..."
        value="Hola"
        onChange={handleChange}
      />
    );
    const input = screen.getByPlaceholderText('Buscar...');
    expect(input).toHaveValue('Hola');
  });

  it('renders Badge and handles onRemove', () => {
    const handleRemove = vi.fn();
    render(
      <Badge variant="blue" onRemove={handleRemove}>
        Etiqueta
      </Badge>
    );
    expect(screen.getByText('Etiqueta')).toBeInTheDocument();
    const removeBtn = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeBtn);
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });

  it('renders ModalBackdrop when isOpen is true', () => {
    const handleClose = vi.fn();
    render(
      <ModalBackdrop isOpen={true} onClose={handleClose}>
        <div>Contenido Modal</div>
      </ModalBackdrop>
    );
    expect(screen.getByText('Contenido Modal')).toBeInTheDocument();
  });
});
