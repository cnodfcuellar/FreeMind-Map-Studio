import React from 'react';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface FontFormatToolbarProps {
  bold?: boolean;
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onChangeAlign: (align: 'left' | 'center' | 'right') => void;
}

export const FontFormatToolbar: React.FC<FontFormatToolbarProps> = ({
  bold,
  italic,
  align = 'left',
  onToggleBold,
  onToggleItalic,
  onChangeAlign,
}) => {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
        <button
          type="button"
          title="Negrita"
          aria-label="Negrita"
          aria-pressed={bold}
          onClick={onToggleBold}
          className={`p-1.5 transition-colors cursor-pointer ${
            bold
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 font-bold'
              : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Cursiva"
          aria-label="Cursiva"
          aria-pressed={italic}
          onClick={onToggleItalic}
          className={`p-1.5 transition-colors border-l border-slate-200 dark:border-slate-700 cursor-pointer ${
            italic
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300'
              : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
        <button
          type="button"
          title="Alinear a la izquierda"
          aria-label="Alinear a la izquierda"
          aria-pressed={align === 'left'}
          onClick={() => onChangeAlign('left')}
          className={`p-1.5 transition-colors cursor-pointer ${
            align === 'left'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300'
              : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Centrar"
          aria-label="Centrar texto"
          aria-pressed={align === 'center'}
          onClick={() => onChangeAlign('center')}
          className={`p-1.5 transition-colors border-l border-slate-200 dark:border-slate-700 cursor-pointer ${
            align === 'center'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300'
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
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300'
              : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
