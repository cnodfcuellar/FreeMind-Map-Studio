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
  { id: 'bubble', name: 'Burbuja', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'fork', name: 'Horquilla', icon: <GitFork className="w-4 h-4" /> },
  { id: 'rectangle', name: 'Rectángulo', icon: <Square className="w-4 h-4" /> },
  { id: 'square', name: 'Cuadrado', icon: <Square className="w-4 h-4" /> },
  { id: 'oval', name: 'Óvalo', icon: <Circle className="w-4 h-4 scale-x-125" /> },
  { id: 'circle', name: 'Círculo', icon: <Circle className="w-4 h-4" /> },
  { id: 'pill', name: 'Píldora', icon: <Pill className="w-4 h-4" /> },
  { id: 'hexagon', name: 'Hexágono', icon: <Hexagon className="w-4 h-4" /> },
  { id: 'arrow', name: 'Flecha', icon: <ArrowRight className="w-4 h-4" /> },
  { id: 'star', name: 'Estrella', icon: <Star className="w-4 h-4" /> },
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
