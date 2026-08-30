import { MindMap } from '../types/mindmap';
import { THEMES } from './themes';

function escapeXML(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generates an ultra-high fidelity, 100% self-contained standalone HTML file
 * featuring full support for all 8 layout engine distributions, node shapes,
 * rich text & body formatting, images, icons, prominent links, tags, progress bars,
 * notes drawer, clouds, cross-connectors, and interactive pan/zoom/search.
 */
export function exportToStandaloneHTML(mindMap: MindMap): string {
  const jsonMap = JSON.stringify(mindMap).replace(/<\/script>/gi, '<\\/script>');
  const title = escapeXML(mindMap.title || 'Mapa Mental');
  const theme = THEMES[mindMap.themeId] || THEMES.default;
  const layout = mindMap.layout || 'standard';

  // Build the complete HTML as an array of strings to avoid template literal escaping issues
  const parts: string[] = [];

  // ── HEAD ──
  parts.push(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes">
  <title>${title} - FreeMind Studio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-color: ${theme.background || '#f8fafc'};
      --font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      font-family: var(--font-family);
      background-color: var(--bg-color);
      color: #1e293b;
      user-select: none;
      -webkit-user-select: none;
    }
    
    /* Top Navigation Bar */
    header {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 56px;
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(226, 232, 240, 0.8);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
      z-index: 100;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .app-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 800;
      font-size: 15px;
      color: #2563eb;
      text-decoration: none;
    }
    .map-title {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      max-width: 320px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .badge {
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 9999px;
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
      text-transform: capitalize;
    }
    
    /* Header Controls */
    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .search-box {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-input {
      padding: 6px 12px 6px 30px;
      font-size: 12px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      background: #f8fafc;
      width: 180px;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .search-input:focus {
      outline: none;
      border-color: #3b82f6;
      background: #ffffff;
      width: 240px;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }
    .search-icon {
      position: absolute;
      left: 9px;
      width: 14px;
      height: 14px;
      color: #94a3b8;
      pointer-events: none;
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #334155;
      transition: all 0.15s ease;
    }
    .btn:hover {
      background: #f1f5f9;
      border-color: #94a3b8;
      color: #0f172a;
    }
    .btn-primary {
      background: #2563eb;
      border-color: #1d4ed8;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #1d4ed8;
      color: #ffffff;
    }
    .btn-icon {
      padding: 6px 8px;
    }
    
    /* Floating Controls */
    .floating-toolbar {
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(226, 232, 240, 0.9);
      border-radius: 14px;
      padding: 6px 10px;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      z-index: 90;
    }
    .zoom-level {
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      min-width: 44px;
      text-align: center;
    }
    .divider {
      width: 1px;
      height: 20px;
      background: #e2e8f0;
      margin: 0 4px;
    }
    
    /* Canvas Container */
    #canvas-container {
      width: 100vw;
      height: 100vh;
      position: relative;
      overflow: hidden;
      cursor: grab;
    }
    #canvas-container:active {
      cursor: grabbing;
    }
    #viewport {
      position: absolute;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
      transform-origin: 0 0;
      will-change: transform;
    }
    
    /* Layers */
    svg#clouds-layer, svg#edges-layer, svg#connectors-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: visible;
    }
    #nodes-layer {
      position: absolute;
      top: 0;
      left: 0;
    }
    
    /* Node Component */
    .node-element {
      position: absolute;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      box-sizing: border-box;
      transition: transform 0.12s ease, box-shadow 0.15s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      touch-action: none;
    }
    .node-element:hover {
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
      transform: translateY(-1px);
    }
    .node-element.search-match {
      outline: 3px solid #f59e0b !important;
      box-shadow: 0 0 16px rgba(245, 158, 11, 0.6) !important;
      animation: pulseMatch 1.5s infinite alternate;
    }
    @keyframes pulseMatch {
      from { outline-color: #f59e0b; }
      to { outline-color: #ef4444; }
    }
    
    /* Node Shapes */
    .shape-bubble { border-radius: 12px; }
    .shape-pill { border-radius: 9999px; }
    .shape-rectangle, .shape-box { border-radius: 6px; }
    .shape-square { border-radius: 8px; }
    .shape-circle, .shape-oval { border-radius: 50%; }
    .shape-underline {
      border-radius: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      border-top: none !important;
      border-left: none !important;
      border-right: none !important;
      border-bottom-width: 2.5px !important;
    }
    .shape-fork {
      border-radius: 0 !important;
      box-shadow: none !important;
      background: transparent !important;
      border-top: none !important;
      border-left: none !important;
      border-right: none !important;
      border-bottom-width: 2px !important;
    }
    .shape-hexagon {
      clip-path: polygon(12% 0%, 88% 0%, 100% 50%, 88% 100%, 12% 100%, 0% 50%);
    }
    .shape-diamond {
      clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    }
    
    /* Node Inner Structure */
    .node-content-wrap {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      justify-content: center;
      padding: 6px 12px;
    }
    .node-header-row {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .node-icons {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }
    .node-icon-item {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .node-title-text {
      flex: 1;
      white-space: pre-wrap;
      word-break: break-word;
      line-height: 1.35;
    }
    .node-body-text {
      margin-top: 4px;
      white-space: pre-wrap;
      word-break: break-word;
      line-height: 1.4;
      opacity: 0.9;
    }
    
    /* Node Images */
    .node-image-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-radius: 6px;
      margin: 4px 0;
    }
    .node-image {
      max-width: 100%;
      height: auto;
      object-fit: cover;
      display: block;
      border-radius: 6px;
    }
    
    /* Prominent Dedicated Link Badge */
    .node-link-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin-top: 5px;
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(37, 99, 235, 0.12);
      color: #1d4ed8;
      border: 1px solid rgba(37, 99, 235, 0.28);
      font-size: 11px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.15s ease;
      width: fit-content;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: pointer;
      position: relative;
      z-index: 10;
    }
    .node-link-badge:hover {
      background: #2563eb;
      color: #ffffff;
      border-color: #1d4ed8;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.35);
      transform: translateY(-1px);
    }
    .node-link-badge svg {
      flex-shrink: 0;
    }
    .inline-link {
      color: #2563eb;
      text-decoration: underline;
      text-underline-offset: 2px;
      font-weight: 600;
      cursor: pointer;
    }
    .inline-link:hover {
      color: #1d4ed8;
    }
    
    /* Progress Bar */
    .node-progress-wrap {
      margin-top: 5px;
      width: 100%;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .progress-bar-bg {
      flex: 1;
      height: 6px;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 999px;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      background: #10b981;
      border-radius: 999px;
    }
    .progress-bar-text {
      font-size: 10px;
      font-weight: 700;
      opacity: 0.8;
      min-width: 28px;
    }
    
    /* Tags Bar */
    .node-tags-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 6px;
      padding-top: 4px;
      border-top: 1px solid rgba(0,0,0,0.06);
    }
    .tag-badge {
      font-size: 10px;
      font-weight: 600;
      padding: 1px 6px;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.06);
      color: inherit;
      display: inline-flex;
      align-items: center;
    }
    
    /* Note Action Badge */
    .node-note-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 2px 4px;
      border-radius: 4px;
      background: rgba(0,0,0,0.08);
      font-size: 11px;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
      transition: background 0.15s;
    }
    .node-note-btn:hover {
      background: rgba(0,0,0,0.18);
    }
    
    /* Floating Note Hover Tooltip */
    .node-note-tooltip {
      position: absolute;
      bottom: calc(100% + 10px);
      left: 50%;
      transform: translateX(-50%);
      width: max-content;
      min-width: 200px;
      max-width: min(420px, 90vw);
      background: rgba(15, 23, 42, 0.96);
      color: #f8fafc;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 11.5px;
      line-height: 1.5;
      box-shadow: 0 12px 30px rgba(0,0,0,0.35);
      border: 1px solid rgba(71, 85, 105, 0.8);
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s ease;
      z-index: 120;
      white-space: normal;
      word-break: break-word;
      text-align: left;
      user-select: none;
      -webkit-user-select: none;
    }
    .node-note-tooltip.pos-bottom {
      bottom: auto;
      top: calc(100% + 10px);
    }
    .node-note-tooltip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border-width: 6px;
      border-style: solid;
      border-color: rgba(15, 23, 42, 0.96) transparent transparent transparent;
    }
    .node-note-tooltip.pos-bottom::after {
      top: auto;
      bottom: 100%;
      border-color: transparent transparent rgba(15, 23, 42, 0.96) transparent;
    }
    .node-element:hover .node-note-tooltip {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(0);
    }
    .tooltip-note-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 5px;
      margin-bottom: 6px;
      border-bottom: 1px solid rgba(255,255,255,0.12);
      font-size: 10.5px;
      font-weight: 700;
      color: #fbbf24;
    }

    
    /* Fold / Unfold Button */
    .fold-btn {
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #ffffff;
      border: 1.5px solid #64748b;
      box-shadow: 0 2px 5px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 800;
      color: #334155;
      cursor: pointer;
      z-index: 10;
      transition: all 0.15s ease;
    }
    .fold-btn:hover {
      background: #2563eb;
      color: #ffffff;
      border-color: #1d4ed8;
      transform: scale(1.15);
    }
    
    /* Note Side Drawer */
    .note-drawer {
      position: fixed;
      right: 0;
      top: 56px;
      bottom: 0;
      width: 360px;
      background: #ffffff;
      border-left: 1px solid #e2e8f0;
      padding: 24px;
      box-shadow: -10px 0 30px rgba(0,0,0,0.08);
      transform: translateX(100%);
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 150;
      display: flex;
      flex-direction: column;
    }
    .note-drawer.open {
      transform: translateX(0);
    }
    .drawer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 16px;
    }
    .drawer-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
    }
    .drawer-close {
      cursor: pointer;
      font-size: 20px;
      font-weight: 700;
      color: #94a3b8;
      border: none;
      background: transparent;
      padding: 4px 8px;
      border-radius: 6px;
    }
    .drawer-close:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
    .drawer-body {
      flex: 1;
      overflow-y: auto;
      font-size: 13.5px;
      line-height: 1.65;
      color: #334155;
      white-space: pre-wrap;
    }

    /* Print Styles */
    @media print {
      header, .floating-toolbar, .note-drawer { display: none !important; }
      body, html, #canvas-container { overflow: visible !important; width: auto !important; height: auto !important; }
      #viewport { transform: scale(1) !important; position: static !important; }
    }
  </style>
