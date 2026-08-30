import React, { useState } from 'react';
import { SpatialSlideCard } from '../../types/mindmap';
import { THEMES } from '../../utils/themes';
import { MarkdownView } from '../../utils/markdownRenderer';
import {
  X,
  FileText,
  Type,
  AlignLeft,
  AlignCenter,
  Palette,
  Sparkles,
  Sliders,
  Check,
} from 'lucide-react';

interface SlideDetailModalProps {
  card: SpatialSlideCard;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCard: (updated: SpatialSlideCard) => void;
}

export const SlideDetailModal: React.FC<SlideDetailModalProps> = ({
  card,
  isOpen,
  onClose,
  onUpdateCard,
}) => {
  if (!isOpen) return null;

  const [titleText, setTitleText] = useState(card.content.titleText);
  const [bodyText, setBodyText] = useState(card.content.bodyText || '');
  const [notesMarkdown, setNotesMarkdown] = useState(card.content.notesMarkdown || '');
  const [imageUrl, setImageUrl] = useState(card.content.imageUrl || '');
  const [themeId, setThemeId] = useState(card.style?.themeId || 'default');
  const [contentAlign, setContentAlign] = useState<'center' | 'left'>(card.style?.contentAlign || 'left');
  const [scale, setScale] = useState(card.spatial.scale);
  const [rotation, setRotation] = useState(card.spatial.rotation);

  const handleSave = () => {
    onUpdateCard({
      ...card,
      title: titleText,
      spatial: {
        ...card.spatial,
        scale,
        rotation,
      },
      content: {
        ...card.content,
        titleText,
        bodyText: bodyText.trim() ? bodyText : undefined,
        notesMarkdown: notesMarkdown.trim() ? notesMarkdown : undefined,
        imageUrl: imageUrl.trim() ? imageUrl : undefined,
      },
      style: {
        ...card.style,
        themeId,
        contentAlign,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="bg-slate-900 text-slate-100 border border-slate-700/80 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-extrabold text-xs shadow-md">
              Slide #{card.order}
            </span>
            <h2 className="text-base font-bold text-slate-200">Editar Diapositiva (Estilo Clásico)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Tabs / Form */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* 1. Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-blue-400" />
              <span>Título del Tema</span>
            </label>
            <input
              type="text"
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              placeholder="Escribe el título..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-100 text-sm font-semibold outline-none transition-all"
            />
          </div>

          {/* 2. Body Text */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cuerpo / Explicación</span>
            </label>
            <textarea
              rows={3}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Descripción breve que complementa el título..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-200 text-xs leading-relaxed outline-none transition-all resize-none"
            />
          </div>

          {/* 3. Speaker Notes Markdown */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Notas del Orador (Markdown Enriquecido)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Soporta # títulos, **negrita**, listas y links</span>
            </div>
            <textarea
              rows={4}
              value={notesMarkdown}
              onChange={(e) => setNotesMarkdown(e.target.value)}
              placeholder="# Puntos clave de la presentación&#10;- Explicar el concepto principal&#10;- Mencionar ejemplos reales..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-850 border border-slate-700 font-mono text-xs text-amber-100/90 leading-relaxed outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
            />
            {notesMarkdown.trim().length > 0 && (
              <div className="mt-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Vista Previa:</span>
                <MarkdownView content={notesMarkdown} isDark={true} />
              </div>
            )}
          </div>

          {/* 4. Layout & Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image URL */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                URL de Imagen Adjunta
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-blue-500 text-xs text-slate-200 outline-none"
              />
            </div>

            {/* Alignment */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Alineación del Contenido
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setContentAlign('left')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    contentAlign === 'left'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                  <span>Izquierda</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContentAlign('center')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    contentAlign === 'center'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                  <span>Centrado</span>
                </button>
              </div>
            </div>
          </div>

          {/* 5. Theme Palette */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-purple-400" />
              <span>Tema Visual de la Diapositiva</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(THEMES).map(([id, t]) => {
                const isCurrent = id === themeId;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setThemeId(id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow" style={{ backgroundColor: t.rootBg }} />
                    <span className="text-xs truncate">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Spatial Controls (Rotation & Scale Sliders) */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-400">Rotación Espacial</span>
                <span className="text-xs font-mono font-bold text-blue-400">{Math.round(rotation)}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-400">Escala de Tarjeta</span>
                <span className="text-xs font-mono font-bold text-emerald-400">{scale.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>
    </div>
  );
};
