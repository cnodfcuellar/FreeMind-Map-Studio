import React from 'react';
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Plus,
  RotateCcw,
} from 'lucide-react';

export interface CompactTextToolbarProps {
  bold?: boolean;
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
  fontSize?: number;
  defaultFontSize?: number;
  minFontSize?: number;
  maxFontSize?: number;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onChangeAlign: (align: 'left' | 'center' | 'right') => void;
  onChangeFontSize: (size: number | undefined) => void;
}

export const CompactTextToolbar: React.FC<CompactTextToolbarProps> = ({
  bold,
  italic,
  align = 'left',
  fontSize,
  defaultFontSize = 14,
  minFontSize = 10,
  maxFontSize = 36,
  onToggleBold,
  onToggleItalic,
  onChangeAlign,
  onChangeFontSize,
}) => {
  const currentSize = fontSize || defaultFontSize;
  const isCustomSize = fontSize !== undefined && fontSize !== defaultFontSize;

  const handleDecreaseSize = () => {
    const next = Math.max(minFontSize, currentSize - 1);
    onChangeFontSize(next === defaultFontSize ? undefined : next);
  };

  const handleIncreaseSize = () => {
    const next = Math.min(maxFontSize, currentSize + 1);
    onChangeFontSize(next === defaultFontSize ? undefined : next);
  };

  const handleResetSize = () => {
    onChangeFontSize(undefined);
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* 1. Estilos: Negrita y Cursiva */}
      <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
        <button
          type="button"
          title="Negrita"
          aria-label="Negrita"
          aria-pressed={!!bold}
          onClick={onToggleBold}
          className={`p-1.5 transition-colors cursor-pointer ${
            bold
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-bold'
              : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Cursiva"
          aria-label="Cursiva"
          aria-pressed={!!italic}
          onClick={onToggleItalic}
          className={`p-1.5 transition-colors border-l border-slate-200 dark:border-slate-700 cursor-pointer ${
            italic
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
              : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Alineación: Izquierda, Centro, Derecha */}
      <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
        <button
          type="button"
          title="Alinear a la izquierda"
          aria-label="Alinear a la izquierda"
          aria-pressed={align === 'left'}
          onClick={() => onChangeAlign('left')}
          className={`p-1.5 transition-colors cursor-pointer ${
            align === 'left'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
              : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Centrar"
          aria-label="Centrar"
          aria-pressed={align === 'center'}
          onClick={() => onChangeAlign('center')}
          className={`p-1.5 transition-colors border-l border-slate-200 dark:border-slate-700 cursor-pointer ${
            align === 'center'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
              : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Alinear a la derecha"
          aria-label="Alinear a la derecha"
          aria-pressed={align === 'right'}
          onClick={() => onChangeAlign('right')}
          className={`p-1.5 transition-colors border-l border-slate-200 dark:border-slate-700 cursor-pointer ${
            align === 'right'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
              : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Stepper de Tamaño [- 16px +] */}
      <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
        <button
          type="button"
          title="Reducir tamaño"
          aria-label="Reducir tamaño"
          disabled={currentSize <= minFontSize}
          onClick={handleDecreaseSize}
          className="p-1 px-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <Minus className="w-3 h-3" />
        </button>

        <span
          title={isCustomSize ? `Tamaño personalizado: ${currentSize}px (por defecto: ${defaultFontSize}px)` : `Tamaño: ${currentSize}px`}
          className={`px-1.5 py-0.5 text-[11px] font-mono font-bold select-none text-center min-w-[34px] ${
            isCustomSize
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-700 dark:text-slate-200'
          }`}
        >
          {currentSize}px
        </span>

        <button
          type="button"
          title="Aumentar tamaño"
          aria-label="Aumentar tamaño"
          disabled={currentSize >= maxFontSize}
          onClick={handleIncreaseSize}
          className="p-1 px-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <Plus className="w-3 h-3" />
        </button>

        {isCustomSize && (
          <button
            type="button"
            title="Restablecer tamaño por defecto"
            aria-label="Restablecer tamaño por defecto"
            onClick={handleResetSize}
            className="p-1 pr-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border-l border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <RotateCcw className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
    </div>
  );
};
