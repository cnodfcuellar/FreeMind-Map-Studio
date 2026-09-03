import React, { useState } from 'react';
import { MindMap, Connector, MindNode } from '../../types/mindmap';
import { Link } from 'lucide-react';
import { ModalBackdrop } from '../atoms/ModalBackdrop';
import { ModalHeader } from '../molecules/ModalHeader';
import { Button } from '../atoms/Button';

interface ConnectorModalProps {
  mindMap: MindMap;
  fromNodeId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveConnector: (connector: Connector) => void;
}

export const ConnectorModal: React.FC<ConnectorModalProps> = ({
  mindMap,
  fromNodeId,
  isOpen,
  onClose,
  onSaveConnector,
}) => {
  const [toNodeId, setToNodeId] = useState<string>('');
  const [label, setLabel] = useState<string>('');
  const [shape, setShape] = useState<'curved' | 'bezier' | 'straight' | 'step'>('curved');
  const [curvature, setCurvature] = useState<number>(-50);
  const [layer, setLayer] = useState<'above' | 'below'>('above');
  const [opacity, setOpacity] = useState<number>(1);
  const [style, setStyle] = useState<'solid' | 'dashed' | 'dotted'>('dashed');
  const [color, setColor] = useState<string>('#3b82f6');

  const fromNode = fromNodeId ? mindMap.nodes[fromNodeId] : null;

  // Potential target nodes (exclude source node)
  const candidateNodes = fromNodeId
    ? (Object.values(mindMap.nodes) as MindNode[]).filter((n) => n.id !== fromNodeId)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toNodeId || !fromNodeId) return;

    const newConnector: Connector = {
      id: `conn-${Date.now()}`,
      fromId: fromNodeId,
      toId: toNodeId,
      label: label.trim() || undefined,
      shape,
      curvature,
      layer,
      opacity,
      style,
      color,
      arrow: 'end',
      width: 2,
    };

    onSaveConnector(newConnector);
    onClose();
  };

  if (!fromNode) return null;

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose} maxWidth="md">
      <ModalHeader
        title="Crear Conector de Relación"
        subtitle="Enlaza dos nodos con aristas personalizadas"
        icon={<Link className="w-5 h-5 text-cyan-600" />}
        onClose={onClose}
      />

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nodo de Origen</label>
          <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 truncate">
            {fromNode.text.split('\n')[0]}
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nodo de Destino</label>
          <select
            value={toNodeId}
            onChange={(e) => setToNodeId(e.target.value)}
            required
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">Selecciona el nodo a conectar...</option>
            {candidateNodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.text.split('\n')[0]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Etiqueta de la Relación (Opcional)</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ej: depende de, influye en, relacionado con..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Forma</label>
            <select
              value={shape}
              onChange={(e: any) => setShape(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="curved">Curva Orgánica</option>
              <option value="bezier">Bézier Suave</option>
              <option value="straight">Línea Recta</option>
              <option value="step">Ortogonal / Ángulo</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Capa Visual</label>
            <select
              value={layer}
              onChange={(e: any) => setLayer(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="above">Por Encima (Frente)</option>
              <option value="below">Por Debajo (Fondo)</option>
            </select>
          </div>
        </div>

        {shape !== 'straight' && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Curvatura</label>
              <span className="font-mono text-slate-500 text-[11px]">{curvature}px</span>
            </div>
            <input
              type="range"
              min="-200"
              max="200"
              step="5"
              value={curvature}
              onChange={(e) => setCurvature(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Opacidad</label>
            <span className="font-mono text-slate-500 text-[11px]">{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 items-center">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Estilo de Línea</label>
            <select
              value={style}
              onChange={(e: any) => setStyle(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="solid">Continua (Solid)</option>
              <option value="dashed">Guiones (Dashed)</option>
              <option value="dotted">Punteada (Dotted)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded border border-slate-200 dark:border-slate-700 cursor-pointer p-0"
              />
              <span className="font-mono text-slate-600 dark:text-slate-400">{color}</span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={!toNodeId}
          >
            Crear Conector
          </Button>
        </div>
      </form>
    </ModalBackdrop>
  );
};
