import React from 'react';

export interface MainEditorLayoutProps {
  menuBar?: React.ReactNode;
  toolBar?: React.ReactNode;
  filterBar?: React.ReactNode;
  canvas: React.ReactNode;
  toolPanel?: React.ReactNode;
  outlineView?: React.ReactNode;
  statusBar?: React.ReactNode;
  modals?: React.ReactNode;
  presentationOverlay?: React.ReactNode;
  isPresentationMode?: boolean;
  isOutlineOpen?: boolean;
  isOutlineFullscreen?: boolean;
  isToolPanelOpen?: boolean;
  isFilterBarOpen?: boolean;
}

export const MainEditorLayout: React.FC<MainEditorLayoutProps> = ({
  menuBar,
  toolBar,
  filterBar,
  canvas,
  toolPanel,
  outlineView,
  statusBar,
  modals,
  presentationOverlay,
  isPresentationMode = false,
  isOutlineOpen = false,
  isOutlineFullscreen = false,
  isToolPanelOpen = false,
  isFilterBarOpen = false,
}) => {
  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 overflow-hidden font-sans text-slate-900 select-none">
      {/* 1. Menu Bar (Top Navigation) */}
      {!isPresentationMode && menuBar}

      {/* 2. Main ToolBar */}
      {!isPresentationMode && toolBar}

      {/* 3. Filter Bar (Collapsible) */}
      {!isPresentationMode && isFilterBarOpen && filterBar}

      {/* 4. Central Work Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Outline View Drawer */}
        {isOutlineOpen && !isPresentationMode && outlineView}

        {/* Center Canvas Area */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          {canvas}
        </div>

        {/* Right Properties Panel */}
        {isToolPanelOpen && !isOutlineFullscreen && !isPresentationMode && toolPanel}
      </div>

      {/* 5. Status Bar */}
      {!isPresentationMode && statusBar}

      {/* 6. Presentation Fullscreen Overlay */}
      {isPresentationMode && presentationOverlay}

      {/* 7. Dialogs and Modals Layer */}
      {modals}
    </div>
  );
};
