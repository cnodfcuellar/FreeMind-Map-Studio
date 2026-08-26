import React, { useState, useEffect } from 'react';
import { MindMap, MindNode } from '../types/mindmap';
import { renderNodeIcon } from '../utils/iconMap';
import { MarkdownView } from '../utils/markdownRenderer';
import {
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Maximize2,
  Sparkles,
} from 'lucide-react';

interface PresentationModeProps {
  mindMap: MindMap;
  onClose: () => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  mindMap,
  onClose,
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
  const currentNode = slides[currentIndex] || slides[0];

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, slides.length]);

  if (!currentNode) return null;

  const isRoot = currentNode.id === mindMap.rootId;
  const parentNode = currentNode.parentId ? mindMap.nodes[currentNode.parentId] : null;

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex flex-col justify-between text-white p-8 select-none animate-in fade-in duration-200">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-950/80 border border-purple-800/60 rounded-full text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Modo Presentación FreeMind
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {mindMap.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            Diapositiva {currentIndex + 1} de {slides.length}
          </span>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Content Spotlight */}
      <div className="max-w-4xl mx-auto w-full text-center py-12 flex flex-col items-center justify-center">
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

        {/* Main Node Heading */}
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
          <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-left text-sm text-slate-300 leading-relaxed shadow-xl max-h-60 overflow-y-auto">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-amber-400" /> Notas del Presentador (Markdown)
            </div>
            <MarkdownView content={currentNode.note} isDark={true} />
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
        <button
          disabled={currentIndex === 0}
          onClick={handlePrev}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition-colors text-sm font-semibold"
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>

        <div className="flex gap-1.5 overflow-x-auto max-w-xs px-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                currentIndex === idx ? 'w-6 bg-blue-500' : 'w-2 bg-slate-800 hover:bg-slate-700'
              }`}
            />
          ))}
        </div>

        <button
          disabled={currentIndex === slides.length - 1}
          onClick={handleNext}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 transition-colors text-sm font-semibold shadow-lg shadow-blue-900/40"
        >
          Siguiente <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
