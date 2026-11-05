import React, { useRef, useEffect } from 'react';
import { MindNode, MindMapTheme } from '../../../types/mindmap';
import { renderNodeIcon } from '../../../utils/iconMap';
import { GripVertical } from 'lucide-react';

export interface NodeHeaderRowProps {
  node: MindNode;
  theme: MindMapTheme;
  isRoot: boolean;
  isHovered: boolean;
  isEditing: boolean;
  editText: string;
  setEditText: (val: string) => void;
  onTextChange: (id: string, newText: string) => void;
  onFinishEditing: () => void;
  onDragStart: (id: string, e: React.MouseEvent) => void;
  isImageHidden: boolean;
  isIconsHidden: boolean;
  isProgressHidden: boolean;
  isBodyHidden: boolean;
  textColor: string;
  effectiveFontFamily?: string;
  children?: React.ReactNode;
  /** Ancho máximo del contenido (ej. '68%' en hexágono para respetar el polígono). */
  contentMaxWidth?: string;
  /** Tope en px para imágenes de contenido (ej. '96px' en hexágono). */
  mediaMaxWidth?: string;
}

/**
 * Computes CSS text-shadow string based on node settings and presets
 */
export const computeNodeTextShadow = (node: MindNode): string | undefined => {
  if (!node.textShadow) return undefined;

  const preset = node.textShadowPreset || 'soft';
  const blur = node.textShadowBlur ?? (preset === 'glow' ? 8 : preset === 'deep' ? 6 : preset === 'medium' ? 4 : 3);
  const color =
    node.textShadowColor ||
    (preset === 'glow'
      ? '#38bdf8'
      : preset === 'deep'
      ? 'rgba(0,0,0,0.85)'
      : preset === 'medium'
      ? 'rgba(0,0,0,0.75)'
      : 'rgba(0,0,0,0.65)');
  const offX = node.textShadowOffsetX ?? 0;
  const offY = node.textShadowOffsetY ?? (preset === 'glow' ? 0 : preset === 'deep' ? 2 : 1);

  if (preset === 'glow') {
    return `0 0 ${blur}px ${color}, 0 0 ${Math.max(2, Math.round(blur / 2))}px rgba(255,255,255,0.85)`;
  }

  return `${offX}px ${offY}px ${blur}px ${color}`;
};

/**
 * Computes CSS filter drop-shadow string for attached images
 */
export const computeNodeImageShadow = (node: MindNode): string | undefined => {
  if (!node.imageShadow) return undefined;

  const preset = node.imageShadowPreset || 'soft';
  const blur = node.imageShadowBlur ?? (preset === 'glow' ? 12 : preset === 'deep' ? 14 : preset === 'medium' ? 8 : 4);
  const color =
    node.imageShadowColor ||
    (preset === 'glow'
      ? '#38bdf8'
      : preset === 'deep'
      ? 'rgba(0,0,0,0.55)'
      : preset === 'medium'
      ? 'rgba(0,0,0,0.38)'
      : 'rgba(0,0,0,0.25)');
  const offY = preset === 'glow' ? 0 : preset === 'deep' ? 6 : preset === 'medium' ? 3 : 2;

  return `drop-shadow(0px ${offY}px ${blur}px ${color})`;
};

