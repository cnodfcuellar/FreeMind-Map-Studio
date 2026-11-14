import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CompactTextToolbar } from '../CompactTextToolbar';

describe('CompactTextToolbar', () => {
  const defaultProps = {
    bold: false,
    italic: false,
    align: 'left' as const,
    fontSize: 14,
    defaultFontSize: 14,
    minFontSize: 10,
    maxFontSize: 36,
    color: undefined,
    defaultColor: '#ffffff',
    colorLabel: 'Color del Texto',
    onToggleBold: vi.fn(),
    onToggleItalic: vi.fn(),
    onChangeAlign: vi.fn(),
    onChangeFontSize: vi.fn(),
    onChangeColor: vi.fn(),
  };

  it('renderiza botones de estilo, alineación, tamaño y swatch de color', () => {
    render(<CompactTextToolbar {...defaultProps} />);

    expect(screen.getByTitle('Negrita')).toBeDefined();
    expect(screen.getByTitle('Cursiva')).toBeDefined();
    expect(screen.getByTitle('Alinear a la izquierda')).toBeDefined();
    expect(screen.getByTitle('Centrar')).toBeDefined();
    expect(screen.getByTitle('Alinear a la derecha')).toBeDefined();
    expect(screen.getByText('14px')).toBeDefined();
    expect(screen.getByTitle(/Color del Texto/)).toBeDefined();
  });

  it('invoca callbacks de negrita y cursiva', () => {
    const onToggleBold = vi.fn();
    const onToggleItalic = vi.fn();
    render(<CompactTextToolbar {...defaultProps} onToggleBold={onToggleBold} onToggleItalic={onToggleItalic} />);

    fireEvent.click(screen.getByTitle('Negrita'));
    expect(onToggleBold).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTitle('Cursiva'));
    expect(onToggleItalic).toHaveBeenCalledTimes(1);
  });

  it('invoca callbacks de alineación', () => {
    const onChangeAlign = vi.fn();
    render(<CompactTextToolbar {...defaultProps} onChangeAlign={onChangeAlign} />);

    fireEvent.click(screen.getByTitle('Centrar'));
    expect(onChangeAlign).toHaveBeenCalledWith('center');

    fireEvent.click(screen.getByTitle('Alinear a la derecha'));
    expect(onChangeAlign).toHaveBeenCalledWith('right');
  });

  it('stepper incrementa y decrementa el tamaño de fuente', () => {
    const onChangeFontSize = vi.fn();
    render(<CompactTextToolbar {...defaultProps} fontSize={16} onChangeFontSize={onChangeFontSize} />);

    fireEvent.click(screen.getByTitle('Aumentar tamaño'));
    expect(onChangeFontSize).toHaveBeenCalledWith(17);

    fireEvent.click(screen.getByTitle('Reducir tamaño'));
    expect(onChangeFontSize).toHaveBeenCalledWith(15);
  });

  it('muestra botón de restablecer tamaño cuando difiere del default', () => {
    const onChangeFontSize = vi.fn();
    render(<CompactTextToolbar {...defaultProps} fontSize={18} defaultFontSize={14} onChangeFontSize={onChangeFontSize} />);

    const resetBtn = screen.getByTitle('Restablecer tamaño por defecto');
    expect(resetBtn).toBeDefined();

    fireEvent.click(resetBtn);
    expect(onChangeFontSize).toHaveBeenCalledWith(undefined);
  });

  it('abre y cierra el panel desplegable de color', () => {
    const onChangeColor = vi.fn();
    render(<CompactTextToolbar {...defaultProps} onChangeColor={onChangeColor} />);

    // Inicialmente cerrado
    expect(screen.queryByTitle('Cerrar paleta')).toBeNull();

    // Clic en el botón swatch de color
    fireEvent.click(screen.getByTitle(/Color del Texto/));
    expect(screen.getByTitle('Cerrar paleta')).toBeDefined();

    // Seleccionar un preset de color
    const presetButtons = screen.getAllByRole('button');
    const bluePreset = screen.getByTitle('#2563eb');
    fireEvent.click(bluePreset);
    expect(onChangeColor).toHaveBeenCalledWith('#2563eb');

    // Cerrar paleta
    fireEvent.click(screen.getByTitle('Cerrar paleta'));
    expect(screen.queryByTitle('Cerrar paleta')).toBeNull();
  });
});
