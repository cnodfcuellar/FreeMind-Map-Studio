import os

svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1150" width="100%" height="100%" style="background:#070a13; font-family:'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;">
  <defs>
    <!-- Gradientes -->
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>

    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>

    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>

    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>

    <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>

    <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#6d28d9"/>
    </linearGradient>

    <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f43f5e"/>
      <stop offset="100%" stop-color="#be123c"/>
    </linearGradient>

    <linearGradient id="cardBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.95"/>
    </linearGradient>

    <!-- Filtros de sombra y brillo -->
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
    <filter id="cyanGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#06b6d4" flood-opacity="0.4"/>
    </filter>
    <filter id="greenGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#10b981" flood-opacity="0.4"/>
    </filter>

    <!-- Patrón de malla de fondo -->
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.8" stroke-opacity="0.45"/>
    </pattern>
  </defs>

  <rect width="1600" height="1150" fill="url(#grid)"/>

  <!-- ==================== HEADER ==================== -->
  <g transform="translate(40, 25)">
    <rect width="1520" height="110" rx="14" fill="url(#headerGrad)" stroke="#334155" stroke-width="1.5" filter="url(#shadow)"/>
    <rect x="0" y="0" width="8" height="110" rx="4" fill="#06b6d4"/>
    
    <text x="32" y="42" fill="#f8fafc" font-size="24" font-weight="800" letter-spacing="0.5">PLAN DE SOLUCIÓN INTEGRAL — ARQUITECTURA &amp; INGENIERÍA</text>
    <text x="32" y="68" fill="#94a3b8" font-size="13" font-weight="500">FreeMind Map Studio — Hoja de Ruta de Modernización, Desacoplamiento de Estado, Calidad y Homogeneidad en 6 Fases</text>
    <text x="32" y="90" fill="#64748b" font-size="11" font-weight="600">Principio Rector: Cero Regresiones (339/339 tests) | Desacoplamiento por Selectores | Modularización de God Components</text>

    <!-- Badge Estado -->
    <g transform="translate(1290, 20)">
      <rect width="200" height="70" rx="10" fill="#0f172a" stroke="#10b981" stroke-width="1.5" filter="url(#greenGlow)"/>
      <text x="100" y="26" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="700" letter-spacing="1">ESTADO DEL PLAN</text>
      <text x="100" y="52" text-anchor="middle" fill="#10b981" font-size="15" font-weight="900">LISTO PARA EJECUCIÓN</text>
    </g>
  </g>

  <!-- ==================== FILA 1: COMPARATIVA ARQUITECTÓNICA (ACTUAL VS OBJETIVO) ==================== -->
  <g transform="translate(40, 155)">
    <!-- Actual (Izquierda) -->
    <g transform="translate(0, 0)">
      <rect width="740" height="235" rx="12" fill="url(#cardBg)" stroke="#ef4444" stroke-width="1.3" filter="url(#shadow)"/>
      <rect x="0" y="0" width="740" height="38" rx="12" fill="#ef4444" fill-opacity="0.12"/>
      <path d="M 0 38 L 740 38" stroke="#334155" stroke-width="1"/>
      <circle cx="24" cy="19" r="5" fill="#ef4444"/>
      <text x="38" y="24" fill="#fca5a5" font-size="14" font-weight="700">ARQUITECTURA ACTUAL (Acoplada / Deuda Técnica)</text>

      <g transform="translate(25, 55)">
        <circle cx="6" cy="14" r="3" fill="#ef4444"/>
        <text x="18" y="18" fill="#f8fafc" font-size="12" font-weight="600">App.tsx monolito (936 LOC): <tspan fill="#fca5a5">Pasa 64 props a ToolPanel y 36 props a MindMapCanvas.</tspan></text>
        <text x="18" y="34" fill="#94a3b8" font-size="11">Decenas de funciones flecha inline recreadas en cada frame, invalidando React.memo.</text>

        <circle cx="6" cy="56" r="3" fill="#f59e0b"/>
        <text x="18" y="60" fill="#f8fafc" font-size="12" font-weight="600">FormatTab.tsx God Component (1,755 LOC): <tspan fill="#fde68a">4 macrosecciones en un solo archivo.</tspan></text>
        <text x="18" y="76" fill="#94a3b8" font-size="11">0 pruebas unitarias; alta dificultad para mantener o añadir nuevas geometrías de arista/forma.</text>

        <circle cx="6" cy="98" r="3" fill="#f59e0b"/>
        <text x="18" y="102" fill="#f8fafc" font-size="12" font-weight="600">MindNode sobredimensionado: <tspan fill="#fde68a">138 propiedades planas en una interfaz monolítica.</tspan></text>
        <text x="18" y="118" fill="#94a3b8" font-size="11">Mezcla horquillas, flechas, burbujas y aristas sin sub-objetos configurables.</text>

        <circle cx="6" cy="140" r="3" fill="#38bdf8"/>
        <text x="18" y="144" fill="#f8fafc" font-size="12" font-weight="600">Dispersión de Organismos &amp; UI Theming: <tspan fill="#93c5fd">10 componentes sueltos en src/components.</tspan></text>
        <text x="18" y="160" fill="#94a3b8" font-size="11">21 componentes con 'bg-white' duro deslumbran en modo Sepia y Oscuro. Solo 20 atributos ARIA.</text>
      </g>
    </g>

    <!-- Objetivo (Derecha) -->
    <g transform="translate(780, 0)">
      <rect width="740" height="235" rx="12" fill="url(#cardBg)" stroke="#10b981" stroke-width="1.3" filter="url(#shadow)"/>
      <rect x="0" y="0" width="740" height="38" rx="12" fill="#10b981" fill-opacity="0.12"/>
      <path d="M 0 38 L 740 38" stroke="#334155" stroke-width="1"/>
      <circle cx="24" cy="19" r="5" fill="#10b981"/>
      <text x="38" y="24" fill="#6ee7b7" font-size="14" font-weight="700">ARQUITECTURA OBJETIVO (Desacoplada / Modular / Homogénea)</text>

      <g transform="translate(25, 55)">
        <circle cx="6" cy="14" r="3" fill="#10b981"/>
        <text x="18" y="18" fill="#f8fafc" font-size="12" font-weight="600">Estado Desacoplado: <tspan fill="#6ee7b7">ToolPanel y Canvas consumen selectores directos de Zustand.</tspan></text>
        <text x="18" y="34" fill="#94a3b8" font-size="11">App.tsx se reduce a &lt; 250 LOC. Cero closures inline. Re-renders acotados por nodo.</text>

        <circle cx="6" cy="56" r="3" fill="#10b981"/>
        <text x="18" y="60" fill="#f8fafc" font-size="12" font-weight="600">FormatTab Modular (4 subcomponentes): <tspan fill="#6ee7b7">Shape, Background, Border y Edge.</tspan></text>
        <text x="18" y="76" fill="#94a3b8" font-size="11">Archivos &lt; 450 LOC. Funciones matemáticas extraídas a nodeStyleUtils. Tests dedicados.</text>

        <circle cx="6" cy="98" r="3" fill="#10b981"/>
        <text x="18" y="102" fill="#f8fafc" font-size="12" font-weight="600">MindNode Componible: <tspan fill="#6ee7b7">Sub-interfaces de dominio (shapeConfig, edgeConfig...).</tspan></text>
        <text x="18" y="118" fill="#94a3b8" font-size="11">Capa de normalización transparente en storage.ts que previene romper mapas antiguos.</text>

        <circle cx="6" cy="140" r="3" fill="#10b981"/>
        <text x="18" y="144" fill="#f8fafc" font-size="12" font-weight="600">Pureza Atómica y 100% Temas: <tspan fill="#6ee7b7">Organismos organizados en carpetas en minúsculas.</tspan></text>
        <text x="18" y="160" fill="#94a3b8" font-size="11">Variables CSS semánticas (--surface-*). Focus-trap en modales y accesibilidad ARIA completa.</text>
      </g>
    </g>
  </g>

  <!-- ==================== FILA 2: LAS 6 FASES DEL PLAN DE SOLUCIÓN (GRID 3x2) ==================== -->
  <g transform="translate(40, 410)">
    <rect width="1520" height="495" rx="14" fill="url(#cardBg)" stroke="#334155" stroke-width="1.5" filter="url(#shadow)"/>
    <rect x="0" y="0" width="1520" height="40" rx="14" fill="#1e293b" fill-opacity="0.6"/>
    <path d="M 0 40 L 1520 40" stroke="#334155" stroke-width="1"/>
    
    <circle cx="28" cy="20" r="6" fill="#06b6d4"/>
    <text x="44" y="25" fill="#f8fafc" font-size="15" font-weight="700">Programa de Ejecución por Fases (Pipeline de Refactorización)</text>

    <!-- 6 CARDS -->

    <!-- FASE 1 -->
    <g transform="translate(25, 55)">
      <rect width="470" height="195" rx="10" fill="#0f172a" stroke="#3b82f6" stroke-width="1.5"/>
      <rect x="0" y="0" width="470" height="34" rx="10" fill="#3b82f6" fill-opacity="0.18"/>
      <text x="16" y="22" fill="#60a5fa" font-size="12" font-weight="800">FASE 1: DESACOPLAMIENTO DE ESTADO (ZUSTAND SELECTORS)</text>
      
      <text x="16" y="56" fill="#f8fafc" font-size="13" font-weight="700">Eliminación de Prop-Drilling &amp; Inline Closures</text>
      <text x="16" y="76" fill="#94a3b8" font-size="11">• Incorporar acciones globales en useMindMapStore (updateMapBackground, etc.).</text>
      <text x="16" y="94" fill="#94a3b8" font-size="11">• Reducir props de ToolPanel de 64 a solo 2 (isOpen, onClose).</text>
      <text x="16" y="112" fill="#94a3b8" font-size="11">• FormatTab y Canvas consumen el store con useMindMapStore(selector).</text>
      <text x="16" y="130" fill="#94a3b8" font-size="11">• Reducir App.tsx de 936 a ~200 LOC como puro orquestador de slots.</text>

      <g transform="translate(16, 150)">
        <rect width="110" height="24" rx="4" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
        <text x="55" y="16" text-anchor="middle" fill="#60a5fa" font-size="10" font-weight="700">IMPACTO CRÍTICO</text>
        <text x="130" y="16" fill="#10b981" font-size="11" font-weight="600">✓ Rendimiento &amp; Memoización</text>
      </g>
    </g>

    <!-- FASE 2 -->
    <g transform="translate(525, 55)">
      <rect width="470" height="195" rx="10" fill="#0f172a" stroke="#3b82f6" stroke-width="1.5"/>
      <rect x="0" y="0" width="470" height="34" rx="10" fill="#3b82f6" fill-opacity="0.18"/>
      <text x="16" y="22" fill="#60a5fa" font-size="12" font-weight="800">FASE 2: MODULARIZACIÓN DE GOD COMPONENTS</text>

      <text x="16" y="56" fill="#f8fafc" font-size="13" font-weight="700">División de FormatTab.tsx (1,755 LOC) &amp; Math Utils</text>
      <text x="16" y="76" fill="#94a3b8" font-size="11">• Crear format/: NodeShapeSection, NodeBgSection, NodeBorder, NodeEdge.</text>
      <text x="16" y="94" fill="#94a3b8" font-size="11">• Ningún componente superará las 450 LOC.</text>
      <text x="16" y="112" fill="#94a3b8" font-size="11">• Extraer funciones de cálculo puro a src/utils/nodeStyleUtils.ts.</text>
      <text x="16" y="130" fill="#94a3b8" font-size="11">• Añadir tests unitarios en toolpanel/__tests__/FormatTab.test.tsx.</text>

      <g transform="translate(16, 150)">
        <rect width="110" height="24" rx="4" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
        <text x="55" y="16" text-anchor="middle" fill="#60a5fa" font-size="10" font-weight="700">MANTENIBILIDAD</text>
        <text x="130" y="16" fill="#10b981" font-size="11" font-weight="600">✓ Código limpio y aislado</text>
      </g>
    </g>

    <!-- FASE 3 -->
    <g transform="translate(1025, 55)">
      <rect width="470" height="195" rx="10" fill="#0f172a" stroke="#10b981" stroke-width="1.5"/>
      <rect x="0" y="0" width="470" height="34" rx="10" fill="#10b981" fill-opacity="0.18"/>
      <text x="16" y="22" fill="#34d399" font-size="12" font-weight="800">FASE 3: SISTEMA DE DISEÑO, TOKENS &amp; A11Y</text>

      <text x="16" y="56" fill="#f8fafc" font-size="13" font-weight="700">Unificación de Temas (Sepia/Dark) y Accesibilidad</text>
      <text x="16" y="76" fill="#94a3b8" font-size="11">• Sustituir 'bg-white' rígido en 21 componentes por --surface-primary.</text>
      <text x="16" y="94" fill="#94a3b8" font-size="11">• Eliminar parches deslumbrantes en modo Sepia en menús y controles.</text>
      <text x="16" y="112" fill="#94a3b8" font-size="11">• Añadir focus-trap y escape listener a ModalBackdrop y modales.</text>
      <text x="16" y="130" fill="#94a3b8" font-size="11">• Incorporar roles semánticos (dialog, slider) y etiquetas aria-label.</text>

      <g transform="translate(16, 150)">
        <rect width="110" height="24" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="1"/>
        <text x="55" y="16" text-anchor="middle" fill="#34d399" font-size="10" font-weight="700">EXPERIENCIA UX</text>
        <text x="130" y="16" fill="#10b981" font-size="11" font-weight="600">✓ Coherencia visual total</text>
      </g>
    </g>

    <!-- FASE 4 -->
    <g transform="translate(25, 275)">
      <rect width="470" height="195" rx="10" fill="#0f172a" stroke="#10b981" stroke-width="1.5"/>
      <rect x="0" y="0" width="470" height="34" rx="10" fill="#10b981" fill-opacity="0.18"/>
      <text x="16" y="22" fill="#34d399" font-size="12" font-weight="800">FASE 4: REALINEACIÓN DE CARPETAS ATOMIC DESIGN</text>

      <text x="16" y="56" fill="#f8fafc" font-size="13" font-weight="700">Estructuración Canónica de Organismos</text>
      <text x="16" y="76" fill="#94a3b8" font-size="11">• Mover 10 organismos sueltos de src/components/ a organisms/:</text>
      <text x="16" y="94" fill="#94a3b8" font-size="11">  organisms/navigation (MenuBar, ToolBar, StatusBar, FilterBar).</text>
      <text x="16" y="112" fill="#94a3b8" font-size="11">  organisms/canvas (MindMapCanvas, MiniMap, ContextMenu).</text>
      <text x="16" y="130" fill="#94a3b8" font-size="11">• Unificar Presentation/ (PascalCase) dentro de organisms/presentation/.</text>

      <g transform="translate(16, 150)">
        <rect width="110" height="24" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="1"/>
        <text x="55" y="16" text-anchor="middle" fill="#34d399" font-size="10" font-weight="700">ARQUITECTURA</text>
        <text x="130" y="16" fill="#10b981" font-size="11" font-weight="600">✓ Jerarquía atómica estricta</text>
      </g>
    </g>

    <!-- FASE 5 -->
    <g transform="translate(525, 275)">
      <rect width="470" height="195" rx="10" fill="#0f172a" stroke="#8b5cf6" stroke-width="1.5"/>
      <rect x="0" y="0" width="470" height="34" rx="10" fill="#8b5cf6" fill-opacity="0.18"/>
      <text x="16" y="22" fill="#a78bfa" font-size="12" font-weight="800">FASE 5: COMPOSICIÓN DEL MODELO MINDNODE</text>

      <text x="16" y="56" fill="#f8fafc" font-size="13" font-weight="700">Transición de 138 Campos Planos a Sub-Interfaces</text>
      <text x="16" y="76" fill="#94a3b8" font-size="11">• Agrupar en sub-objetos: shapeConfig, borderConfig, edgeConfig.</text>
      <text x="16" y="94" fill="#94a3b8" font-size="11">• Nodos simples no arrastran propiedades de flechas ni horquillas.</text>
      <text x="16" y="112" fill="#94a3b8" font-size="11">• Normalizador en storage.ts: migra mapas legados de forma transparente.</text>
      <text x="16" y="130" fill="#94a3b8" font-size="11">• Cero pérdida de compatibilidad con mapas guardados en localStorage.</text>

      <g transform="translate(16, 150)">
        <rect width="110" height="24" rx="4" fill="#1e293b" stroke="#8b5cf6" stroke-width="1"/>
        <text x="55" y="16" text-anchor="middle" fill="#a78bfa" font-size="10" font-weight="700">ESCALABILIDAD</text>
        <text x="130" y="16" fill="#10b981" font-size="11" font-weight="600">✓ Esquema limpio y tipado</text>
      </g>
    </g>

    <!-- FASE 6 -->
    <g transform="translate(1025, 275)">
      <rect width="470" height="195" rx="10" fill="#0f172a" stroke="#06b6d4" stroke-width="1.5"/>
      <rect x="0" y="0" width="470" height="34" rx="10" fill="#06b6d4" fill-opacity="0.18"/>
      <text x="16" y="22" fill="#38bdf8" font-size="12" font-weight="800">FASE 6: TESTS EN PUNTOS CIEGOS &amp; STORAGE SEGURO</text>

      <text x="16" y="56" fill="#f8fafc" font-size="13" font-weight="700">Cobertura de Canvas &amp; Prevención de QuotaExceeded</text>
      <text x="16" y="76" fill="#94a3b8" font-size="11">• Crear MindMapCanvas.test.tsx con pruebas de interacción y selección.</text>
      <text x="16" y="94" fill="#94a3b8" font-size="11">• Eliminar la doble persistencia simultánea de mapas completos en storage.ts.</text>
      <text x="16" y="112" fill="#94a3b8" font-size="11">• Gestión de errores con aviso proactivo si se supera cuota de 5MB.</text>
      <text x="16" y="130" fill="#94a3b8" font-size="11">• Preparación de adaptador IndexedDB para mapas con imágenes embebidas.</text>

      <g transform="translate(16, 150)">
        <rect width="110" height="24" rx="4" fill="#1e293b" stroke="#06b6d4" stroke-width="1"/>
        <text x="55" y="16" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="700">ROBUSTEZ</text>
        <text x="130" y="16" fill="#10b981" font-size="11" font-weight="600">✓ Resiliencia y cobertura</text>
      </g>
    </g>
  </g>

  <!-- ==================== FILA 3: PILARES DE DEFINICIÓN DE TERMINADO (DoD) ==================== -->
  <g transform="translate(40, 925)">
    <rect width="1520" height="195" rx="14" fill="url(#cardBg)" stroke="#334155" stroke-width="1.5" filter="url(#shadow)"/>
    <rect x="0" y="0" width="1520" height="38" rx="14" fill="#1e293b" fill-opacity="0.6"/>
    <path d="M 0 38 L 1520 38" stroke="#334155" stroke-width="1"/>

    <circle cx="28" cy="19" r="6" fill="#10b981"/>
    <text x="44" y="24" fill="#f8fafc" font-size="14" font-weight="700">Criterios de Aceptación Globales y Definición de Terminado (Definition of Done)</text>

    <g transform="translate(30, 55)">
      <!-- Col 1 -->
      <g transform="translate(0, 0)">
        <rect width="345" height="115" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1"/>
        <text x="16" y="26" fill="#60a5fa" font-size="13" font-weight="700">1. Rendimiento &amp; Estado</text>
        <text x="16" y="48" fill="#94a3b8" font-size="11">✓ Cero re-renders innecesarios en App.</text>
        <text x="16" y="68" fill="#94a3b8" font-size="11">✓ Selectores atómicos suscritos a nodos.</text>
        <text x="16" y="88" fill="#94a3b8" font-size="11">✓ App.tsx reducido a &lt; 250 LOC.</text>
      </g>

      <!-- Col 2 -->
      <g transform="translate(370, 0)">
        <rect width="345" height="115" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1"/>
        <text x="16" y="26" fill="#34d399" font-size="13" font-weight="700">2. Mantenibilidad de Código</text>
        <text x="16" y="48" fill="#94a3b8" font-size="11">✓ Ningún componente supera 500 LOC.</text>
        <text x="16" y="68" fill="#94a3b8" font-size="11">✓ Funciones puras en nodeStyleUtils.ts.</text>
        <text x="16" y="88" fill="#94a3b8" font-size="11">✓ 0 directivas @ts-ignore en TS.</text>
      </g>

      <!-- Col 3 -->
      <g transform="translate(740, 0)">
        <rect width="345" height="115" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1"/>
        <text x="16" y="26" fill="#a78bfa" font-size="13" font-weight="700">3. Sistema Visual &amp; a11y</text>
        <text x="16" y="48" fill="#94a3b8" font-size="11">✓ 0 parches deslumbrantes en Sepia.</text>
        <text x="16" y="68" fill="#94a3b8" font-size="11">✓ Focus-trap y Escape funcional en modales.</text>
        <text x="16" y="88" fill="#94a3b8" font-size="11">✓ Atributos ARIA en controles interactivos.</text>
      </g>

      <!-- Col 4 -->
      <g transform="translate(1110, 0)">
        <rect width="350" height="115" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1"/>
        <text x="16" y="26" fill="#38bdf8" font-size="13" font-weight="700">4. Pruebas &amp; Compatibilidad</text>
        <text x="16" y="48" fill="#94a3b8" font-size="11">✓ 339/339 tests de regresión pasando (100%).</text>
        <text x="16" y="68" fill="#94a3b8" font-size="11">✓ Tests dedicados para Canvas y FormatTab.</text>
        <text x="16" y="88" fill="#94a3b8" font-size="11">✓ Migración retroactiva sin pérdida de mapas.</text>
      </g>
    </g>
  </g>
</svg>
"""

output_path = "doc/img/plan_solucion_integral.svg"
with open(output_path, "w", encoding="utf-8") as f:
    f.write(svg_content.strip())

print(f"SVG del Plan de Solución generado exitosamente en: {output_path}")
