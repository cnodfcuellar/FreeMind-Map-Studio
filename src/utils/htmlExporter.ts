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

  return `<!DOCTYPE html>
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
      top: -25000px;
      left: -25000px;
      width: 50000px;
      height: 50000px;
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
      shrink: 0;
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
      shrink: 0;
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
      <button class="drawer-close" onclick="closeNoteDrawer()">×</button>
    </div>
    <div class="drawer-body" id="note-body"></div>
  </div>

  <script>
    const mapData = ${jsonMap};
    let zoom = 1;
    let panX = window.innerWidth / 2;
    let panY = window.innerHeight / 2;
    let isDragging = false;
    let startX, startY;
    let searchQuery = '';
    let isAllFolded = false;

    const viewport = document.getElementById('viewport');
    const container = document.getElementById('canvas-container');
    const cloudsSvg = document.getElementById('clouds-layer');
    const edgesSvg = document.getElementById('edges-layer');
    const connectorsSvg = document.getElementById('connectors-layer');
    const nodesLayer = document.getElementById('nodes-layer');
    const zoomText = document.getElementById('zoom-text');

    // Vector Icon Generator
    function getSvgIcon(iconName) {
      const icons = {
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
        'user': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      };
      return icons[iconName] || '<span style="font-size:12px;">🏷️</span>';
    }

    // Auto-Hyperlink formatter for text/body
    function formatTextWithLinks(rawText) {
      if (!rawText) return '';
      let escaped = String(rawText)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Markdown links: [Label](url)
      escaped = escaped.replace(/\\[([^\\]]+)\\]\\((https?:\\/\\/[^\\s\\)]+)\\)/g, (match, label, url) => {
        return \`<a href="\${url}" target="_blank" rel="noopener noreferrer" class="inline-link" onclick="event.stopPropagation()">\${label} <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>\`;
      });

      // Raw URLs: https://... or http://...
      escaped = escaped.replace(/(^|[\\s(])(https?:\\/\\/[^\\s\\)<]+)/g, (match, prefix, url) => {
        return \`\${prefix}<a href="\${url}" target="_blank" rel="noopener noreferrer" class="inline-link" onclick="event.stopPropagation()">\${url} <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>\`;
      });

      return escaped;
    }

    // Node Estimation Engine matching FreeMind Studio
    function estimateNodeSize(node) {
      const isRoot = !node.parentId;
      const fontSize = node.fontSize || (isRoot ? 16 : 14);
      const paddingX = isRoot ? 24 : 14;
      const paddingY = isRoot ? 12 : 8;

      let extraWidth = 0;
      if (node.icons && node.icons.length > 0) extraWidth += node.icons.length * 20 + 6;
      if (node.progress !== undefined) extraWidth += 24;
      if (node.note) extraWidth += 18;

      let linkExtraHeight = 0;
      let linkMinWidth = 0;
      if (node.link && node.link.trim().length > 0) {
        linkExtraHeight += 24;
        const cleanUrl = node.link.replace(/^https?:\\/\\//, '').replace(/^www\\./, '');
        linkMinWidth = Math.min(cleanUrl.length * 6.5 + 28, 220);
      }

      let imageExtraHeight = 0;
      let imageMinWidth = 0;
      if (node.imageUrl) {
        if (node.imagePosition === 'left' || node.imagePosition === 'right') {
          const imgW = node.imageWidth || 80;
          extraWidth += imgW + 10;
          imageExtraHeight = Math.max(0, (node.imageHeight || imgW * 0.75) - 28);
        } else {
          const imgW = node.imageWidth || 120;
          const imgH = node.imageHeight || Math.round(imgW * 0.65);
          imageExtraHeight = imgH + 10;
          imageMinWidth = imgW + 16;
        }
      }

      let extraHeight = 0;
      let tagMinWidth = 0;
      if (node.tags && node.tags.length > 0) {
        extraHeight += 22;
        tagMinWidth = Math.min(node.tags.reduce((acc, t) => acc + t.length * 7 + 16, 0), 280);
      }

      const charWidth = fontSize * 0.58;
      const lines = (node.text || ' ').split('\\n');
      const maxLineLength = Math.max(...lines.map(l => l.length), 1);
      let titleWidth = Math.min(Math.max(maxLineLength * charWidth, 40), 400);
      let titleHeight = lines.length * (fontSize * 1.35);

      let bodyWidth = 0;
      let bodyHeight = 0;
      if (node.body && node.body.trim().length > 0) {
        const bodyFontSize = node.bodyFontSize || (isRoot ? 13 : 12);
        const bodyLines = node.body.split('\\n');
        const bodyCharWidth = bodyFontSize * 0.56;
        const maxBodyLineLength = Math.max(...bodyLines.map(l => l.length), 1);
        bodyWidth = Math.min(Math.max(maxBodyLineLength * bodyCharWidth, 40), 420);
        bodyHeight = bodyLines.length * (bodyFontSize * 1.4) + 6;
      }

      const contentWidth = Math.max(titleWidth, bodyWidth);
      const contentHeight = titleHeight + bodyHeight;

      let width = Math.round(Math.max(contentWidth + paddingX * 2 + extraWidth, tagMinWidth + paddingX * 2, linkMinWidth + paddingX * 2, imageMinWidth + paddingX * 2));
      let height = Math.round(Math.max(contentHeight + paddingY * 2 + extraHeight + linkExtraHeight + imageExtraHeight, (isRoot ? 48 : 34) + extraHeight + linkExtraHeight + imageExtraHeight));

      if (node.customWidth && node.customWidth > 0) width = Math.max(width, node.customWidth);
      if (node.customHeight && node.customHeight > 0) height = Math.max(height, node.customHeight);

      if (node.shape === 'hexagon' || node.shape === 'diamond') {
        width = Math.round(width * 1.25 + 24);
        height = Math.round(height * 1.1 + 12);
      } else if (node.shape === 'circle' || node.shape === 'square') {
        const dim = Math.max(width, height, 54);
        width = dim;
        height = dim;
      }

      return { width, height };
    }

    function calculateSubTreeMetrics(nodeId, nodes, verticalGap) {
      const node = nodes[nodeId];
      if (!node) return { id: nodeId, width: 60, height: 30, subtreeHeight: 30, childrenLayouts: [] };

      const { width, height } = estimateNodeSize(node);
      const hasCloud = Boolean(node.cloud && node.cloud.enabled);
      const cloudPad = hasCloud ? 36 : 0;

      if (node.folded || !node.children || node.children.length === 0) {
        return { id: nodeId, width: width + cloudPad, height: height + cloudPad, subtreeHeight: height + cloudPad, childrenLayouts: [] };
      }

      const childrenLayouts = node.children.filter(cid => Boolean(nodes[cid])).map(cid => calculateSubTreeMetrics(cid, nodes, verticalGap));
      let totalChildrenHeight = 0;
      for (let i = 0; i < childrenLayouts.length; i++) {
        totalChildrenHeight += childrenLayouts[i].subtreeHeight;
        if (i < childrenLayouts.length - 1) totalChildrenHeight += verticalGap;
      }

      const subtreeHeight = Math.max(height + cloudPad, totalChildrenHeight + cloudPad);
      return { id: nodeId, width: width + cloudPad, height: height + cloudPad, subtreeHeight, childrenLayouts };
    }

    function calculateSubTreeVerticalMetrics(nodeId, nodes, horizontalGap) {
      const node = nodes[nodeId];
      if (!node) return { id: nodeId, width: 60, height: 30, subtreeWidth: 60, childrenLayouts: [] };

      const { width, height } = estimateNodeSize(node);
      const hasCloud = Boolean(node.cloud && node.cloud.enabled);
      const cloudPad = hasCloud ? 36 : 0;

      if (node.folded || !node.children || node.children.length === 0) {
        return { id: nodeId, width: width + cloudPad, height: height + cloudPad, subtreeWidth: width + cloudPad, childrenLayouts: [] };
      }

      const childrenLayouts = node.children.filter(cid => Boolean(nodes[cid])).map(cid => calculateSubTreeVerticalMetrics(cid, nodes, horizontalGap));
      let totalChildrenWidth = 0;
      for (let i = 0; i < childrenLayouts.length; i++) {
        totalChildrenWidth += childrenLayouts[i].subtreeWidth;
        if (i < childrenLayouts.length - 1) totalChildrenWidth += horizontalGap;
      }

      const subtreeWidth = Math.max(width + cloudPad, totalChildrenWidth + cloudPad);
      return { id: nodeId, width: width + cloudPad, height: height + cloudPad, subtreeWidth, childrenLayouts };
    }

    // Complete Layout Engine for all 8 distributions
    function computeMindMapLayout() {
      const layoutMap = new Map();
      const root = mapData.nodes[mapData.rootId];
      if (!root) return layoutMap;

      const hGap = mapData.horizontalGap !== undefined ? mapData.horizontalGap : 54;
      const vGap = mapData.verticalGap !== undefined ? mapData.verticalGap : 14;
      const rootHGap = Math.max(48, Math.round(hGap * 1.3));

      const vertSiblingHGap = Math.max(20, Math.round(hGap * 0.9 + 10));
      const vertLevelVGap = Math.max(50, Math.round(vGap * 2.8 + 45));
      const vertRootVGap = Math.max(70, Math.round(vGap * 3.4 + 60));

      const rootSize = estimateNodeSize(root);
      const rootLayout = {
        id: root.id,
        x: -rootSize.width / 2,
        y: -rootSize.height / 2,
        width: rootSize.width,
        height: rootSize.height,
        side: 'root',
        depth: 0,
        branchIndex: 0,
      };
      layoutMap.set(root.id, rootLayout);

      if (root.folded || !root.children || root.children.length === 0) {
        return layoutMap;
      }

      const validChildren = root.children.filter(id => Boolean(mapData.nodes[id]));
      const layoutType = mapData.layout || 'standard';

      // 1. RADIAL
      if (layoutType === 'radial') {
        const radius = Math.max(180, validChildren.length * 40 + hGap * 1.5);
        const angleStep = (2 * Math.PI) / validChildren.length;
        validChildren.forEach((childId, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const childSize = estimateNodeSize(mapData.nodes[childId]);
          const cx = Math.cos(angle) * radius - childSize.width / 2;
          const cy = Math.sin(angle) * radius - childSize.height / 2;
          const side = Math.cos(angle) >= 0 ? 'right' : 'left';
          layoutMap.set(childId, {
            id: childId,
            x: cx,
            y: cy,
            width: childSize.width,
            height: childSize.height,
            side,
            depth: 1,
            branchIndex: i,
          });
          layoutBranchRadial(childId, cx, cy, childSize.width, childSize.height, angle, layoutMap, hGap, vGap);
        });
      }
      // 2. CIRCULAR
      else if (layoutType === 'circular') {
        const count = validChildren.length;
        const baseRadius = Math.max(200, count * 45);
        validChildren.forEach((childId, i) => {
          const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
          const childSize = estimateNodeSize(mapData.nodes[childId]);
          const cx = Math.cos(angle) * baseRadius - childSize.width / 2;
          const cy = Math.sin(angle) * baseRadius - childSize.height / 2;
          const side = Math.cos(angle) >= 0 ? 'right' : 'left';
          layoutMap.set(childId, {
            id: childId,
            x: cx,
            y: cy,
            width: childSize.width,
            height: childSize.height,
            side,
            depth: 1,
            branchIndex: i,
          });
          layoutBranchCircular(childId, baseRadius + 140, layoutMap, hGap);
        });
      }
      // 3 & 4. TOP / BOTTOM (Tree Vertical)
      else if (layoutType === 'bottom' || layoutType === 'tree-down' || layoutType === 'top') {
        const dir = (layoutType === 'top') ? 'top' : 'bottom';
        layoutVerticalBranch(validChildren, dir, rootLayout, mapData.nodes, layoutMap, vertRootVGap, vertSiblingHGap, vertLevelVGap);
      }
      // 5. BALANCED HORIZONTAL
      else if (layoutType === 'balanced-horizontal') {
        const topChildren = [];
        const bottomChildren = [];
        validChildren.forEach((cid, i) => {
          const node = mapData.nodes[cid];
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
        let rightChildren = [];
        let leftChildren = [];
        if (layoutType === 'right') {
          rightChildren = validChildren;
        } else if (layoutType === 'left') {
          leftChildren = validChildren;
        } else {
          validChildren.forEach((cid, i) => {
            const node = mapData.nodes[cid];
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

    function layoutBranchSide(childIds, side, parentLayout, nodes, layoutMap, rootHGap, hGap, vGap) {
      if (childIds.length === 0) return;
      const metricsList = childIds.map(id => calculateSubTreeMetrics(id, nodes, vGap));
      let totalHeight = 0;
      for (let i = 0; i < metricsList.length; i++) {
        totalHeight += metricsList[i].subtreeHeight;
        if (i < metricsList.length - 1) totalHeight += vGap;
      }
      let startY = parentLayout.y + parentLayout.height / 2 - totalHeight / 2;

      metricsList.forEach((metric, branchIdx) => {
        const node = nodes[metric.id];
        const nodeY = startY + metric.subtreeHeight / 2 - metric.height / 2;
        const nodeX = (side === 'right')
          ? parentLayout.x + parentLayout.width + rootHGap
          : parentLayout.x - metric.width - rootHGap;

        const calculated = {
          id: metric.id,
          x: nodeX,
          y: nodeY,
          width: metric.width,
          height: metric.height,
          side,
          depth: parentLayout.depth + 1,
          branchIndex: branchIdx,
        };
        layoutMap.set(metric.id, calculated);

        if (!node.folded && metric.childrenLayouts.length > 0) {
          layoutChildrenSide(metric.childrenLayouts, side, calculated, nodes, layoutMap, hGap, vGap);
        }
        startY += metric.subtreeHeight + vGap;
      });
    }

    function layoutChildrenSide(childrenMetrics, side, parentLayout, nodes, layoutMap, hGap, vGap) {
      let totalHeight = 0;
      for (let i = 0; i < childrenMetrics.length; i++) {
        totalHeight += childrenMetrics[i].subtreeHeight;
        if (i < childrenMetrics.length - 1) totalHeight += vGap;
      }
      let startY = parentLayout.y + parentLayout.height / 2 - totalHeight / 2;

      childrenMetrics.forEach(metric => {
        const node = nodes[metric.id];
        const nodeY = startY + metric.subtreeHeight / 2 - metric.height / 2;
        const nodeX = (side === 'right')
          ? parentLayout.x + parentLayout.width + hGap
          : parentLayout.x - metric.width - hGap;

        const calculated = {
          id: metric.id,
          x: nodeX,
          y: nodeY,
          width: metric.width,
          height: metric.height,
          side,
          depth: parentLayout.depth + 1,
          branchIndex: parentLayout.branchIndex,
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
      const metricsList = childIds.map(id => calculateSubTreeVerticalMetrics(id, nodes, hGap));
      let totalWidth = 0;
      for (let i = 0; i < metricsList.length; i++) {
        totalWidth += metricsList[i].subtreeWidth;
        if (i < metricsList.length - 1) totalWidth += hGap;
      }
      let startX = parentLayout.x + parentLayout.width / 2 - totalWidth / 2;

      metricsList.forEach((metric, branchIdx) => {
        const node = nodes[metric.id];
        const nodeX = startX + metric.subtreeWidth / 2 - metric.width / 2;
        const nodeY = (dir === 'bottom')
          ? parentLayout.y + parentLayout.height + rootVGap
          : parentLayout.y - metric.height - rootVGap;

        const calculated = {
          id: metric.id,
          x: nodeX,
          y: nodeY,
          width: metric.width,
          height: metric.height,
          side: dir,
          depth: parentLayout.depth + 1,
          branchIndex: branchIdx,
        };
        layoutMap.set(metric.id, calculated);

        if (!node.folded && metric.childrenLayouts.length > 0) {
          layoutChildrenVertical(metric.childrenLayouts, dir, calculated, nodes, layoutMap, hGap, vGap);
        }
        startX += metric.subtreeWidth + hGap;
      });
    }

    function layoutChildrenVertical(childrenMetrics, dir, parentLayout, nodes, layoutMap, hGap, vGap) {
      let totalWidth = 0;
      for (let i = 0; i < childrenMetrics.length; i++) {
        totalWidth += childrenMetrics[i].subtreeWidth;
        if (i < childrenMetrics.length - 1) totalWidth += hGap;
      }
      let startX = parentLayout.x + parentLayout.width / 2 - totalWidth / 2;

      childrenMetrics.forEach(metric => {
        const node = nodes[metric.id];
        const nodeX = startX + metric.subtreeWidth / 2 - metric.width / 2;
        const nodeY = (dir === 'bottom')
          ? parentLayout.y + parentLayout.height + vGap
          : parentLayout.y - metric.height - vGap;

        const calculated = {
          id: metric.id,
          x: nodeX,
          y: nodeY,
          width: metric.width,
          height: metric.height,
          side: dir,
          depth: parentLayout.depth + 1,
          branchIndex: parentLayout.branchIndex,
        };
        layoutMap.set(metric.id, calculated);

        if (!node.folded && metric.childrenLayouts.length > 0) {
          layoutChildrenVertical(metric.childrenLayouts, dir, calculated, nodes, layoutMap, hGap, vGap);
        }
        startX += metric.subtreeWidth + hGap;
      });
    }

    function layoutBranchRadial(nodeId, px, py, pw, ph, parentAngle, layoutMap, hGap, vGap) {
      const node = mapData.nodes[nodeId];
      if (!node || node.folded || !node.children || node.children.length === 0) return;
      const count = node.children.length;
      const spread = Math.PI / 2.5;
      const subDist = Math.max(140, hGap * 2.2);

      node.children.forEach((cid, idx) => {
        const angle = (count === 1)
          ? parentAngle
          : parentAngle - spread / 2 + (idx / (count - 1)) * spread;
        const size = estimateNodeSize(mapData.nodes[cid]);
        const cx = px + pw / 2 + Math.cos(angle) * subDist - size.width / 2;
        const cy = py + ph / 2 + Math.sin(angle) * subDist - size.height / 2;
        const side = Math.cos(angle) >= 0 ? 'right' : 'left';
        layoutMap.set(cid, {
          id: cid,
          x: cx,
          y: cy,
          width: size.width,
          height: size.height,
          side,
          depth: 2,
          branchIndex: idx,
        });
        layoutBranchRadial(cid, cx, cy, size.width, size.height, angle, layoutMap, hGap, vGap);
      });
    }

    function layoutBranchCircular(nodeId, radius, layoutMap, hGap) {
      const node = mapData.nodes[nodeId];
      if (!node || node.folded || !node.children || node.children.length === 0) return;
      node.children.forEach((cid, i) => {
        const count = node.children.length;
        const pLayout = layoutMap.get(nodeId);
        const pAngle = Math.atan2(pLayout.y + pLayout.height / 2, pLayout.x + pLayout.width / 2);
        const spread = Math.PI / 3;
        const angle = (count === 1) ? pAngle : pAngle - spread / 2 + (i / (count - 1)) * spread;
        const size = estimateNodeSize(mapData.nodes[cid]);
        const cx = Math.cos(angle) * radius - size.width / 2;
        const cy = Math.sin(angle) * radius - size.height / 2;
        const side = Math.cos(angle) >= 0 ? 'right' : 'left';
        layoutMap.set(cid, {
          id: cid,
          x: cx,
          y: cy,
          width: size.width,
          height: size.height,
          side,
          depth: 2,
          branchIndex: i,
        });
        layoutBranchCircular(cid, radius + 130, layoutMap, hGap);
      });
    }

    // Edge Path Generators
    function generateEdgePath(parent, child, edgeStyle) {
      let startX, startY, endX, endY;
      const isVertical = child.side === 'top' || child.side === 'bottom';

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
          const midY = (startY + endY) / 2;
          return \`M \${startX} \${startY} L \${startX} \${midY} L \${endX} \${midY} L \${endX} \${endY}\`;
        } else {
          const midX = (startX + endX) / 2;
          return \`M \${startX} \${startY} L \${midX} \${startY} L \${midX} \${endY} L \${endX} \${endY}\`;
        }
      } else if (edgeStyle === 'linear') {
        return \`M \${startX} \${startY} L \${endX} \${endY}\`;
      } else {
        // Bezier curve
        if (isVertical) {
          const dy = Math.abs(endY - startY);
          const cy1 = child.side === 'bottom' ? startY + dy * 0.45 : startY - dy * 0.45;
          const cy2 = child.side === 'bottom' ? endY - dy * 0.45 : endY + dy * 0.45;
          return \`M \${startX} \${startY} C \${startX} \${cy1}, \${endX} \${cy2}, \${endX} \${endY}\`;
        } else {
          const dx = Math.abs(endX - startX);
          const cx1 = child.side === 'right' ? startX + dx * 0.45 : startX - dx * 0.45;
          const cx2 = child.side === 'right' ? endX - dx * 0.45 : endX + dx * 0.45;
          return \`M \${startX} \${startY} C \${cx1} \${startY}, \${cx2} \${endY}, \${endX} \${endY}\`;
        }
      }
    }

    // Main Renderer
    function renderMap() {
      nodesLayer.innerHTML = '';
      edgesSvg.innerHTML = '';
      cloudsSvg.innerHTML = '';
      connectorsSvg.innerHTML = '';

      const layoutMap = computeMindMapLayout();
      const themeBranchColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#14b8a6'];
      const edgeStyle = mapData.edgeStyle || 'bezier';
      const edgeDash = mapData.edgeDash || 'solid';
      const edgeWidth = mapData.edgeWidth || 2.2;

      // 1. Render Clouds
      Object.values(mapData.nodes).forEach(node => {
        if (node.cloud && node.cloud.enabled) {
          const pLayout = layoutMap.get(node.id);
          if (!pLayout) return;

          let minX = pLayout.x;
          let maxX = pLayout.x + pLayout.width;
          let minY = pLayout.y;
          let maxY = pLayout.y + pLayout.height;

          function expandDescendants(nId) {
            const n = mapData.nodes[nId];
            if (!n || n.folded || !n.children) return;
            n.children.forEach(cid => {
              const cLayout = layoutMap.get(cid);
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

          const pad = 18;
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
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
      layoutMap.forEach((childLayout, childId) => {
        const childNode = mapData.nodes[childId];
        if (!childNode || !childNode.parentId) return;
        const parentLayout = layoutMap.get(childNode.parentId);
        if (!parentLayout) return;

        const pathData = generateEdgePath(parentLayout, childLayout, edgeStyle);
        const branchColor = childNode.borderColor || themeBranchColors[childLayout.branchIndex % themeBranchColors.length] || '#94a3b8';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
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
        mapData.connectors.forEach(conn => {
          const fromL = layoutMap.get(conn.fromId);
          const toL = layoutMap.get(conn.toId);
          if (!fromL || !toL) return;

          const sx = fromL.x + fromL.width / 2;
          const sy = fromL.y + fromL.height / 2;
          const ex = toL.x + toL.width / 2;
          const ey = toL.y + toL.height / 2;
          const dx = ex - sx;
          const dy = ey - sy;
          const curve = conn.curvature !== undefined ? conn.curvature : -50;
          const mx = (sx + ex) / 2 - (dy / 2) * (curve / 100);
          const my = (sy + ey) / 2 + (dx / 2) * (curve / 100);

          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', \`M \${sx} \${sy} Q \${mx} \${my}, \${ex} \${ey}\`);
          path.setAttribute('stroke', conn.color || '#3b82f6');
          path.setAttribute('stroke-width', String(conn.width || 2));
          path.setAttribute('fill', 'none');
          path.setAttribute('opacity', String(conn.opacity || 0.9));
          if (conn.style === 'dashed') path.setAttribute('stroke-dasharray', '6 4');
          else if (conn.style === 'dotted') path.setAttribute('stroke-dasharray', '2 3');
          connectorsSvg.appendChild(path);

          if (conn.label) {
            const textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            const textBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textEl.textContent = conn.label;
            textEl.setAttribute('x', String(mx));
            textEl.setAttribute('y', String(my + 4));
            textEl.setAttribute('font-size', '11');
            textEl.setAttribute('font-weight', '600');
            textEl.setAttribute('fill', '#1e293b');
            textEl.setAttribute('text-anchor', 'middle');
            
            const w = conn.label.length * 6.5 + 16;
            textBg.setAttribute('x', String(mx - w / 2));
            textBg.setAttribute('y', String(my - 10));
            textBg.setAttribute('width', String(w));
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
      layoutMap.forEach((layout, id) => {
        const node = mapData.nodes[id];
        if (!node) return;

        const isRoot = !node.parentId;
        const div = document.createElement('div');
        const shape = node.shape || 'bubble';
        div.className = \`node-element shape-\${shape} \${isRoot ? 'node-root' : ''}\`;
        div.id = \`node-\${id}\`;
        div.style.left = \`\${layout.x}px\`;
        div.style.top = \`\${layout.y}px\`;
        div.style.width = \`\${layout.width}px\`;
        div.style.height = \`\${layout.height}px\`;

        // Background
        if (node.bgType === 'transparent') {
          div.style.background = 'transparent';
        } else if (node.bgType === 'gradient') {
          const c1 = node.gradientColor1 || node.color || '#3b82f6';
          const c2 = node.gradientColor2 || '#8b5cf6';
          div.style.background = \`linear-gradient(135deg, \${c1}, \${c2})\`;
        } else {
          div.style.backgroundColor = node.color || (isRoot ? '#2563eb' : '#ffffff');
        }

        // Borders
        div.style.borderColor = node.borderColor || (isRoot ? '#1d4ed8' : '#cbd5e1');
        div.style.borderWidth = \`\${node.borderWidth !== undefined ? node.borderWidth : (isRoot ? 2 : 1.5)}px\`;
        div.style.borderStyle = node.borderDash || node.borderStyle || 'solid';

        // Content Wrapper
        const wrap = document.createElement('div');
        wrap.className = 'node-content-wrap';

        // Top Image
        if (node.imageUrl && (node.imagePosition === 'top' || !node.imagePosition)) {
          const imgWrap = document.createElement('div');
          imgWrap.className = 'node-image-wrap';
          const img = document.createElement('img');
          img.src = node.imageUrl;
          img.className = 'node-image';
          if (node.imageWidth) img.style.width = \`\${node.imageWidth}px\`;
          imgWrap.appendChild(img);
          wrap.appendChild(imgWrap);
        }

        // Header Row (Icons + Title + Action Badges)
        const headerRow = document.createElement('div');
        headerRow.className = 'node-header-row';

        // Left Image
        if (node.imageUrl && node.imagePosition === 'left') {
          const img = document.createElement('img');
          img.src = node.imageUrl;
          img.className = 'node-image';
          img.style.width = \`\${node.imageWidth || 40}px\`;
          img.style.marginRight = '6px';
          headerRow.appendChild(img);
        }

        // Icons
        if (node.icons && node.icons.length > 0) {
          const iconsContainer = document.createElement('div');
          iconsContainer.className = 'node-icons';
          node.icons.forEach(ic => {
            const span = document.createElement('span');
            span.className = 'node-icon-item';
            span.innerHTML = getSvgIcon(ic);
            iconsContainer.appendChild(span);
          });
          headerRow.appendChild(iconsContainer);
        }

        // Title Text
        const titleEl = document.createElement('div');
        titleEl.className = 'node-title-text';
        titleEl.innerHTML = formatTextWithLinks(node.text || '');
        titleEl.style.fontSize = \`\${node.fontSize || (isRoot ? 16 : 14)}px\`;
        titleEl.style.color = node.textColor || (isRoot ? '#ffffff' : '#1e293b');
        if (node.bold) titleEl.style.fontWeight = '700';
        if (node.italic) titleEl.style.fontStyle = 'italic';
        if (node.textAlign) titleEl.style.textAlign = node.textAlign;
        headerRow.appendChild(titleEl);

        // Right Image
        if (node.imageUrl && node.imagePosition === 'right') {
          const img = document.createElement('img');
          img.src = node.imageUrl;
          img.className = 'node-image';
          img.style.width = \`\${node.imageWidth || 40}px\`;
          img.style.marginLeft = '6px';
          headerRow.appendChild(img);
        }

        // Note Indicator Button in Header
        if (node.note) {
          const noteBtn = document.createElement('span');
          noteBtn.className = 'node-note-btn';
          noteBtn.innerHTML = '📝';
          noteBtn.title = 'Ver nota';
          noteBtn.onclick = (e) => {
            e.stopPropagation();
            openNoteDrawer(node.text, node.note);
          };
          headerRow.appendChild(noteBtn);
        }

        wrap.appendChild(headerRow);

        // Between Image
        if (node.imageUrl && node.imagePosition === 'between') {
          const imgWrap = document.createElement('div');
          imgWrap.className = 'node-image-wrap';
          const img = document.createElement('img');
          img.src = node.imageUrl;
          img.className = 'node-image';
          if (node.imageWidth) img.style.width = \`\${node.imageWidth}px\`;
          imgWrap.appendChild(img);
          wrap.appendChild(imgWrap);
        }

        // Body Text
        if (node.body && node.body.trim().length > 0) {
          const bodyEl = document.createElement('div');
          bodyEl.className = 'node-body-text';
          bodyEl.innerHTML = formatTextWithLinks(node.body);
          bodyEl.style.fontSize = \`\${node.bodyFontSize || (isRoot ? 13 : 11.5)}px\`;
          bodyEl.style.color = node.bodyColor || (isRoot ? '#e2e8f0' : '#475569');
          if (node.bodyBold) bodyEl.style.fontWeight = '700';
          if (node.bodyItalic) bodyEl.style.fontStyle = 'italic';
          if (node.bodyAlign) bodyEl.style.textAlign = node.bodyAlign;
          wrap.appendChild(bodyEl);
        }

        // Bottom Image
        if (node.imageUrl && node.imagePosition === 'bottom') {
          const imgWrap = document.createElement('div');
          imgWrap.className = 'node-image-wrap';
          const img = document.createElement('img');
          img.src = node.imageUrl;
          img.className = 'node-image';
          if (node.imageWidth) img.style.width = \`\${node.imageWidth}px\`;
          imgWrap.appendChild(img);
          wrap.appendChild(imgWrap);
        }

        // Dedicated Prominent Link Badge
        if (node.link && node.link.trim().length > 0) {
          const linkBadge = document.createElement('a');
          linkBadge.className = 'node-link-badge';
          linkBadge.href = node.link;
          linkBadge.target = '_blank';
          linkBadge.rel = 'noopener noreferrer';
          linkBadge.title = \`Abrir enlace: \${node.link}\`;
          linkBadge.onclick = (e) => e.stopPropagation();

          const cleanDisplayUrl = node.link.replace(/^https?:\\/\\//, '').replace(/^www\\./, '').replace(/\\/$/, '');
          linkBadge.innerHTML = \`
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span style="overflow:hidden; text-overflow:ellipsis; max-width:180px;">\${cleanDisplayUrl}</span>
          \`;
          wrap.appendChild(linkBadge);
        }

        // Progress Bar
        if (node.progress !== undefined) {
          const progWrap = document.createElement('div');
          progWrap.className = 'node-progress-wrap';
          const bg = document.createElement('div');
          bg.className = 'progress-bar-bg';
          const fill = document.createElement('div');
          fill.className = 'progress-bar-fill';
          fill.style.width = \`\${node.progress}%\`;
          bg.appendChild(fill);
          const txt = document.createElement('span');
          txt.className = 'progress-bar-text';
          txt.textContent = \`\${node.progress}%\`;
          progWrap.appendChild(bg);
          progWrap.appendChild(txt);
          wrap.appendChild(progWrap);
        }

        // Tags
        if (node.tags && node.tags.length > 0) {
          const tagsWrap = document.createElement('div');
          tagsWrap.className = 'node-tags-wrap';
          node.tags.forEach(t => {
            const tSpan = document.createElement('span');
            tSpan.className = 'tag-badge';
            tSpan.textContent = '#' + t;
            tagsWrap.appendChild(tSpan);
          });
          wrap.appendChild(tagsWrap);
        }

        div.appendChild(wrap);

        // Search Match Highlight
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          if ((node.text && node.text.toLowerCase().includes(q)) ||
              (node.body && node.body.toLowerCase().includes(q)) ||
              (node.link && node.link.toLowerCase().includes(q)) ||
              (node.tags && node.tags.some(t => t.toLowerCase().includes(q)))) {
            div.classList.add('search-match');
          }
        }

        nodesLayer.appendChild(div);

        // Fold/Unfold Button
        if (node.children && node.children.length > 0 && !isRoot) {
          const foldBtn = document.createElement('div');
          foldBtn.className = 'fold-btn';
          foldBtn.textContent = node.folded ? '+' : '−';
          const isVert = layout.side === 'top' || layout.side === 'bottom';
          if (isVert) {
            foldBtn.style.left = \`\${layout.x + layout.width / 2 - 10}px\`;
            foldBtn.style.top = (layout.side === 'bottom')
              ? \`\${layout.y + layout.height - 10}px\`
              : \`\${layout.y - 10}px\`;
          } else {
            foldBtn.style.top = \`\${layout.y + layout.height / 2 - 10}px\`;
            foldBtn.style.left = (layout.side === 'left')
              ? \`\${layout.x - 10}px\`
              : \`\${layout.x + layout.width - 10}px\`;
          }
          foldBtn.onclick = (e) => {
            e.stopPropagation();
            toggleFold(id);
          };
          nodesLayer.appendChild(foldBtn);
        }
      });
    }

    // Viewport & Pan/Zoom
    function updateTransform() {
      viewport.style.transform = \`translate(\${panX}px, \${panY}px) scale(\${zoom})\`;
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
      const layoutMap = computeMindMapLayout();
      if (layoutMap.size === 0) return;

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      layoutMap.forEach(l => {
        minX = Math.min(minX, l.x);
        maxX = Math.max(maxX, l.x + l.width);
        minY = Math.min(minY, l.y);
        maxY = Math.max(maxY, l.y + l.height);
      });

      const mapWidth = maxX - minX + 120;
      const mapHeight = maxY - minY + 120;
      const scaleX = (window.innerWidth - 60) / mapWidth;
      const scaleY = (window.innerHeight - 100) / mapHeight;
      zoom = Math.max(0.2, Math.min(1.2, Math.min(scaleX, scaleY)));

      panX = window.innerWidth / 2 - ((minX + maxX) / 2) * zoom;
      panY = window.innerHeight / 2 - ((minY + maxY) / 2) * zoom;
      updateTransform();
    }

    // Interaction Listeners
    container.addEventListener('mousedown', (e) => {
      if (e.target.closest('.node-element') || e.target.closest('.fold-btn') || e.target.closest('a')) return;
      isDragging = true;
      startX = e.clientX - panX;
      startY = e.clientY - panY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      panX = e.clientX - startX;
      panY = e.clientY - startY;
      updateTransform();
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const newZoom = Math.max(0.15, Math.min(3.0, zoom * zoomFactor));
      panX = mouseX - (mouseX - panX) * (newZoom / zoom);
      panY = mouseY - (mouseY - panY) * (newZoom / zoom);
      zoom = newZoom;
      updateTransform();
    }, { passive: false });

    // Touch Support (Pinch to Zoom & Pan)
    let initialTouchDistance = null;
    let initialTouchZoom = zoom;

    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX - panX;
        startY = e.touches[0].clientY - panY;
      } else if (e.touches.length === 2) {
        isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialTouchDistance = Math.hypot(dx, dy);
        initialTouchZoom = zoom;
      }
    });

    container.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length === 1 && isDragging) {
        panX = e.touches[0].clientX - startX;
        panY = e.touches[0].clientY - startY;
        updateTransform();
      } else if (e.touches.length === 2 && initialTouchDistance) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.hypot(dx, dy);
        zoom = Math.max(0.15, Math.min(3.0, initialTouchZoom * (distance / initialTouchDistance)));
        updateTransform();
      }
    }, { passive: false });

    container.addEventListener('touchend', () => {
      isDragging = false;
      initialTouchDistance = null;
    });

    // Fold / Unfold
    function toggleFold(nodeId) {
      if (mapData.nodes[nodeId]) {
        mapData.nodes[nodeId].folded = !mapData.nodes[nodeId].folded;
        renderMap();
      }
    }

    function toggleFoldAll() {
      isAllFolded = !isAllFolded;
      Object.keys(mapData.nodes).forEach(id => {
        if (id !== mapData.rootId) {
          mapData.nodes[id].folded = isAllFolded;
        }
      });
      document.getElementById('btn-fold-toggle').textContent = isAllFolded ? 'Desplegar Todo' : 'Plegar Todo';
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
      document.getElementById('note-body').textContent = note || '';
      document.getElementById('note-drawer').classList.add('open');
    }

    function closeNoteDrawer() {
      document.getElementById('note-drawer').classList.remove('open');
    }

    // Export PNG
    function exportCanvasPng() {
      window.print();
    }

    // Init
    renderMap();
    fitToScreen();
  </script>
</body>
</html>`;
}
