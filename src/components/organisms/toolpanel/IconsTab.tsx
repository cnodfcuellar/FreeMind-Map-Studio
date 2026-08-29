import React, { useState, useMemo } from 'react';
import { MindNode } from '../../../types/mindmap';
import {
  VECTOR_ICON_PACK,
  VECTOR_ICON_CATEGORIES,
  VectorIconCategory,
  searchVectorIcons,
  TOTAL_VECTOR_ICONS_COUNT,
} from '../../../utils/vectorIconPack';
import { renderNodeIcon } from '../../../utils/iconMap';
import { ColorPicker } from '../../atoms/ColorPicker';
import { SliderInput } from '../../atoms/SliderInput';
import { CollapsibleSection } from '../../atoms/CollapsibleSection';
import { Search, Sparkles, X, Palette } from 'lucide-react';

interface IconsTabProps {
  selectedNode: MindNode;
  onUpdateNode: (nodeId: string, updates: Partial<MindNode>) => void;
  onOpenIconPackModal?: () => void;
  onApplyIconsToChildren?: (nodeId: string) => void;
  onApplyIconsToSiblings?: (nodeId: string) => void;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  all: '🌟',
  priority_status: '🎯',
  business_finance: '💼',
  tech_code: '💻',
  communication: '💬',
  design_media: '🎨',
  education_science: '🎓',
  navigation_maps: '🧭',
  documents_files: '📁',
  nature_weather: '☀️',
  tools_security: '🛡️',
  health_sports: '🏃',
  emojis_symbols: '✨',
};

const QUICK_SEARCH_TAGS = [
  { label: '🎯 Prioridad', query: 'prioridad' },
  { label: '✓ Check', query: 'check' },
  { label: '⚠ Alerta', query: 'alerta' },
  { label: '★ Estrella', query: 'estrella' },
  { label: '👤 Usuario', query: 'usuario' },
  { label: '➔ Flecha', query: 'flecha' },
  { label: '💰 Dinero', query: 'dinero' },
  { label: '📁 Archivo', query: 'archivo' },
];

