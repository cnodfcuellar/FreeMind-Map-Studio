import os

SVG_PATH = r"C:\Users\admin\.gemini\antigravity\brain\e14d73aa-b7b2-4a1d-9994-dc393facce6c\mockup_unificacion_ui_final.svg"
HTML_PATH = r"C:\Users\admin\.gemini\antigravity\brain\e14d73aa-b7b2-4a1d-9994-dc393facce6c\visor_unificacion_ui_final.html"

svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 940" width="100%" height="100%">
  <defs>
    <!-- Fondo degrade general -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>

    <!-- Tarjetas de fondo paneles -->
    <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e293b" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.95" />
    </linearGradient>

    <!-- Sombras -->
    <filter id="panelShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000000" flood-opacity="0.5" />
    </filter>
    <filter id="glowBlue" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#38bdf8" flood-opacity="0.6" />
    </filter>

    <!-- Patrón de rejilla sutil -->
    <pattern id="gridPat" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="14" cy="14" r="1" fill="#334155" fill-opacity="0.3" />
    </pattern>
  </defs>

  <!-- Fondo base -->
  <rect width="1200" height="940" fill="url(#bgGrad)" />
  <rect width="1200" height="940" fill="url(#gridPat)" />

  <!-- ========================================================= -->
  <!-- HEADER PRINCIPAL -->
  <!-- ========================================================= -->
  <g transform="translate(50, 30)">
    <rect x="0" y="0" width="1100" height="85" rx="14" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.2" filter="url(#panelShadow)" />
    
    <rect x="20" y="18" width="50" height="50" rx="12" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="1.5" />
    <path d="M 33 43 L 42 52 L 57 33" fill="none" stroke="#34d399" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

    <text x="86" y="40" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">
      ✨ Mockup Final: Panel Lateral 100% Unificado y Coherente
    </text>
    <text x="86" y="60" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13">
      Mismo átomo ColorPicker, mismas cabeceras con badge de color activo y botón "Gradiente" sin truncamiento
    </text>

    <!-- Badge superior -->
    <rect x="915" y="25" width="160" height="36" rx="18" fill="#064e3b" stroke="#10b981" stroke-width="1" />
    <circle cx="935" cy="43" r="5" fill="#34d399" />
    <text x="948" y="47" fill="#6ee7b7" font-family="system-ui, sans-serif" font-size="12" font-weight="700">Atomic Design 100%</text>
  </g>

  <!-- ========================================================= -->
  <!-- 3 COLUMNAS: LAS 3 VISTAS DEL PANEL LATERAL -->
  <!-- ========================================================= -->

  <!-- ========================================================= -->
  <!-- COLUMNA 1: CONTENIDO / TEXTO (ContentTab) -->
  <!-- ========================================================= -->
  <g transform="translate(50, 140)">
    <!-- Marco panel simulado -->
    <rect x="0" y="0" width="345" height="760" rx="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" filter="url(#panelShadow)" />

    <!-- Header de Pestaña -->
    <g transform="translate(16, 16)">
      <rect x="0" y="0" width="313" height="30" rx="6" fill="#f1f5f9" />
      <rect x="2" y="2" width="100" height="26" rx="5" fill="#ffffff" stroke="#cbd5e1" />
      <text x="52" y="19" fill="#1d4ed8" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Contenido</text>
      <text x="156" y="19" fill="#64748b" font-family="system-ui, sans-serif" font-size="11" font-weight="medium" text-anchor="middle">Formato</text>
      <text x="260" y="19" fill="#64748b" font-family="system-ui, sans-serif" font-size="11" font-weight="medium" text-anchor="middle">Iconos</text>
    </g>

    <!-- Acordeón 1: Título del Nodo -->
    <g transform="translate(16, 60)">
      <rect x="0" y="0" width="313" height="42" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" />
      <rect x="8" y="8" width="26" height="26" rx="6" fill="#eff6ff" />
      <text x="21" y="25" fill="#2563eb" font-size="13" text-anchor="middle">T</text>
      <text x="42" y="20" fill="#0f172a" font-family="system-ui, sans-serif" font-size="12" font-weight="700">Título del Nodo</text>
      <text x="42" y="32" fill="#64748b" font-family="system-ui, sans-serif" font-size="9.5">Texto principal y formato</text>
      
      <!-- Badge de color de texto unificado en cabecera -->
      <circle cx="265" cy="21" r="7" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
      <path d="M 288 19 L 293 24 L 298 19" fill="none" stroke="#64748b" stroke-width="1.5" />

      <!-- Cuerpo abierto del acordeón -->
      <g transform="translate(0, 50)">
        <!-- Textarea -->
        <rect x="0" y="0" width="313" height="52" rx="8" fill="#ffffff" stroke="#3b82f6" stroke-width="1.5" />
        <text x="10" y="20" fill="#0f172a" font-family="system-ui, sans-serif" font-size="11.5" font-weight="600">🧠 FreeMind Map Studio</text>
        <text x="10" y="38" fill="#64748b" font-family="system-ui, sans-serif" font-size="9.5">Organizador de ideas visual e interactivo</text>

        <!-- Barra tipográfica horizontal en 1 SOLA FILA limpia -->
        <g transform="translate(0, 64)">
          <!-- [B I] -->
          <rect x="0" y="0" width="56" height="30" rx="6" fill="#ffffff" stroke="#cbd5e1" />
          <rect x="2" y="2" width="26" height="26" rx="4" fill="#dbeafe" />
          <text x="15" y="19" fill="#1d4ed8" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">B</text>
          <text x="42" y="19" fill="#64748b" font-family="sans-serif" font-size="11" font-style="italic" text-anchor="middle">I</text>

          <!-- [Izq Cen Der] -->
          <rect x="62" y="0" width="80" height="30" rx="6" fill="#ffffff" stroke="#cbd5e1" />
          <rect x="36" y="2" width="26" height="26" rx="4" fill="#f1f5f9" transform="translate(54,0)" />
          <text x="76" y="19" fill="#1d4ed8" font-size="10">≡</text>
          <text x="102" y="19" fill="#64748b" font-size="10">☵</text>
          <text x="128" y="19" fill="#64748b" font-size="10">≡</text>

          <!-- Stepper tamaño [- 18px + ⟲] -->
          <rect x="148" y="0" width="165" height="30" rx="6" fill="#ffffff" stroke="#cbd5e1" />
          <text x="162" y="19" fill="#64748b" font-size="12" text-anchor="middle">−</text>
          <text x="210" y="19" fill="#1d4ed8" font-family="monospace" font-size="11.5" font-weight="bold" text-anchor="middle">18px</text>
          <text x="260" y="19" fill="#64748b" font-size="12" text-anchor="middle">+</text>
          <line x1="278" y1="4" x2="278" y2="26" stroke="#e2e8f0" />
          <text x="296" y="19" fill="#94a3b8" font-size="10" text-anchor="middle">⟲</text>
        </g>

        <!-- SECCIÓN DE COLOR: COMPONENTE COLORPICKER ESTÁNDAR REUTILIZADO -->
        <g transform="translate(0, 106)">
          <line x1="0" y1="0" x2="313" y2="0" stroke="#f1f5f9" stroke-width="1.5" />

          <!-- Header ColorPicker -->
          <text x="0" y="18" fill="#334155" font-family="system-ui, sans-serif" font-size="11" font-weight="700">Color del Título</text>
          
          <!-- Input Hex + Reset -->
          <g transform="translate(200, 4)">
            <rect x="0" y="0" width="70" height="20" rx="4" fill="#ffffff" stroke="#cbd5e1" />
            <rect x="4" y="3" width="14" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" />
            <text x="24" y="14" fill="#475569" font-family="monospace" font-size="9.5">#FFFFFF</text>
            <text x="80" y="14" fill="#94a3b8" font-size="10">Reset</text>
          </g>

          <!-- Grilla de 16 colores pedagógicos -->
          <g transform="translate(0, 32)">
            <!-- Fila 1 Pasteles -->
            <rect x="0" y="0" width="34" height="28" rx="5" fill="#ffffff" stroke="#3b82f6" stroke-width="2" />
            <rect x="40" y="0" width="34" height="28" rx="5" fill="#dbeafe" stroke="#cbd5e1" />
            <rect x="80" y="0" width="34" height="28" rx="5" fill="#dcfce7" stroke="#cbd5e1" />
            <rect x="120" y="0" width="34" height="28" rx="5" fill="#fef08a" stroke="#cbd5e1" />
            <rect x="160" y="0" width="34" height="28" rx="5" fill="#ffedd5" stroke="#cbd5e1" />
            <rect x="200" y="0" width="34" height="28" rx="5" fill="#fee2e2" stroke="#cbd5e1" />
            <rect x="240" y="0" width="34" height="28" rx="5" fill="#f3e8ff" stroke="#cbd5e1" />
            <rect x="280" y="0" width="34" height="28" rx="5" fill="#f1f5f9" stroke="#cbd5e1" />

            <!-- Fila 2 Tintas -->
            <rect x="0" y="33" width="34" height="28" rx="5" fill="#0f172a" />
            <rect x="40" y="33" width="34" height="28" rx="5" fill="#2563eb" />
            <rect x="80" y="33" width="34" height="28" rx="5" fill="#16a34a" />
            <rect x="120" y="33" width="34" height="28" rx="5" fill="#d97706" />
            <rect x="160" y="33" width="34" height="28" rx="5" fill="#ea580c" />
            <rect x="200" y="33" width="34" height="28" rx="5" fill="#dc2626" />
            <rect x="240" y="33" width="34" height="28" rx="5" fill="#7c3aed" />
            <rect x="280" y="33" width="34" height="28" rx="5" fill="#db2777" />
          </g>
        </g>

        <!-- Sombra de Texto Compacta -->
        <g transform="translate(0, 215)">
          <line x1="0" y1="0" x2="313" y2="0" stroke="#f1f5f9" stroke-width="1.5" />
          <rect x="0" y="10" width="313" height="36" rx="8" fill="#f8fafc" stroke="#e2e8f0" />
          <text x="12" y="32" fill="#334155" font-family="system-ui, sans-serif" font-size="11" font-weight="600">Sombra de Texto</text>
          <!-- Switch ON -->
          <rect x="260" y="18" width="40" height="20" rx="10" fill="#3b82f6" />
          <circle cx="290" cy="28" r="8" fill="#ffffff" />
        </g>
      </g>
    </g>

    <text x="172" y="440" fill="#10b981" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">
      ✓ Barra 100% en 1 sola fila + ColorPicker estándar
    </text>
  </g>

  <!-- ========================================================= -->
  <!-- COLUMNA 2: FORMATO / FONDO Y RELLENO (NodeBackgroundSection) -->
  <!-- ========================================================= -->
  <g transform="translate(425, 140)">
    <rect x="0" y="0" width="345" height="760" rx="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" filter="url(#panelShadow)" />

    <!-- Header de Pestaña -->
    <g transform="translate(16, 16)">
      <rect x="0" y="0" width="313" height="30" rx="6" fill="#f1f5f9" />
      <text x="52" y="19" fill="#64748b" font-family="system-ui, sans-serif" font-size="11" font-weight="medium" text-anchor="middle">Contenido</text>
      <rect x="108" y="2" width="100" height="26" rx="5" fill="#ffffff" stroke="#cbd5e1" />
      <text x="156" y="19" fill="#1d4ed8" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Formato</text>
      <text x="260" y="19" fill="#64748b" font-family="system-ui, sans-serif" font-size="11" font-weight="medium" text-anchor="middle">Iconos</text>
    </g>

    <!-- Acordeón 2: Fondo y Relleno -->
    <g transform="translate(16, 60)">
      <rect x="0" y="0" width="313" height="42" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" />
      <rect x="8" y="8" width="26" height="26" rx="6" fill="#eff6ff" />
      <path d="M 16 23 L 26 13 L 23 10 L 13 20 Z" fill="#2563eb" />
      <text x="42" y="20" fill="#0f172a" font-family="system-ui, sans-serif" font-size="12" font-weight="700">Fondo y Relleno</text>
      <text x="42" y="32" fill="#64748b" font-family="system-ui, sans-serif" font-size="9.5">Color, degradado, trama o imagen</text>
      
      <!-- BADGE AÑADIDO: Color activo (#1D4ED8) visible en la cabecera -->
      <circle cx="265" cy="21" r="7" fill="#1d4ed8" stroke="#3b82f6" stroke-width="1.5" filter="url(#glowBlue)" />
      <path d="M 288 19 L 293 24 L 298 19" fill="none" stroke="#64748b" stroke-width="1.5" />

      <!-- Cuerpo abierto del acordeón -->
      <g transform="translate(0, 50)">
        <!-- 5 BOTONES PERFECTOS: "Gradiente" sin truncamiento -->
        <g transform="translate(0, 0)">
          <!-- Sólido -->
          <rect x="0" y="0" width="58" height="54" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5" />
          <rect x="20" y="8" width="18" height="16" rx="4" fill="#1d4ed8" />
          <text x="29" y="40" fill="#1d4ed8" font-family="system-ui, sans-serif" font-size="9.5" font-weight="700" text-anchor="middle">Sólido</text>

          <!-- Gradiente (¡Completamente legible!) -->
          <rect x="64" y="0" width="58" height="54" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
          <rect x="84" y="8" width="18" height="16" rx="4" fill="#a855f7" />
          <text x="93" y="40" fill="#64748b" font-family="system-ui, sans-serif" font-size="9" font-weight="600" text-anchor="middle">Gradiente</text>

          <!-- Trama -->
          <rect x="128" y="0" width="58" height="54" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
          <circle cx="157" cy="16" r="6" fill="none" stroke="#64748b" stroke-width="1.5" />
          <text x="157" y="40" fill="#64748b" font-family="system-ui, sans-serif" font-size="9.5" font-weight="medium" text-anchor="middle">Trama</text>

          <!-- Imagen -->
          <rect x="192" y="0" width="58" height="54" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
          <rect x="211" y="9" width="18" height="14" rx="2" fill="none" stroke="#64748b" stroke-width="1.5" />
          <text x="220" y="40" fill="#64748b" font-family="system-ui, sans-serif" font-size="9.5" font-weight="medium" text-anchor="middle">Imagen</text>

          <!-- Transp. -->
          <rect x="256" y="0" width="57" height="54" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
          <rect x="275" y="9" width="18" height="14" rx="2" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="2 2" />
          <text x="284" y="40" fill="#64748b" font-family="system-ui, sans-serif" font-size="9.5" font-weight="medium" text-anchor="middle">Transp.</text>
        </g>

        <!-- ColorPicker de Fondo IDÉNTICO AL DE TEXTO -->
        <g transform="translate(0, 68)">
          <text x="0" y="18" fill="#334155" font-family="system-ui, sans-serif" font-size="11" font-weight="700">Color de Fondo</text>
          
          <g transform="translate(200, 4)">
            <rect x="0" y="0" width="70" height="20" rx="4" fill="#ffffff" stroke="#cbd5e1" />
            <rect x="4" y="3" width="14" height="14" rx="2" fill="#1d4ed8" />
            <text x="24" y="14" fill="#475569" font-family="monospace" font-size="9.5">#1D4ED8</text>
            <text x="80" y="14" fill="#94a3b8" font-size="10">Reset</text>
          </g>

          <!-- Misma cuadrícula de 16 colores pedagógicos -->
          <g transform="translate(0, 32)">
            <!-- Fila 1 Pasteles -->
            <rect x="0" y="0" width="34" height="28" rx="5" fill="#ffffff" stroke="#cbd5e1" />
            <rect x="40" y="0" width="34" height="28" rx="5" fill="#dbeafe" stroke="#cbd5e1" />
            <rect x="80" y="0" width="34" height="28" rx="5" fill="#dcfce7" stroke="#cbd5e1" />
            <rect x="120" y="0" width="34" height="28" rx="5" fill="#fef08a" stroke="#cbd5e1" />
            <rect x="160" y="0" width="34" height="28" rx="5" fill="#ffedd5" stroke="#cbd5e1" />
            <rect x="200" y="0" width="34" height="28" rx="5" fill="#fee2e2" stroke="#cbd5e1" />
            <rect x="240" y="0" width="34" height="28" rx="5" fill="#f3e8ff" stroke="#cbd5e1" />
            <rect x="280" y="0" width="34" height="28" rx="5" fill="#f1f5f9" stroke="#cbd5e1" />

            <!-- Fila 2 Tintas (con #1D4ED8 seleccionado) -->
            <rect x="0" y="33" width="34" height="28" rx="5" fill="#0f172a" />
            <rect x="40" y="33" width="34" height="28" rx="5" fill="#2563eb" stroke="#1d4ed8" stroke-width="2.5" />
            <rect x="80" y="33" width="34" height="28" rx="5" fill="#16a34a" />
            <rect x="120" y="33" width="34" height="28" rx="5" fill="#d97706" />
            <rect x="160" y="33" width="34" height="28" rx="5" fill="#ea580c" />
            <rect x="200" y="33" width="34" height="28" rx="5" fill="#dc2626" />
            <rect x="240" y="33" width="34" height="28" rx="5" fill="#7c3aed" />
            <rect x="280" y="33" width="34" height="28" rx="5" fill="#db2777" />
          </g>
        </g>
      </g>
    </g>

    <text x="172" y="350" fill="#10b981" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">
      ✓ Botón "Gradiente" nítido + Badge en Cabecera
    </text>
  </g>

  <!-- ========================================================= -->
  <!-- COLUMNA 3: ICONOS (IconsTab) -->
  <!-- ========================================================= -->
  <g transform="translate(800, 140)">
    <rect x="0" y="0" width="345" height="760" rx="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" filter="url(#panelShadow)" />

    <!-- Header de Pestaña -->
    <g transform="translate(16, 16)">
      <rect x="0" y="0" width="313" height="30" rx="6" fill="#f1f5f9" />
      <text x="52" y="19" fill="#64748b" font-family="system-ui, sans-serif" font-size="11" font-weight="medium" text-anchor="middle">Contenido</text>
      <text x="156" y="19" fill="#64748b" font-family="system-ui, sans-serif" font-size="11" font-weight="medium" text-anchor="middle">Formato</text>
      <rect x="212" y="2" width="100" height="26" rx="5" fill="#ffffff" stroke="#cbd5e1" />
      <text x="260" y="19" fill="#1d4ed8" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Iconos</text>
    </g>

    <!-- Acordeón 3: Color y Tamaño de Iconos -->
    <g transform="translate(16, 60)">
      <rect x="0" y="0" width="313" height="42" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" />
      <rect x="8" y="8" width="26" height="26" rx="6" fill="#eff6ff" />
      <circle cx="21" cy="21" r="6" fill="#3b82f6" />
      <text x="42" y="20" fill="#0f172a" font-family="system-ui, sans-serif" font-size="12" font-weight="700">Color y Tamaño de Iconos</text>
      <text x="42" y="32" fill="#64748b" font-family="system-ui, sans-serif" font-size="9.5">Personalizar tinte, escala y propagación</text>
      
      <!-- BADGE DE CABECERA HOMOGÉNEO -->
      <circle cx="265" cy="21" r="7" fill="#93c5fd" stroke="#cbd5e1" stroke-width="1.5" />
      <path d="M 288 19 L 293 24 L 298 19" fill="none" stroke="#64748b" stroke-width="1.5" />

      <!-- Cuerpo abierto del acordeón -->
      <g transform="translate(0, 50)">
        <!-- ColorPicker de Iconos IDÉNTICO SIN FILA HUÉRFANA -->
        <g transform="translate(0, 0)">
          <text x="0" y="18" fill="#334155" font-family="system-ui, sans-serif" font-size="11" font-weight="700">Tinte del Icono</text>
          
          <g transform="translate(200, 4)">
            <rect x="0" y="0" width="70" height="20" rx="4" fill="#ffffff" stroke="#cbd5e1" />
            <rect x="4" y="3" width="14" height="14" rx="2" fill="#93c5fd" />
            <text x="24" y="14" fill="#475569" font-family="monospace" font-size="9.5">#93C5FD</text>
            <text x="80" y="14" fill="#94a3b8" font-size="10">Reset</text>
          </g>

          <!-- Misma cuadrícula de 16 colores pedagógicos -->
          <g transform="translate(0, 32)">
            <!-- Fila 1 Pasteles (#93C5FD / Celeste resaltado) -->
            <rect x="0" y="0" width="34" height="28" rx="5" fill="#ffffff" stroke="#cbd5e1" />
            <rect x="40" y="0" width="34" height="28" rx="5" fill="#dbeafe" stroke="#3b82f6" stroke-width="2.5" />
            <rect x="80" y="0" width="34" height="28" rx="5" fill="#dcfce7" stroke="#cbd5e1" />
            <rect x="120" y="0" width="34" height="28" rx="5" fill="#fef08a" stroke="#cbd5e1" />
            <rect x="160" y="0" width="34" height="28" rx="5" fill="#ffedd5" stroke="#cbd5e1" />
            <rect x="200" y="0" width="34" height="28" rx="5" fill="#fee2e2" stroke="#cbd5e1" />
            <rect x="240" y="0" width="34" height="28" rx="5" fill="#f3e8ff" stroke="#cbd5e1" />
            <rect x="280" y="0" width="34" height="28" rx="5" fill="#f1f5f9" stroke="#cbd5e1" />

            <!-- Fila 2 Tintas -->
            <rect x="0" y="33" width="34" height="28" rx="5" fill="#0f172a" />
            <rect x="40" y="33" width="34" height="28" rx="5" fill="#2563eb" />
            <rect x="80" y="33" width="34" height="28" rx="5" fill="#16a34a" />
            <rect x="120" y="33" width="34" height="28" rx="5" fill="#d97706" />
            <rect x="160" y="33" width="34" height="28" rx="5" fill="#ea580c" />
            <rect x="200" y="33" width="34" height="28" rx="5" fill="#dc2626" />
            <rect x="240" y="33" width="34" height="28" rx="5" fill="#7c3aed" />
            <rect x="280" y="33" width="34" height="28" rx="5" fill="#db2777" />
          </g>
        </g>

        <!-- Slider de Tamaño de Icono -->
        <g transform="translate(0, 115)">
          <line x1="0" y1="0" x2="313" y2="0" stroke="#f1f5f9" stroke-width="1.5" />
          <text x="0" y="18" fill="#334155" font-family="system-ui, sans-serif" font-size="11" font-weight="700">Tamaño del Icono</text>
          <text x="313" y="18" fill="#1d4ed8" font-family="monospace" font-size="10.5" font-weight="bold" text-anchor="end">20px</text>

          <rect x="0" y="28" width="313" height="6" rx="3" fill="#e2e8f0" />
          <rect x="0" y="28" width="130" height="6" rx="3" fill="#3b82f6" />
          <circle cx="130" cy="31" r="8" fill="#ffffff" stroke="#3b82f6" stroke-width="2.5" />
        </g>

        <!-- Propagación -->
        <g transform="translate(0, 175)">
          <line x1="0" y1="0" x2="313" y2="0" stroke="#f1f5f9" stroke-width="1.5" />
          <text x="0" y="16" fill="#334155" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700">Propagación de Iconos</text>
          <g transform="translate(0, 24)">
            <rect x="0" y="0" width="152" height="30" rx="6" fill="#eff6ff" stroke="#bfdbfe" />
            <text x="76" y="19" fill="#1d4ed8" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">Copiar a Hijos</text>

            <rect x="161" y="0" width="152" height="30" rx="6" fill="#f8fafc" stroke="#e2e8f0" />
            <text x="237" y="19" fill="#475569" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">Copiar a Hermanos</text>
          </g>
        </g>
      </g>
    </g>

    <text x="172" y="380" fill="#10b981" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">
      ✓ Misma cuadrícula + Sin filas huérfanas
    </text>
  </g>
</svg>"""

with open(SVG_PATH, "w", encoding="utf-8") as f:
    f.write(svg_content)

html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mockup de Unificación UI Final</title>
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
    <h1>✨ Mockup Final de la UI Unificada</h1>
    <p>Visualización exacta de las 3 pestañas principales (Contenido, Formato e Iconos) con el diseño armonizado</p>
  </div>
  <div class="container">
    {svg_content}
  </div>
</body>
</html>"""

with open(HTML_PATH, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Mockups finales generados con éxito:\n- SVG: {SVG_PATH}\n- HTML: {HTML_PATH}")
