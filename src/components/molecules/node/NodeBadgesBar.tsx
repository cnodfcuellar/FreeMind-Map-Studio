import React from 'react';
import { MindNode } from '../../../types/mindmap';
import { MarkdownView } from '../../../utils/markdownRenderer';
import { FileText, ExternalLink } from 'lucide-react';

export interface NodeBadgesBarProps {
  node: MindNode;
  isHovered: boolean;
  isEditing: boolean;
  isPresentationMode?: boolean;
  isImageHidden: boolean;
  isLinkHidden: boolean;
  isTagsHidden: boolean;
  isDarkNodeBackground: boolean;
  side?: string;
  onOpenNote: (id: string) => void;
  globalVisibility?: {
    showAllNotesInline?: boolean;
  };
}

export const NodeBadgesBar: React.FC<NodeBadgesBarProps> = ({
  node,
  isHovered,
  isEditing,
  isPresentationMode,
  isImageHidden,
  isLinkHidden,
  isTagsHidden,
  isDarkNodeBackground,
  side,
  onOpenNote,
  globalVisibility,
}) => {
  return (
    <>
      {/* Right Attached Content Image */}
      {!isImageHidden && node.imageUrl && node.imagePosition === 'right' && (
        <div className="shrink-0 flex items-center justify-center overflow-hidden rounded-lg relative z-10 ml-1.5">
          <img
            src={node.imageUrl}
            alt=""
            className="rounded-lg object-contain pointer-events-none shadow-2xs transition-all"
            style={{
              width: `${node.imageWidth || 100}px`,
              maxWidth: '100%',
              height: 'auto',
            }}
          />
        </div>
      )}

      {/* Note indicator icon button */}
      {node.note && (
        <button
          type="button"
          title={
            node.showNoteInline || globalVisibility?.showAllNotesInline
              ? undefined
              : `Nota: ${node.note}`
          }
          onClick={(e) => {
            e.stopPropagation();
            onOpenNote(node.id);
          }}
          className={`shrink-0 p-0.5 transition-colors cursor-pointer ${
            node.showNoteInline || globalVisibility?.showAllNotesInline
              ? 'text-amber-600 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-900/40 rounded'
              : 'text-amber-500 hover:text-amber-600 dark:text-amber-400'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Link indicator */}
      {!isLinkHidden && node.link && (
        <a
          href={node.link}
          target="_blank"
          rel="noopener noreferrer"
          title={`Abrir enlace: ${node.link}`}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 p-0.5 text-slate-400 hover:text-blue-600 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}

      {/* Inline Note (Notas visibles debajo del cuerpo sin tooltip con contraste automático) */}
      {(node.showNoteInline || globalVisibility?.showAllNotesInline) && node.note && node.note.trim().length > 0 && (
        <div
          className={`mt-2 pt-2 border-t rounded-lg p-2.5 text-xs select-text w-full shadow-2xs transition-all ${
            isDarkNodeBackground
              ? 'border-white/20 bg-black/35 text-slate-100 backdrop-blur-xs'
              : 'border-amber-500/20 bg-amber-50/70 text-slate-800'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
              isDarkNodeBackground ? 'text-amber-300' : 'text-amber-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Nota</span>
          </div>
          <MarkdownView content={node.note} isDark={isDarkNodeBackground} />
        </div>
      )}

      {/* Bottom Image if position is bottom */}
      {!isImageHidden && node.imageUrl && node.imagePosition === 'bottom' && (
        <div className="w-full flex justify-center mt-1.5 overflow-hidden rounded-lg relative z-10">
          <img
            src={node.imageUrl}
            alt=""
            className="rounded-lg object-contain pointer-events-none shadow-2xs transition-all"
            style={{
              width: `${node.imageWidth || 140}px`,
              maxWidth: '100%',
              height: 'auto',
            }}
          />
        </div>
      )}

      {/* Dedicated Prominent Link Badge */}
      {!isLinkHidden && node.link && node.link.trim().length > 0 && (
        <a
          href={node.link}
          target="_blank"
          rel="noopener noreferrer"
          title={`Abrir enlace: ${node.link}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-sky-400 hover:bg-blue-600 hover:text-white border border-blue-500/20 text-[11px] font-semibold transition-all max-w-full truncate shadow-2xs z-10 select-none cursor-pointer"
        >
          <ExternalLink className="w-3 h-3 shrink-0" />
          <span className="truncate">
            {node.link.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')}
          </span>
        </a>
      )}

      {/* Tags in the bottom area of the node (Centrados) */}
      {!isTagsHidden && node.tags && node.tags.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1 mt-1 pt-1 border-t border-black/10 dark:border-white/10 w-full shrink-0 relative z-10">
          {node.tags.map((tg, idx) => (
            <span
              key={idx}
              className="text-[10px] leading-tight px-1.5 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-medium tracking-tight shadow-2xs"
            >
              #{tg}
            </span>
          ))}
        </div>
      )}

      {/* Floating Note Hover Tooltip Preview Card (Only when notes are NOT shown inline and NOT in presentation mode) */}
      {node.note &&
        node.note.trim().length > 0 &&
        isHovered &&
        !isEditing &&
        !isPresentationMode &&
        !(node.showNoteInline || globalVisibility?.showAllNotesInline) && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 w-max min-w-[200px] max-w-[340px] sm:max-w-[420px] bg-slate-900/95 text-slate-100 dark:bg-slate-800/98 dark:text-slate-100 p-3.5 rounded-xl shadow-2xl border border-slate-700/80 backdrop-blur-md text-left z-50 animate-in fade-in zoom-in-95 duration-150 pointer-events-none select-none ${
            side === 'top' ? 'top-full mt-2.5' : 'bottom-full mb-2.5'
          }`}
        >
          {/* Tooltip Header */}
          <div className="flex items-center gap-1.5 pb-1.5 mb-2 border-b border-slate-700/60 text-[11px] font-semibold text-amber-400">
            <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Nota del Nodo</span>
          </div>

          {/* Tooltip Body with Complete Rich Markdown Rendering */}
          <div className="text-xs leading-relaxed text-slate-200">
            <MarkdownView content={node.note} isDark={true} />
          </div>

          {/* Arrow pointing towards node */}
          {side === 'top' ? (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-px w-0 h-0 border-x-6 border-x-transparent border-b-6 border-b-slate-900/95 dark:border-b-slate-800/98" />
          ) : (
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-slate-900/95 dark:border-t-slate-800/98" />
          )}
        </div>
      )}
    </>
  );
};
