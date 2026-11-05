import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from '../Switch';

describe('Switch Atom', () => {
  it('renders with label and description', () => {
    const handleChange = vi.fn();
    render(
      <Switch
        checked={false}
        onChange={handleChange}
        label="Sombra de Texto"
        description="Añade relieve tipográfico"
      />
    );

    expect(screen.getByText('Sombra de Texto')).toBeInTheDocument();
    expect(screen.getByText('Añade relieve tipográfico')).toBeInTheDocument();
    const switchBtn = screen.getByRole('switch');
    expect(switchBtn).toHaveAttribute('aria-checked', 'false');
  });

  it('triggers onChange with toggled boolean value when clicked', () => {
    const handleChange = vi.fn();
    render(<Switch checked={false} onChange={handleChange} label="Activar" />);

    const switchBtn = screen.getByRole('switch');
    fireEvent.click(switchBtn);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('toggles from true to false correctly', () => {
    const handleChange = vi.fn();
    render(<Switch checked={true} onChange={handleChange} label="Activo" />);

    const switchBtn = screen.getByRole('switch');
    expect(switchBtn).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(switchBtn);
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('is disabled when disabled prop is provided', () => {
    const handleChange = vi.fn();
    render(<Switch checked={false} onChange={handleChange} disabled label="Desactivado" />);

    const switchBtn = screen.getByRole('switch');
    expect(switchBtn).toBeDisabled();
    fireEvent.click(switchBtn);
    expect(handleChange).not.toHaveBeenCalled();
  });
});

