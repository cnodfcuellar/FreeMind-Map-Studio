import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { MindNode, CalculatedNodeLayout, MindMapTheme } from '../types/mindmap';
import {
  getNodeShapeStyles,
  isDarkNodeBackground,
  computeNodeShadowStyle,
  NodeSvgPolygonBackground,
  NodeBubbleTail,
} from './molecules/node/NodeBackgroundRenderer';
import { NodeHeaderRow } from './molecules/node/NodeHeaderRow';
import { NodeBadgesBar } from './molecules/node/NodeBadgesBar';
import { NodeActionButtons } from './molecules/node/NodeActionButtons';

export interface NodeComponentProps {
  node: MindNode;
  layout: CalculatedNodeLayout;
  isSelected: boolean;
  isEditing: boolean;
  theme: MindMapTheme;
  branchColor: string;
  isMatch?: boolean;
  isPresentationMode?: boolean;
  isStaged?: boolean;
  globalVisibility?: {

    hideAllBodies?: boolean;
    hideAllImages?: boolean;
    hideAllTags?: boolean;
    hideAllIcons?: boolean;
    hideAllLinks?: boolean;
    showAllNotesInline?: boolean;
  };
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
  isPresentationMode,
  isStaged = false,
  globalVisibility,
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
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>(node.text);

  // Resync editText when entering edit mode: node.text may have changed since mount
  // (outline edits, undo/redo, templates, paste) and nodes are keyed by id (no remount).
  useEffect(() => {
    if (isEditing) {
      setEditText(node.text);
    }
  }, [isEditing]); // eslint-disable-line react-hooks/exhaustive-deps

  const isRoot = !node.parentId;
  const shape = node.shape || (isRoot ? 'rounded' : 'rounded');
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const isSvgShape = shape === 'hexagon' || shape === 'arrow' || shape === 'star';

  // Effective Visibility (combines node-level and map-level global toggles)
  const isBodyHidden = Boolean(node.hideBody || globalVisibility?.hideAllBodies);
  const isImageHidden = Boolean(node.hideImage || globalVisibility?.hideAllImages);
  const isTagsHidden = Boolean(node.hideTags || globalVisibility?.hideAllTags);
  const isIconsHidden = Boolean(node.hideIcons || globalVisibility?.hideAllIcons);
  const isLinkHidden = Boolean(node.hideLink || globalVisibility?.hideAllLinks);
  const isProgressHidden = Boolean(node.hideProgress);

  // Colors & luminance
  const textColor = isRoot
    ? (node.textColor || theme.rootText)
    : (node.textColor || theme.nodeText);
  const effectiveFontFamily = node.fontFamily || theme.fontFamily;
  const isDarkBg = isDarkNodeBackground(node.color, isRoot);

  const shapeStyles = getNodeShapeStyles(node, theme, branchColor, isRoot);
  const nodeShadowStyle = computeNodeShadowStyle(node, isSvgShape);

  // If node has custom shadow and shape is fork, apply drop-shadow to the fork underline
  const effectiveForkFilter =
    isSelected && shape === 'fork'
      ? 'drop-shadow(0 2px 4px rgba(59,130,246,0.8))'
      : shape === 'fork' && node.nodeShadow
      ? (nodeShadowStyle.filter || `drop-shadow(0 2px 4px ${node.nodeShadowColor || 'rgba(0,0,0,0.2)'})`)
      : undefined;

  return (
    <div
      id={`node-${node.id}`}
      style={{
        left: `${layout.x}px`,
        top: `${layout.y}px`,
        width: `${layout.width}px`,
        minHeight: `${layout.height}px`,
        ...shapeStyles,
        ...nodeShadowStyle,
        ...(effectiveForkFilter ? { filter: effectiveForkFilter } : {}),
      }}
      className={`absolute select-none flex flex-col justify-center transition-all duration-150 group cursor-pointer ${
        isSvgShape || shape === 'fork' ? 'px-0 py-0 shadow-none' : node.nodeShadow ? 'px-2 py-1' : 'px-2 py-1 shadow-xs'
      } ${
        isStaged
          ? 'ring-4 ring-blue-500 ring-offset-4 ring-offset-slate-950 shadow-[0_0_35px_rgba(59,130,246,0.9)] scale-[1.03] z-50 animate-pulse'
          : isSelected
          ? isSvgShape || shape === 'fork'
            ? 'z-30'
            : node.nodeShadow
            ? 'ring-3 ring-blue-500 ring-offset-2 ring-offset-slate-50 z-30'
            : 'ring-3 ring-blue-500 ring-offset-2 ring-offset-slate-50 shadow-md z-30'
          : isSvgShape || shape === 'fork'
          ? 'z-10'
          : node.nodeShadow
          ? 'z-10'
          : 'hover:shadow-md z-10'
      } ${isMatch ? (isSvgShape ? 'brightness-125' : 'ring-2 ring-amber-400 bg-amber-50/90') : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id, e);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick(node.id);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Visual Staged Checkmark Badge (Presentation Editor Frame Picking) */}
      {isStaged && (
        <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center font-bold text-xs border-2 border-white animate-bounce z-50">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      )}

      {/* 1. SVG Polygon Background (Hexagon, Arrow, Star) */}
      <NodeSvgPolygonBackground
        node={node}
        layout={layout}
        theme={theme}
        branchColor={branchColor}
        isRoot={isRoot}
        isSelected={isSelected}
      />

      {/* 2. Visible Speech Bubble Pointy Tail */}
      <NodeBubbleTail
        node={node}
        layout={layout}
        theme={theme}
        branchColor={branchColor}
        isRoot={isRoot}
      />

      {/* 3. Header Row (Top Image, Top Icons, Drag Handle, Title & Body) */}
      <NodeHeaderRow
        node={node}
        theme={theme}
        isRoot={isRoot}
        isHovered={isHovered}
        isEditing={isEditing}
        editText={editText}
        setEditText={setEditText}
        onTextChange={onTextChange}
        onFinishEditing={onFinishEditing}
        onDragStart={onDragStart}
        isImageHidden={isImageHidden}
        isIconsHidden={isIconsHidden}
        isProgressHidden={isProgressHidden}
        isBodyHidden={isBodyHidden}
        textColor={textColor}
        effectiveFontFamily={effectiveFontFamily}
        contentMaxWidth={shape === 'hexagon' ? '68%' : undefined}
        mediaMaxWidth={shape === 'hexagon' ? '96px' : undefined}
      />

      {/* 4. Badges Bar (Right Image, Bottom Image, Note icon/inline, Prominent Link, Tags, Tooltip) */}
      <NodeBadgesBar
        node={node}
        isHovered={isHovered}
        isEditing={isEditing}
        isPresentationMode={isPresentationMode}
        isImageHidden={isImageHidden}
        isLinkHidden={isLinkHidden}
        isTagsHidden={isTagsHidden}
        isDarkNodeBackground={isDarkBg}
        side={layout.side}
        onOpenNote={onOpenNote}
        globalVisibility={globalVisibility}
        contentMaxWidth={shape === 'hexagon' ? '68%' : undefined}
        mediaMaxWidth={shape === 'hexagon' ? '96px' : undefined}
      />

      {/* 5. Action Buttons (Fold/Unfold branch badge & Quick Add child button) */}
      <NodeActionButtons
        node={node}
        side={layout.side}
        hasChildren={hasChildren}
        branchColor={branchColor}
        isHovered={isHovered}
        isEditing={isEditing}
        onToggleFold={onToggleFold}
        onAddChild={onAddChild}
      />
    </div>
  );
};
