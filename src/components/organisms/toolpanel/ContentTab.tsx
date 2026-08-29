import React from 'react';
import { MindNode } from '../../../types/mindmap';
import { CollapsibleSection } from '../../atoms/CollapsibleSection';
import { ColorPicker } from '../../atoms/ColorPicker';
import { SliderInput } from '../../atoms/SliderInput';
import { ToggleButtonGroup } from '../../atoms/ToggleButtonGroup';
import { FontFormatToolbar } from '../../molecules/FontFormatToolbar';
import { TagManager } from '../../molecules/TagManager';
import {
  Type,
  FileText,
  Image as ImageIcon,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Smile,
  Minus,
  Plus,
  Trash2,
  Upload,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  FoldVertical,
  Maximize2,
} from 'lucide-react';

interface ContentTabProps {
  selectedNode: MindNode;
  onUpdateNode: (nodeId: string, updates: Partial<MindNode>) => void;
  onOpenIconPackModal?: () => void;
}

export const ContentTab: React.FC<ContentTabProps> = ({
  selectedNode,
  onUpdateNode,
  onOpenIconPackModal,
}) => {
  const [sectionsOpen, setSectionsOpen] = React.useState<Record<string, boolean>>({
    title: true,
    body: false,
    image: false,
    metadata: false,
  });

  const toggleSection = (s: string) => {
    setSectionsOpen((prev) => ({ ...prev, [s]: !prev[s] }));
  };

  const handleExpandAll = (expand: boolean) => {
    setSectionsOpen({
      title: expand,
      body: expand,
      image: expand,
      metadata: expand,
    });
  };

  return (
    <div className="space-y-3.5">
      {/* Barra superior de plegar / desplegar */}
      <div className="flex items-center justify-between pb-0.5">
        <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
          Secciones de Contenido
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

      {/* 1. Título del Nodo */}
      <CollapsibleSection
        title="Título del Nodo"
        subtitle="Texto principal y tipografía"
        isOpen={sectionsOpen.title}
        onToggle={() => toggleSection('title')}
        icon={<Type className="w-3.5 h-3.5" />}
        badge={
          <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
            {selectedNode.fontSize || 14}px
          </span>
        }
      >
        <textarea
          value={selectedNode.text}
          onChange={(e) => onUpdateNode(selectedNode.id, { text: e.target.value })}
          rows={2}
          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 resize-y shadow-2xs"
          placeholder="Escribe el título..."
        />

        <div className="space-y-2 pt-1 border-t border-slate-200/80">
          <FontFormatToolbar
            bold={selectedNode.bold}
            italic={selectedNode.italic}
            align={selectedNode.textAlign || 'left'}
            onToggleBold={() => onUpdateNode(selectedNode.id, { bold: !selectedNode.bold })}
            onToggleItalic={() => onUpdateNode(selectedNode.id, { italic: !selectedNode.italic })}
            onChangeAlign={(align) => onUpdateNode(selectedNode.id, { textAlign: align })}
          />

          <ColorPicker
            label="Color del Texto"
            value={selectedNode.textColor}
            onChange={(c) => onUpdateNode(selectedNode.id, { textColor: c })}
            onClear={() => onUpdateNode(selectedNode.id, { textColor: undefined })}
          />

          <SliderInput
            label="Tamaño de Fuente"
            value={selectedNode.fontSize || 14}
            min={10}
            max={36}
            unit="px"
            onChange={(s) => onUpdateNode(selectedNode.id, { fontSize: s })}
            onReset={() => onUpdateNode(selectedNode.id, { fontSize: undefined })}
          />
        </div>
      </CollapsibleSection>

      {/* 2. Cuerpo / Subtexto */}
      <CollapsibleSection
        title="Cuerpo / Subtexto"
        subtitle="Descripción adicional del nodo"
        isOpen={sectionsOpen.body}
        onToggle={() => toggleSection('body')}
        icon={<FileText className="w-3.5 h-3.5" />}
        action={
          selectedNode.body ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateNode(selectedNode.id, { hideBody: !selectedNode.hideBody });
              }}
              title={selectedNode.hideBody ? 'Mostrar cuerpo en el lienzo' : 'Ocultar cuerpo en el lienzo'}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                selectedNode.hideBody
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {selectedNode.hideBody ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          ) : undefined
        }
        badge={
          selectedNode.body ? (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              selectedNode.hideBody ? 'text-amber-700 bg-amber-100' : 'text-emerald-700 bg-emerald-100'
            }`}>
              {selectedNode.hideBody ? 'Oculto' : 'Activo'}
            </span>
          ) : undefined
        }
      >
        <textarea
          value={selectedNode.body || ''}
          onChange={(e) => onUpdateNode(selectedNode.id, { body: e.target.value || undefined })}
          rows={3}
          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500 resize-y shadow-2xs"
          placeholder="Escribe detalles o párrafos explicativos..."
        />

        {selectedNode.body && (
          <div className="space-y-2 pt-1 border-t border-slate-200/80">
            <FontFormatToolbar
              bold={selectedNode.bodyBold}
              italic={selectedNode.bodyItalic}
              align={selectedNode.bodyAlign || 'left'}
              onToggleBold={() => onUpdateNode(selectedNode.id, { bodyBold: !selectedNode.bodyBold })}
              onToggleItalic={() => onUpdateNode(selectedNode.id, { bodyItalic: !selectedNode.bodyItalic })}
              onChangeAlign={(align) => onUpdateNode(selectedNode.id, { bodyAlign: align })}
            />

            <ColorPicker
              label="Color del Cuerpo"
              value={selectedNode.bodyColor}
              onChange={(c) => onUpdateNode(selectedNode.id, { bodyColor: c })}
              onClear={() => onUpdateNode(selectedNode.id, { bodyColor: undefined })}
            />

            <SliderInput
              label="Tamaño del Cuerpo"
              value={selectedNode.bodyFontSize || 12}
              min={9}
              max={24}
              unit="px"
              onChange={(s) => onUpdateNode(selectedNode.id, { bodyFontSize: s })}
              onReset={() => onUpdateNode(selectedNode.id, { bodyFontSize: undefined })}
            />
          </div>
        )}
      </CollapsibleSection>

      {/* 3. Imagen de Contenido */}
      <CollapsibleSection
        title="Imagen Adjunta"
        subtitle="Ilustración dentro del nodo"
        isOpen={sectionsOpen.image}
        onToggle={() => toggleSection('image')}
        icon={<ImageIcon className="w-3.5 h-3.5" />}
        action={
          selectedNode.imageUrl ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateNode(selectedNode.id, { hideImage: !selectedNode.hideImage });
              }}
              title={selectedNode.hideImage ? 'Mostrar imagen en el lienzo' : 'Ocultar imagen en el lienzo'}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                selectedNode.hideImage
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {selectedNode.hideImage ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          ) : undefined
        }
        badge={
          selectedNode.imageUrl ? (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              selectedNode.hideImage ? 'text-amber-700 bg-amber-100' : 'text-blue-700 bg-blue-100'
            }`}>
              {selectedNode.hideImage ? 'Oculta' : 'Activa'}
            </span>
          ) : undefined
        }
      >
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="URL de la imagen (https://...)"
              value={selectedNode.imageUrl || ''}
              onChange={(e) => onUpdateNode(selectedNode.id, { imageUrl: e.target.value || undefined })}
              className="flex-1 min-w-0 bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500 shadow-2xs"
            />
            {/* Botón Examinar Archivo Local */}
            <label
              title="Examinar e insertar imagen local"
              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors border border-blue-200/80 shrink-0 cursor-pointer shadow-2xs flex items-center justify-center"
            >
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const result = ev.target?.result as string;
                      if (result) {
                        onUpdateNode(selectedNode.id, { imageUrl: result, imagePosition: selectedNode.imagePosition || 'top' });
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                  e.target.value = '';
                }}
              />
            </label>

            {selectedNode.imageUrl && (
              <button
                type="button"
                onClick={() => onUpdateNode(selectedNode.id, { imageUrl: undefined, imagePosition: undefined, imageWidth: undefined, imageHeight: undefined })}
                title="Eliminar imagen adjunta"
                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-200/80 shrink-0 cursor-pointer shadow-2xs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {selectedNode.imageUrl && (
            <div className="space-y-2.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-600 block">Posición de Imagen</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'top' as const, label: 'Arriba', icon: <ArrowUp className="w-3.5 h-3.5" /> },
                  { id: 'between' as const, label: 'Entre texto', icon: <FoldVertical className="w-3.5 h-3.5" /> },
                  { id: 'bottom' as const, label: 'Abajo', icon: <ArrowDown className="w-3.5 h-3.5" /> },
                  { id: 'left' as const, label: 'Izquierda', icon: <ArrowLeft className="w-3.5 h-3.5" /> },
                  { id: 'right' as const, label: 'Derecha', icon: <ArrowRight className="w-3.5 h-3.5" /> },
                  { id: 'fit' as const, label: 'Ajustar', icon: <Maximize2 className="w-3.5 h-3.5" /> },
                ].map((opt) => {
                  const isSelected = (selectedNode.imagePosition || 'top') === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onUpdateNode(selectedNode.id, { imagePosition: opt.id })}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-semibold shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {opt.icon}
                      <span className="text-[10px] mt-1 text-center truncate w-full">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              <SliderInput
                label="Ancho de imagen"
                value={selectedNode.imageWidth || 140}
                min={60}
                max={500}
                step={10}
                unit="px"
                onChange={(w) => onUpdateNode(selectedNode.id, { imageWidth: w })}
              />
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* 4. Metadatos (Tags, Enlace, Progreso, Iconos) */}
      <CollapsibleSection
        title="Metadatos y Visibilidad"
        subtitle="Tags, enlace, progreso e iconos"
        isOpen={sectionsOpen.metadata}
        onToggle={() => toggleSection('metadata')}
        icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
      >
        <div className="space-y-3">
          {/* Tags */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700">Etiquetas (Tags)</span>
              {selectedNode.tags && selectedNode.tags.length > 0 && (
                <button
                  type="button"
                  onClick={() => onUpdateNode(selectedNode.id, { hideTags: !selectedNode.hideTags })}
                  title={selectedNode.hideTags ? 'Mostrar etiquetas en nodo' : 'Ocultar etiquetas en nodo'}
                  className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    selectedNode.hideTags ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {selectedNode.hideTags ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{selectedNode.hideTags ? 'Oculto' : 'Visible'}</span>
                </button>
              )}
            </div>
            <TagManager
              tags={selectedNode.tags}
              onAddTag={(tag) => onUpdateNode(selectedNode.id, { tags: [...(selectedNode.tags || []), tag] })}
              onRemoveTag={(tag) =>
                onUpdateNode(selectedNode.id, {
                  tags: (selectedNode.tags || []).filter((t) => t !== tag),
                })
              }
            />
          </div>

          {/* Enlace */}
          <div className="space-y-1 pt-2 border-t border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700">Enlace Web</span>
              {selectedNode.link && (
                <button
                  type="button"
                  onClick={() => onUpdateNode(selectedNode.id, { hideLink: !selectedNode.hideLink })}
                  title={selectedNode.hideLink ? 'Mostrar enlace en nodo' : 'Ocultar enlace en nodo'}
                  className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    selectedNode.hideLink ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {selectedNode.hideLink ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{selectedNode.hideLink ? 'Oculto' : 'Visible'}</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="https://ejemplo.com"
                value={selectedNode.link || ''}
                onChange={(e) => onUpdateNode(selectedNode.id, { link: e.target.value || undefined })}
                className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Progreso */}
          <div className="pt-2 border-t border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700">Barra de Progreso</span>
              {selectedNode.progress !== undefined && (
                <button
                  type="button"
                  onClick={() => onUpdateNode(selectedNode.id, { hideProgress: !selectedNode.hideProgress })}
                  title={selectedNode.hideProgress ? 'Mostrar progreso en nodo' : 'Ocultar progreso en nodo'}
                  className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    selectedNode.hideProgress ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {selectedNode.hideProgress ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{selectedNode.hideProgress ? 'Oculto' : 'Visible'}</span>
                </button>
              )}
            </div>
            <SliderInput
              label="Porcentaje"
              value={selectedNode.progress || 0}
              min={0}
              max={100}
              step={5}
              unit="%"
              badge={selectedNode.progress !== undefined ? `${selectedNode.progress}%` : 'Sin asignar'}
              onChange={(p) => onUpdateNode(selectedNode.id, { progress: p })}
              onReset={() => onUpdateNode(selectedNode.id, { progress: undefined })}
            />
          </div>

          {/* Iconos Activos y Visibilidad */}
          {selectedNode.icons && selectedNode.icons.length > 0 && (
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700">
                Iconos ({selectedNode.icons.length})
              </span>
              <button
                type="button"
                onClick={() => onUpdateNode(selectedNode.id, { hideIcons: !selectedNode.hideIcons })}
                title={selectedNode.hideIcons ? 'Mostrar iconos en nodo' : 'Ocultar iconos en nodo'}
                className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  selectedNode.hideIcons ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {selectedNode.hideIcons ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{selectedNode.hideIcons ? 'Ocultos' : 'Visibles'}</span>
              </button>
            </div>
          )}

          {/* Icon Pack Modal Trigger */}
          {onOpenIconPackModal && (
            <div className="pt-2 border-t border-slate-200/80">
              <button
                type="button"
                onClick={onOpenIconPackModal}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-blue-200/80 shadow-2xs"
              >
                <Smile className="w-4 h-4" />
                <span>Abrir Galería de Iconos</span>
              </button>
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
};