</head>
<body>

  <!-- Top Header Navigation -->
  <header>
    <div class="header-left">
      <a href="#" class="app-brand" onclick="resetView(); return false;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 3v6"></path><path d="M12 15v6"></path>
          <path d="M3 12h6"></path><path d="M15 12h6"></path>
        </svg>
        <span>FreeMind</span>
      </a>
      <h1 class="map-title" title="${title}">${title}</h1>
      <span class="badge">${layout}</span>
    </div>

    <div class="header-right">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" id="search-input" class="search-input" placeholder="Buscar nodo..." oninput="handleSearch(this.value)">
      </div>
      <button class="btn" onclick="toggleFoldAll()" id="btn-fold-toggle">Plegar Todo</button>
      <button class="btn" onclick="window.print()">Imprimir / PDF</button>
      <button class="btn btn-primary" onclick="exportCanvasPng()">Exportar PNG</button>
    </div>
  </header>

  <!-- Canvas Viewport -->
  <div id="canvas-container">
    <div id="viewport">
      <!-- Background SVG Clouds Layer -->
      <svg id="clouds-layer"></svg>
      <!-- Edges and Branches Layer -->
      <svg id="edges-layer"></svg>
      <!-- Cross Connectors Layer -->
      <svg id="connectors-layer"></svg>
      <!-- Node HTML DOM Layer -->
      <div id="nodes-layer"></div>
    </div>
  </div>

  <!-- Floating Bottom Controls -->
  <div class="floating-toolbar">
    <button class="btn btn-icon" onclick="zoomBy(0.85)" title="Reducir Zoom">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
    </button>
    <span class="zoom-level" id="zoom-text">100%</span>
    <button class="btn btn-icon" onclick="zoomBy(1.18)" title="Aumentar Zoom">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
    </button>
    <div class="divider"></div>
    <button class="btn" onclick="resetView()">Centrar</button>
    <button class="btn" onclick="fitToScreen()">Ajustar Vista</button>
  </div>

  <!-- Side Note Drawer -->
  <div id="note-drawer" class="note-drawer">
    <div class="drawer-header">
      <h3 class="drawer-title" id="note-title">Nota del Nodo</h3>
      <button class="drawer-close" onclick="closeNoteDrawer()">&times;</button>
    </div>
    <div class="drawer-body" id="note-body"></div>
  </div>

  <script>`);

  // ── JAVASCRIPT SECTION ──
  // Using string concatenation instead of template literals inside <script> to avoid
  // double-escaping issues with backticks inside a TS template literal.
  parts.push(`
    var mapData = ${jsonMap};
    var zoom = 1;
    var panX = window.innerWidth / 2;
    var panY = window.innerHeight / 2;
    var isDragging = false;
    var startX = 0;
    var startY = 0;
    var searchQuery = '';
    var isAllFolded = false;

    var viewport = document.getElementById('viewport');
    var container = document.getElementById('canvas-container');
    var cloudsSvg = document.getElementById('clouds-layer');
    var edgesSvg = document.getElementById('edges-layer');
    var connectorsSvg = document.getElementById('connectors-layer');
    var nodesLayer = document.getElementById('nodes-layer');
    var zoomText = document.getElementById('zoom-text');
`);

  // Icon Generator
  parts.push(`
    function getSvgIcon(iconName) {
      var icons = {
        'check': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
        'star': '<svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        'flag': '<svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',
        'lightbulb': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5z"/></svg>',
        'rocket': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>',
        'target': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
        'trophy': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34"/><path d="M18 4H6v7a6 6 0 0 0 12 0V4z"/></svg>',
        'sparkles': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>',
        'book': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 2v20"/></svg>',
        'code': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
        'flame': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
        'zap': '<svg width="14" height="14" viewBox="0 0 24 24" fill="#eab308" stroke="#eab308" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        'shield': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
        'database': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
        'user': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
      };
      return icons[iconName] || '<span style="font-size:12px;">\\ud83c\\udff7\\ufe0f</span>';
    }
`);

  // Text formatters
  parts.push(`
    function formatTextWithLinks(rawText) {
      if (!rawText) return '';
      var escaped = String(rawText)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Markdown links: [Label](url)
      escaped = escaped.replace(/\\[([^\\]]+)\\]\\((https?:\\/\\/[^\\s\\)]+)\\)/g, function(match, label, url) {
        return '<a href="' + url + '" target="_blank" rel="noopener noreferrer" class="inline-link" onclick="event.stopPropagation()">' + label + ' <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>';
      });

      // Raw URLs
      escaped = escaped.replace(/(^|[\\s(])(https?:\\/\\/[^\\s\\)<]+)/g, function(match, prefix, url) {
        return prefix + '<a href="' + url + '" target="_blank" rel="noopener noreferrer" class="inline-link" onclick="event.stopPropagation()">' + url + ' <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>';
      });

      return escaped;
    }
