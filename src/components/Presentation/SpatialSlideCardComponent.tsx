import React from 'react';
import { SpatialSlideCard } from '../../types/mindmap';
import { THEMES } from '../../utils/themes';
import { MarkdownView } from '../../utils/markdownRenderer';
import { renderNodeIcon } from '../../utils/iconMap';
import {
  RotateCw,
  Maximize2,
  Trash2,
  Copy,
  Edit3,
  FileText,
  Sparkles,
  Move,
} from 'lucide-react';

interface SpatialSlideCardComponentProps {
  card: SpatialSlideCard;
  isSelected: boolean;
  isPresenterMode: boolean;
  isCurrentActive?: boolean;
  isOverviewActive?: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  onEditDetail: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onStartDrag: (e: React.MouseEvent) => void;
  onStartRotate: (e: React.MouseEvent) => void;
  onStartResize: (e: React.MouseEvent, corner: string) => void;
}

export const SpatialSlideCardComponent: React.FC<SpatialSlideCardComponentProps> = ({
  card,
  isSelected,
  isPresenterMode,
  isCurrentActive = false,
  isOverviewActive = false,
  onSelect,
  onDoubleClick,
  onEditDetail,
  onDelete,
  onDuplicate,
  onStartDrag,
  onStartRotate,
  onStartResize,
}) => {
  const theme = THEMES[card.style?.themeId || 'default'] || THEMES.default;
  const isRoot = card.order === 1;

  const { x, y, width, height, scale, rotation } = card.spatial;
  const content = card.content;

  // Background and Text color
  const baseBgColor = card.style?.backgroundColor || (isRoot ? theme.rootBg : theme.nodeBg);
  const textColor = card.style?.textColor || (isRoot ? theme.rootText : theme.nodeText);
  const borderColor = card.style?.borderColor || (isRoot ? '#2563eb' : theme.nodeBorder);
  const borderWidth = card.style?.borderWidth ?? (isRoot ? 3 : 2);
  const isCenter = card.style?.contentAlign === 'center';

  // Build Rich Background (Gradients & SVG Patterns)
  const getCardBackgroundStyle = (): React.CSSProperties => {
    const s = card.style;
    if (!s) return { backgroundColor: baseBgColor };

    // 1. Gradients
    if (s.bgType === 'gradient') {
      const g1 = s.gradientColor1 || baseBgColor;
      const g2 = s.gradientColor2 || '#1e293b';
      const dir = s.gradientDirection || 'to-br';
      if (dir === 'radial') {
        return { backgroundImage: `radial-gradient(circle, ${g1}, ${g2})` };
      }
      const cssDir = dir === 'to-r' ? 'to right' : dir === 'to-b' ? 'to bottom' : 'to bottom right';
      return { backgroundImage: `linear-gradient(${cssDir}, ${g1}, ${g2})` };
    }

    // 2. SVG Patterns
    if (s.bgType === 'pattern' && s.pattern) {
      const pat = s.pattern;
      const patColor = s.patternColor || '#94a3b8';
      const size = s.patternSize || 24;
      const opacity = s.patternOpacity ?? 0.45;

      const hexToRgba = (hex: string, op: number) => {
        let cleanHex = hex.replace('#', '');
        let r = 148, g = 163, b = 184;
        if (cleanHex.length === 3) {
          r = parseInt(cleanHex[0] + cleanHex[0], 16);
          g = parseInt(cleanHex[1] + cleanHex[1], 16);
          b = parseInt(cleanHex[2] + cleanHex[2], 16);
        } else if (cleanHex.length === 6) {
          r = parseInt(cleanHex.substring(0, 2), 16);
          g = parseInt(cleanHex.substring(2, 4), 16);
          b = parseInt(cleanHex.substring(4, 6), 16);
        }
        return `rgba(${r}, ${g}, ${b}, ${op})`;
      };

      const patRgba = hexToRgba(patColor, opacity);

      if (pat === 'dots') {
        return {
          backgroundColor: baseBgColor,
          backgroundImage: `radial-gradient(${patRgba} 1.5px, transparent 1.5px)`,
          backgroundSize: `${size}px ${size}px`,
        };
      }
      if (pat === 'squares') {
        return {
          backgroundColor: baseBgColor,
          backgroundImage: `linear-gradient(to right, ${patRgba} 1px, transparent 1px), linear-gradient(to bottom, ${patRgba} 1px, transparent 1px)`,
          backgroundSize: `${size}px ${size}px`,
        };
      }
      if (pat === 'stripes') {
        return {
          backgroundColor: baseBgColor,
          backgroundImage: `repeating-linear-gradient(45deg, ${patRgba}, ${patRgba} 1.5px, transparent 1.5px, transparent ${size}px)`,
        };
      }
      if (pat === 'hexagons') {
        const R = size;
        const W = Number((R * 1.7320508).toFixed(2));
        const H = Number((R * 3).toFixed(2));
        const W2 = Number((W / 2).toFixed(2));
        const r05 = Number((R * 0.5).toFixed(2));
        const r10 = Number((R * 1.0).toFixed(2));
        const d = `M 0,0 v ${r05} l ${W2},${r05} v ${r10} l -${W2},${r05} v ${r05} M ${W},0 v ${r05} l -${W2},${r05} v ${r10} l ${W2},${r05} v ${r05} M 0,${R * 1.5} h 0`;
        const hexSvg = encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><path d="${d}" fill="none" stroke="${patColor}" stroke-width="1.2" stroke-opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"/></svg>`
        );
        return {
          backgroundColor: baseBgColor,
          backgroundImage: `url("data:image/svg+xml,${hexSvg}")`,
          backgroundSize: `${W}px ${H}px`,
        };
      }
    }

    return { backgroundColor: baseBgColor };
  };

  const richBgStyle = getCardBackgroundStyle();

  // In presenter mode: active slide is on top (z-50) and 100% opaque. Non-active slides are dimmed (opacity 0.22, z-10).
  const isSpotlighted = !isPresenterMode || isOverviewActive || isCurrentActive;
  const zIndexVal = isPresenterMode
    ? isCurrentActive
      ? 60
      : 10
    : isSelected
    ? 50
    : 20;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick();
      }}
      style={{
        transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: 'center center',
        width: `${width}px`,
        minHeight: `${height}px`,
        color: textColor,
        borderColor: isSelected && !isPresenterMode ? '#3b82f6' : isPresenterMode && isCurrentActive ? '#60a5fa' : borderColor,
        borderWidth: `${borderWidth}px`,
        opacity: isSpotlighted ? 1 : 0.2,
        zIndex: zIndexVal,
        transition: 'opacity 400ms ease, box-shadow 300ms ease, border-color 300ms ease',
        ...richBgStyle,
      }}
      className={`absolute top-0 left-0 rounded-3xl p-6 flex flex-col justify-between select-none group ${
        isPresenterMode && isCurrentActive
          ? 'shadow-[0_0_80px_rgba(59,130,246,0.5)] ring-2 ring-blue-400/80'
          : isSelected && !isPresenterMode
          ? 'ring-4 ring-blue-500/40 shadow-[0_0_50px_rgba(59,130,246,0.35)]'
          : 'shadow-2xl hover:shadow-[0_0_30px_rgba(0,0,0,0.15)]'
      }`}
    >
      {/* 1. Header Badges & Actions */}
      <div className="flex items-center justify-between gap-3 mb-3 border-b border-black/10 dark:border-white/10 pb-3">
        {/* Order Badge */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-extrabold text-xs shadow-md">
            #{card.order}
          </span>
          {content.tags && content.tags.length > 0 && (
            <div className="flex items-center gap-1">
              {content.tags.slice(0, 2).map((t, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-slate-500/15 text-[11px] font-semibold opacity-90"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls in Edit Mode */}
        {!isPresenterMode && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 dark:bg-white/10 p-1 rounded-xl backdrop-blur-xs">
            <button
              title="Editar contenido detallado (Doble clic)"
              onClick={(e) => {
                e.stopPropagation();
                onEditDetail();
              }}
              className="p-1.5 hover:bg-blue-600 hover:text-white rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
            <button
              title="Duplicar diapositiva"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="p-1.5 hover:bg-slate-700 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              title="Eliminar diapositiva"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 hover:bg-rose-600 hover:text-white rounded-lg transition-colors cursor-pointer text-rose-500"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Main Content Body */}
      {card.isNoteSlide ? (
        <div className="flex-1 flex flex-col items-start text-left w-full overflow-hidden">
          <div className="flex items-center gap-2 mb-3 text-amber-500 font-bold text-sm border-b border-amber-500/20 pb-2 w-full">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Nota Detallada</span>
            </span>
            <span className="text-base font-extrabold text-slate-100">{content.titleText}</span>
          </div>
          <div className="overflow-y-auto pr-1 text-sm leading-relaxed text-slate-100 max-h-[320px] w-full">
            <MarkdownView content={content.notesMarkdown} isDark={true} />
          </div>
        </div>
      ) : (
        <div className={`flex-1 flex flex-col ${isCenter ? 'items-center text-center' : 'items-start text-left'}`}>
          {/* Optional Image */}
          {content.imageUrl && (
            <div className="mb-4 w-full flex justify-center">
              <img
                src={content.imageUrl}
                alt={content.titleText}
                className="max-h-40 object-contain rounded-xl shadow-md border border-black/5"
              />
            </div>
          )}

          {/* Title & Icons */}
          <div className={`flex items-center gap-2 mb-2 ${isCenter ? 'justify-center' : 'justify-start'}`}>
            {content.icons && content.icons.length > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                {content.icons.map((ic, i) => (
                  <span key={i} className="text-xl">
                    {renderNodeIcon(ic, 'w-5 h-5', textColor, 22)}
                  </span>
                ))}
              </div>
            )}
            <h2 className="text-2xl font-black tracking-tight leading-tight">
              {content.titleText}
            </h2>
          </div>

          {/* Body Text */}
          {content.bodyText && (
            <p className="text-sm opacity-85 leading-relaxed mb-4 max-w-xl font-medium">
              {content.bodyText}
            </p>
          )}

          {/* Sub-items list if any */}
          {content.subItems && content.subItems.length > 0 && (
            <div className="grid grid-cols-2 gap-2 w-full my-2">
              {content.subItems.slice(0, 6).map((sub) => (
                <div
                  key={sub.id}
                  className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-semibold flex items-center gap-2 truncate"
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sub.color || '#3b82f6' }} />
                  <span className="truncate">{sub.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Footer with Markdown Notes Preview on standard cards (if not a dedicated note slide) */}
      {!card.isNoteSlide && content.notesMarkdown && content.notesMarkdown.trim().length > 0 && (
        <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 w-full">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Nota del Orador (Ver diapositiva siguiente)</span>
          </div>
        </div>
      )}

      {/* 4. Interactive Transformation Handles in Edit Mode */}
      {isSelected && !isPresenterMode && (
        <>
          {/* Top Rotation Knob */}
          <div
            onMouseDown={onStartRotate}
            title="Arrastra para rotar la tarjeta"
            className="absolute -top-10 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-50 border-2 border-white"
          >
            <RotateCw className="w-4 h-4" />
          </div>
          <div className="absolute -top-4 left-1/2 -translate-x-px w-0.5 h-4 bg-blue-500 z-40" />

          {/* Drag Move Handle */}
          <div
            onMouseDown={onStartDrag}
            title="Arrastra para mover la posición (X, Y)"
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900 text-white shadow-xl text-[10px] font-bold flex items-center gap-1.5 cursor-grab active:cursor-grabbing hover:bg-blue-600 transition-colors z-50 border border-slate-700"
          >
            <Move className="w-3 h-3" />
            <span>Mover ({Math.round(x)}, {Math.round(y)}) • {Math.round(rotation)}°</span>
          </div>

          {/* Corner Resize Knobs */}
          <div
            onMouseDown={(e) => onStartResize(e, 'se')}
            title="Escalar tamaño"
            className="absolute -bottom-2.5 -right-2.5 w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-md cursor-nwse-resize hover:scale-125 transition-transform z-50 flex items-center justify-center text-white text-[8px]"
          >
            <Maximize2 className="w-2.5 h-2.5" />
          </div>
          <div
            onMouseDown={(e) => onStartResize(e, 'sw')}
            title="Escalar tamaño"
            className="absolute -bottom-2.5 -left-2.5 w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-md cursor-nesw-resize hover:scale-125 transition-transform z-50"
          />
          <div
            onMouseDown={(e) => onStartResize(e, 'ne')}
            title="Escalar tamaño"
            className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-md cursor-nesw-resize hover:scale-125 transition-transform z-50"
          />
          <div
            onMouseDown={(e) => onStartResize(e, 'nw')}
            title="Escalar tamaño"
            className="absolute -top-2.5 -left-2.5 w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-md cursor-nwse-resize hover:scale-125 transition-transform z-50"
          />
        </>
      )}
    </div>
  );
};
