import React, { useState, useRef, useEffect } from 'react';
import { MindNode, CalculatedNodeLayout, MindMapTheme } from '../types/mindmap';
import { renderNodeIcon } from '../utils/iconMap';
import {
  FileText,
  ExternalLink,
  Plus,
  GripVertical,
  ChevronRight,
  ChevronLeft,
  Minus,
} from 'lucide-react';

interface NodeComponentProps {
  node: MindNode;
  layout: CalculatedNodeLayout;
  isSelected: boolean;
  isEditing: boolean;
  theme: MindMapTheme;
  branchColor: string;
  isMatch?: boolean;
  onSelect: (id: string, e: React.MouseEvent) => void;
  onDoubleClick: (id: string) => void;
  onTextChange: (id: string, newText: string) => void;
  onFinishEditing: () => void;
  onToggleFold: (id: string, e: React.MouseEvent) => void;
  onAddChild: (parentId: string) => void;
  onOpenNote: (id: string) => void;
  onDragStart: (id: string, e: React.MouseEvent) => void;
  onDropOnNode: (draggedId: string, targetId: string) => void;
}

export const NodeComponent: React.FC<NodeComponentProps> = ({
  node,
  layout,
  isSelected,
  isEditing,
  theme,
  branchColor,
  isMatch,
  onSelect,
  onDoubleClick,
  onTextChange,
  onFinishEditing,
  onToggleFold,
  onAddChild,
  onOpenNote,
  onDragStart,
  onDropOnNode,
}) => {
  const [editText, setEditText] = useState(node.text);
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isRoot = !node.parentId;
  const shape = node.shape || (isRoot ? 'bubble' : 'bubble');
  const hasChildren = node.children && node.children.length > 0;

  useEffect(() => {
    setEditText(node.text);
  }, [node.text]);

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

  // Determine Colors
  const bgColor = isRoot
    ? (node.color || theme.rootBg)
    : (node.color || theme.nodeBg);

  const textColor = isRoot
    ? (node.textColor || theme.rootText)
    : (node.textColor || theme.nodeText);

  const borderStyle = node.borderDash || node.borderStyle || 'solid';
  const borderColor = node.borderColor || (isRoot ? 'transparent' : branchColor || theme.nodeBorder);
  const borderWidth = node.borderWidth !== undefined ? node.borderWidth : (isRoot ? 0 : 1.5);

  // Background computation (Solid, Transparent, Gradient, Pattern)
  const getNodeBackgroundStyles = (): React.CSSProperties => {
    const bgType = node.bgType || 'color';

    if (bgType === 'transparent') {
      return {
        backgroundColor: 'transparent',
        backgroundImage: 'none',
      };
    }

    if (bgType === 'gradient') {
      const c1 = node.gradientColor1 || node.color || bgColor || '#3b82f6';
      const c2 = node.gradientColor2 || '#8b5cf6';
      const dir = node.gradientDirection || 'to-br';
      let grad = `linear-gradient(135deg, ${c1}, ${c2})`;
      if (dir === 'to-r') grad = `linear-gradient(to right, ${c1}, ${c2})`;
      else if (dir === 'to-b') grad = `linear-gradient(to bottom, ${c1}, ${c2})`;
      else if (dir === 'radial') grad = `radial-gradient(circle, ${c1}, ${c2})`;

      return {
        background: grad,
      };
    }

    if (bgType === 'pattern') {
      const baseColor = node.color || bgColor || '#ffffff';
      const pat = node.nodePattern || 'dots';
      const patColor = node.nodePatternColor || '#475569';
      const opacity = node.nodePatternOpacity ?? 0.4;
      const size = node.nodePatternSize || 16;

      const hexToRgba = (hex: string, op: number) => {
        const cleanHex = hex.replace('#', '');
        let r = 71, g = 85, b = 105;
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
          backgroundColor: baseColor,
          backgroundImage: `radial-gradient(${patRgba} 1.5px, transparent 1.5px)`,
          backgroundSize: `${size}px ${size}px`,
        };
      }
      if (pat === 'lines') {
        return {
          backgroundColor: baseColor,
          backgroundImage: `linear-gradient(to bottom, transparent calc(100% - 1px), ${patRgba} 1px)`,
          backgroundSize: `100% ${size}px`,
        };
      }
      if (pat === 'squares') {
        return {
          backgroundColor: baseColor,
          backgroundImage: `linear-gradient(to right, ${patRgba} 1px, transparent 1px), linear-gradient(to bottom, ${patRgba} 1px, transparent 1px)`,
          backgroundSize: `${size}px ${size}px`,
        };
      }
      if (pat === 'stripes') {
        return {
          backgroundColor: baseColor,
          backgroundImage: `repeating-linear-gradient(45deg, ${patRgba}, ${patRgba} 1.5px, transparent 1.5px, transparent ${size}px)`,
        };
      }
      if (pat === 'triangles') {
        const triH = Math.round(size * 1.732);
        const triSvg = encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${triH}" viewBox="0 0 ${size} ${triH}"><path d="M 0 ${triH} L ${size/2} 0 L ${size} ${triH} Z" fill="none" stroke="${patColor}" stroke-width="1" stroke-opacity="${opacity}"/></svg>`
        );
        return {
          backgroundColor: baseColor,
          backgroundImage: `url("data:image/svg+xml,${triSvg}")`,
          backgroundSize: `${size}px ${triH}px`,
        };
      }
      if (pat === 'hexagons') {
        const hexH = Math.round(size * 1.732);
        const hexSvg = encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${hexH}" viewBox="0 0 ${size} ${hexH}"><path d="M 0 ${Math.round(size * 0.288)} L ${size/2} 0 L ${size} ${Math.round(size * 0.288)} L ${size} ${Math.round(size * 0.866)} L ${size/2} ${Math.round(size * 1.155)} L 0 ${Math.round(size * 0.866)} Z" fill="none" stroke="${patColor}" stroke-width="1" stroke-opacity="${opacity}"/></svg>`
        );
        return {
          backgroundColor: baseColor,
          backgroundImage: `url("data:image/svg+xml,${hexSvg}")`,
          backgroundSize: `${size}px ${hexH}px`,
        };
      }
      if (pat === 'cross') {
        return {
          backgroundColor: baseColor,
          backgroundImage: `radial-gradient(circle, ${patRgba} 1.5px, transparent 1.5px), radial-gradient(circle, ${patRgba} 1.5px, transparent 1.5px)`,
          backgroundSize: `${size}px ${size}px`,
          backgroundPosition: `0 0, ${size / 2}px ${size / 2}px`,
        };
      }

      return {
        backgroundColor: baseColor,
        backgroundImage: `radial-gradient(${patRgba} 1.5px, transparent 1.5px)`,
        backgroundSize: `${size}px ${size}px`,
      };
    }

    if (bgType === 'image' || node.bgImageUrl) {
      const bgImg = node.bgImageUrl || (bgType === 'image' ? node.imageUrl : undefined);
      if (bgImg) {
        const mode = node.bgImageMode || 'cover';
        const bgSize = mode === 'fit' || mode === 'contain' ? 'contain' : mode === 'tile' ? 'auto' : 'cover';
        const bgRepeat = mode === 'tile' ? 'repeat' : 'no-repeat';
        const bgPos = 'center';
        return {
          backgroundColor: node.color || bgColor || '#ffffff',
          backgroundImage: `url("${bgImg}")`,
          backgroundSize: bgSize,
          backgroundRepeat: bgRepeat,
          backgroundPosition: bgPos,
        };
      }
    }

    return {
      backgroundColor: bgColor,
    };
  };

  // Shape class generator
  const getShapeStyle = (): React.CSSProperties => {
    const bgStyles = getNodeBackgroundStyles();

    const baseStyle: React.CSSProperties = {
      ...bgStyles,
      border: borderWidth > 0 ? `${borderWidth}px ${borderStyle} ${borderColor}` : 'none',
    };

    if (shape === 'fork') {
      return {
        ...baseStyle,
        background: 'transparent',
        borderBottom: `${Math.max(2, borderWidth || 2.5)}px ${borderStyle} ${borderColor || branchColor || '#3b82f6'}`,
        borderRadius: 0,
      };
    }
    if (shape === 'square') {
      return {
        ...baseStyle,
        borderRadius: '0px',
      };
    }
    if (shape === 'circle') {
      return {
        ...baseStyle,
        borderRadius: '9999px',
      };
    }
    if (shape === 'pill') {
      return {
        ...baseStyle,
        borderRadius: '9999px',
        paddingLeft: '16px',
        paddingRight: '16px',
      };
    }
    if (shape === 'oval') {
      return {
        ...baseStyle,
        borderRadius: '50%',
        paddingLeft: '16px',
        paddingRight: '16px',
      };
    }
    if (shape === 'rectangle') {
      return {
        ...baseStyle,
        borderRadius: '4px',
      };
    }
    if (shape === 'hexagon') {
      return {
        background: 'transparent',
        border: 'none',
        paddingLeft: '32px',
        paddingRight: '32px',
      };
    }
    if (shape === 'arrow') {
      return {
        background: 'transparent',
        border: 'none',
        paddingLeft: '24px',
        paddingRight: '36px',
      };
    }
    if (shape === 'star') {
      return {
        background: 'transparent',
        border: 'none',
        padding: '24px 28px',
        textAlign: 'center',
      };
    }
    // Default Bubble
    return {
      ...baseStyle,
      borderRadius: isRoot ? '16px' : '10px',
    };
  };

  const isSvgShape = shape === 'hexagon' || shape === 'arrow' || shape === 'star';

  const renderSvgPolygonBackground = () => {
    if (!isSvgShape) return null;

    const w = layout.width;
    const h = layout.height;
    const strokeDash = borderStyle === 'dashed' ? '6 4' : borderStyle === 'dotted' ? '2.5 3' : undefined;
    const effectiveBorderColor = borderWidth > 0 ? borderColor : 'none';
    const effectiveBorderWidth = borderWidth;

    const bgType = node.bgType || (node.bgImageUrl ? 'image' : 'color');
    const gradId = `grad-${node.id}`;
    const patternId = `pat-${node.id}`;
    const bgImgId = `bg-img-${node.id}`;
    const bgImg = node.bgImageUrl || (bgType === 'image' ? node.imageUrl : undefined);

    let fillAttr = node.color || bgColor || '#ffffff';
    if (bgType === 'transparent') {
      fillAttr = 'transparent';
    } else if (bgType === 'image' && bgImg) {
      fillAttr = `url(#${bgImgId})`;
    } else if (bgType === 'gradient') {
      fillAttr = `url(#${gradId})`;
    } else if (bgType === 'pattern') {
      fillAttr = `url(#${patternId})`;
    }

    let points = '';
    if (shape === 'hexagon') {
      const inset = Math.min(w * 0.28, Math.max(28, h * 0.58));
      const pad = effectiveBorderWidth / 2;
      points = `${inset},${pad} ${w - inset},${pad} ${w - pad},${h / 2} ${w - inset},${h - pad} ${inset},${h - pad} ${pad},${h / 2}`;
    } else if (shape === 'arrow') {
      const arrowTip = Math.min(w * 0.32, Math.max(32, h * 0.70));
      const notch = Math.min(w * 0.16, Math.max(16, h * 0.40));
      const pad = effectiveBorderWidth / 2;
      points = `${pad},${pad} ${w - arrowTip},${pad} ${w - pad},${h / 2} ${w - arrowTip},${h - pad} ${pad},${h - pad} ${notch},${h / 2}`;
    } else if (shape === 'star') {
      const pad = effectiveBorderWidth / 2;
      const cx = w / 2;
      const cy = h / 2;
      const Rx = Math.max((w - 2 * pad) / 2, 10);
      const Ry = Math.max((h - 2 * pad) / 2, 10);
      const rx = Rx * 0.44;
      const ry = Ry * 0.44;
      const starPts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const angle = -Math.PI / 2 + (i * Math.PI) / 5;
        const rCurrX = i % 2 === 0 ? Rx : rx;
        const rCurrY = i % 2 === 0 ? Ry : ry;
        starPts.push(`${cx + rCurrX * Math.cos(angle)},${cy + rCurrY * Math.sin(angle)}`);
      }
      points = starPts.join(' ');
    }

    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
      >
        <defs>
          {bgImg && (
            <pattern
              id={bgImgId}
              width="100%"
              height="100%"
              patternContentUnits="objectBoundingBox"
            >
              <image
                href={bgImg}
                width="1"
                height="1"
                preserveAspectRatio={node.bgImageMode === 'fit' || node.bgImageMode === 'contain' ? 'xMidYMid meet' : 'xMidYMid slice'}
              />
            </pattern>
          )}
          {bgType === 'gradient' && (
            <linearGradient
              id={gradId}
              x1={node.gradientDirection === 'to-r' ? '0%' : '0%'}
              y1={node.gradientDirection === 'to-b' ? '0%' : '0%'}
              x2={node.gradientDirection === 'to-r' ? '100%' : node.gradientDirection === 'to-br' ? '100%' : '0%'}
              y2={node.gradientDirection === 'to-b' ? '100%' : node.gradientDirection === 'to-br' ? '100%' : '100%'}
            >
              <stop offset="0%" stopColor={node.gradientColor1 || node.color || bgColor || '#3b82f6'} />
              <stop offset="100%" stopColor={node.gradientColor2 || '#8b5cf6'} />
            </linearGradient>
          )}
          {bgType === 'pattern' && (
            <pattern
              id={patternId}
              width={node.nodePatternSize || 16}
              height={node.nodePatternSize || 16}
              patternUnits="userSpaceOnUse"
            >
              <rect width="100%" height="100%" fill={node.color || bgColor || '#ffffff'} />
              <circle
                cx={(node.nodePatternSize || 16) / 2}
                cy={(node.nodePatternSize || 16) / 2}
                r={2}
                fill={node.nodePatternColor || '#475569'}
                opacity={node.nodePatternOpacity ?? 0.4}
              />
            </pattern>
          )}
        </defs>
        <polygon
          points={points}
          fill={fillAttr}
          stroke={effectiveBorderColor}
          strokeWidth={effectiveBorderWidth}
          strokeDasharray={strokeDash}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  return (
    <div
      id={`node-${node.id}`}
      style={{
        left: `${layout.x}px`,
        top: `${layout.y}px`,
        width: `${layout.width}px`,
        minHeight: `${layout.height}px`,
        ...getShapeStyle(),
      }}
      className={`absolute select-none flex flex-col justify-center px-3 py-1.5 shadow-xs transition-shadow duration-150 group cursor-pointer ${
        isSelected ? 'ring-3 ring-blue-500 ring-offset-2 ring-offset-slate-50 shadow-md z-30' : 'hover:shadow-md z-10'
      } ${isMatch ? 'ring-2 ring-amber-400 bg-amber-50/90' : ''}`}
      onClick={(e) => onSelect(node.id, e)}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick(node.id);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* SVG Shape background for Hexagon, Arrow, Star */}
      {renderSvgPolygonBackground()}

      {/* Top Image if position is top or default */}
      {node.imageUrl && (!node.imagePosition || node.imagePosition === 'top') && (
        <div className="w-full flex justify-center mb-1.5 overflow-hidden rounded-lg relative z-10">
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

      {/* Node Content Container */}
      <div className="flex items-center gap-1.5 w-full relative z-10">
        {/* Drag handle on hover (non-root) */}
        {!isRoot && isHovered && (
          <div
            title="Arrastrar para mover o reordenar rama"
            className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700 -ml-1.5"
            onMouseDown={(e) => {
              e.stopPropagation();
              onDragStart(node.id, e);
            }}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Node Icons */}
        {node.icons && node.icons.length > 0 && (
          <div className="flex items-center gap-1 shrink-0">
            {node.icons.map((ic, idx) => (
              <span key={idx} className="inline-flex items-center">
                {renderNodeIcon(ic)}
              </span>
            ))}
          </div>
        )}

        {/* Progress indicator */}
        {node.progress !== undefined && (
          <div
            title={`Progreso: ${node.progress}%`}
            className="shrink-0 flex items-center justify-center w-4 h-4 rounded-full border border-slate-300 bg-slate-100 text-[9px] font-bold text-slate-700"
          >
            {node.progress === 100 ? '✓' : `${node.progress}%`}
          </div>
        )}

        {/* Left Attached Content Image */}
        {node.imageUrl && node.imagePosition === 'left' && (
          <div className="shrink-0 flex items-center justify-center overflow-hidden rounded-lg relative z-10 mr-1.5">
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

        {/* Main Text Content (Title & Body) */}
        <div className="flex-1 min-w-0 w-full flex flex-col justify-center overflow-hidden">
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
                textAlign: node.textAlign || (node.shape === 'circle' || node.shape === 'square' || node.shape === 'star' ? 'center' : 'left'),
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
                  fontFamily: node.fontFamily,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  hyphens: 'auto',
                }}
              >
                {node.text || 'Nuevo Nodo'}
              </div>

              {/* Between Image (between title and body) */}
              {node.imageUrl && node.imagePosition === 'between' && (
                <div className="w-full flex justify-center my-1.5 overflow-hidden rounded-lg relative z-10">
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

              {/* Body (Cuerpo del nodo) */}
              {node.body && node.body.trim().length > 0 && (
                <div
                  className="mt-1 pt-0.5 leading-relaxed break-words whitespace-pre-wrap select-text border-t border-black/5 dark:border-white/5 w-full"
                  style={{
                    color: node.bodyColor || (isRoot ? 'rgba(255,255,255,0.88)' : '#475569'),
                    fontSize: `${node.bodyFontSize || (isRoot ? 13 : 12)}px`,
                    fontWeight: node.bodyBold ? 700 : 400,
                    fontStyle: node.bodyItalic ? 'italic' : 'normal',
                    textAlign: node.bodyAlign || (node.shape === 'circle' || node.shape === 'square' || node.shape === 'star' ? 'center' : 'left'),
                    fontFamily: node.bodyFontFamily,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto',
                  }}
                >
                  {node.body}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Attached Content Image */}
        {node.imageUrl && node.imagePosition === 'right' && (
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

        {/* Note indicator */}
        {node.note && (
          <button
            title={`Nota: ${node.note}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenNote(node.id);
            }}
            className="shrink-0 p-0.5 text-amber-500 hover:text-amber-600 dark:text-amber-400 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Link indicator */}
        {node.link && (
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
      </div>

      {/* Bottom Image if position is bottom */}
      {node.imageUrl && node.imagePosition === 'bottom' && (
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
      {node.link && node.link.trim().length > 0 && (
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

      {/* Tags in the bottom area of the node */}
      {node.tags && node.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 mt-1 pt-1 border-t border-black/10 dark:border-white/10 w-full shrink-0 relative z-10">
          {node.tags.map((tg, idx) => (
            <span
              key={idx}
              className="text-[10px] leading-tight px-1.5 py-0.5 rounded-md bg-slate-200/80 text-slate-700 font-medium tracking-tight"
            >
              #{tg}
            </span>
          ))}
        </div>
      )}

      {/* Folding / Unfolding Toggle Badge */}
      {hasChildren && (
        <button
          title={
            node.folded
              ? `Desplegar ${node.children.length} sub-nodos (Espacio)`
              : 'Plegar rama (Espacio)'
          }
          onClick={(e) => onToggleFold(node.id, e)}
          style={{
            borderColor: node.folded ? '#f59e0b' : branchColor || '#94a3b8',
          }}
          className={`absolute flex items-center justify-center rounded-full transition-all z-20 shadow-xs cursor-pointer ${
            node.folded
              ? 'min-w-5 h-5 px-1 bg-amber-50 text-amber-800 border-2 border-amber-500 font-bold hover:bg-amber-100 hover:scale-105'
              : 'w-4.5 h-4.5 bg-white text-slate-600 border border-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600'
          } ${
            layout.side === 'left'
              ? '-left-2.5 top-1/2 -translate-y-1/2'
              : '-right-2.5 top-1/2 -translate-y-1/2'
          }`}
        >
          {node.folded ? (
            <span className="flex items-center gap-0.5 text-[10px] leading-none">
              {layout.side === 'left' ? (
                <ChevronLeft className="w-3 h-3 stroke-[2.5]" />
              ) : (
                <ChevronRight className="w-3 h-3 stroke-[2.5]" />
              )}
              <span className="text-[9px] font-bold font-mono">{node.children.length}</span>
            </span>
          ) : (
            <Minus className="w-2.5 h-2.5 stroke-[2.5]" />
          )}
        </button>
      )}

      {/* Quick Add Child Button on Hover (Placed Higher Up to avoid collision) */}
      {isHovered && !isEditing && (
        <button
          title="Agregar nodo hijo (Tab)"
          onClick={(e) => {
            e.stopPropagation();
            onAddChild(node.id);
          }}
          className={`absolute flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all z-20 cursor-pointer ${
            layout.side === 'left' ? '-left-3 -top-2.5' : '-right-3 -top-2.5'
          }`}
        >
          <Plus className="w-3 h-3 stroke-[2.5]" />
        </button>
      )}

      {/* Floating Note Hover Tooltip Preview Card */}
      {node.note && node.note.trim().length > 0 && isHovered && !isEditing && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onOpenNote(node.id);
          }}
          className={`absolute left-1/2 -translate-x-1/2 w-64 sm:w-72 max-h-60 overflow-y-auto bg-slate-900/95 text-slate-100 dark:bg-slate-800/98 dark:text-slate-100 p-3 rounded-xl shadow-2xl border border-slate-700/80 backdrop-blur-md text-left z-50 animate-in fade-in zoom-in-95 duration-150 cursor-pointer pointer-events-auto select-text group/tooltip ${
            layout.side === 'top' ? 'top-full mt-2.5' : 'bottom-full mb-2.5'
          }`}
        >
          {/* Tooltip Header */}
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-700/60 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-amber-400">
              <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Nota del Nodo</span>
            </span>
            <span className="text-[10px] text-slate-400 group-hover/tooltip:text-amber-300 transition-colors">
              Clic para editar
            </span>
          </div>

          {/* Tooltip Body */}
          <div className="text-xs leading-relaxed text-slate-200 whitespace-pre-wrap break-words font-normal">
            {node.note}
          </div>

          {/* Arrow pointing towards node */}
          {layout.side === 'top' ? (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-px w-0 h-0 border-x-6 border-x-transparent border-b-6 border-b-slate-900/95 dark:border-b-slate-800/98" />
          ) : (
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-slate-900/95 dark:border-t-slate-800/98" />
          )}
        </div>
      )}
    </div>
  );
};