`);

  // Markdown renderer
  parts.push(`
    function renderMarkdown(markdown) {
      if (!markdown) return '';
      var html = String(markdown)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      html = html.replace(/\`\`\`([\\s\\S]*?)\`\`\`/g, function(m, code) {
        return '<pre style="background:#020617; color:#38bdf8; padding:8px 10px; border-radius:8px; font-family:monospace; font-size:11px; overflow-x:auto; margin:6px 0; border:1px solid #1e293b;"><code>' + code.trim() + '</code></pre>';
      });

      html = html.replace(/^# (.+)$/gm, '<h1 style="font-size:13.5px; font-weight:bold; color:#60a5fa; margin:6px 0 3px; border-bottom:1px solid rgba(255,255,255,0.15); padding-bottom:2px;">$1</h1>');
      html = html.replace(/^## (.+)$/gm, '<h2 style="font-size:12.5px; font-weight:bold; color:#fcd34d; margin:5px 0 2px;">$1</h2>');
      html = html.replace(/^### (.+)$/gm, '<h3 style="font-size:11.5px; font-weight:bold; color:#34d399; margin:4px 0 2px;">$1</h3>');

      html = html.replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid #f59e0b; padding-left:8px; margin:4px 0; color:#cbd5e1; font-style:italic; background:rgba(245,158,11,0.08); border-radius:0 4px 4px 0;">$1</blockquote>');

      html = html.replace(/^- \\[x\\] (.+)$/gim, '<div style="display:flex; align-items:center; gap:6px; margin:2px 0;"><input type="checkbox" checked disabled><span style="text-decoration:line-through; opacity:0.6;">$1</span></div>');
      html = html.replace(/^- \\[ \\] (.+)$/gm, '<div style="display:flex; align-items:center; gap:6px; margin:2px 0;"><input type="checkbox" disabled><span>$1</span></div>');

      html = html.replace(/^[\\*\\-] (.+)$/gm, '<li style="margin-left:14px; list-style-type:disc; margin-bottom:2px;">$1</li>');

      html = html.replace(/\\*\\*([^*]+)\\*\\*/g, '<strong style="color:#ffffff; font-weight:bold;">$1</strong>');
      html = html.replace(/\\*([^*]+)\\*/g, '<em style="font-style:italic;">$1</em>');
      html = html.replace(/\`([^\`]+)\`/g, '<code style="background:rgba(255,255,255,0.14); color:#fef08a; padding:1px 4px; border-radius:4px; font-family:monospace; font-size:10.5px;">$1</code>');

      html = html.replace(/\\[([^\\]]+)\\]\\((https?:\\/\\/[^\\s\\)]+)\\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; text-decoration:underline; font-weight:600;" onclick="event.stopPropagation()">$1 \\u2197</a>');

      html = html.replace(/\\n/g, '<br/>');

      return html;
    }
`);

  // Node Size Estimation
  parts.push(`
    function estimateNodeSize(node) {
      var isRoot = !node.parentId;
      var fontSize = node.fontSize || (isRoot ? 16 : 14);
      var paddingX = isRoot ? 24 : 14;
      var paddingY = isRoot ? 12 : 8;

      var extraWidth = 0;
      if (node.icons && node.icons.length > 0) extraWidth += node.icons.length * 20 + 6;
      if (node.progress !== undefined) extraWidth += 24;
      if (node.note) extraWidth += 18;

      var linkExtraHeight = 0;
      var linkMinWidth = 0;
      if (node.link && node.link.trim().length > 0) {
        linkExtraHeight += 24;
        var cleanUrl = node.link.replace(/^https?:\\/\\//, '').replace(/^www\\./, '');
        linkMinWidth = Math.min(cleanUrl.length * 6.5 + 28, 220);
      }

      var imageExtraHeight = 0;
      var imageMinWidth = 0;
      if (node.imageUrl) {
        if (node.imagePosition === 'left' || node.imagePosition === 'right') {
          var imgW1 = node.imageWidth || 80;
          extraWidth += imgW1 + 10;
          imageExtraHeight = Math.max(0, (node.imageHeight || imgW1 * 0.75) - 28);
        } else {
          var imgW2 = node.imageWidth || 120;
          var imgH2 = node.imageHeight || Math.round(imgW2 * 0.65);
          imageExtraHeight = imgH2 + 10;
          imageMinWidth = imgW2 + 16;
        }
      }

      var extraHeight = 0;
      var tagMinWidth = 0;
      if (node.tags && node.tags.length > 0) {
        extraHeight += 22;
        tagMinWidth = Math.min(node.tags.reduce(function(acc, t) { return acc + t.length * 7 + 16; }, 0), 280);
      }

      var charWidth = fontSize * 0.58;
      var lines = (node.text || ' ').split('\\n');
      var maxLineLength = Math.max.apply(null, lines.map(function(l) { return l.length; }).concat([1]));
      var titleWidth = Math.min(Math.max(maxLineLength * charWidth, 40), 400);
      var titleHeight = lines.length * (fontSize * 1.35);

      var bodyWidth = 0;
      var bodyHeight = 0;
      if (node.body && node.body.trim().length > 0) {
        var bodyFontSize = node.bodyFontSize || (isRoot ? 13 : 12);
        var bodyLines = node.body.split('\\n');
        var bodyCharWidth = bodyFontSize * 0.56;
        var maxBodyLineLength = Math.max.apply(null, bodyLines.map(function(l) { return l.length; }).concat([1]));
        bodyWidth = Math.min(Math.max(maxBodyLineLength * bodyCharWidth, 40), 420);
        bodyHeight = bodyLines.length * (bodyFontSize * 1.4) + 6;
      }

      var contentWidth = Math.max(titleWidth, bodyWidth);
      var contentHeight = titleHeight + bodyHeight;

      var width = Math.round(Math.max(contentWidth + paddingX * 2 + extraWidth, tagMinWidth + paddingX * 2, linkMinWidth + paddingX * 2, imageMinWidth + paddingX * 2));
      var height = Math.round(Math.max(contentHeight + paddingY * 2 + extraHeight + linkExtraHeight + imageExtraHeight, (isRoot ? 48 : 34) + extraHeight + linkExtraHeight + imageExtraHeight));

      if (node.customWidth && node.customWidth > 0) width = Math.max(width, node.customWidth);
      if (node.customHeight && node.customHeight > 0) height = Math.max(height, node.customHeight);

      if (node.shape === 'hexagon' || node.shape === 'diamond') {
        width = Math.round(width * 1.25 + 24);
        height = Math.round(height * 1.1 + 12);
      } else if (node.shape === 'circle' || node.shape === 'square') {
        var dim = Math.max(width, height, 54);
        width = dim;
        height = dim;
      }

      return { width: width, height: height };
    }
`);

  // Subtree metrics (horizontal)
  parts.push(`
    function calculateSubTreeMetrics(nodeId, nodes, verticalGap) {
      var node = nodes[nodeId];
      if (!node) return { id: nodeId, width: 60, height: 30, subtreeHeight: 30, childrenLayouts: [] };

      var sz = estimateNodeSize(node);
      var hasCloud = Boolean(node.cloud && node.cloud.enabled);
      var cloudPad = hasCloud ? 36 : 0;

      if (node.folded || !node.children || node.children.length === 0) {
        return { id: nodeId, width: sz.width + cloudPad, height: sz.height + cloudPad, subtreeHeight: sz.height + cloudPad, childrenLayouts: [] };
      }

      var childrenLayouts = node.children.filter(function(cid) { return Boolean(nodes[cid]); }).map(function(cid) { return calculateSubTreeMetrics(cid, nodes, verticalGap); });
      var totalChildrenHeight = 0;
      for (var i = 0; i < childrenLayouts.length; i++) {
        totalChildrenHeight += childrenLayouts[i].subtreeHeight;
        if (i < childrenLayouts.length - 1) totalChildrenHeight += verticalGap;
      }

      var subtreeHeight = Math.max(sz.height + cloudPad, totalChildrenHeight + cloudPad);
      return { id: nodeId, width: sz.width + cloudPad, height: sz.height + cloudPad, subtreeHeight: subtreeHeight, childrenLayouts: childrenLayouts };
    }
`);

  // Subtree metrics (vertical)
  parts.push(`
    function calculateSubTreeVerticalMetrics(nodeId, nodes, horizontalGap) {
      var node = nodes[nodeId];
      if (!node) return { id: nodeId, width: 60, height: 30, subtreeWidth: 60, childrenLayouts: [] };

      var sz = estimateNodeSize(node);
      var hasCloud = Boolean(node.cloud && node.cloud.enabled);
      var cloudPad = hasCloud ? 36 : 0;

      if (node.folded || !node.children || node.children.length === 0) {
        return { id: nodeId, width: sz.width + cloudPad, height: sz.height + cloudPad, subtreeWidth: sz.width + cloudPad, childrenLayouts: [] };
      }

      var childrenLayouts = node.children.filter(function(cid) { return Boolean(nodes[cid]); }).map(function(cid) { return calculateSubTreeVerticalMetrics(cid, nodes, horizontalGap); });
      var totalChildrenWidth = 0;
      for (var i = 0; i < childrenLayouts.length; i++) {
        totalChildrenWidth += childrenLayouts[i].subtreeWidth;
        if (i < childrenLayouts.length - 1) totalChildrenWidth += horizontalGap;
      }

      var subtreeWidth = Math.max(sz.width + cloudPad, totalChildrenWidth + cloudPad);
      return { id: nodeId, width: sz.width + cloudPad, height: sz.height + cloudPad, subtreeWidth: subtreeWidth, childrenLayouts: childrenLayouts };
    }
`);

  // Layout Engine
  parts.push(`
    function computeMindMapLayout() {
      var layoutMap = new Map();
      var root = mapData.nodes[mapData.rootId];
      if (!root) return layoutMap;

      var hGap = mapData.horizontalGap !== undefined ? mapData.horizontalGap : 54;
      var vGap = mapData.verticalGap !== undefined ? mapData.verticalGap : 14;
      var rootHGap = Math.max(48, Math.round(hGap * 1.3));

      var vertSiblingHGap = Math.max(20, Math.round(hGap * 0.9 + 10));
      var vertLevelVGap = Math.max(50, Math.round(vGap * 2.8 + 45));
      var vertRootVGap = Math.max(70, Math.round(vGap * 3.4 + 60));

      var rootSize = estimateNodeSize(root);
      var rootLayout = {
        id: root.id,
        x: -rootSize.width / 2,
        y: -rootSize.height / 2,
        width: rootSize.width,
        height: rootSize.height,
        side: 'root',
        depth: 0,
        branchIndex: 0
      };
      layoutMap.set(root.id, rootLayout);

      if (root.folded || !root.children || root.children.length === 0) {
        return layoutMap;
      }

      var validChildren = root.children.filter(function(id) { return Boolean(mapData.nodes[id]); });
      var layoutType = mapData.layout || 'standard';

      // 1. RADIAL
      if (layoutType === 'radial') {
        var radius = Math.max(180, validChildren.length * 40 + hGap * 1.5);
        var angleStep = (2 * Math.PI) / validChildren.length;
        validChildren.forEach(function(childId, i) {
          var angle = i * angleStep - Math.PI / 2;
          var childSize = estimateNodeSize(mapData.nodes[childId]);
          var cx = Math.cos(angle) * radius - childSize.width / 2;
          var cy = Math.sin(angle) * radius - childSize.height / 2;
          var side = Math.cos(angle) >= 0 ? 'right' : 'left';
          layoutMap.set(childId, { id: childId, x: cx, y: cy, width: childSize.width, height: childSize.height, side: side, depth: 1, branchIndex: i });
          layoutBranchRadial(childId, cx, cy, childSize.width, childSize.height, angle, layoutMap, hGap, vGap);
        });
      }
      // 2. CIRCULAR
      else if (layoutType === 'circular') {
        var count = validChildren.length;
        var baseRadius = Math.max(200, count * 45);
        validChildren.forEach(function(childId, i) {
          var angle = (i / count) * 2 * Math.PI - Math.PI / 2;
          var childSize = estimateNodeSize(mapData.nodes[childId]);
          var cx = Math.cos(angle) * baseRadius - childSize.width / 2;
          var cy = Math.sin(angle) * baseRadius - childSize.height / 2;
          var side = Math.cos(angle) >= 0 ? 'right' : 'left';
          layoutMap.set(childId, { id: childId, x: cx, y: cy, width: childSize.width, height: childSize.height, side: side, depth: 1, branchIndex: i });
          layoutBranchCircular(childId, baseRadius + 140, layoutMap, hGap);
        });
      }
      // 3 & 4. TOP / BOTTOM (Tree Vertical)
      else if (layoutType === 'bottom' || layoutType === 'tree-down' || layoutType === 'top') {
        var dir = (layoutType === 'top') ? 'top' : 'bottom';
        layoutVerticalBranch(validChildren, dir, rootLayout, mapData.nodes, layoutMap, vertRootVGap, vertSiblingHGap, vertLevelVGap);
      }
      // 5. BALANCED HORIZONTAL
      else if (layoutType === 'balanced-horizontal') {
        var topChildren = [];
        var bottomChildren = [];
        validChildren.forEach(function(cid, i) {
          var node = mapData.nodes[cid];
          if (node.side === 'top') topChildren.push(cid);
          else if (node.side === 'bottom') bottomChildren.push(cid);
          else if (i % 2 === 0) bottomChildren.push(cid);
          else topChildren.push(cid);
        });
        layoutVerticalBranch(topChildren, 'top', rootLayout, mapData.nodes, layoutMap, vertRootVGap, vertSiblingHGap, vertLevelVGap);
        layoutVerticalBranch(bottomChildren, 'bottom', rootLayout, mapData.nodes, layoutMap, vertRootVGap, vertSiblingHGap, vertLevelVGap);
      }
      // 6, 7 & 8. RIGHT, LEFT, STANDARD
      else {
        var rightChildren = [];
        var leftChildren = [];
        if (layoutType === 'right') {
          rightChildren = validChildren;
        } else if (layoutType === 'left') {
          leftChildren = validChildren;
        } else {
          validChildren.forEach(function(cid, i) {
            var node = mapData.nodes[cid];
            if (node.side === 'left') leftChildren.push(cid);
            else if (node.side === 'right') rightChildren.push(cid);
            else if (i % 2 === 0) rightChildren.push(cid);
            else leftChildren.push(cid);
          });
        }
        layoutBranchSide(rightChildren, 'right', rootLayout, mapData.nodes, layoutMap, rootHGap, hGap, vGap);
        layoutBranchSide(leftChildren, 'left', rootLayout, mapData.nodes, layoutMap, rootHGap, hGap, vGap);
      }

      return layoutMap;
    }
`);

  // Layout helpers
  parts.push(`
    function layoutBranchSide(childIds, side, parentLayout, nodes, layoutMap, rootHGap, hGap, vGap) {
      if (childIds.length === 0) return;
      var metricsList = childIds.map(function(id) { return calculateSubTreeMetrics(id, nodes, vGap); });
      var totalHeight = 0;
      for (var i = 0; i < metricsList.length; i++) {
        totalHeight += metricsList[i].subtreeHeight;
        if (i < metricsList.length - 1) totalHeight += vGap;
      }
      var startY = parentLayout.y + parentLayout.height / 2 - totalHeight / 2;

      metricsList.forEach(function(metric, branchIdx) {
        var node = nodes[metric.id];
        var nodeY = startY + metric.subtreeHeight / 2 - metric.height / 2;
        var nodeX = (side === 'right')
          ? parentLayout.x + parentLayout.width + rootHGap
          : parentLayout.x - metric.width - rootHGap;

        var calculated = {
          id: metric.id, x: nodeX, y: nodeY, width: metric.width, height: metric.height,
          side: side, depth: parentLayout.depth + 1, branchIndex: branchIdx
        };
        layoutMap.set(metric.id, calculated);

        if (!node.folded && metric.childrenLayouts.length > 0) {
          layoutChildrenSide(metric.childrenLayouts, side, calculated, nodes, layoutMap, hGap, vGap);
        }
        startY += metric.subtreeHeight + vGap;
      });
    }

    function layoutChildrenSide(childrenMetrics, side, parentLayout, nodes, layoutMap, hGap, vGap) {
      var totalHeight = 0;
      for (var i = 0; i < childrenMetrics.length; i++) {
        totalHeight += childrenMetrics[i].subtreeHeight;
        if (i < childrenMetrics.length - 1) totalHeight += vGap;
      }
      var startY = parentLayout.y + parentLayout.height / 2 - totalHeight / 2;

      childrenMetrics.forEach(function(metric) {
        var node = nodes[metric.id];
        var nodeY = startY + metric.subtreeHeight / 2 - metric.height / 2;
        var nodeX = (side === 'right')
          ? parentLayout.x + parentLayout.width + hGap
          : parentLayout.x - metric.width - hGap;

        var calculated = {
          id: metric.id, x: nodeX, y: nodeY, width: metric.width, height: metric.height,
          side: side, depth: parentLayout.depth + 1, branchIndex: parentLayout.branchIndex
        };
        layoutMap.set(metric.id, calculated);

        if (!node.folded && metric.childrenLayouts.length > 0) {
          layoutChildrenSide(metric.childrenLayouts, side, calculated, nodes, layoutMap, hGap, vGap);
        }
        startY += metric.subtreeHeight + vGap;
      });
    }

    function layoutVerticalBranch(childIds, dir, parentLayout, nodes, layoutMap, rootVGap, hGap, vGap) {
      if (childIds.length === 0) return;
      var metricsList = childIds.map(function(id) { return calculateSubTreeVerticalMetrics(id, nodes, hGap); });
      var totalWidth = 0;
      for (var i = 0; i < metricsList.length; i++) {
        totalWidth += metricsList[i].subtreeWidth;
        if (i < metricsList.length - 1) totalWidth += hGap;
      }
      var startX = parentLayout.x + parentLayout.width / 2 - totalWidth / 2;

      metricsList.forEach(function(metric, branchIdx) {
        var node = nodes[metric.id];
        var nodeX = startX + metric.subtreeWidth / 2 - metric.width / 2;
        var nodeY = (dir === 'bottom')
          ? parentLayout.y + parentLayout.height + rootVGap
          : parentLayout.y - metric.height - rootVGap;

        var calculated = {
          id: metric.id, x: nodeX, y: nodeY, width: metric.width, height: metric.height,
          side: dir, depth: parentLayout.depth + 1, branchIndex: branchIdx
        };
        layoutMap.set(metric.id, calculated);

        if (!node.folded && metric.childrenLayouts.length > 0) {
          layoutChildrenVertical(metric.childrenLayouts, dir, calculated, nodes, layoutMap, hGap, vGap);
        }
        startX += metric.subtreeWidth + hGap;
      });
    }

    function layoutChildrenVertical(childrenMetrics, dir, parentLayout, nodes, layoutMap, hGap, vGap) {
      var totalWidth = 0;
      for (var i = 0; i < childrenMetrics.length; i++) {
        totalWidth += childrenMetrics[i].subtreeWidth;
        if (i < childrenMetrics.length - 1) totalWidth += hGap;
      }
      var startX = parentLayout.x + parentLayout.width / 2 - totalWidth / 2;

      childrenMetrics.forEach(function(metric) {
        var node = nodes[metric.id];
        var nodeX = startX + metric.subtreeWidth / 2 - metric.width / 2;
        var nodeY = (dir === 'bottom')
          ? parentLayout.y + parentLayout.height + vGap
          : parentLayout.y - metric.height - vGap;

        var calculated = {
          id: metric.id, x: nodeX, y: nodeY, width: metric.width, height: metric.height,
          side: dir, depth: parentLayout.depth + 1, branchIndex: parentLayout.branchIndex
        };
        layoutMap.set(metric.id, calculated);

        if (!node.folded && metric.childrenLayouts.length > 0) {
          layoutChildrenVertical(metric.childrenLayouts, dir, calculated, nodes, layoutMap, hGap, vGap);
        }
        startX += metric.subtreeWidth + hGap;
      });
    }

    function layoutBranchRadial(nodeId, px, py, pw, ph, parentAngle, layoutMap, hGap, vGap) {
      var node = mapData.nodes[nodeId];
      if (!node || node.folded || !node.children || node.children.length === 0) return;
      var count = node.children.length;
      var spread = Math.PI / 2.5;
      var subDist = Math.max(140, hGap * 2.2);

      node.children.forEach(function(cid, idx) {
        var angle = (count === 1)
          ? parentAngle
          : parentAngle - spread / 2 + (idx / (count - 1)) * spread;
        var size = estimateNodeSize(mapData.nodes[cid]);
        var cx = px + pw / 2 + Math.cos(angle) * subDist - size.width / 2;
        var cy = py + ph / 2 + Math.sin(angle) * subDist - size.height / 2;
        var side = Math.cos(angle) >= 0 ? 'right' : 'left';
        layoutMap.set(cid, { id: cid, x: cx, y: cy, width: size.width, height: size.height, side: side, depth: 2, branchIndex: idx });
        layoutBranchRadial(cid, cx, cy, size.width, size.height, angle, layoutMap, hGap, vGap);
      });
    }

    function layoutBranchCircular(nodeId, radius, layoutMap, hGap) {
      var node = mapData.nodes[nodeId];
      if (!node || node.folded || !node.children || node.children.length === 0) return;
      node.children.forEach(function(cid, i) {
        var count = node.children.length;
        var pLayout = layoutMap.get(nodeId);
        var pAngle = Math.atan2(pLayout.y + pLayout.height / 2, pLayout.x + pLayout.width / 2);
        var spread = Math.PI / 3;
        var angle = (count === 1) ? pAngle : pAngle - spread / 2 + (i / (count - 1)) * spread;
        var size = estimateNodeSize(mapData.nodes[cid]);
        var cx = Math.cos(angle) * radius - size.width / 2;
        var cy = Math.sin(angle) * radius - size.height / 2;
        var side = Math.cos(angle) >= 0 ? 'right' : 'left';
        layoutMap.set(cid, { id: cid, x: cx, y: cy, width: size.width, height: size.height, side: side, depth: 2, branchIndex: i });
        layoutBranchCircular(cid, radius + 130, layoutMap, hGap);
      });
    }
`);

  // Edge Path Generator
  parts.push(`
    function generateEdgePath(parent, child, edgeStyle) {
      var startX, startY, endX, endY;
      var isVertical = child.side === 'top' || child.side === 'bottom';

      if (isVertical) {
        if (child.side === 'bottom') {
          startX = parent.x + parent.width / 2;
          startY = parent.y + parent.height;
          endX = child.x + child.width / 2;
          endY = child.y;
        } else {
          startX = parent.x + parent.width / 2;
          startY = parent.y;
          endX = child.x + child.width / 2;
          endY = child.y + child.height;
        }
      } else {
        if (child.side === 'right') {
          startX = parent.x + parent.width;
          startY = parent.y + parent.height / 2;
          endX = child.x;
          endY = child.y + child.height / 2;
        } else {
          startX = parent.x;
          startY = parent.y + parent.height / 2;
          endX = child.x + child.width;
          endY = child.y + child.height / 2;
        }
      }

      if (edgeStyle === 'sharp') {
        if (isVertical) {
          var midY = (startY + endY) / 2;
          return 'M ' + startX + ' ' + startY + ' L ' + startX + ' ' + midY + ' L ' + endX + ' ' + midY + ' L ' + endX + ' ' + endY;
        } else {
          var midX = (startX + endX) / 2;
          return 'M ' + startX + ' ' + startY + ' L ' + midX + ' ' + startY + ' L ' + midX + ' ' + endY + ' L ' + endX + ' ' + endY;
        }
      } else if (edgeStyle === 'linear') {
        return 'M ' + startX + ' ' + startY + ' L ' + endX + ' ' + endY;
      } else {
        if (isVertical) {
          var dy = Math.abs(endY - startY);
          var cy1 = child.side === 'bottom' ? startY + dy * 0.45 : startY - dy * 0.45;
          var cy2 = child.side === 'bottom' ? endY - dy * 0.45 : endY + dy * 0.45;
          return 'M ' + startX + ' ' + startY + ' C ' + startX + ' ' + cy1 + ', ' + endX + ' ' + cy2 + ', ' + endX + ' ' + endY;
        } else {
          var dx = Math.abs(endX - startX);
          var cx1 = child.side === 'right' ? startX + dx * 0.45 : startX - dx * 0.45;
          var cx2 = child.side === 'right' ? endX - dx * 0.45 : endX + dx * 0.45;
          return 'M ' + startX + ' ' + startY + ' C ' + cx1 + ' ' + startY + ', ' + cx2 + ' ' + endY + ', ' + endX + ' ' + endY;
        }
      }
    }
`);

  // Main Renderer
  parts.push(`
    function renderMap() {
      nodesLayer.innerHTML = '';
      edgesSvg.innerHTML = '';
      cloudsSvg.innerHTML = '';
      connectorsSvg.innerHTML = '';

      var layoutMap = computeMindMapLayout();
      var themeBranchColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#14b8a6'];
      var edgeStyle = mapData.edgeStyle || 'bezier';
      var edgeDash = mapData.edgeDash || 'solid';
      var edgeWidth = mapData.edgeWidth || 2.2;

      // 1. Render Clouds
      Object.values(mapData.nodes).forEach(function(node) {
        if (node.cloud && node.cloud.enabled) {
          var pLayout = layoutMap.get(node.id);
          if (!pLayout) return;

          var minX = pLayout.x;
          var maxX = pLayout.x + pLayout.width;
          var minY = pLayout.y;
          var maxY = pLayout.y + pLayout.height;

          function expandDescendants(nId) {
            var n = mapData.nodes[nId];
            if (!n || n.folded || !n.children) return;
            n.children.forEach(function(cid) {
              var cLayout = layoutMap.get(cid);
              if (cLayout) {
                minX = Math.min(minX, cLayout.x);
                maxX = Math.max(maxX, cLayout.x + cLayout.width);
                minY = Math.min(minY, cLayout.y);
                maxY = Math.max(maxY, cLayout.y + cLayout.height);
                expandDescendants(cid);
              }
            });
          }
          expandDescendants(node.id);

          var pad = 18;
          var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', minX - pad);
          rect.setAttribute('y', minY - pad);
          rect.setAttribute('width', (maxX - minX) + pad * 2);
          rect.setAttribute('height', (maxY - minY) + pad * 2);
          rect.setAttribute('rx', '20');
          rect.setAttribute('fill', node.cloud.color || 'rgba(59, 130, 246, 0.08)');
          rect.setAttribute('stroke', node.cloud.color || 'rgba(59, 130, 246, 0.2)');
          rect.setAttribute('stroke-width', '1.5');
          rect.setAttribute('stroke-dasharray', '4 4');
          cloudsSvg.appendChild(rect);
        }
      });

      // 2. Render Edges
      layoutMap.forEach(function(childLayout, childId) {
        var childNode = mapData.nodes[childId];
        if (!childNode || !childNode.parentId) return;
        var parentLayout = layoutMap.get(childNode.parentId);
        if (!parentLayout) return;

        var pathData = generateEdgePath(parentLayout, childLayout, edgeStyle);
        var branchColor = childNode.borderColor || themeBranchColors[childLayout.branchIndex % themeBranchColors.length] || '#94a3b8';

        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', branchColor);
        path.setAttribute('stroke-width', String(edgeWidth));
        path.setAttribute('fill', 'none');
        if (edgeDash === 'dashed') path.setAttribute('stroke-dasharray', '6 4');
        else if (edgeDash === 'dotted') path.setAttribute('stroke-dasharray', '2 3');
        edgesSvg.appendChild(path);
      });

      // 3. Render Cross-Connectors
      if (mapData.connectors && mapData.connectors.length > 0) {
        mapData.connectors.forEach(function(conn) {
          var fromL = layoutMap.get(conn.fromId);
          var toL = layoutMap.get(conn.toId);
          if (!fromL || !toL) return;

          var sx = fromL.x + fromL.width / 2;
          var sy = fromL.y + fromL.height / 2;
          var ex = toL.x + toL.width / 2;
          var ey = toL.y + toL.height / 2;
          var ddx = ex - sx;
          var ddy = ey - sy;
          var curve = conn.curvature !== undefined ? conn.curvature : -50;
          var mx = (sx + ex) / 2 - (ddy / 2) * (curve / 100);
          var my = (sy + ey) / 2 + (ddx / 2) * (curve / 100);

          var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', 'M ' + sx + ' ' + sy + ' Q ' + mx + ' ' + my + ', ' + ex + ' ' + ey);
          path.setAttribute('stroke', conn.color || '#3b82f6');
          path.setAttribute('stroke-width', String(conn.width || 2));
          path.setAttribute('fill', 'none');
          path.setAttribute('opacity', String(conn.opacity || 0.9));
          if (conn.style === 'dashed') path.setAttribute('stroke-dasharray', '6 4');
          else if (conn.style === 'dotted') path.setAttribute('stroke-dasharray', '2 3');
          connectorsSvg.appendChild(path);

          if (conn.label) {
            var textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            var textBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            var textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textEl.textContent = conn.label;
            textEl.setAttribute('x', String(mx));
            textEl.setAttribute('y', String(my + 4));
            textEl.setAttribute('font-size', '11');
            textEl.setAttribute('font-weight', '600');
            textEl.setAttribute('fill', '#1e293b');
            textEl.setAttribute('text-anchor', 'middle');
            
            var tw = conn.label.length * 6.5 + 16;
            textBg.setAttribute('x', String(mx - tw / 2));
            textBg.setAttribute('y', String(my - 10));
            textBg.setAttribute('width', String(tw));
            textBg.setAttribute('height', '20');
            textBg.setAttribute('rx', '6');
            textBg.setAttribute('fill', '#ffffff');
            textBg.setAttribute('stroke', conn.color || '#3b82f6');
            textBg.setAttribute('stroke-width', '1');
            
            textGroup.appendChild(textBg);
            textGroup.appendChild(textEl);
            connectorsSvg.appendChild(textGroup);
          }
        });
      }

      // 4. Render HTML Nodes
      layoutMap.forEach(function(layout, id) {
        var node = mapData.nodes[id];
        if (!node) return;

        var isRoot = !node.parentId;
        var div = document.createElement('div');
        var shape = node.shape || 'bubble';
        div.className = 'node-element shape-' + shape + (isRoot ? ' node-root' : '');
        div.id = 'node-' + id;
        div.style.left = layout.x + 'px';
        div.style.top = layout.y + 'px';
        div.style.width = layout.width + 'px';
        div.style.height = layout.height + 'px';

        // Background
        if (node.bgType === 'transparent') {
          div.style.background = 'transparent';
        } else if (node.bgType === 'gradient') {
          var c1 = node.gradientColor1 || node.color || '#3b82f6';
          var c2 = node.gradientColor2 || '#8b5cf6';
          div.style.background = 'linear-gradient(135deg, ' + c1 + ', ' + c2 + ')';
        } else {
          div.style.backgroundColor = node.color || (isRoot ? '#2563eb' : '#ffffff');
        }

        // Borders
        div.style.borderColor = node.borderColor || (isRoot ? '#1d4ed8' : '#cbd5e1');
        div.style.borderWidth = (node.borderWidth !== undefined ? node.borderWidth : (isRoot ? 2 : 1.5)) + 'px';
        div.style.borderStyle = node.borderDash || node.borderStyle || 'solid';

        // Content Wrapper
        var wrap = document.createElement('div');
        wrap.className = 'node-content-wrap';

        // Top Image
        if (node.imageUrl && (node.imagePosition === 'top' || !node.imagePosition)) {
          var imgWrap = document.createElement('div');
          imgWrap.className = 'node-image-wrap';
          var img = document.createElement('img');
          img.src = node.imageUrl;
          img.className = 'node-image';
          if (node.imageWidth) img.style.width = node.imageWidth + 'px';
          imgWrap.appendChild(img);
          wrap.appendChild(imgWrap);
        }

        // Header Row (Icons + Title + Action Badges)
        var headerRow = document.createElement('div');
        headerRow.className = 'node-header-row';

        // Left Image
        if (node.imageUrl && node.imagePosition === 'left') {
          var imgL = document.createElement('img');
          imgL.src = node.imageUrl;
          imgL.className = 'node-image';
          imgL.style.width = (node.imageWidth || 40) + 'px';
          imgL.style.marginRight = '6px';
          headerRow.appendChild(imgL);
        }

        // Icons
        if (node.icons && node.icons.length > 0) {
          var iconsContainer = document.createElement('div');
          iconsContainer.className = 'node-icons';
          node.icons.forEach(function(ic) {
            var span = document.createElement('span');
            span.className = 'node-icon-item';
            span.innerHTML = getSvgIcon(ic);
            iconsContainer.appendChild(span);
          });
          headerRow.appendChild(iconsContainer);
        }

        // Title Text
        var titleEl = document.createElement('div');
        titleEl.className = 'node-title-text';
        titleEl.innerHTML = formatTextWithLinks(node.text || '');
        titleEl.style.fontSize = (node.fontSize || (isRoot ? 16 : 14)) + 'px';
        titleEl.style.color = node.textColor || (isRoot ? '#ffffff' : '#1e293b');
        if (node.bold) titleEl.style.fontWeight = '700';
        if (node.italic) titleEl.style.fontStyle = 'italic';
        if (node.textAlign) titleEl.style.textAlign = node.textAlign;
        headerRow.appendChild(titleEl);

        // Right Image
        if (node.imageUrl && node.imagePosition === 'right') {
          var imgR = document.createElement('img');
          imgR.src = node.imageUrl;
          imgR.className = 'node-image';
          imgR.style.width = (node.imageWidth || 40) + 'px';
          imgR.style.marginLeft = '6px';
          headerRow.appendChild(imgR);
        }

        // Note Indicator Button in Header
        if (node.note) {
          var noteBtn = document.createElement('span');
          noteBtn.className = 'node-note-btn';
          noteBtn.innerHTML = '\\ud83d\\udcdd';
          noteBtn.title = 'Nota: ' + (node.note || '');
          noteBtn.onclick = function(e) {
            e.stopPropagation();
            openNoteDrawer(node.text, node.note);
          };
          headerRow.appendChild(noteBtn);
        }

        wrap.appendChild(headerRow);

        // Between Image
        if (node.imageUrl && node.imagePosition === 'between') {
          var imgWrapB = document.createElement('div');
          imgWrapB.className = 'node-image-wrap';
          var imgB = document.createElement('img');
          imgB.src = node.imageUrl;
          imgB.className = 'node-image';
          if (node.imageWidth) imgB.style.width = node.imageWidth + 'px';
          imgWrapB.appendChild(imgB);
          wrap.appendChild(imgWrapB);
        }

        // Body Text
        if (node.body && node.body.trim().length > 0) {
          var bodyEl = document.createElement('div');
          bodyEl.className = 'node-body-text';
          bodyEl.innerHTML = formatTextWithLinks(node.body);
          bodyEl.style.fontSize = (node.bodyFontSize || (isRoot ? 13 : 11.5)) + 'px';
          bodyEl.style.color = node.bodyColor || (isRoot ? '#e2e8f0' : '#475569');
          if (node.bodyBold) bodyEl.style.fontWeight = '700';
          if (node.bodyItalic) bodyEl.style.fontStyle = 'italic';
          if (node.bodyAlign) bodyEl.style.textAlign = node.bodyAlign;
          wrap.appendChild(bodyEl);
        }

        // Bottom Image
        if (node.imageUrl && node.imagePosition === 'bottom') {
          var imgWrapBtm = document.createElement('div');
          imgWrapBtm.className = 'node-image-wrap';
          var imgBtm = document.createElement('img');
          imgBtm.src = node.imageUrl;
          imgBtm.className = 'node-image';
          if (node.imageWidth) imgBtm.style.width = node.imageWidth + 'px';
          imgWrapBtm.appendChild(imgBtm);
          wrap.appendChild(imgWrapBtm);
        }

        // Dedicated Prominent Link Badge
        if (node.link && node.link.trim().length > 0) {
          var linkBadge = document.createElement('a');
          linkBadge.className = 'node-link-badge';
          linkBadge.href = node.link;
          linkBadge.target = '_blank';
          linkBadge.rel = 'noopener noreferrer';
          linkBadge.title = 'Abrir enlace: ' + node.link;
          linkBadge.onclick = function(e) { e.stopPropagation(); };

          var cleanDisplayUrl = node.link.replace(/^https?:\\/\\//, '').replace(/^www\\./, '').replace(/\\/$/, '');
          linkBadge.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> <span style="overflow:hidden; text-overflow:ellipsis; max-width:180px;">' + cleanDisplayUrl + '</span>';
          wrap.appendChild(linkBadge);
        }

        // Progress Bar
        if (node.progress !== undefined) {
          var progWrap = document.createElement('div');
          progWrap.className = 'node-progress-wrap';
          var bg = document.createElement('div');
          bg.className = 'progress-bar-bg';
          var fill = document.createElement('div');
          fill.className = 'progress-bar-fill';
          fill.style.width = node.progress + '%';
          bg.appendChild(fill);
          var txt = document.createElement('span');
          txt.className = 'progress-bar-text';
          txt.textContent = node.progress + '%';
          progWrap.appendChild(bg);
          progWrap.appendChild(txt);
          wrap.appendChild(progWrap);
        }

        // Tags
        if (node.tags && node.tags.length > 0) {
          var tagsWrap = document.createElement('div');
          tagsWrap.className = 'node-tags-wrap';
          node.tags.forEach(function(t) {
            var tSpan = document.createElement('span');
            tSpan.className = 'tag-badge';
            tSpan.textContent = '#' + t;
            tagsWrap.appendChild(tSpan);
          });
          wrap.appendChild(tagsWrap);
        }

        // Floating Note Hover Tooltip
        if (node.note && node.note.trim().length > 0) {
          var tooltip = document.createElement('div');
          var isTopLayout = layout.side === 'top';
          tooltip.className = 'node-note-tooltip' + (isTopLayout ? ' pos-bottom' : '');
          
          var tipHeader = document.createElement('div');
          tipHeader.className = 'tooltip-note-header';
          tipHeader.innerHTML = '<span>\\ud83d\\udcdd Nota del Nodo</span>';
          
          var tipBody = document.createElement('div');
          tipBody.className = 'tooltip-note-body';
          tipBody.innerHTML = renderMarkdown(node.note);
          
          tooltip.appendChild(tipHeader);
          tooltip.appendChild(tipBody);
          div.appendChild(tooltip);
        }

        div.appendChild(wrap);

        // Search Match Highlight
        if (searchQuery.trim() !== '') {
          var q = searchQuery.toLowerCase();
          if ((node.text && node.text.toLowerCase().indexOf(q) !== -1) ||
              (node.body && node.body.toLowerCase().indexOf(q) !== -1) ||
              (node.link && node.link.toLowerCase().indexOf(q) !== -1) ||
              (node.tags && node.tags.some(function(t) { return t.toLowerCase().indexOf(q) !== -1; }))) {
            div.classList.add('search-match');
          }
        }

        nodesLayer.appendChild(div);

        // Fold/Unfold Button
        if (node.children && node.children.length > 0) {
          var foldBtn = document.createElement('div');
          foldBtn.className = 'fold-btn';
          foldBtn.textContent = node.folded ? '+' : '\\u2212';
          foldBtn.title = node.folded ? 'Desplegar ramas' : 'Plegar ramas';
          var isVert = layout.side === 'top' || layout.side === 'bottom';
          if (isVert) {
            foldBtn.style.left = (layout.x + layout.width / 2 - 11) + 'px';
            foldBtn.style.top = (layout.side === 'bottom')
              ? (layout.y + layout.height - 11) + 'px'
              : (layout.y - 11) + 'px';
          } else {
            foldBtn.style.top = (layout.y + layout.height / 2 - 11) + 'px';
            foldBtn.style.left = (layout.side === 'left')
              ? (layout.x - 11) + 'px'
              : (layout.x + layout.width - 11) + 'px';
          }
          foldBtn.onclick = (function(nodeId) {
            return function(e) {
              e.stopPropagation();
              toggleFold(nodeId);
            };
          })(id);
          nodesLayer.appendChild(foldBtn);
        }
      });
    }
`);

  // Viewport & Pan/Zoom & Interaction
  parts.push(`
    function updateTransform() {
      viewport.style.transform = 'translate(' + panX + 'px, ' + panY + 'px) scale(' + zoom + ')';
      zoomText.textContent = Math.round(zoom * 100) + '%';
    }

    function zoomBy(factor) {
      zoom = Math.max(0.15, Math.min(3.0, zoom * factor));
      updateTransform();
    }

    function resetView() {
      zoom = 1;
      panX = window.innerWidth / 2;
      panY = window.innerHeight / 2;
      updateTransform();
    }

    function fitToScreen() {
      var layoutMap = computeMindMapLayout();
      if (layoutMap.size === 0) return;

      var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      layoutMap.forEach(function(l) {
        minX = Math.min(minX, l.x);
        maxX = Math.max(maxX, l.x + l.width);
        minY = Math.min(minY, l.y);
        maxY = Math.max(maxY, l.y + l.height);
      });

      var mapW = maxX - minX + 120;
      var mapH = maxY - minY + 120;
      var vw = window.innerWidth;
      var vh = window.innerHeight;

      var fitZoom = Math.min(Math.max(Math.min((vw * 0.9) / mapW, (vh * 0.85) / mapH), 0.25), 1.8);
      var centerX = (minX + maxX) / 2;
      var centerY = (minY + maxY) / 2;

      zoom = fitZoom;
      panX = vw / 2 - centerX * zoom;
      panY = vh / 2 - centerY * zoom;
      updateTransform();
    }

    // Pan interaction
    container.addEventListener('mousedown', function(e) {
      if (e.target.closest('.node-element') || e.target.closest('.fold-btn') || e.target.closest('.floating-toolbar') || e.target.closest('header')) return;
      isDragging = true;
      startX = e.clientX - panX;
      startY = e.clientY - panY;
    });

    window.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      panX = e.clientX - startX;
      panY = e.clientY - startY;
      updateTransform();
    });

    window.addEventListener('mouseup', function() { isDragging = false; });

    container.addEventListener('wheel', function(e) {
      e.preventDefault();
      var zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      var mouseX = e.clientX;
      var mouseY = e.clientY;

      var newZoom = Math.max(0.15, Math.min(3.0, zoom * zoomFactor));
      panX = mouseX - (mouseX - panX) * (newZoom / zoom);
      panY = mouseY - (mouseY - panY) * (newZoom / zoom);
      zoom = newZoom;
      updateTransform();
    }, { passive: false });

    // Touch Support (Pinch to Zoom & Pan)
    var initialTouchDistance = null;
    var initialTouchZoom = zoom;

    container.addEventListener('touchstart', function(e) {
      if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX - panX;
        startY = e.touches[0].clientY - panY;
      } else if (e.touches.length === 2) {
        isDragging = false;
        var dx = e.touches[0].clientX - e.touches[1].clientX;
        var dy = e.touches[0].clientY - e.touches[1].clientY;
        initialTouchDistance = Math.hypot(dx, dy);
        initialTouchZoom = zoom;
      }
    });

    container.addEventListener('touchmove', function(e) {
      e.preventDefault();
      if (e.touches.length === 1 && isDragging) {
        panX = e.touches[0].clientX - startX;
        panY = e.touches[0].clientY - startY;
        updateTransform();
      } else if (e.touches.length === 2 && initialTouchDistance) {
        var dx = e.touches[0].clientX - e.touches[1].clientX;
        var dy = e.touches[0].clientY - e.touches[1].clientY;
        var distance = Math.hypot(dx, dy);
        zoom = Math.max(0.15, Math.min(3.0, initialTouchZoom * (distance / initialTouchDistance)));
        updateTransform();
      }
    }, { passive: false });

    container.addEventListener('touchend', function() {
      isDragging = false;
      initialTouchDistance = null;
    });

    // Fold / Unfold Single Node
    function toggleFold(nodeId) {
      if (mapData.nodes[nodeId]) {
        mapData.nodes[nodeId].folded = !mapData.nodes[nodeId].folded;
        renderMap();
      }
    }

    // Fold / Unfold All Nodes
    function toggleFoldAll() {
      isAllFolded = !isAllFolded;
      Object.keys(mapData.nodes).forEach(function(id) {
        if (id !== mapData.rootId && mapData.nodes[id].children && mapData.nodes[id].children.length > 0) {
          mapData.nodes[id].folded = isAllFolded;
        }
      });
      var btn = document.getElementById('btn-fold-toggle');
      if (btn) btn.textContent = isAllFolded ? 'Desplegar Todo' : 'Plegar Todo';
      renderMap();
      fitToScreen();
    }

    // Search
    function handleSearch(query) {
      searchQuery = query;
      renderMap();
    }

    // Notes Drawer
    function openNoteDrawer(title, note) {
      document.getElementById('note-title').textContent = title || 'Nota';
      document.getElementById('note-body').innerHTML = renderMarkdown(note || '');
      document.getElementById('note-drawer').classList.add('open');
    }

    function closeNoteDrawer() {
      document.getElementById('note-drawer').classList.remove('open');
    }

    // Export PNG / Print
    function exportCanvasPng() {
      window.print();
    }

    // Init
    renderMap();
    fitToScreen();
`);

  parts.push(`  </script>
</body>
</html>`);

  return parts.join('\n');
}