export const IconsTab: React.FC<IconsTabProps> = ({
  selectedNode,
  onUpdateNode,
  onOpenIconPackModal,
  onApplyIconsToChildren,
  onApplyIconsToSiblings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<VectorIconCategory | 'all'>('all');
  const [isStyleSectionOpen, setIsStyleSectionOpen] = useState(true);

  const filteredIcons = useMemo(() => {
    return searchVectorIcons(searchQuery, category);
  }, [searchQuery, category]);

  const handleToggleIcon = (iconId: string) => {
    const current = selectedNode.icons || [];
    const updated = current.includes(iconId)
      ? current.filter((id) => id !== iconId)
      : [...current, iconId];
    onUpdateNode(selectedNode.id, { icons: updated });
  };

  const handleRemoveIcon = (iconId: string) => {
    const current = selectedNode.icons || [];
    onUpdateNode(selectedNode.id, {
      icons: current.filter((id) => id !== iconId),
    });
  };

  return (
    <div className="space-y-3.5">
      {/* 1. Sección Plegable de Estilo y Tamaño de Iconos */}
      <CollapsibleSection
        title="Color y Tamaño de Iconos"
        subtitle="Personalizar tinte, escala y propagación"
        isOpen={isStyleSectionOpen}
        onToggle={() => setIsStyleSectionOpen((prev) => !prev)}
        icon={<Palette className="w-3.5 h-3.5" />}
        badge={
          selectedNode.iconColor ? (
            <span
              className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs inline-block"
              style={{ backgroundColor: selectedNode.iconColor }}
            />
          ) : undefined
        }
      >
        <div className="space-y-3">
          {/* Selector de Color */}
          <ColorPicker
            label="Tinte del Icono"
            value={selectedNode.iconColor}
            onChange={(color) => onUpdateNode(selectedNode.id, { iconColor: color })}
            onClear={() => onUpdateNode(selectedNode.id, { iconColor: undefined })}
          />

          {/* Paleta rápida de colores populares para iconos */}
          <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto pb-0.5">
            <span className="text-[10px] text-slate-400 shrink-0 font-medium">Sugeridos:</span>
            {[
              { col: '#ef4444', label: 'Rojo' },
              { col: '#f59e0b', label: 'Ámbar' },
              { col: '#10b981', label: 'Verde' },
              { col: '#3b82f6', label: 'Azul' },
              { col: '#8b5cf6', label: 'Púrpura' },
              { col: '#ec4899', label: 'Rosa' },
              { col: '#475569', label: 'Pizarra' },
            ].map((item) => (
              <button
                key={item.col}
                type="button"
                title={item.label}
                onClick={() => onUpdateNode(selectedNode.id, { iconColor: item.col })}
                className="w-4.5 h-4.5 rounded-full shrink-0 border border-slate-300 transition-transform hover:scale-115 cursor-pointer shadow-2xs"
                style={{ backgroundColor: item.col }}
              />
            ))}
            {selectedNode.iconColor && (
              <button
                type="button"
                onClick={() => onUpdateNode(selectedNode.id, { iconColor: undefined })}
                className="text-[10px] text-slate-400 hover:text-slate-600 underline ml-auto shrink-0 cursor-pointer"
              >
                Original
              </button>
            )}
          </div>

          {/* Barra deslizante para cambiar el tamaño de los iconos */}
          <div className="pt-2 border-t border-slate-200/80 space-y-1">
            <SliderInput
              label="Tamaño del Icono"
              value={selectedNode.iconSize || 14}
              min={10}
              max={36}
              step={1}
              unit="px"
              badge={selectedNode.iconSize ? `${selectedNode.iconSize}px` : '14px (Estándar)'}
              onChange={(sz) => onUpdateNode(selectedNode.id, { iconSize: sz })}
              onReset={() => onUpdateNode(selectedNode.id, { iconSize: undefined })}
            />
          </div>

          {/* Propagación exclusiva de iconos, tamaño y color a hijos o hermanos */}
          <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
            <span className="text-[10.5px] font-semibold text-slate-600 block">Propagación de Iconos</span>
            <div className="grid grid-cols-2 gap-1.5">
              {onApplyIconsToChildren && (
                <button
                  type="button"
                  onClick={() => onApplyIconsToChildren(selectedNode.id)}
                  className="py-1.5 px-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[10.5px] font-semibold hover:bg-blue-100 transition-colors cursor-pointer text-center"
                >
                  Copiar a Hijos
                </button>
              )}
              {onApplyIconsToSiblings && (
                <button
                  type="button"
                  onClick={() => onApplyIconsToSiblings(selectedNode.id)}
                  className="py-1.5 px-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[10.5px] font-semibold hover:bg-slate-200 transition-colors cursor-pointer text-center"
                >
                  Copiar a Hermanos
                </button>
              )}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Iconos actualmente asignados al nodo */}
      {selectedNode.icons && selectedNode.icons.length > 0 && (
        <div className="space-y-1.5 bg-blue-50/60 p-2.5 rounded-xl border border-blue-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-blue-900">Iconos Asignados</span>
            <button
              type="button"
              onClick={() => onUpdateNode(selectedNode.id, { icons: [] })}
              className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              Quitar todos
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {selectedNode.icons.map((iconId) => (
              <span
                key={iconId}
                className="inline-flex items-center gap-1 bg-white border border-blue-200 px-2 py-1 rounded-lg text-xs shadow-2xs"
              >
                <span>{renderNodeIcon(iconId, 'w-3.5 h-3.5', selectedNode.iconColor)}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveIcon(iconId)}
                  className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Buscador de iconos */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Buscar entre ${TOTAL_VECTOR_ICONS_COUNT}+ iconos...`}
          className="w-full bg-white border border-slate-200 rounded-xl pl-8.5 pr-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Categorías en chip scroll */}
      <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={`px-2.5 py-1 rounded-lg border whitespace-nowrap cursor-pointer transition-all ${
            category === 'all'
              ? 'bg-blue-600 text-white font-semibold border-blue-600'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          🌟 Todos
        </button>
        {VECTOR_ICON_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            className={`px-2.5 py-1 rounded-lg border whitespace-nowrap cursor-pointer transition-all ${
              category === cat.id
                ? 'bg-blue-600 text-white font-semibold border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {CATEGORY_EMOJIS[cat.id] || '•'} {cat.name}
          </button>
        ))}
      </div>

      {/* Quick Search Tags */}
      <div className="flex flex-wrap gap-1">
        {QUICK_SEARCH_TAGS.map((t) => (
          <button
            key={t.query}
            type="button"
            onClick={() => setSearchQuery(t.query)}
            className="text-[10px] bg-slate-100 hover:bg-slate-200/80 text-slate-600 px-2 py-0.5 rounded-full cursor-pointer transition-colors"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Grid de iconos */}
      <div className="grid grid-cols-6 gap-1.5 max-h-[300px] overflow-y-auto p-1 bg-slate-50/60 rounded-xl border border-slate-200/80">
        {filteredIcons.slice(0, 120).map((icon) => {
          const isSelected = selectedNode.icons?.includes(icon.id);
          return (
            <button
              key={icon.id}
              type="button"
              title={icon.name}
              onClick={() => handleToggleIcon(icon.id)}
              className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-2xs scale-105 ring-2 ring-blue-400'
                  : 'bg-white hover:bg-blue-50 text-slate-700 border border-slate-200/80 hover:border-blue-300'
              }`}
            >
              {renderNodeIcon(icon.id)}
            </button>
          );
        })}
      </div>

      {/* Modal Trigger para el pack completo */}
      {onOpenIconPackModal && (
        <button
          type="button"
          onClick={onOpenIconPackModal}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-blue-200 shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ver Galería Completa de Iconos</span>
        </button>
      )}
    </div>
  );
};
