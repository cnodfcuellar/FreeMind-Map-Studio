import React from 'react';
import { MindNode } from '../../../types/mindmap';
import { NodeShapeSection } from './format/NodeShapeSection';
import { NodeBackgroundSection, PATTERN_OPTIONS } from './format/NodeBackgroundSection';
import { NodeBorderSection } from './format/NodeBorderSection';
import { NodeEdgeSection } from './format/NodeEdgeSection';

export { PATTERN_OPTIONS };

export interface FormatTabProps {
  selectedNode: MindNode;
  onUpdateNode: (nodeId: string, updates: Partial<MindNode>) => void;
  onApplyStyleToChildren?: (nodeId: string) => void;
  onApplyStyleToSiblings?: (nodeId: string) => void;
}

export const FormatTab: React.FC<FormatTabProps> = ({
  selectedNode,
  onUpdateNode,
  onApplyStyleToChildren,
  onApplyStyleToSiblings,
}) => {
  const [sectionsOpen, setSectionsOpen] = React.useState<Record<string, boolean>>({
    shape: true,
    background: false,
    border: false,
    edge: false,
  });

  const toggleSection = (s: string) => {
    setSectionsOpen((prev) => ({ ...prev, [s]: !prev[s] }));
  };

  const handleExpandAll = (expand: boolean) => {
    setSectionsOpen({
      shape: expand,
      background: expand,
      border: expand,
      edge: expand,
    });
  };

  return (
    <div className="space-y-3.5">
      {/* Barra superior de plegar / desplegar */}
      <div className="flex items-center justify-between pb-0.5">
        <span className="text-[10.5px] font-bold text-[var(--sp-muted)] uppercase tracking-wider">
          Formato Visual del Nodo
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleExpandAll(true)}
            className="text-[10.5px] text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
          >
            Desplegar todo
          </button>
          <span className="text-slate-300 text-[10px]">|</span>
          <button
            type="button"
            onClick={() => handleExpandAll(false)}
            className="text-[10.5px] text-slate-500 hover:text-slate-700 font-medium hover:underline cursor-pointer"
          >
            Plegar todo
          </button>
        </div>
      </div>

      {/* 1. Forma y Geometría */}
      <NodeShapeSection
        selectedNode={selectedNode}
        onUpdateNode={onUpdateNode}
        isOpen={sectionsOpen.shape}
        onToggle={() => toggleSection('shape')}
      />

      {/* 2. Fondo y Relleno */}
      <NodeBackgroundSection
        selectedNode={selectedNode}
        onUpdateNode={onUpdateNode}
        isOpen={sectionsOpen.background}
        onToggle={() => toggleSection('background')}
      />

      {/* 3. Bordes y Contorno */}
      <NodeBorderSection
        selectedNode={selectedNode}
        onUpdateNode={onUpdateNode}
        isOpen={sectionsOpen.border}
        onToggle={() => toggleSection('border')}
      />

      {/* 4. Aristas del Nodo y Propagación de Estilos */}
      <NodeEdgeSection
        selectedNode={selectedNode}
        onUpdateNode={onUpdateNode}
        isOpen={sectionsOpen.edge}
        onToggle={() => toggleSection('edge')}
        onApplyStyleToChildren={onApplyStyleToChildren}
        onApplyStyleToSiblings={onApplyStyleToSiblings}
      />
    </div>
  );
};
