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
      <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <button
          type="button"
          title="Negrita"
          onClick={onToggleBold}
          className={`p-1.5 transition-colors cursor-pointer ${
            bold ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Cursiva"
          onClick={onToggleItalic}
          className={`p-1.5 transition-colors border-l border-slate-200 cursor-pointer ${
            italic ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <button
          type="button"
          title="Alinear a la izquierda"
          onClick={() => onChangeAlign('left')}
          className={`p-1.5 transition-colors cursor-pointer ${
            align === 'left' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Centrar"
          onClick={() => onChangeAlign('center')}
          className={`p-1.5 transition-colors border-l border-slate-200 cursor-pointer ${
            align === 'center' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Alinear a la derecha"
          onClick={() => onChangeAlign('right')}
          className={`p-1.5 transition-colors border-l border-slate-200 cursor-pointer ${
            align === 'right' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
