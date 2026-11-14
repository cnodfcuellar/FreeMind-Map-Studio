import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CompactTextShadowControl } from '../CompactTextShadowControl';

describe('CompactTextShadowControl', () => {
  it('permite alternar presets y apagar la sombra con Off', () => {
    const onUpdate = vi.fn();
    render(
      <CompactTextShadowControl
        enabled={false}
        preset="soft"
        onUpdate={onUpdate}
      />
    );

    expect(screen.getByText('Off')).toBeDefined();
    expect(screen.getByText('Suave')).toBeDefined();
    expect(screen.getByText('Media')).toBeDefined();
    expect(screen.getByText('Glow')).toBeDefined();

    // Activar preset suave
    fireEvent.click(screen.getByText('Suave'));
    expect(onUpdate).toHaveBeenCalledWith({
      textShadow: true,
      textShadowPreset: 'soft',
    });

    // Activar preset glow
    fireEvent.click(screen.getByText('Glow'));
    expect(onUpdate).toHaveBeenCalledWith({
      textShadow: true,
      textShadowPreset: 'glow',
    });
  });

  it('cuando está activa, muestra ajustes de blur y permite apagar con Off', () => {
    const onUpdate = vi.fn();
    render(
      <CompactTextShadowControl
        enabled={true}
        preset="medium"
        blur={4}
        applyToBody={false}
        onUpdate={onUpdate}
      />
    );

    // Apagar con Off
    fireEvent.click(screen.getByText('Off'));
    expect(onUpdate).toHaveBeenCalledWith({ textShadow: false });

    // Ajustar blur
    fireEvent.click(screen.getByTitle('Aumentar desenfoque'));
    expect(onUpdate).toHaveBeenCalledWith({ textShadowBlur: 5 });

    fireEvent.click(screen.getByTitle('Reducir desenfoque'));
    expect(onUpdate).toHaveBeenCalledWith({ textShadowBlur: 3 });
  });

  it('permite abrir y seleccionar color de sombra', () => {
    const onUpdate = vi.fn();
    render(
      <CompactTextShadowControl
        enabled={true}
        preset="glow"
        onUpdate={onUpdate}
      />
    );

    // Abrir popover de color
    fireEvent.click(screen.getByTitle(/Color de sombra:/));
    expect(screen.getByTitle('Cerrar paleta')).toBeDefined();

    // Seleccionar color
    fireEvent.click(screen.getByTitle('#2563eb'));
    expect(onUpdate).toHaveBeenCalledWith({ textShadowColor: '#2563eb' });
  });
});
