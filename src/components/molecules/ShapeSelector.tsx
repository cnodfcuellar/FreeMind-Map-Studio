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
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {SHAPES.map((s) => {
        const isSelected = currentShape === s.id;
        return (
          <button
            key={s.id}
            type="button"
            title={s.name}
            onClick={() => onSelectShape(s.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer select-none ${
              isSelected
                ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-semibold shadow-2xs'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {s.icon}
            <span className="text-[10px] mt-1 text-center truncate w-full">{s.name}</span>
          </button>
        );
      })}
    </div>
  );
};
