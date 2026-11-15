import os

SVG_PATH = r"C:\Users\admin\.gemini\antigravity\brain\e14d73aa-b7b2-4a1d-9994-dc393facce6c\paleta_educativa_16_colores.svg"
HTML_PATH = r"C:\Users\admin\.gemini\antigravity\brain\e14d73aa-b7b2-4a1d-9994-dc393facce6c\visor_paleta_educativa.html"

svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 920" width="100%" height="100%">
  <defs>
    <!-- Fondo degrade general -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>

    <!-- Gradientes de tarjetas -->
    <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e293b" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.95" />
    </linearGradient>

    <!-- Filtros de sombra -->
    <filter id="shadowBox" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.45" />
    </filter>
    <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#f59e0b" flood-opacity="0.5" />
    </filter>
    <filter id="glowBlue" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#38bdf8" flood-opacity="0.5" />
    </filter>

    <!-- Patrón de rejilla -->
    <pattern id="gridPattern" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="14" cy="14" r="1" fill="#334155" fill-opacity="0.3" />
    </pattern>
  </defs>

  <!-- Fondo base -->
  <rect width="1200" height="920" fill="url(#bgGrad)" />
  <rect width="1200" height="920" fill="url(#gridPattern)" />

  <!-- ========================================================= -->
  <!-- HEADER PRINCIPAL -->
  <!-- ========================================================= -->
  <g transform="translate(60, 35)">
    <rect x="0" y="0" width="1080" height="90" rx="14" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.2" filter="url(#shadowBox)" />
    
    <!-- Icono Birrete / Academia -->
    <rect x="22" y="20" width="50" height="50" rx="12" fill="#3b82f6" fill-opacity="0.2" stroke="#3b82f6" stroke-width="1.5" />
    <path d="M 47 32 L 63 40 L 47 48 L 31 40 Z" fill="#38bdf8" />
    <path d="M 37 43.5 L 37 54 C 37 57 57 57 57 54 L 57 43.5" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" />
    <line x1="63" y1="40" x2="63" y2="52" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" />

    <text x="86" y="42" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="21" font-weight="700">
      🎓 Paleta Pedagógica de 16 Colores para la Educación
    </text>
    <text x="86" y="63" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13">
      Optimizada para la memoria a largo plazo, codificación dual y contraste de lectura prolongada sin fatiga ocular
    </text>

    <!-- Badge -->
    <rect x="910" y="27" width="145" height="36" rx="18" fill="#1e1b4b" stroke="#6366f1" stroke-width="1" />
    <circle cx="928" cy="45" r="4.5" fill="#a855f7" />
    <text x="940" y="49" fill="#c084fc" font-family="system-ui, sans-serif" font-size="11.5" font-weight="600">8 Pares Mnemotécnicos</text>
  </g>

  <!-- ========================================================= -->
  <!-- SECCIÓN 1: LA MATRIZ DE 16 COLORES EN EL SELECTOR -->
  <!-- ========================================================= -->
  <g transform="translate(60, 145)">
    <rect x="0" y="0" width="1080" height="280" rx="14" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.2" filter="url(#shadowBox)" />

    <text x="24" y="34" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="16" font-weight="700">
      1. Anatomía del Componente ColorPicker (16 Tonos Calibrados)
    </text>
    <text x="24" y="52" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">
      Fila 1: Fondos suaves que hacen el texto 100% legible · Fila 2: Tintas vivas con contraste óptimo para títulos, aristas y bordes
    </text>

    <!-- Contenedor del ColorPicker en grande -->
    <g transform="translate(24, 75)">
      <!-- Panel simulado -->
      <rect x="0" y="0" width="1032" height="180" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1" />

      <!-- Fila 1: Pasteles de Fondo (8 swatches) -->
      <text x="20" y="24" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" font-weight="700">
        FILA 1: FONDOS DE ESTUDIO (Pasteles nítidos nivel 100/150 — Se distinguen perfectamente entre sí)
      </text>

      <g transform="translate(20, 36)">
        <!-- 1. Blanco -->
        <g transform="translate(0, 0)">
          <rect x="0" y="0" width="115" height="52" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
          <text x="10" y="22" fill="#0f172a" font-family="system-ui, sans-serif" font-size="11" font-weight="bold">Blanco Puro</text>
          <text x="10" y="38" fill="#475569" font-family="monospace" font-size="9.5">#FFFFFF</text>
          <text x="10" y="47" fill="#64748b" font-family="system-ui, sans-serif" font-size="8">Neutro Base</text>
        </g>
        <!-- 2. Celeste -->
        <g transform="translate(125, 0)">
          <rect x="0" y="0" width="115" height="52" rx="8" fill="#dbeafe" stroke="#93c5fd" stroke-width="1.5" />
          <text x="10" y="22" fill="#1e3a8a" font-family="system-ui, sans-serif" font-size="11" font-weight="bold">Celeste</text>
          <text x="10" y="38" fill="#1d4ed8" font-family="monospace" font-size="9.5">#DBEAFE</text>
          <text x="10" y="47" fill="#2563eb" font-family="system-ui, sans-serif" font-size="8">Concepto / Lógica</text>
        </g>
        <!-- 3. Menta -->
        <g transform="translate(250, 0)">
          <rect x="0" y="0" width="115" height="52" rx="8" fill="#dcfce7" stroke="#86efac" stroke-width="1.5" />
          <text x="10" y="22" fill="#14532d" font-family="system-ui, sans-serif" font-size="11" font-weight="bold">Menta</text>
          <text x="10" y="38" fill="#15803d" font-family="monospace" font-size="9.5">#DCFCE7</text>
          <text x="10" y="47" fill="#16a34a" font-family="system-ui, sans-serif" font-size="8">Ejemplo / Acierto</text>
        </g>
        <!-- 4. Amarillo -->
        <g transform="translate(375, 0)">
          <rect x="0" y="0" width="115" height="52" rx="8" fill="#fef08a" stroke="#fde047" stroke-width="1.5" />
          <text x="10" y="22" fill="#713f12" font-family="system-ui, sans-serif" font-size="11" font-weight="bold">Amarillo Flúor</text>
          <text x="10" y="38" fill="#a16207" font-family="monospace" font-size="9.5">#FEF08A</text>
          <text x="10" y="47" fill="#b45309" font-family="system-ui, sans-serif" font-size="8">Resaltador / Clave</text>
        </g>
        <!-- 5. Melocotón -->
        <g transform="translate(500, 0)">
          <rect x="0" y="0" width="115" height="52" rx="8" fill="#ffedd5" stroke="#fdba74" stroke-width="1.5" />
          <text x="10" y="22" fill="#7c2d12" font-family="system-ui, sans-serif" font-size="11" font-weight="bold">Melocotón</text>
          <text x="10" y="38" fill="#c2410c" font-family="monospace" font-size="9.5">#FFEDD5</text>
          <text x="10" y="47" fill="#ea580c" font-family="system-ui, sans-serif" font-size="8">Proceso / Etapas</text>
        </g>
        <!-- 6. Coral -->
        <g transform="translate(625, 0)">
          <rect x="0" y="0" width="115" height="52" rx="8" fill="#fee2e2" stroke="#fca5a5" stroke-width="1.5" />
          <text x="10" y="22" fill="#7f1d1d" font-family="system-ui, sans-serif" font-size="11" font-weight="bold">Coral Suave</text>
          <text x="10" y="38" fill="#b91c1c" font-family="monospace" font-size="9.5">#FEE2E2</text>
          <text x="10" y="47" fill="#dc2626" font-family="system-ui, sans-serif" font-size="8">Atención / Error</text>
        </g>
        <!-- 7. Lavanda -->
        <g transform="translate(750, 0)">
          <rect x="0" y="0" width="115" height="52" rx="8" fill="#f3e8ff" stroke="#d8b4fe" stroke-width="1.5" />
          <text x="10" y="22" fill="#581c87" font-family="system-ui, sans-serif" font-size="11" font-weight="bold">Lavanda</text>
          <text x="10" y="38" fill="#7e22ce" font-family="monospace" font-size="9.5">#F3E8FF</text>
          <text x="10" y="47" fill="#9333ea" font-family="system-ui, sans-serif" font-size="8">Pregunta / Hipótesis</text>
        </g>
        <!-- 8. Pizarra Clara -->
        <g transform="translate(875, 0)">
          <rect x="0" y="0" width="115" height="52" rx="8" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.5" />
          <text x="10" y="22" fill="#1e293b" font-family="system-ui, sans-serif" font-size="11" font-weight="bold">Gris Cuaderno</text>
          <text x="10" y="38" fill="#475569" font-family="monospace" font-size="9.5">#F1F5F9</text>
          <text x="10" y="47" fill="#64748b" font-family="system-ui, sans-serif" font-size="8">Estructura / Notas</text>
        </g>
      </g>

      <!-- Fila 2: Tintas Vivas de Énfasis (8 swatches) -->
      <text x="20" y="112" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" font-weight="700">
        FILA 2: TINTAS Y ÉNFASIS (Contraste alto WCAG AAA — Títulos, bordes anatómicos y aristas)
      </text>

      <g transform="translate(20, 122)">
        <!-- 1. Grafito Oscuro -->
        <g transform="translate(0, 0)">
          <rect x="0" y="0" width="115" height="42" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1.5" />
          <text x="10" y="18" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="10.5" font-weight="bold">Carbón / Tinta</text>
          <text x="10" y="33" fill="#94a3b8" font-family="monospace" font-size="9">#0F172A</text>
        </g>
        <!-- 2. Azul Real -->
        <g transform="translate(125, 0)">
          <rect x="0" y="0" width="115" height="42" rx="8" fill="#2563eb" stroke="#1d4ed8" stroke-width="1.5" />
          <text x="10" y="18" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10.5" font-weight="bold">Azul Ciencias</text>
          <text x="10" y="33" fill="#bfdbfe" font-family="monospace" font-size="9">#2563EB</text>
        </g>
        <!-- 3. Verde Esmeralda -->
        <g transform="translate(250, 0)">
          <rect x="0" y="0" width="115" height="42" rx="8" fill="#16a34a" stroke="#15803d" stroke-width="1.5" />
          <text x="10" y="18" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10.5" font-weight="bold">Verde Aprobado</text>
          <text x="10" y="33" fill="#bbf7d0" font-family="monospace" font-size="9">#16A34A</text>
        </g>
        <!-- 4. Ámbar Examen -->
        <g transform="translate(375, 0)">
          <rect x="0" y="0" width="115" height="42" rx="8" fill="#d97706" stroke="#b45309" stroke-width="1.5" />
          <text x="10" y="18" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10.5" font-weight="bold">Ámbar Examen</text>
          <text x="10" y="33" fill="#fef08a" font-family="monospace" font-size="9">#D97706</text>
        </g>
        <!-- 5. Naranja Acción -->
        <g transform="translate(500, 0)">
          <rect x="0" y="0" width="115" height="42" rx="8" fill="#ea580c" stroke="#c2410c" stroke-width="1.5" />
          <text x="10" y="18" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10.5" font-weight="bold">Naranja Acción</text>
          <text x="10" y="33" fill="#fed7aa" font-family="monospace" font-size="9">#EA580C</text>
        </g>
        <!-- 6. Rojo Excepción -->
        <g transform="translate(625, 0)">
          <rect x="0" y="0" width="115" height="42" rx="8" fill="#dc2626" stroke="#b91c1c" stroke-width="1.5" />
          <text x="10" y="18" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10.5" font-weight="bold">Rojo Alerta</text>
          <text x="10" y="33" fill="#fecaca" font-family="monospace" font-size="9">#DC2626</text>
        </g>
        <!-- 7. Púrpura Teoría -->
        <g transform="translate(750, 0)">
          <rect x="0" y="0" width="115" height="42" rx="8" fill="#7c3aed" stroke="#6d28d9" stroke-width="1.5" />
          <text x="10" y="18" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10.5" font-weight="bold">Púrpura Teoría</text>
          <text x="10" y="33" fill="#e9d5ff" font-family="monospace" font-size="9">#7C3AED</text>
        </g>
        <!-- 8. Fucsia Mnemotécnico -->
        <g transform="translate(875, 0)">
          <rect x="0" y="0" width="115" height="42" rx="8" fill="#db2777" stroke="#be185d" stroke-width="1.5" />
          <text x="10" y="18" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10.5" font-weight="bold">Fucsia Memoria</text>
          <text x="10" y="33" fill="#fbcfe8" font-family="monospace" font-size="9">#DB2777</text>
        </g>
      </g>
    </g>
  </g>

  <!-- ========================================================= -->
  <!-- SECCIÓN 2: EJEMPLOS REALES DE APLICACIÓN EN MAPA MENTAL -->
  <!-- ========================================================= -->
  <g transform="translate(60, 445)">
    <rect x="0" y="0" width="1080" height="435" rx="14" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.2" filter="url(#shadowBox)" />

    <text x="24" y="32" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="16" font-weight="700">
      2. Casos de Uso Pedagógico en Nodos del Mapa Mental
    </text>
    <text x="24" y="50" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">
      Cómo el estudiante y profesor combinan la fila superior (fondo) con la fila inferior (borde/tinta) para crear jerarquías memorables
    </text>

    <!-- Grid 4x2 de Nodos Didácticos -->
    <g transform="translate(24, 70)">
      <!-- 1. CONCEPTO / LÓGICA -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="245" height="155" rx="12" fill="#dbeafe" stroke="#2563eb" stroke-width="2.5" />
        <rect x="14" y="14" width="28" height="28" rx="8" fill="#2563eb" />
        <text x="28" y="33" fill="#ffffff" font-family="sans-serif" font-size="14" text-anchor="middle">📘</text>
        <text x="50" y="26" fill="#1e3a8a" font-family="system-ui, sans-serif" font-size="12" font-weight="800">Concepto / Definición</text>
        <text x="50" y="38" fill="#2563eb" font-family="system-ui, sans-serif" font-size="9.5" font-weight="bold">#DBEAFE + #2563EB</text>
        <rect x="14" y="48" width="217" height="1" fill="#93c5fd" />
        <text x="14" y="66" fill="#1e293b" font-family="system-ui, sans-serif" font-size="10.5" font-weight="bold">Ley de Conservación</text>
        <text x="14" y="82" fill="#334155" font-family="system-ui, sans-serif" font-size="9.5">"La energía no se crea ni se destruye, solo se transforma en otra forma."</text>
        <rect x="14" y="122" width="75" height="18" rx="4" fill="#2563eb" />
        <text x="51" y="134" fill="#ffffff" font-family="system-ui, sans-serif" font-size="8.5" font-weight="bold" text-anchor="middle">Física Básica</text>
      </g>

      <!-- 2. EJEMPLO / ACIERTO -->
      <g transform="translate(262, 0)">
        <rect x="0" y="0" width="245" height="155" rx="12" fill="#dcfce7" stroke="#16a34a" stroke-width="2.5" />
        <rect x="14" y="14" width="28" height="28" rx="8" fill="#16a34a" />
        <text x="28" y="33" fill="#ffffff" font-family="sans-serif" font-size="14" text-anchor="middle">✅</text>
        <text x="50" y="26" fill="#14532d" font-family="system-ui, sans-serif" font-size="12" font-weight="800">Ejemplo Resuelto</text>
        <text x="50" y="38" fill="#16a34a" font-family="system-ui, sans-serif" font-size="9.5" font-weight="bold">#DCFCE7 + #16A34A</text>
        <rect x="14" y="48" width="217" height="1" fill="#86efac" />
        <text x="14" y="66" fill="#14532d" font-family="system-ui, sans-serif" font-size="10.5" font-weight="bold">Cálculo de Energía Cinética</text>
        <text x="14" y="82" fill="#1e293b" font-family="system-ui, sans-serif" font-size="9.5">Ec = ½ · m · v²</text>
        <text x="14" y="98" fill="#15803d" font-family="system-ui, sans-serif" font-size="9.5">Objeto de 2kg a 3m/s = 9 Joules</text>
        <rect x="14" y="122" width="80" height="18" rx="4" fill="#16a34a" />
        <text x="54" y="134" fill="#ffffff" font-family="system-ui, sans-serif" font-size="8.5" font-weight="bold" text-anchor="middle">Caso Práctico</text>
      </g>

      <!-- 3. CLAVE DE EXAMEN -->
      <g transform="translate(524, 0)">
        <rect x="0" y="0" width="245" height="155" rx="12" fill="#fef08a" stroke="#d97706" stroke-width="2.5" filter="url(#glowGold)" />
        <rect x="14" y="14" width="28" height="28" rx="8" fill="#d97706" />
        <text x="28" y="33" fill="#ffffff" font-family="sans-serif" font-size="14" text-anchor="middle">⭐</text>
        <text x="50" y="26" fill="#713f12" font-family="system-ui, sans-serif" font-size="12" font-weight="800">Pregunta de Examen</text>
        <text x="50" y="38" fill="#b45309" font-family="system-ui, sans-serif" font-size="9.5" font-weight="bold">#FEF08A + #D97706</text>
        <rect x="14" y="48" width="217" height="1" fill="#fde047" />
        <text x="14" y="66" fill="#713f12" font-family="system-ui, sans-serif" font-size="10.5" font-weight="bold">¡Pregunta Frecuente!</text>
        <text x="14" y="82" fill="#1e293b" font-family="system-ui, sans-serif" font-size="9.5">¿La masa cambia con la gravedad?</text>
        <text x="14" y="98" fill="#854d0e" font-family="system-ui, sans-serif" font-size="9.5 font-weight=bold">No. La masa es constante; el peso varía.</text>
        <rect x="14" y="122" width="80" height="18" rx="4" fill="#b45309" />
        <text x="54" y="134" fill="#ffffff" font-family="system-ui, sans-serif" font-size="8.5" font-weight="bold" text-anchor="middle">Alta Prioridad</text>
      </g>

      <!-- 4. ALERTA / ERROR COMÚN -->
      <g transform="translate(786, 0)">
        <rect x="0" y="0" width="245" height="155" rx="12" fill="#fee2e2" stroke="#dc2626" stroke-width="2.5" />
        <rect x="14" y="14" width="28" height="28" rx="8" fill="#dc2626" />
        <text x="28" y="33" fill="#ffffff" font-family="sans-serif" font-size="14" text-anchor="middle">⚠️</text>
        <text x="50" y="26" fill="#7f1d1d" font-family="system-ui, sans-serif" font-size="12" font-weight="800">Error a Evitar</text>
        <text x="50" y="38" fill="#dc2626" font-family="system-ui, sans-serif" font-size="9.5" font-weight="bold">#FEE2E2 + #DC2626</text>
        <rect x="14" y="48" width="217" height="1" fill="#fca5a5" />
        <text x="14" y="66" fill="#991b1b" font-family="system-ui, sans-serif" font-size="10.5" font-weight="bold">Confusión Típica</text>
        <text x="14" y="82" fill="#1e293b" font-family="system-ui, sans-serif" font-size="9.5">No confundir velocidad (vectorial) con rapidez (escalar).</text>
        <rect x="14" y="122" width="80" height="18" rx="4" fill="#dc2626" />
        <text x="54" y="134" fill="#ffffff" font-family="system-ui, sans-serif" font-size="8.5" font-weight="bold" text-anchor="middle">Trampa Típica</text>
      </g>

      <!-- FILA INFERIOR DE NODOS -->

      <!-- 5. PROCESO PASO A PASO -->
      <g transform="translate(0, 180)">
        <rect x="0" y="0" width="245" height="155" rx="12" fill="#ffedd5" stroke="#ea580c" stroke-width="2.5" />
        <rect x="14" y="14" width="28" height="28" rx="8" fill="#ea580c" />
        <text x="28" y="33" fill="#ffffff" font-family="sans-serif" font-size="14" text-anchor="middle">🔄</text>
        <text x="50" y="26" fill="#7c2d12" font-family="system-ui, sans-serif" font-size="12" font-weight="800">Método de 3 Pasos</text>
        <text x="50" y="38" fill="#ea580c" font-family="system-ui, sans-serif" font-size="9.5" font-weight="bold">#FFEDD5 + #EA580C</text>
        <rect x="14" y="48" width="217" height="1" fill="#fdba74" />
        <text x="14" y="66" fill="#7c2d12" font-family="system-ui, sans-serif" font-size="10.5" font-weight="bold">Resolución de Problemas</text>
        <text x="14" y="82" fill="#1e293b" font-family="system-ui, sans-serif" font-size="9.5">1. Identificar datos conocidos</text>
        <text x="14" y="96" fill="#1e293b" font-family="system-ui, sans-serif" font-size="9.5">2. Seleccionar ecuación rectora</text>
        <text x="14" y="110" fill="#1e293b" font-family="system-ui, sans-serif" font-size="9.5">3. Despejar y verificar unidades</text>
        <rect x="14" y="125" width="85" height="18" rx="4" fill="#c2410c" />
        <text x="56" y="137" fill="#ffffff" font-family="system-ui, sans-serif" font-size="8.5" font-weight="bold" text-anchor="middle">Paso a Paso</text>
      </g>

      <!-- 6. PREGUNTA / HIPÓTESIS -->
      <g transform="translate(262, 180)">
        <rect x="0" y="0" width="245" height="155" rx="12" fill="#f3e8ff" stroke="#7c3aed" stroke-width="2.5" />
        <rect x="14" y="14" width="28" height="28" rx="8" fill="#7c3aed" />
        <text x="28" y="33" fill="#ffffff" font-family="sans-serif" font-size="14" text-anchor="middle">💡</text>
        <text x="50" y="26" fill="#581c87" font-family="system-ui, sans-serif" font-size="12" font-weight="800">Pregunta Reflexiva</text>
        <text x="50" y="38" fill="#7c3aed" font-family="system-ui, sans-serif" font-size="9.5" font-weight="bold">#F3E8FF + #7C3AED</text>
        <rect x="14" y="48" width="217" height="1" fill="#d8b4fe" />
        <text x="14" y="66" fill="#581c87" font-family="system-ui, sans-serif" font-size="10.5" font-weight="bold">Debate en Clase</text>
        <text x="14" y="82" fill="#1e293b" font-family="system-ui, sans-serif" font-size="9.5">¿Qué sucedería si no existiese la fricción en el mundo cotidiano?</text>
        <rect x="14" y="125" width="80" height="18" rx="4" fill="#7c3aed" />
        <text x="54" y="137" fill="#ffffff" font-family="system-ui, sans-serif" font-size="8.5" font-weight="bold" text-anchor="middle">Investigación</text>
      </g>

      <!-- 7. REGLA MNEMOTÉCNICA -->
      <g transform="translate(524, 180)">
        <rect x="0" y="0" width="245" height="155" rx="12" fill="#fce7f3" stroke="#db2777" stroke-width="2.5" />
        <rect x="14" y="14" width="28" height="28" rx="8" fill="#db2777" />
        <text x="28" y="33" fill="#ffffff" font-family="sans-serif" font-size="14" text-anchor="middle">🧠</text>
        <text x="50" y="26" fill="#831843" font-family="system-ui, sans-serif" font-size="12" font-weight="800">Regla Mnemotécnica</text>
        <text x="50" y="38" fill="#db2777" font-family="system-ui, sans-serif" font-size="9.5" font-weight="bold">#FCE7F3 + #DB2777</text>
        <rect x="14" y="48" width="217" height="1" fill="#fbcfe8" />
        <text x="14" y="66" fill="#831843" font-family="system-ui, sans-serif" font-size="10.5" font-weight="bold">Acrónimo para Memorizar</text>
        <text x="14" y="82" fill="#1e293b" font-family="system-ui, sans-serif" font-size="9.5">"SOH-CAH-TOA" para razones trigonométricas: Seno, Coseno, Tangente.</text>
        <rect x="14" y="125" width="85" height="18" rx="4" fill="#be185d" />
        <text x="56" y="137" fill="#ffffff" font-family="system-ui, sans-serif" font-size="8.5" font-weight="bold" text-anchor="middle">Mnemotecnia</text>
      </g>

      <!-- 8. ESTRUCTURA / NOTAS -->
      <g transform="translate(786, 180)">
        <rect x="0" y="0" width="245" height="155" rx="12" fill="#f1f5f9" stroke="#475569" stroke-width="2.5" />
        <rect x="14" y="14" width="28" height="28" rx="8" fill="#475569" />
        <text x="28" y="33" fill="#ffffff" font-family="sans-serif" font-size="14" text-anchor="middle">📝</text>
        <text x="50" y="26" fill="#0f172a" font-family="system-ui, sans-serif" font-size="12" font-weight="800">Nota Estructurada</text>
        <text x="50" y="38" fill="#475569" font-family="system-ui, sans-serif" font-size="9.5" font-weight="bold">#F1F5F9 + #0F172A</text>
        <rect x="14" y="48" width="217" height="1" fill="#cbd5e1" />
        <text x="14" y="66" fill="#0f172a" font-family="system-ui, sans-serif" font-size="10.5" font-weight="bold">Bibliografía &amp; Fuentes</text>
        <text x="14" y="82" fill="#334155" font-family="system-ui, sans-serif" font-size="9.5">Tipler &amp; Mosca, "Física para la Ciencia y la Tecnología", Vol. 1, Cap. 7.</text>
        <rect x="14" y="125" width="80" height="18" rx="4" fill="#334155" />
        <text x="54" y="137" fill="#ffffff" font-family="system-ui, sans-serif" font-size="8.5" font-weight="bold" text-anchor="middle">Referencia</text>
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
  <title>Visor de Paleta Pedagógica de 16 Colores</title>
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
    <h1>🎓 Visor de la Paleta Pedagógica de 16 Colores</h1>
    <p>Visualización del mapa mental educativo y su impacto mnemotécnico en el aprendizaje</p>
  </div>
  <div class="container">
    {svg_content}
  </div>
</body>
</html>"""

with open(HTML_PATH, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Archivos pedagógicos generados con éxito:\n- SVG: {SVG_PATH}\n- HTML: {HTML_PATH}")
