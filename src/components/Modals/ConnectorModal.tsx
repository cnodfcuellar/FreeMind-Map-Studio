import React, { useState } from 'react';
import { MindMap, Connector, MindNode } from '../../types/mindmap';
import { X, Link, ArrowRight } from 'lucide-react';

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
  const [style, setStyle] = useState<'solid' | 'dashed' | 'dotted'>('dashed');
  const [color, setColor] = useState<string>('#3b82f6');

  if (!isOpen || !fromNodeId) return null;

  const fromNode = mindMap.nodes[fromNodeId];
  if (!fromNode) return null;

  // Potential target nodes (exclude source node)
  const candidateNodes = (Object.values(mindMap.nodes) as MindNode[]).filter((n) => n.id !== fromNodeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toNodeId) return;

    const newConnector: Connector = {
      id: `conn-${Date.now()}`,
      fromId: fromNodeId,
      toId: toNodeId,
      label: label.trim() || undefined,
      shape,
      curvature,
      style,
      color,
      arrow: 'end',
      width: 2,
    };

    onSaveConnector(newConnector);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Link className="w-5 h-5 text-cyan-600" />
            <h2 className="font-bold text-base text-slate-800">
              Crear Conector de Relación
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nodo de Origen</label>
            <div className="p-2.5 rounded-lg bg-slate-100 font-medium text-slate-800 truncate">
              {fromNode.text.split('\n')[0]}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nodo de Destino</label>
            <select
              value={toNodeId}
              onChange={(e) => setToNodeId(e.target.value)}
              required
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
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
            <label className="block font-semibold text-slate-700 mb-1">Etiqueta de la Relación (Opcional)</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ej: Causa, Depende de, Relacionado..."
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
            />
          </div>

          {/* Forma del Recorrido */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Forma / Trazado</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'curved', label: 'Curva', sym: '⌒' },
                { id: 'bezier', label: 'Bézier S', sym: '∿' },
                { id: 'straight', label: 'Recta', sym: '─' },
                { id: 'step', label: 'Escalón', sym: '┐' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setShape(s.id as any)}
                  className={`py-1.5 rounded-lg border text-center font-medium transition-all ${
                    shape === s.id
                      ? 'bg-cyan-600 text-white border-cyan-600 font-bold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block font-mono text-xs">{s.sym}</span>
                  <span className="text-[10px] block">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {shape !== 'straight' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Curvatura Inicial ({curvature}px)</label>
              </div>
              <input
                type="range"
                min="-200"
                max="200"
                step="5"
                value={curvature}
                onChange={(e) => setCurvature(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estilo de Línea</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
              >
                <option value="dashed">Discontinua (Dashed)</option>
                <option value="solid">Sólida (Solid)</option>
                <option value="dotted">Punteada (Dotted)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0"
                />
                <span className="font-mono text-slate-600">{color}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!toNodeId}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              Crear Conector
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
