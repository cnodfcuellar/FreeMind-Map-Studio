import React from 'react';
import { NodeShape } from '../../types/mindmap';
import {
  MessageSquare,
  GitFork,
  Square,
  Circle,
  Pill,
  Hexagon,
  ArrowRight,
  Star,
} from 'lucide-react';

interface ShapeSelectorProps {
  currentShape?: NodeShape;
  onSelectShape: (shape: NodeShape) => void;
}

interface ShapeItem {
  id: NodeShape;
  name: string;
  icon: React.ReactNode;
}

const SHAPES: ShapeItem[] = [
  {
    id: 'bubble',
    name: 'Burbuja',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 'fork',
    name: 'Horquilla',
    icon: (
      <div className="w-5 h-3.5 flex flex-col justify-end">
        <div className="w-full h-0.5 bg-current rounded-full" />
      </div>
    ),
  },
  {
    id: 'rectangle',
    name: 'Rectángulo',
    icon: (
      <div className="w-5 h-3.5 rounded-none border-2 border-current" />
    ),
  },
  {
    id: 'square',
    name: 'Cuadrado',
    icon: (
      <div className="w-4 h-4 rounded-none border-2 border-current" />
    ),
  },
  {
    id: 'oval',
    name: 'Óvalo',
    icon: (
      <div className="w-5 h-3 rounded-[50%] border-2 border-current" />
    ),
  },
  {
    id: 'circle',
    name: 'Círculo',
    icon: (
      <div className="w-4 h-4 rounded-full border-2 border-current" />
    ),
  },
  {
    id: 'pill',
    name: 'Píldora',
    icon: (
      <div className="w-5 h-2.5 rounded-full border-2 border-current" />
    ),
  },
  {
    id: 'hexagon',
    name: 'Hexágono',
    icon: <Hexagon className="w-4 h-4" />,
  },
  {
    id: 'arrow',
    name: 'Flecha',
    icon: <ArrowRight className="w-4 h-4" />,
  },
  {
    id: 'star',
    name: 'Estrella',
    icon: <Star className="w-4 h-4" />,
  },
];

export const ShapeSelector: React.FC<ShapeSelectorProps> = ({
  currentShape = 'bubble',
  onSelectShape,
}) => {
  const activeShape = SHAPES.find((s) => s.id === currentShape) || SHAPES[0];

  return (
    <div className="space-y-1.5">
      {/* Indicador de forma activa con nombre completo (cero truncamiento) */}
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[10.5px] font-medium text-slate-500">Forma activa:</span>
        <span className="text-[10px] font-bold text-blue-700 bg-blue-50/90 border border-blue-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
          {activeShape.name}
        </span>
      </div>

      {/* Grid de 10 iconos limpios y proporcionados con tooltip nativo */}
      <div className="grid grid-cols-5 gap-1.5">
        {SHAPES.map((s) => {
          const isSelected = currentShape === s.id;
          return (
            <button
              key={s.id}
              type="button"
              title={s.name}
              aria-label={s.name}
              aria-pressed={isSelected}
              onClick={() => onSelectShape(s.id)}
              className={`h-10 flex items-center justify-center rounded-xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/90 text-blue-700 shadow-xs ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100'
              }`}
            >
              {s.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
};