export const NodeHeaderRow: React.FC<NodeHeaderRowProps> = ({
  node,
  theme,
  isRoot,
  isHovered,
  isEditing,
  editText,
  setEditText,
  onTextChange,
  onFinishEditing,
  onDragStart,
  isImageHidden,
  isIconsHidden,
  isProgressHidden,
  isBodyHidden,
  textColor,
  effectiveFontFamily,
  children,
  contentMaxWidth,
  mediaMaxWidth,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onTextChange(node.id, editText);
      onFinishEditing();
    } else if (e.key === 'Escape') {
      setEditText(node.text);
      onFinishEditing();
    }
  };

  const handleBlur = () => {
    onTextChange(node.id, editText);
    onFinishEditing();
  };

  // Formas con contenido centrado (el hexágono además se ciñe al polígono)
  const centeredShape =
    node.shape === 'circle' ||
    node.shape === 'square' ||
    node.shape === 'star' ||
    node.shape === 'hexagon';
  const contentStyle: React.CSSProperties | undefined = contentMaxWidth
    ? { maxWidth: contentMaxWidth, marginLeft: 'auto', marginRight: 'auto' }
    : undefined;
  // Las imágenes se acotan más (vértices estrechos) con tope fijo en px
  // para que la medición del motor coincida con lo dibujado.
  const mediaStyle: React.CSSProperties | undefined = mediaMaxWidth
    ? { maxWidth: mediaMaxWidth, marginLeft: 'auto', marginRight: 'auto' }
    : contentStyle;

  const textShadowStyle = computeNodeTextShadow(node);
  const imageShadowStyle = computeNodeImageShadow(node);

  return (
    <>
      {/* Top Image if position is top, fit or default */}
      {!isImageHidden && node.imageUrl && (!node.imagePosition || node.imagePosition === 'top' || node.imagePosition === 'fit') && (
        <div className={`w-full flex justify-center mb-1.5 ${imageShadowStyle ? 'overflow-visible' : 'overflow-hidden'} rounded-lg relative z-10`} style={mediaStyle}>
          <img
            src={node.imageUrl}
            alt=""
            className="rounded-lg object-contain pointer-events-none shadow-2xs transition-all"
            style={{
              width: `${node.imageWidth || 140}px`,
              maxWidth: '100%',
              height: 'auto',
              filter: imageShadowStyle,
            }}
          />
        </div>
      )}

      {/* Top Icons & Status / Progress Row (Placed OVER / ABOVE the Title) */}
      {((!isIconsHidden && node.icons && node.icons.length > 0 && node.iconPosition !== 'left') ||
        (!isProgressHidden && node.progress !== undefined && node.progressPosition !== 'left')) && (
        <div
          className={`flex items-center gap-1.5 mb-1 relative z-10 w-full ${
            node.textAlign === 'center' || centeredShape
              ? 'justify-center'
              : node.textAlign === 'right'
              ? 'justify-end'
              : 'justify-start'
          }`}
        >
          {/* Icons */}
          {!isIconsHidden && node.icons && node.icons.length > 0 && node.iconPosition !== 'left' && (
            <div className="flex items-center gap-1 shrink-0">
              {node.icons.map((ic, idx) => (
                <span key={idx} className="inline-flex items-center shrink-0">
                  {renderNodeIcon(ic, 'w-3.5 h-3.5', node.iconColor, node.iconSize)}
                </span>
              ))}
            </div>
          )}

          {/* Progress / Status indicator */}
          {!isProgressHidden && node.progress !== undefined && node.progressPosition !== 'left' && (
            <div
              title={`Progreso: ${node.progress}%`}
              className="shrink-0 flex items-center justify-center px-1.5 py-0.5 rounded-full border border-slate-300/80 bg-slate-100/90 text-[9.5px] font-bold text-slate-700 shadow-2xs"
            >
              {node.progress === 100 ? '✓ 100%' : `${node.progress}%`}
            </div>
          )}
        </div>
      )}

      {/* Node Content Container (Side elements + Title/Body) */}
      <div className="flex items-start gap-1.5 w-full relative z-10">
        {/* Drag handle on hover (non-root) */}
        {!isRoot && isHovered && (
          <div
            title="Arrastrar para mover o reordenar rama"
            className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700 -ml-1.5 mt-0.5 shrink-0"
            onMouseDown={(e) => {
              e.stopPropagation();
              onDragStart(node.id, e);
            }}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Side Icons (only when iconPosition is explicitly 'left') */}
        {!isIconsHidden && node.icons && node.icons.length > 0 && node.iconPosition === 'left' && (
          <div className="flex items-center gap-1 shrink-0 mt-0.5">
            {node.icons.map((ic, idx) => (
              <span key={idx} className="inline-flex items-center shrink-0">
                {renderNodeIcon(ic, 'w-3.5 h-3.5', node.iconColor, node.iconSize)}
              </span>
            ))}
          </div>
        )}

        {/* Side Progress (only when progressPosition is explicitly 'left') */}
        {!isProgressHidden && node.progress !== undefined && node.progressPosition === 'left' && (
          <div
            title={`Progreso: ${node.progress}%`}
            className="shrink-0 flex items-center justify-center w-4.5 h-4.5 rounded-full border border-slate-300 bg-slate-100 text-[9px] font-bold text-slate-700 mt-0.5"
          >
            {node.progress === 100 ? '✓' : `${node.progress}%`}
          </div>
        )}

        {/* Left Attached Content Image */}
        {!isImageHidden && node.imageUrl && node.imagePosition === 'left' && (
          <div className={`shrink-0 flex items-center justify-center ${imageShadowStyle ? 'overflow-visible' : 'overflow-hidden'} rounded-lg relative z-10 mr-1.5`} style={mediaStyle}>
            <img
              src={node.imageUrl}
              alt=""
              className="rounded-lg object-contain pointer-events-none shadow-2xs transition-all"
              style={{
                width: `${node.imageWidth || 100}px`,
                maxWidth: '100%',
                height: 'auto',
                filter: imageShadowStyle,
              }}
            />
          </div>
        )}

        {/* Main Text Content (Title & Body) */}
        <div className="flex-1 min-w-0 flex flex-col justify-center overflow-hidden z-10" style={contentStyle}>
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              rows={Math.max(1, editText.split('\n').length)}
              className="w-full bg-white text-slate-900 text-sm rounded px-1.5 py-0.5 border border-blue-500 outline-none resize-none overflow-hidden font-medium"
              style={{
                fontSize: `${node.fontSize || (isRoot ? 16 : 14)}px`,
                fontWeight: node.bold ? 700 : 500,
                fontStyle: node.italic ? 'italic' : 'normal',
                textAlign: node.textAlign || (centeredShape ? 'center' : 'left'),
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            />
          ) : (
            <>
              {/* Title */}
              <div
                className="leading-snug break-words whitespace-pre-wrap select-text w-full"
                style={{
                  color: textColor,
                  fontSize: `${node.fontSize || (isRoot ? 16 : 14)}px`,
                  fontWeight: node.bold ? 700 : (isRoot ? 600 : 500),
                  fontStyle: node.italic ? 'italic' : 'normal',
                  textAlign: node.textAlign || (node.shape === 'circle' || node.shape === 'square' || node.shape === 'star' ? 'center' : 'left'),
                  fontFamily: effectiveFontFamily,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  hyphens: 'auto',
                  textShadow: textShadowStyle,
                }}
              >
                {node.text || 'Nuevo Nodo'}
              </div>

              {/* Between Image (between title and body) */}
              {!isImageHidden && node.imageUrl && node.imagePosition === 'between' && (
                <div className={`w-full flex justify-center my-1.5 ${imageShadowStyle ? 'overflow-visible' : 'overflow-hidden'} rounded-lg relative z-10`} style={mediaStyle}>
                  <img
                    src={node.imageUrl}
                    alt=""
                    className="rounded-lg object-contain pointer-events-none shadow-2xs transition-all"
                    style={{
                      width: `${node.imageWidth || 140}px`,
                      maxWidth: '100%',
                      height: 'auto',
                      filter: imageShadowStyle,
                    }}
                  />
                </div>
              )}

              {/* Body (Cuerpo del nodo) */}
              {!isBodyHidden && node.body && node.body.trim().length > 0 && (
                <div
                  className="mt-1 pt-0.5 leading-relaxed break-words whitespace-pre-wrap select-text border-t border-black/5 dark:border-white/5 w-full"
                  style={{
                    color: node.bodyColor || (isRoot ? 'rgba(255,255,255,0.88)' : (theme.nodeText ? `${theme.nodeText}cc` : '#475569')),
                    fontSize: `${node.bodyFontSize || (isRoot ? 13 : 12)}px`,
                    fontWeight: node.bodyBold ? 700 : 400,
                    fontStyle: node.bodyItalic ? 'italic' : 'normal',
                    textAlign: node.bodyAlign || (centeredShape ? 'center' : 'left'),
                    fontFamily: node.bodyFontFamily || effectiveFontFamily,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto',
                    textShadow: node.applyTextShadowToBody ? textShadowStyle : undefined,
                  }}
                >
                  {node.body}
                </div>
              )}

              {/* Slot for inline notes if needed */}
              {children}
            </>
          )}
        </div>
      </div>
    </>
  );
};
