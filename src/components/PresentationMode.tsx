import React, { useState, useEffect } from 'react';
import { MindMap, MindNode } from '../types/mindmap';
import { renderNodeIcon } from '../utils/iconMap';
import { MarkdownView } from '../utils/markdownRenderer';
import {
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Sparkles,
  Edit3,
  Check,
  ExternalLink,
} from 'lucide-react';

interface PresentationModeProps {
  mindMap: MindMap;
  onClose: () => void;
  onEditNode?: (nodeId: string) => void;
  onUpdateNode?: (nodeId: string, updates: Partial<MindNode>) => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  mindMap,
  onClose,
  onEditNode,
  onUpdateNode,
}) => {
  // Collect all slides (nodes in depth-first order)
  const slides = React.useMemo(() => {
    const list: MindNode[] = [];
    function traverse(nodeId: string) {
      const node = mindMap.nodes[nodeId];
      if (!node) return;
      list.push(node);
      if (node.children) {
        node.children.forEach(traverse);
      }
    }
    traverse(mindMap.rootId);
    return list;
  }, [mindMap]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditingSlide, setIsEditingSlide] = useState(false);

  const currentNode = slides[currentIndex] || slides[0];

  // In-place edit draft states
  const [draftText, setDraftText] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [draftNote, setDraftNote] = useState('');

  // Sync draft states when slide changes or edit mode toggles
  useEffect(() => {
    if (currentNode) {
      setDraftText(currentNode.text || '');
      setDraftBody(currentNode.body || '');
      setDraftNote(currentNode.note || '');
    }
  }, [currentIndex, currentNode?.id]);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleSaveSlideChanges = () => {
    if (currentNode && onUpdateNode) {
      onUpdateNode(currentNode.id, {
        text: draftText,
        body: draftBody.trim().length > 0 ? draftBody : undefined,
        note: draftNote.trim().length > 0 ? draftNote : undefined,
      });
    }
    setIsEditingSlide(false);
  };

  const handleGoToFullEditor = () => {
    if (currentNode && onEditNode) {
      onEditNode(currentNode.id);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture arrow keys while typing in input fields
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        if (e.key === 'Escape') {
          setIsEditingSlide(false);
        }
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        if (isEditingSlide) {
          setIsEditingSlide(false);
        } else {
          onClose();
        }
      } else if (e.key.toLowerCase() === 'e') {
        setIsEditingSlide((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, slides.length, isEditingSlide]);

  if (!currentNode) return null;

  const isRoot = currentNode.id === mindMap.rootId;
  const parentNode = currentNode.parentId ? mindMap.nodes[currentNode.parentId] : null;

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex flex-col justify-between text-white p-6 sm:p-8 select-none animate-in fade-in duration-200 overflow-y-auto">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between gap-3 w-full shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-950/80 border border-purple-800/60 rounded-full text-purple-300 text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Modo Presentación Clásica
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline truncate max-w-xs">
            {mindMap.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* EDIT BUTTON (Editar) */}
          <button
            onClick={() => setIsEditingSlide(!isEditingSlide)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
              isEditingSlide
                ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                : 'bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-600'
            }`}
            title="Editar contenido de esta diapositiva (Tecla E)"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-400" />
            <span>Editar</span>
          </button>

          {/* Slide Indicator */}
          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 hidden sm:inline">
            Diapositiva {currentIndex + 1} de {slides.length}
          </span>

          {/* Exit / Close */}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="Salir de la presentación (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Content Spotlight */}
      <div className="max-w-4xl mx-auto w-full text-center py-6 sm:py-10 flex flex-col items-center justify-center flex-1">
        {/* IN-PLACE QUICK EDIT DRAWER / MODAL */}
        {isEditingSlide ? (
          <div className="w-full max-w-2xl bg-slate-900 border border-blue-500/50 rounded-2xl p-6 text-left shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Editar Diapositiva</h3>
                  <span className="text-[11px] text-slate-400">Modifica el título, subtítulo o notas en vivo</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGoToFullEditor}
                  className="text-xs text-slate-400 hover:text-blue-400 font-semibold px-2.5 py-1 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Salir de la presentación y abrir el panel de edición completo"
                >
                  <span>Editor de Mapa</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Título del Nodo / Diapositiva
              </label>
              <textarea
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sm text-white font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                placeholder="Título del nodo..."
              />
            </div>

            {/* Subtitle / Body Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Subtítulo / Cuerpo
              </label>
              <textarea
                value={draftBody}
                onChange={(e) => setDraftBody(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
                placeholder="Texto explicativo adicional (opcional)..."
              />
            </div>

            {/* Presenter Notes Input (Markdown) */}
            <div>
              <label className="block text-xs font-semibold text-amber-400 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Notas del Presentador (Markdown)</span>
              </label>
              <textarea
                value={draftNote}
                onChange={(e) => setDraftNote(e.target.value)}
                rows={5}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-200 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-y leading-relaxed"
                placeholder="# Nota en Markdown...&#10;- Punto clave 1&#10;- Punto clave 2"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditingSlide(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveSlideChanges}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-900/50 transition-all hover:scale-102 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        ) : (
          /* STANDARD SLIDE SPOTLIGHT VIEW */
          <>
            {/* Parent Breadcrumb if not root */}
            {parentNode && (
              <div className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                <span>{parentNode.text.split('\n')[0]}</span>
                <span className="text-slate-600">→</span>
              </div>
            )}

            {/* Node Icons */}
            {currentNode.icons && currentNode.icons.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                {currentNode.icons.map((ic, i) => (
                  <span key={i} className="scale-125">{renderNodeIcon(ic)}</span>
                ))}
              </div>
            )}

            {/* Main Node Heading with Quick Edit Hover trigger */}
            <div className="relative group/title inline-block max-w-3xl">
              <h1
                style={{
                  color: currentNode.textColor || '#ffffff',
                }}
                className={`text-3xl md:text-5xl font-bold tracking-tight mb-3 leading-tight whitespace-pre-wrap ${
                  isRoot ? 'text-blue-400' : ''
                }`}
              >
                {currentNode.text}
              </h1>
              <button
                onClick={() => setIsEditingSlide(true)}
                className="absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-blue-400 opacity-0 group-hover/title:opacity-100 transition-all cursor-pointer"
                title="Editar este texto"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            {/* Node Body / Subtitle if present */}
            {currentNode.body && (
              <div
                style={{
                  color: currentNode.bodyColor || '#94a3b8',
                  fontWeight: currentNode.bodyBold ? 'bold' : 'normal',
                  fontStyle: currentNode.bodyItalic ? 'italic' : 'normal',
                  textAlign: currentNode.bodyAlign || 'center',
                }}
                className="text-lg md:text-xl max-w-2xl mb-6 text-slate-300 font-normal whitespace-pre-wrap leading-relaxed"
              >
                {currentNode.body}
              </div>
            )}

            {/* Progress or Tags */}
            <div className="flex items-center gap-2 mb-8">
              {currentNode.progress !== undefined && (
                <span className="px-3 py-1 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold">
                  Progreso: {currentNode.progress}%
                </span>
              )}
              {currentNode.tags?.map((t) => (
                <span key={t} className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs">
                  #{t}
                </span>
              ))}
            </div>

            {/* Note / Details Box if present */}
            {currentNode.note && (
              <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-left text-sm text-slate-300 leading-relaxed shadow-xl max-h-60 overflow-y-auto group/note relative">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Notas del Presentador (Markdown)</span>
                  </div>
                  <button
                    onClick={() => setIsEditingSlide(true)}
                    className="text-[11px] text-slate-400 hover:text-amber-300 capitalize flex items-center gap-1 opacity-0 group-hover/note:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Editar nota</span>
                  </button>
                </div>
                <MarkdownView content={currentNode.note} isDark={true} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="flex items-center justify-between max-w-2xl mx-auto w-full shrink-0">
        <button
          disabled={currentIndex === 0}
          onClick={handlePrev}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition-colors text-sm font-semibold cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>

        <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs px-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setIsEditingSlide(false);
              }}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentIndex === idx ? 'w-6 bg-blue-500' : 'w-2 bg-slate-800 hover:bg-slate-700'
              }`}
            />
          ))}
        </div>

        <button
          disabled={currentIndex === slides.length - 1}
          onClick={handleNext}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 transition-colors text-sm font-semibold shadow-lg shadow-blue-900/40 cursor-pointer"
        >
          Siguiente <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
