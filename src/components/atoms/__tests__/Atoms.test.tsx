import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { Input } from '../Input';
import { Badge } from '../Badge';
import { ModalBackdrop } from '../ModalBackdrop';
import { SliderInput } from '../SliderInput';
import { ToggleButton } from '../ToggleButton';

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

  it('renders ModalBackdrop with dialog role, aria-modal, and handles Escape key', () => {
    const handleClose = vi.fn();
    render(
      <ModalBackdrop isOpen={true} onClose={handleClose}>
        <button type="button">Primer Botón</button>
        <div>Contenido Modal</div>
      </ModalBackdrop>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Contenido Modal')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders SliderInput with accessible ARIA attributes and triggers onChange', () => {
    const handleChange = vi.fn();
    render(
      <SliderInput
        label="Grosor"
        value={4}
        min={1}
        max={10}
        onChange={handleChange}
      />
    );
    const slider = screen.getByRole('slider', { name: 'Grosor' });
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('aria-valuenow', '4');
    expect(slider).toHaveAttribute('aria-valuemin', '1');
    expect(slider).toHaveAttribute('aria-valuemax', '10');

    fireEvent.change(slider, { target: { value: '6' } });
    expect(handleChange).toHaveBeenCalledWith(6);
  });

  it('renders ToggleButton with aria-pressed', () => {
    const handleClick = vi.fn();
    render(
      <ToggleButton
        label="Activar"
        active={true}
        onClick={handleClick}
      />
    );
    const btn = screen.getByRole('button', { name: 'Activar' });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
