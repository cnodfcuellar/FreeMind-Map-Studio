import os

SVG_PATH = r"C:\Users\admin\.gemini\antigravity\brain\e14d73aa-b7b2-4a1d-9994-dc393facce6c\propuesta_alternativas_ui.svg"
HTML_PATH = r"C:\Users\admin\.gemini\antigravity\brain\e14d73aa-b7b2-4a1d-9994-dc393facce6c\visor_alternativas_ui.html"

svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="100%" height="100%">
  <defs>
    <!-- Gradiente de fondo general -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>

    <!-- Tarjetas de fondo -->
    <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e293b" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.9" />
    </linearGradient>

    <linearGradient id="cardGradAlt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e293b" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#131c2e" stop-opacity="0.95" />
    </linearGradient>

    <!-- Sombras -->
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.5" />
    </filter>
    <filter id="glowBlue" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#38bdf8" flood-opacity="0.6" />
    </filter>
    <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#ef4444" flood-opacity="0.5" />
    </filter>
    <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#10b981" flood-opacity="0.6" />
    </filter>

    <!-- Patrón de rejilla sutil de fondo -->
    <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="15" cy="15" r="1" fill="#334155" fill-opacity="0.3" />
    </pattern>
  </defs>

  <!-- Fondo base -->
  <rect width="1200" height="900" fill="url(#bgGrad)" />
  <rect width="1200" height="900" fill="url(#gridPattern)" />

  <!-- ========================================== -->
  <!-- HEADER PRINCIPAL -->
  <!-- ========================================== -->
  <g transform="translate(60, 40)">
    <rect x="0" y="0" width="1080" height="85" rx="14" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.2" filter="url(#cardShadow)" />
    
    <!-- Icono Header -->
    <rect x="20" y="18" width="48" height="48" rx="12" fill="#2563eb" fill-opacity="0.2" stroke="#3b82f6" stroke-width="1.5" />
    <path d="M 36 30 L 52 30 M 44 26 L 44 42 M 34 46 L 54 46" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" />

    <text x="82" y="38" fill="#f8fafc" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700">
      Diagnóstico Visual de Inconsistencias &amp; Alternativas de Solución
    </text>
    <text x="82" y="58" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="13">
      FreeMind Map Studio · Comparativa UI: Botones truncados, patrones de ColorPicker y badges de cabeceras
    </text>

    <!-- Badges de estado en header -->
    <rect x="910" y="24" width="145" height="36" rx="18" fill="#1e1b4b" stroke="#6366f1" stroke-width="1" />
    <circle cx="928" cy="42" r="4.5" fill="#a855f7" />
    <text x="940" y="46" fill="#c084fc" font-family="system-ui, sans-serif" font-size="11.5" font-weight="600">UI / UX Review</text>
  </g>

  <!-- ========================================================================= -->
  <!-- CASO 1: TRUNCAMIENTO DE BOTÓN ("Degra...") -->
  <!-- ========================================================================= -->
  <g transform="translate(60, 150)">
    <!-- Marco contenedor -->
    <rect x="0" y="0" width="1080" height="210" rx="14" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.2" filter="url(#cardShadow)" />

    <!-- Título de Caso 1 -->
    <rect x="18" y="16" width="30" height="30" rx="8" fill="#ef4444" fill-opacity="0.15" stroke="#ef4444" stroke-width="1.2" />
    <text x="28" y="36" fill="#f87171" font-family="system-ui, sans-serif" font-size="15" font-weight="700">1</text>
    <text x="58" y="32" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="16" font-weight="700">
      Truncamiento de Texto en Botón de Fondo (`Degra...`)
    </text>
    <text x="58" y="49" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">
      El grid de 5 columnas en panel estrecho (~270px) activa truncate sobre "Degradado", mientras otros tienen texto entero o abreviado ad-hoc.
    </text>

    <!-- Tarjeta ANTES (Problema) -->
    <g transform="translate(24, 70)">
      <rect x="0" y="0" width="320" height="120" rx="10" fill="#0f172a" stroke="#ef4444" stroke-width="1.4" stroke-dasharray="4 2" />
      <rect x="12" y="-10" width="120" height="20" rx="4" fill="#7f1d1d" />
      <text x="20" y="4" fill="#fecaca" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700">❌ ACTUAL (Error)</text>

      <!-- Fila de 5 botones reales -->
      <g transform="translate(14, 25)">
        <!-- Sólido -->
        <rect x="0" y="0" width="54" height="60" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5" />
        <rect x="18" y="8" width="18" height="18" rx="4" fill="#3b82f6" />
        <text x="27" y="42" fill="#1d4ed8" font-family="system-ui, sans-serif" font-size="9.5" font-weight="700" text-anchor="middle">Sólido</text>

        <!-- Degra... (con aviso rojo de truncamiento) -->
        <rect x="58" y="0" width="54" height="60" rx="8" fill="#ffffff" stroke="#ef4444" stroke-width="2" />
        <rect x="76" y="8" width="18" height="18" rx="4" fill="#8b5cf6" />
        <text x="85" y="42" fill="#ef4444" font-family="system-ui, sans-serif" font-size="9" font-weight="800" text-anchor="middle">Degra...</text>
        <circle cx="106" cy="10" r="5" fill="#ef4444" filter="url(#glowRed)" />
        <text x="106" y="13" fill="#ffffff" font-size="8" font-weight="bold" text-anchor="middle">!</text>

        <!-- Trama -->
        <rect x="116" y="0" width="54" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
        <circle cx="143" cy="17" r="7" fill="none" stroke="#64748b" stroke-width="1.5" />
        <text x="143" y="42" fill="#64748b" font-family="system-ui, sans-serif" font-size="9.5" text-anchor="middle">Trama</text>

        <!-- Imagen -->
        <rect x="174" y="0" width="54" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
        <rect x="193" y="10" width="16" height="14" rx="2" fill="none" stroke="#64748b" stroke-width="1.5" />
        <text x="201" y="42" fill="#64748b" font-family="system-ui, sans-serif" font-size="9.5" text-anchor="middle">Imagen</text>

        <!-- Transp. -->
        <rect x="232" y="0" width="54" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
        <rect x="251" y="10" width="16" height="14" rx="2" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="2 2" />
        <text x="259" y="42" fill="#64748b" font-family="system-ui, sans-serif" font-size="9.5" text-anchor="middle">Transp.</text>
      </g>
      <text x="15" y="105" fill="#f87171" font-family="system-ui, sans-serif" font-size="10">Elipsis corta la palabra: "Degra..."</text>
    </g>

    <!-- Flecha comparativa -->
    <g transform="translate(365, 125)">
      <path d="M 0 0 L 18 0 M 12 -6 L 18 0 L 12 6" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </g>

    <!-- Tarjeta ALTERNATIVA A (Recomendada: "Gradiente") -->
    <g transform="translate(400, 70)">
      <rect x="0" y="0" width="315" height="120" rx="10" fill="#0f172a" stroke="#10b981" stroke-width="1.5" />
      <rect x="12" y="-10" width="165" height="20" rx="4" fill="#064e3b" />
      <text x="20" y="4" fill="#6ee7b7" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700">✅ ALTERNATIVA A (Ideal)</text>

      <!-- Fila con "Gradiente" -->
      <g transform="translate(12, 25)">
        <rect x="0" y="0" width="54" height="60" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5" />
        <rect x="18" y="8" width="18" height="18" rx="4" fill="#3b82f6" />
        <text x="27" y="42" fill="#1d4ed8" font-family="system-ui, sans-serif" font-size="9.5" font-weight="700" text-anchor="middle">Sólido</text>

        <!-- Gradiente perfecto sin corte -->
        <rect x="58" y="0" width="54" height="60" rx="8" fill="#faf5ff" stroke="#a855f7" stroke-width="1.5" />
        <rect x="76" y="8" width="18" height="18" rx="4" fill="url(#bgGrad)" stroke="#a855f7" stroke-width="1" />
        <text x="85" y="42" fill="#9333ea" font-family="system-ui, sans-serif" font-size="9" font-weight="700" text-anchor="middle">Gradiente</text>

        <!-- Trama -->
        <rect x="116" y="0" width="54" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
        <circle cx="143" cy="17" r="7" fill="none" stroke="#64748b" stroke-width="1.5" />
        <text x="143" y="42" fill="#64748b" font-family="system-ui, sans-serif" font-size="9.5" text-anchor="middle">Trama</text>

        <!-- Imagen -->
        <rect x="174" y="0" width="54" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
        <rect x="193" y="10" width="16" height="14" rx="2" fill="none" stroke="#64748b" stroke-width="1.5" />
        <text x="201" y="42" fill="#64748b" font-family="system-ui, sans-serif" font-size="9.5" text-anchor="middle">Imagen</text>

        <!-- Transp -->
        <rect x="232" y="0" width="54" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
        <rect x="251" y="10" width="16" height="14" rx="2" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="2 2" />
        <text x="259" y="42" fill="#64748b" font-family="system-ui, sans-serif" font-size="9.5" text-anchor="middle">Transp.</text>
      </g>
      <text x="15" y="105" fill="#34d399" font-family="system-ui, sans-serif" font-size="10">Palabra "Gradiente" cabe 100% íntegra sin cortes</text>
    </g>

    <!-- Tarjeta ALTERNATIVA B (2 líneas centradas) -->
    <g transform="translate(735, 70)">
      <rect x="0" y="0" width="320" height="120" rx="10" fill="#0f172a" stroke="#38bdf8" stroke-width="1.2" />
      <rect x="12" y="-10" width="160" height="20" rx="4" fill="#0c4a6e" />
      <text x="20" y="4" fill="#7dd3fc" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700">ℹ️ ALTERNATIVA B (2 Líneas)</text>

      <g transform="translate(14, 25)">
        <rect x="0" y="0" width="54" height="60" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5" />
        <rect x="18" y="8" width="18" height="18" rx="4" fill="#3b82f6" />
        <text x="27" y="42" fill="#1d4ed8" font-family="system-ui, sans-serif" font-size="9.5" font-weight="700" text-anchor="middle">Sólido</text>

        <!-- 2 líneas: Degra- / dado -->
        <rect x="58" y="0" width="54" height="60" rx="8" fill="#faf5ff" stroke="#a855f7" stroke-width="1.5" />
        <rect x="76" y="6" width="18" height="16" rx="4" fill="#8b5cf6" />
        <text x="85" y="38" fill="#9333ea" font-family="system-ui, sans-serif" font-size="8.5" font-weight="700" text-anchor="middle">Degra-</text>
        <text x="85" y="48" fill="#9333ea" font-family="system-ui, sans-serif" font-size="8.5" font-weight="700" text-anchor="middle">dado</text>

        <rect x="116" y="0" width="54" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
        <circle cx="143" cy="17" r="7" fill="none" stroke="#64748b" stroke-width="1.5" />
        <text x="143" y="42" fill="#64748b" font-family="system-ui, sans-serif" font-size="9.5" text-anchor="middle">Trama</text>

        <rect x="174" y="0" width="54" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
        <rect x="193" y="10" width="16" height="14" rx="2" fill="none" stroke="#64748b" stroke-width="1.5" />
        <text x="201" y="42" fill="#64748b" font-family="system-ui, sans-serif" font-size="9.5" text-anchor="middle">Imagen</text>

        <rect x="232" y="0" width="54" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
        <rect x="251" y="10" width="16" height="14" rx="2" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="2 2" />
        <text x="259" y="42" fill="#64748b" font-family="system-ui, sans-serif" font-size="9.5" text-anchor="middle">Transp.</text>
      </g>
      <text x="15" y="105" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="10">Mantiene el término en 2 renglones sin elipsis</text>
    </g>
  </g>

  <!-- ========================================================================= -->
  <!-- CASO 2: INCONSISTENCIA EN BADGES DE CABECERA (CollapsibleSection) -->
  <!-- ========================================================================= -->
  <g transform="translate(60, 380)">
    <rect x="0" y="0" width="1080" height="210" rx="14" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.2" filter="url(#cardShadow)" />

    <!-- Título de Caso 2 -->
    <rect x="18" y="16" width="30" height="30" rx="8" fill="#f59e0b" fill-opacity="0.15" stroke="#f59e0b" stroke-width="1.2" />
    <text x="28" y="36" fill="#fbbf24" font-family="system-ui, sans-serif" font-size="15" font-weight="700">2</text>
    <text x="58" y="32" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="16" font-weight="700">
      Badges de Color en Cabeceras de Acordeón (`CollapsibleSection`)
    </text>
    <text x="58" y="49" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">
      "Color y Tamaño de Iconos" muestra un circulito con el color activo junto al chevron, pero "Fondo y Relleno" y "Bordes" están vacíos.
    </text>

    <!-- ANTES (Inconsistente) -->
    <g transform="translate(24, 70)">
      <rect x="0" y="0" width="490" height="120" rx="10" fill="#0f172a" stroke="#ef4444" stroke-width="1.4" stroke-dasharray="4 2" />
      <rect x="12" y="-10" width="140" height="20" rx="4" fill="#7f1d1d" />
      <text x="20" y="4" fill="#fecaca" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700">❌ ACTUAL (Inconsistente)</text>

      <!-- Header Iconos (con dot) -->
      <g transform="translate(15, 20)">
        <rect x="0" y="0" width="460" height="38" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
        <rect x="8" y="6" width="26" height="26" rx="6" fill="#eff6ff" />
        <circle cx="21" cy="19" r="6" fill="#3b82f6" />
        <text x="42" y="18" fill="#1e293b" font-family="system-ui, sans-serif" font-size="11" font-weight="700">Color y Tamaño de Iconos</text>
        <text x="42" y="30" fill="#64748b" font-family="system-ui, sans-serif" font-size="9">Personalizar tinte, escala...</text>
        <!-- Badge Presente -->
        <circle cx="410" cy="19" r="7" fill="#93c5fd" stroke="#cbd5e1" stroke-width="1" />
        <path d="M 436 17 L 441 22 L 446 17" fill="none" stroke="#64748b" stroke-width="1.5" />
      </g>

      <!-- Header Fondo (SIN dot) -->
      <g transform="translate(15, 66)">
        <rect x="0" y="0" width="460" height="38" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
        <rect x="8" y="6" width="26" height="26" rx="6" fill="#eff6ff" />
        <path d="M 16 23 L 26 13 L 23 10 L 13 20 Z" fill="#2563eb" />
        <text x="42" y="18" fill="#1e293b" font-family="system-ui, sans-serif" font-size="11" font-weight="700">Fondo y Relleno</text>
        <text x="42" y="30" fill="#64748b" font-family="system-ui, sans-serif" font-size="9">Color, degradado, trama o imagen</text>
        <!-- Falta el badge (círculo rojo punteado) -->
        <circle cx="410" cy="19" r="8" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="2 2" />
        <text x="410" y="22" fill="#ef4444" font-size="8" font-weight="bold" text-anchor="middle">✕</text>
        <path d="M 436 17 L 441 22 L 446 17" fill="none" stroke="#64748b" stroke-width="1.5" />
      </g>
    </g>

    <!-- Flecha comparativa -->
    <g transform="translate(530, 125)">
      <path d="M 0 0 L 18 0 M 12 -6 L 18 0 L 12 6" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </g>

    <!-- DESPUÉS (Unificado) -->
    <g transform="translate(565, 70)">
      <rect x="0" y="0" width="490" height="120" rx="10" fill="#0f172a" stroke="#10b981" stroke-width="1.5" />
      <rect x="12" y="-10" width="160" height="20" rx="4" fill="#064e3b" />
      <text x="20" y="4" fill="#6ee7b7" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700">✅ PROPUESTA (Homogénea)</text>

      <!-- Header Iconos (con dot) -->
      <g transform="translate(15, 20)">
        <rect x="0" y="0" width="460" height="38" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
        <rect x="8" y="6" width="26" height="26" rx="6" fill="#eff6ff" />
        <circle cx="21" cy="19" r="6" fill="#3b82f6" />
        <text x="42" y="18" fill="#1e293b" font-family="system-ui, sans-serif" font-size="11" font-weight="700">Color y Tamaño de Iconos</text>
        <text x="42" y="30" fill="#64748b" font-family="system-ui, sans-serif" font-size="9">Personalizar tinte, escala...</text>
        <circle cx="410" cy="19" r="7" fill="#93c5fd" stroke="#94a3b8" stroke-width="1" />
        <path d="M 436 17 L 441 22 L 446 17" fill="none" stroke="#64748b" stroke-width="1.5" />
      </g>

      <!-- Header Fondo (CON dot activo #1D4ED8) -->
      <g transform="translate(15, 66)">
        <rect x="0" y="0" width="460" height="38" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
        <rect x="8" y="6" width="26" height="26" rx="6" fill="#eff6ff" />
        <path d="M 16 23 L 26 13 L 23 10 L 13 20 Z" fill="#2563eb" />
        <text x="42" y="18" fill="#1e293b" font-family="system-ui, sans-serif" font-size="11" font-weight="700">Fondo y Relleno</text>
        <text x="42" y="30" fill="#64748b" font-family="system-ui, sans-serif" font-size="9">Color, degradado, trama o imagen</text>
        <!-- Badge Presente y Consistente -->
        <circle cx="410" cy="19" r="7" fill="#1d4ed8" stroke="#3b82f6" stroke-width="1.5" filter="url(#glowBlue)" />
        <path d="M 436 17 L 441 22 L 446 17" fill="none" stroke="#64748b" stroke-width="1.5" />
      </g>
    </g>
  </g>

  <!-- ========================================================================= -->
  <!-- CASO 3: SELECTOR DE COLOR EN BARRA DE TEXTO (Popover vs Inline) -->
  <!-- ========================================================================= -->
  <g transform="translate(60, 610)">
    <rect x="0" y="0" width="1080" height="260" rx="14" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.2" filter="url(#cardShadow)" />

    <!-- Título de Caso 3 -->
    <rect x="18" y="16" width="30" height="30" rx="8" fill="#3b82f6" fill-opacity="0.15" stroke="#3b82f6" stroke-width="1.2" />
    <text x="28" y="36" fill="#60a5fa" font-family="system-ui, sans-serif" font-size="15" font-weight="700">3</text>
    <text x="58" y="32" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="16" font-weight="700">
      Patrón de Color: Barra de Texto (`CompactTextToolbar`) vs. `ColorPicker` Estándar
    </text>
    <text x="58" y="49" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">
      En texto el botón de color cae a una segunda fila y abre un popover que duplica labels, inputs y añade una X redundante.
    </text>

    <!-- Tarjeta ANTES (Popover redundante) -->
    <g transform="translate(24, 70)">
      <rect x="0" y="0" width="490" height="170" rx="10" fill="#0f172a" stroke="#ef4444" stroke-width="1.4" stroke-dasharray="4 2" />
      <rect x="12" y="-10" width="160" height="20" rx="4" fill="#7f1d1d" />
      <text x="20" y="4" fill="#fecaca" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700">❌ ACTUAL (Duplicado)</text>

      <!-- Fila 1: [B I] [Align] [- 18px +] -->
      <g transform="translate(14, 20)">
        <rect x="0" y="0" width="48" height="28" rx="6" fill="#ffffff" stroke="#cbd5e1" />
        <text x="12" y="18" fill="#2563eb" font-family="sans-serif" font-size="12" font-weight="bold">B</text>
        <text x="32" y="18" fill="#64748b" font-family="sans-serif" font-size="12" font-style="italic">I</text>

        <rect x="54" y="0" width="70" height="28" rx="6" fill="#ffffff" stroke="#cbd5e1" />
        <text x="89" y="18" fill="#64748b" font-family="sans-serif" font-size="10" text-anchor="middle">≡ ☵ ≡</text>

        <rect x="130" y="0" width="95" height="28" rx="6" fill="#ffffff" stroke="#cbd5e1" />
        <text x="177" y="18" fill="#2563eb" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">- 18px + ⟲</text>
      </g>

      <!-- Fila 2 (Salto huérfano): [ (O) #FFFFFF ^ ] -->
      <g transform="translate(14, 56)">
        <rect x="0" y="0" width="96" height="26" rx="6" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5" />
        <circle cx="14" cy="13" r="5" fill="#ffffff" stroke="#cbd5e1" />
        <text x="48" y="17" fill="#1e293b" font-family="monospace" font-size="9" font-weight="bold">#FFFFFF</text>
        <text x="84" y="17" fill="#3b82f6" font-size="10">▲</text>
      </g>

      <!-- Popover redundante desplegado abajo -->
      <g transform="translate(14, 90)">
        <rect x="0" y="0" width="460" height="66" rx="8" fill="#ffffff" stroke="#3b82f6" stroke-width="1.2" />
        <text x="12" y="18" fill="#1e293b" font-family="system-ui, sans-serif" font-size="10" font-weight="700">Color del Título (Repetido)</text>
        <!-- Input duplicado -->
        <rect x="270" y="6" width="70" height="18" rx="3" fill="#f8fafc" stroke="#cbd5e1" />
        <rect x="274" y="8" width="10" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" />
        <text x="306" y="19" fill="#64748b" font-family="monospace" font-size="8.5">#FFFFFF</text>
        <text x="350" y="19" fill="#94a3b8" font-size="9">Reset</text>
        <text x="382" y="19" fill="#ef4444" font-size="11" font-weight="bold">✕</text>

        <!-- 16 swatches -->
        <g transform="translate(12, 30)">
          <rect x="0" y="0" width="20" height="14" rx="2" fill="#ffffff" stroke="#3b82f6" stroke-width="1.5" />
          <rect x="25" y="0" width="20" height="14" rx="2" fill="#eff6ff" />
          <rect x="50" y="0" width="20" height="14" rx="2" fill="#2563eb" />
          <rect x="75" y="0" width="20" height="14" rx="2" fill="#059669" />
          <rect x="100" y="0" width="20" height="14" rx="2" fill="#d97706" />
          <rect x="125" y="0" width="20" height="14" rx="2" fill="#dc2626" />
          <rect x="150" y="0" width="20" height="14" rx="2" fill="#7c3aed" />
          <rect x="175" y="0" width="20" height="14" rx="2" fill="#0f172a" />
        </g>
      </g>
    </g>

    <!-- Flecha comparativa -->
    <g transform="translate(530, 150)">
      <path d="M 0 0 L 18 0 M 12 -6 L 18 0 L 12 6" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </g>

    <!-- Tarjeta DESPUÉS (Alternativa Unificada) -->
    <g transform="translate(565, 70)">
      <rect x="0" y="0" width="490" height="170" rx="10" fill="#0f172a" stroke="#10b981" stroke-width="1.5" />
      <rect x="12" y="-10" width="180" height="20" rx="4" fill="#064e3b" />
      <text x="20" y="4" fill="#6ee7b7" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700">✅ SOLUCIÓN RECOMENDADA</text>

      <!-- Barra de herramientas 100% en 1 sola fila continua -->
      <g transform="translate(14, 20)">
        <rect x="0" y="0" width="44" height="28" rx="6" fill="#ffffff" stroke="#cbd5e1" />
        <text x="11" y="18" fill="#2563eb" font-family="sans-serif" font-size="12" font-weight="bold">B</text>
        <text x="28" y="18" fill="#64748b" font-family="sans-serif" font-size="12" font-style="italic">I</text>

        <rect x="50" y="0" width="68" height="28" rx="6" fill="#ffffff" stroke="#cbd5e1" />
        <text x="84" y="18" fill="#64748b" font-family="sans-serif" font-size="10" text-anchor="middle">≡ ☵ ≡</text>

        <rect x="124" y="0" width="88" height="28" rx="6" fill="#ffffff" stroke="#cbd5e1" />
        <text x="168" y="18" fill="#2563eb" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">- 18px +</text>

        <!-- Botón de color integrado en la MISMA fila (sin descolgarse) -->
        <rect x="218" y="0" width="86" height="28" rx="6" fill="#ffffff" stroke="#3b82f6" stroke-width="1.2" />
        <circle cx="230" cy="14" r="5.5" fill="#ffffff" stroke="#94a3b8" />
        <text x="258" y="18" fill="#1e293b" font-family="monospace" font-size="9.5" font-weight="bold">#FFF</text>
        <text x="292" y="18" fill="#3b82f6" font-size="9">▼</text>
      </g>

      <!-- Panel de color directo, limpio y sin títulos redundantes -->
      <g transform="translate(14, 60)">
        <rect x="0" y="0" width="460" height="95" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
        
        <text x="14" y="22" fill="#334155" font-family="system-ui, sans-serif" font-size="11" font-weight="700">Paleta de Título</text>
        
        <!-- Input Hex nativo directo alineado -->
        <g transform="translate(340, 10)">
          <rect x="0" y="0" width="62" height="20" rx="4" fill="#f8fafc" stroke="#cbd5e1" />
          <rect x="4" y="3" width="14" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" />
          <text x="24" y="14" fill="#475569" font-family="monospace" font-size="9">#FFFFFF</text>
          <text x="70" y="14" fill="#94a3b8" font-size="9.5">Reset</text>
        </g>

        <!-- Grilla de 16 colores idéntica a ColorPicker estándar -->
        <g transform="translate(14, 38)">
          <!-- Fila 1 claros -->
          <rect x="0" y="0" width="22" height="20" rx="3" fill="#ffffff" stroke="#3b82f6" stroke-width="2" />
          <rect x="28" y="0" width="22" height="20" rx="3" fill="#f8fafc" stroke="#cbd5e1" />
          <rect x="56" y="0" width="22" height="20" rx="3" fill="#eff6ff" stroke="#cbd5e1" />
          <rect x="84" y="0" width="22" height="20" rx="3" fill="#f0fdf4" stroke="#cbd5e1" />
          <rect x="112" y="0" width="22" height="20" rx="3" fill="#fefce8" stroke="#cbd5e1" />
          <rect x="140" y="0" width="22" height="20" rx="3" fill="#fff7ed" stroke="#cbd5e1" />
          <rect x="168" y="0" width="22" height="20" rx="3" fill="#faf5ff" stroke="#cbd5e1" />
          <rect x="196" y="0" width="22" height="20" rx="3" fill="#ecfeff" stroke="#cbd5e1" />

          <!-- Fila 2 oscuros -->
          <rect x="0" y="25" width="22" height="20" rx="3" fill="#2563eb" />
          <rect x="28" y="25" width="22" height="20" rx="3" fill="#059669" />
          <rect x="56" y="25" width="22" height="20" rx="3" fill="#d97706" />
          <rect x="84" y="25" width="22" height="20" rx="3" fill="#dc2626" />
          <rect x="112" y="25" width="22" height="20" rx="3" fill="#7c3aed" />
          <rect x="140" y="25" width="22" height="20" rx="3" fill="#0891b2" />
          <rect x="168" y="25" width="22" height="20" rx="3" fill="#475569" />
          <rect x="196" y="25" width="22" height="20" rx="3" fill="#0f172a" />
        </g>
      </g>
    </g>
  </g>
</svg>"""

with open(SVG_PATH, "w", encoding="utf-8") as f:
    f.write(svg_content)

html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Visor de Alternativas de Diseño UI</title>
  <style>
    body {{
      margin: 0;
      padding: 24px;
      background: #090d16;
      font-family: system-ui, -apple-system, sans-serif;
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
    }}
    .header {{
      text-align: center;
      margin-bottom: 20px;
    }}
    .header h1 {{
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #38bdf8;
    }}
    .header p {{
      margin: 0;
      color: #94a3b8;
      font-size: 14px;
    }}
    .container {{
      max-width: 1200px;
      width: 100%;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }}
    svg {{
      display: block;
      width: 100%;
      height: auto;
    }}
  </style>
</head>
<body>
  <div class="header">
    <h1>🎨 Visor de Alternativas y Comparativa de Diseño</h1>
    <p>Inspección detallada de las 3 inconsistencias detectadas en el panel lateral y sus propuestas de armonización</p>
  </div>
  <div class="container">
    {svg_content}
  </div>
</body>
</html>"""

with open(HTML_PATH, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Archivos generados exitosamente:\n- SVG: {SVG_PATH}\n- HTML: {HTML_PATH}")
