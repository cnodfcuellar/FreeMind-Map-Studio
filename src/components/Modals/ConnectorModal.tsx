import React, { useState, useEffect } from 'react';
import { MindMap, Connector, MindNode } from '../../types/mindmap';
import { Link, Trash2 } from 'lucide-react';
import { ModalBackdrop } from '../atoms/ModalBackdrop';
import { ModalHeader } from '../molecules/ModalHeader';
import { Button } from '../atoms/Button';
import { Switch } from '../atoms/Switch';
import { SliderInput } from '../atoms/SliderInput';
import { ColorPicker } from '../atoms/ColorPicker';

interface ConnectorModalProps {
  mindMap: MindMap;
  fromNodeId?: string | null;
  connectorToEdit?: Connector | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveConnector: (connector: Connector) => void;
  onDeleteConnector?: (connectorId: string) => void;
}

export const ConnectorModal: React.FC<ConnectorModalProps> = ({
  mindMap,
  fromNodeId,
  connectorToEdit,
  isOpen,
  onClose,
  onSaveConnector,
  onDeleteConnector,
}) => {
  const isEditing = Boolean(connectorToEdit);

  const [fromId, setFromId] = useState<string>('');
  const [toNodeId, setToNodeId] = useState<string>('');
  const [label, setLabel] = useState<string>('');
  const [shape, setShape] = useState<'curved' | 'bezier' | 'straight' | 'step'>('curved');
  const [curvature, setCurvature] = useState<number>(-50);
  const [layer, setLayer] = useState<'above' | 'below'>('above');
  const [opacity, setOpacity] = useState<number>(1);
  const [style, setStyle] = useState<'solid' | 'dashed' | 'dotted'>('dashed');
  const [color, setColor] = useState<string>('#3b82f6');
  const [arrow, setArrow] = useState<'none' | 'end' | 'start' | 'both'>('end');
  const [width, setWidth] = useState<number>(2);

  // Sombra Flotante
  const [shadow, setShadow] = useState<boolean>(false);
  const [shadowPreset, setShadowPreset] = useState<'soft' | 'deep' | 'glow'>('soft');
  const [shadowBlur, setShadowBlur] = useState<number>(4);
  const [shadowOffsetY, setShadowOffsetY] = useState<number>(2);
  const [shadowColor, setShadowColor] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!isOpen) return;

    if (connectorToEdit) {
      setFromId(connectorToEdit.fromId);
      setToNodeId(connectorToEdit.toId);
      setLabel(connectorToEdit.label || '');
      setShape(connectorToEdit.shape || 'curved');
      setCurvature(connectorToEdit.curvature !== undefined ? connectorToEdit.curvature : -50);
      setLayer(connectorToEdit.layer || 'above');
      setOpacity(connectorToEdit.opacity !== undefined ? connectorToEdit.opacity : 1);
      setStyle(connectorToEdit.style || 'dashed');
      setColor(connectorToEdit.color || '#3b82f6');
      setArrow(connectorToEdit.arrow || 'end');
      setWidth(connectorToEdit.width !== undefined ? connectorToEdit.width : 2);
      setShadow(Boolean(connectorToEdit.shadow));
      setShadowPreset(connectorToEdit.shadowPreset || 'soft');
      setShadowBlur(connectorToEdit.shadowBlur !== undefined ? connectorToEdit.shadowBlur : 4);
      setShadowOffsetY(connectorToEdit.shadowOffsetY !== undefined ? connectorToEdit.shadowOffsetY : 2);
      setShadowColor(connectorToEdit.shadowColor);
    } else {
      setFromId(fromNodeId || mindMap.rootId || '');
      setToNodeId('');
      setLabel('');
      setShape('curved');
      setCurvature(-50);
      setLayer('above');
      setOpacity(1);
      setStyle('dashed');
      setColor('#3b82f6');
      setArrow('end');
      setWidth(2);
      setShadow(false);
      setShadowPreset('soft');
      setShadowBlur(4);
      setShadowOffsetY(2);
      setShadowColor(undefined);
    }
  }, [isOpen, connectorToEdit, fromNodeId, mindMap.rootId]);

  const resolvedFromId = fromId || fromNodeId || mindMap.rootId;
  const fromNode = resolvedFromId ? mindMap.nodes[resolvedFromId] : null;
  const toNode = toNodeId ? mindMap.nodes[toNodeId] : null;

  // Candidatos para origen y destino
  const allNodes = Object.values(mindMap.nodes) as MindNode[];
  const candidateTargetNodes = resolvedFromId
    ? allNodes.filter((n) => n.id !== resolvedFromId)
    : allNodes;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toNodeId || !resolvedFromId) return;

    const savedConnector: Connector = {
      id: connectorToEdit ? connectorToEdit.id : `conn-${Date.now()}`,
      fromId: resolvedFromId,
      toId: toNodeId,
      label: label.trim() || undefined,
      shape,
      curvature,
      layer,
      opacity,
      style,
      color,
      arrow,
      width,
      controlPoint: connectorToEdit?.controlPoint,
      shadow: shadow || undefined,
      shadowPreset: shadow ? shadowPreset : undefined,
      shadowBlur: shadow ? shadowBlur : undefined,
      shadowOffsetY: shadow ? shadowOffsetY : undefined,
      shadowColor: shadow ? shadowColor : undefined,
    };

    onSaveConnector(savedConnector);
    onClose();
  };

  const handleDelete = () => {
    if (!connectorToEdit || !onDeleteConnector) return;
    onDeleteConnector(connectorToEdit.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose} maxWidth="md">
      <ModalHeader
        title={isEditing ? 'Editar Conector de Relación' : 'Crear Conector de Relación'}
        subtitle={
          isEditing && fromNode && toNode
            ? `«${fromNode.text}» ➔ «${toNode.text}»`
            : 'Enlaza dos nodos con aristas personalizadas'
        }
        icon={<Link className="w-5 h-5 text-cyan-600" />}
        onClose={onClose}
      />

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          {/* Nodo Origen */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nodo Origen
            </label>
            {isEditing ? (
              <select
                value={resolvedFromId}
                onChange={(e) => setFromId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {allNodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.text || '(Sin título)'}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 truncate border border-slate-200 dark:border-slate-700">
                {fromNode?.text || 'Nodo seleccionado'}
              </div>
            )}
          </div>

          {/* Nodo Destino */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nodo Destino
            </label>
            <select
              value={toNodeId}
              onChange={(e) => setToNodeId(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              required
            >
              <option value="" disabled>
                -- Selecciona nodo destino --
              </option>
              {candidateTargetNodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.text}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Etiqueta / Texto */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Etiqueta del Conector (Opcional)
          </label>
          <input
            type="text"
            placeholder="ej. Depende de, Relacionado con..."
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        {/* Forma de la Línea y Dirección de Flechas */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Forma de Curvatura
            </label>
            <select
              value={shape}
              onChange={(e) => setShape(e.target.value as any)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="curved">Curva Bézier Natural</option>
              <option value="straight">Línea Recta</option>
              <option value="step">En Ángulo (Escalonada)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Dirección de Flechas
            </label>
            <select
              value={arrow}
              onChange={(e) => setArrow(e.target.value as any)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="end">Hacia el Destino (➔)</option>
              <option value="both">Bidireccional (◄➔)</option>
              <option value="start">Hacia el Origen (◄)</option>
              <option value="none">Sin Flechas (Línea)</option>
            </select>
          </div>
        </div>

        {/* Estilo de Línea y Capa */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Estilo de Trazo
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'solid', label: 'Sólido' },
                { id: 'dashed', label: 'Discontinuo' },
                { id: 'dotted', label: 'Puntos' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setStyle(item.id as any)}
                  className={`py-2 px-1 rounded-lg border text-center transition-all font-medium text-[11px] cursor-pointer ${
                    style === item.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Capa de Profundidad
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'above', label: 'Frente' },
                { id: 'below', label: 'Detrás' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setLayer(item.id as any)}
                  className={`py-2 px-1 rounded-lg border text-center transition-all font-medium text-[11px] cursor-pointer ${
                    layer === item.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grosor de Línea y Color */}
        <div className="grid grid-cols-2 gap-3 items-center">
          <SliderInput
            label="Grosor de Línea"
            value={width}
            min={1}
            max={8}
            unit="px"
            onChange={(w) => setWidth(w)}
          />

          <ColorPicker
            label="Color del Conector"
            value={color}
            onChange={(c) => setColor(c)}
          />
        </div>

        {/* Curvatura personalizada */}
        {shape === 'curved' && (
          <SliderInput
            label="Curvatura Inicial"
            value={curvature}
            min={-150}
            max={150}
            unit=""
            onChange={(v) => setCurvature(v)}
            description="Ajusta el arco del conector. También puedes arrastrar el tirador en el mapa."
          />
        )}

        {/* 6. Sombra Flotante (Objeto #6) */}
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-3">
          <Switch
            checked={shadow}
            onChange={(val) => {
              setShadow(val);
              if (val && !shadowColor) {
                setShadowColor(undefined);
              }
            }}
            label="Sombra Flotante del Conector"
            description="Proyecta relieve y resplandor neón en la curva y flechas"
          />

          {shadow && (
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
              {/* Presets Rápidos */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                  Estilo de Sombra
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'soft' as const, label: 'Suave' },
                    { id: 'deep' as const, label: 'Profunda' },
                    { id: 'glow' as const, label: 'Glow' },
                  ].map((preset) => {
                    const isCur = shadowPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setShadowPreset(preset.id);
                          if (preset.id === 'soft') {
                            setShadowBlur(4);
                            setShadowOffsetY(2);
                            setShadowColor(undefined);
                          } else if (preset.id === 'deep') {
                            setShadowBlur(8);
                            setShadowOffsetY(4);
                            setShadowColor(undefined);
                          } else if (preset.id === 'glow') {
                            setShadowBlur(6);
                            setShadowOffsetY(0);
                            setShadowColor(color || '#3b82f6');
                          }
                        }}
                        className={`py-1 px-1.5 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                          isCur
                            ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-2xs'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slider de Desenfoque */}
              <SliderInput
                label="Desenfoque (Blur)"
                value={shadowBlur}
                min={1}
                max={20}
                unit="px"
                onChange={(b) => setShadowBlur(b)}
              />

              {/* Slider de Desplazamiento Y */}
              <SliderInput
                label="Desplazamiento Vertical (Y)"
                value={shadowOffsetY}
                min={0}
                max={16}
                unit="px"
                onChange={(y) => setShadowOffsetY(y)}
              />

              {/* ColorPicker */}
              <ColorPicker
                label="Color de Sombra / Resplandor"
                value={shadowColor}
                onChange={(c) => setShadowColor(c)}
                onClear={() => setShadowColor(undefined)}
              />
            </div>
          )}
        </div>

        <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <div>
            {isEditing && onDeleteConnector && (
              <Button
                variant="danger"
                size="sm"
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar Conector
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={!toNodeId || !resolvedFromId}
            >
              {isEditing ? 'Guardar Cambios' : 'Crear Conector'}
            </Button>
          </div>
        </div>
      </form>
    </ModalBackdrop>
  );
};
