"""
Generador del SVG exacto que reproduce el dibujo del usuario:
Arista tipo Corchete con doble bisel a 45° (en la bifurcación y en la llegada)
sobre papel cuadriculado milimétrico y variaciones de estilos de trazo.
"""

import os

# Tamaño de celda de cuadrícula
U = 24  # 24px por celda

svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="100%" height="100%" style="background:#f8fafc; font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <defs>
    <!-- Filtro de sombra suave -->
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.12"/>
    </filter>

    <!-- Patrón de cuadrícula azul suave idéntica al dibujo del usuario -->
    <pattern id="grid-user" width="{U}" height="{U}" patternUnits="userSpaceOnUse">
      <path d="M {U} 0 L 0 0 0 {U}" fill="none" stroke="#bae6fd" stroke-width="1.2"/>
    </pattern>

    <!-- Marcador de punto de bifurcación -->
    <circle id="dot" r="3.5" fill="#0f172a"/>
  </defs>

  <!-- ========================================================
       PARTE 1: REPRODUCCIÓN EXACTA DEL DIBUJO DEL USUARIO (GRID)
       ======================================================== -->
  <g transform="translate(40, 30)">
    <!-- Marco de papel milimetrado -->
    <rect x="0" y="0" width="1120" height="420" rx="14" fill="#ffffff" stroke="#93c5fd" stroke-width="1.5" filter="url(#shadow)"/>
    <rect x="0" y="0" width="1120" height="420" rx="14" fill="url(#grid-user)"/>

    <!-- Cabecera del panel -->
    <rect x="16" y="14" width="460" height="32" rx="6" fill="#f0f9ff" stroke="#bae6fd" stroke-width="1"/>
    <text x="28" y="35" fill="#0369a1" font-size="13" font-weight="700">A. Reproducción Exacta del Dibujo (Geometría en Cuadrícula)</text>
    <text x="1100" y="35" fill="#0284c7" font-size="11" font-weight="600" text-anchor="end">Doble Bisel a 45°: Bifurcación + Llegada</text>

    <!--
      COORDENADAS EN CELDA (U = 24px):
      Padre: X=3*U (72), Y=7*U (168), Ancho=6*U (144), Alto=4*U (96), rx=20
      Lado derecho padre: X = 72 + 144 = 216, Y_mid = 168 + 48 = 216

      Tronco común:
      Desde X = 216 hasta X_split = 216 + 4*U = 312, Y = 216

      Bifurcación central (X_split = 312, Y = 216):
      - Cúspide biselada superior a 45°:
        L 312 216 -> L (312 + 1*U = 336, 216 - 1*U = 192)
      - Columna vertical hacia arriba:
        L 336 192 -> L (336, 96 + 1*U = 120)
      - Bisel de llegada superior a 45°:
        L 336 120 -> L (336 + 1*U = 360, 96)
      - Llegada horizontal al hijo superior:
        L 360 96 -> L (456, 96)

      - Rama central recta:
        L 312 216 -> L 456 216

      - Cúspide biselada inferior a 45°:
        L 312 216 -> L (336, 216 + 1*U = 240)
      - Columna vertical hacia abajo:
        L 336 240 -> L (336, 336 - 1*U = 312)
      - Bisel de llegada inferior a 45°:
        L 336 312 -> L (360, 336)
      - Llegada horizontal al hijo inferior:
        L 360 336 -> L (456, 336)

      Hijos: X = 456 (19*U), Ancho = 6*U (144), Alto = 4*U (96)
      Hijo 1: Y = 96 - 48 = 48
      Hijo 2: Y = 216 - 48 = 168
      Hijo 3: Y = 336 - 48 = 288
    -->

    <!-- NODO PADRE (MAGENTA VIBRANTE DEL DIBUJO #ff00ff) -->
    <g transform="translate(72, 168)">
      <rect x="0" y="0" width="144" height="96" rx="28" fill="#f000ff" stroke="#d900e6" stroke-width="2" filter="url(#shadow)"/>
      <text x="72" y="54" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">Nodo Padre</text>
    </g>

    <!-- TRAZADO DE ARISTAS CON DOBLE BISEL A 45° -->
    <g stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <!-- Tronco principal desde el padre -->
      <path d="M 216 216 L 312 216"/>

      <!-- Rama Superior: Bisel 45° -> Vertical -> Bisel 45° -> Horizontal -->
      <path d="M 312 216 L 336 192 L 336 120 L 360 96 L 456 96"/>

      <!-- Rama Central: Horizontal directa -->
      <path d="M 312 216 L 456 216"/>

      <!-- Rama Inferior: Bisel 45° -> Vertical -> Bisel 45° -> Horizontal -->
      <path d="M 312 216 L 336 240 L 336 312 L 360 336 L 456 336"/>
    </g>

    <!-- INDICADORES DIDÁCTICOS Y COTAS DE ÁNGULO -->
    <!-- Cota de 45° en bifurcación superior -->
    <line x1="312" y1="216" x2="350" y2="216" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3 2"/>
    <path d="M 330 216 A 18 18 0 0 0 326 202" fill="none" stroke="#ea580c" stroke-width="1.8"/>
    <text x="338" y="206" fill="#ea580c" font-size="10" font-weight="800">45°</text>

    <!-- Cota de 45° en llegada superior -->
    <line x1="312" y1="120" x2="336" y2="120" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3 2"/>
    <path d="M 336 108 A 12 12 0 0 1 346 114" fill="none" stroke="#ea580c" stroke-width="1.8"/>
    <text x="348" y="114" fill="#ea580c" font-size="10" font-weight="800">45°</text>

    <!-- Puntos de referencia -->
    <circle cx="312" cy="216" r="3.5" fill="#f000ff"/>
    <circle cx="336" cy="192" r="2.5" fill="#0f172a"/>
    <circle cx="336" cy="120" r="2.5" fill="#0f172a"/>
    <circle cx="360" cy="96" r="2.5" fill="#0f172a"/>

    <!-- 3 NODOS HIJOS (MAGENTA VIBRANTE) -->
    <!-- Hijo 1 (Superior) -->
    <g transform="translate(456, 48)">
      <rect x="0" y="0" width="144" height="96" rx="28" fill="#f000ff" stroke="#d900e6" stroke-width="2" filter="url(#shadow)"/>
      <text x="72" y="54" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">Hijo 1</text>
    </g>

    <!-- Hijo 2 (Central) -->
    <g transform="translate(456, 168)">
      <rect x="0" y="0" width="144" height="96" rx="28" fill="#f000ff" stroke="#d900e6" stroke-width="2" filter="url(#shadow)"/>
      <text x="72" y="54" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">Hijo 2</text>
    </g>

    <!-- Hijo 3 (Inferior) -->
    <g transform="translate(456, 288)">
      <rect x="0" y="0" width="144" height="96" rx="28" fill="#f000ff" stroke="#d900e6" stroke-width="2" filter="url(#shadow)"/>
      <text x="72" y="54" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">Hijo 3</text>
    </g>

    <!-- PANEL LATERAL EXPLICATIVO -->
    <g transform="translate(640, 48)">
      <rect x="0" y="0" width="450" height="336" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
      
      <text x="20" y="32" fill="#0f172a" font-size="14" font-weight="700">Ventajas de la Fórmula del Usuario</text>

      <g transform="translate(20, 56)">
        <circle cx="8" cy="8" r="8" fill="#dbeafe"/>
        <text x="8" y="12" fill="#1d4ed8" font-size="10" font-weight="800" text-anchor="middle">1</text>
        <text x="26" y="12" fill="#1e293b" font-size="12" font-weight="700">Cúspide de Corchete en Chevron (&lt;):</text>
        <text x="26" y="28" fill="#64748b" font-size="11.5">El padre proyecta un único tronco que abre a ±45°.</text>
      </g>

      <g transform="translate(20, 110)">
        <circle cx="8" cy="8" r="8" fill="#dbeafe"/>
        <text x="8" y="12" fill="#1d4ed8" font-size="10" font-weight="800" text-anchor="middle">2</text>
        <text x="26" y="12" fill="#1e293b" font-size="12" font-weight="700">Bus / Columna Vertical Alineada:</text>
        <text x="26" y="28" fill="#64748b" font-size="11.5">Mantiene a todos los hermanos cohesionados en bloque.</text>
      </g>

      <g transform="translate(20, 164)">
        <circle cx="8" cy="8" r="8" fill="#dbeafe"/>
        <text x="8" y="12" fill="#1d4ed8" font-size="10" font-weight="800" text-anchor="middle">3</text>
        <text x="26" y="12" fill="#1e293b" font-size="12" font-weight="700">Segundo Chaflán a 45° hacia el Hijo:</text>
        <text x="26" y="28" fill="#64748b" font-size="11.5">La entrada al nodo es 100% horizontal y sin colisiones.</text>
      </g>

      <g transform="translate(20, 218)">
        <circle cx="8" cy="8" r="8" fill="#dcfce7"/>
        <text x="8" y="12" fill="#15803d" font-size="10" font-weight="800" text-anchor="middle">✓</text>
        <text x="26" y="12" fill="#1e293b" font-size="12" font-weight="700">Escalable a N Hermanos:</text>
        <text x="26" y="28" fill="#64748b" font-size="11.5">Funciona idéntico con 2, 3, 5 o 10 nodos hijos.</text>
      </g>

      <!-- Badge con la fórmula matemática -->
      <rect x="20" y="270" width="410" height="46" rx="6" fill="#0f172a"/>
      <text x="32" y="292" fill="#38bdf8" font-size="11" font-weight="700">Fórmula analítica exacta:</text>
      <text x="32" y="306" fill="#94a3b8" font-size="10.5">dx = 16px (1 chamfer), x_bus = x_parent + (x_child - x_parent) * 0.45</text>
    </g>
  </g>


  <!-- ========================================================
       PARTE 2: APLICACIÓN DE ESTILOS DE TRAZO SOBRE EL CORCHETE 45°
       ======================================================== -->
  <g transform="translate(40, 480)">
    <rect x="0" y="0" width="1120" height="380" rx="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2" filter="url(#shadow)"/>
    
    <!-- Encabezado -->
    <rect x="16" y="14" width="530" height="32" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
    <text x="28" y="35" fill="#0f172a" font-size="13" font-weight="700">B. Estilos de Trazo Aplicados sobre el Corchete a 45° del Usuario</text>

    <!-- 4 VARIANTES EN GRID 2x2 -->
    
    <!-- 1. CORCHETE DOBLE LÍNEA -->
    <g transform="translate(30, 60)">
      <rect x="0" y="0" width="510" height="135" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <text x="16" y="24" fill="#ca8a04" font-size="12" font-weight="700">1. Corchete con DOBLE LÍNEA (Troncal / Vía Principal)</text>
      
      <!-- Mini Padre -->
      <rect x="20" y="45" width="80" height="36" rx="10" fill="#fef08a" stroke="#eab308" stroke-width="1.5"/>
      <text x="60" y="68" fill="#713f12" font-size="11" font-weight="700" text-anchor="middle">Padre</text>

      <!-- Doble línea paralela con separación de 3.5px -->
      <!-- Línea A (exterior) -->
      <path d="M 100 61 L 158 61 L 173 46 L 173 34 L 188 19 L 260 19" fill="none" stroke="#ca8a04" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 100 61 L 260 61" fill="none" stroke="#ca8a04" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M 100 65 L 158 65 L 173 80 L 173 92 L 188 107 L 260 107" fill="none" stroke="#ca8a04" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Línea B (interior) -->
      <path d="M 100 64 L 156 64 L 170 50 L 170 36 L 186 22 L 260 22" fill="none" stroke="#eab308" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 100 64 L 260 64" fill="none" stroke="#eab308" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M 100 62 L 156 62 L 170 76 L 170 90 L 186 104 L 260 104" fill="none" stroke="#eab308" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Mini Hijos -->
      <rect x="260" y="8" width="80" height="26" rx="6" fill="#fef08a" stroke="#eab308" stroke-width="1.5"/>
      <text x="300" y="25" fill="#713f12" font-size="10" font-weight="600" text-anchor="middle">Hijo 1</text>
      <rect x="260" y="50" width="80" height="26" rx="6" fill="#fef08a" stroke="#eab308" stroke-width="1.5"/>
      <text x="300" y="67" fill="#713f12" font-size="10" font-weight="600" text-anchor="middle">Hijo 2</text>
      <rect x="260" y="93" width="80" height="26" rx="6" fill="#fef08a" stroke="#eab308" stroke-width="1.5"/>
      <text x="300" y="110" fill="#713f12" font-size="10" font-weight="600" text-anchor="middle">Hijo 3</text>

      <text x="360" y="68" fill="#854d0e" font-size="11" font-weight="500">Jerarquía doble institucional</text>
    </g>

    <!-- 2. CORCHETE GUIONES TÉCNICOS -->
    <g transform="translate(580, 60)">
      <rect x="0" y="0" width="510" height="135" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <text x="16" y="24" fill="#7c3aed" font-size="12" font-weight="700">2. Corchete con GUIONES (Estructura Modular / Borrador)</text>
      
      <!-- Mini Padre -->
      <rect x="20" y="45" width="80" height="36" rx="10" fill="#ede9fe" stroke="#8b5cf6" stroke-width="1.5"/>
      <text x="60" y="68" fill="#5b21b6" font-size="11" font-weight="700" text-anchor="middle">Padre</text>

      <!-- Guiones siguiendo el camino biselado a 45° -->
      <path d="M 100 63 L 160 63 L 175 48 L 175 35 L 190 20 L 260 20" fill="none" stroke="#7c3aed" stroke-width="2.2" stroke-dasharray="6 4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 160 63 L 260 63" fill="none" stroke="#7c3aed" stroke-width="2.2" stroke-dasharray="6 4" stroke-linecap="round"/>
      <path d="M 100 63 L 160 63 L 175 78 L 175 91 L 190 106 L 260 106" fill="none" stroke="#7c3aed" stroke-width="2.2" stroke-dasharray="6 4" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Mini Hijos -->
      <rect x="260" y="8" width="80" height="26" rx="6" fill="#ede9fe" stroke="#8b5cf6" stroke-width="1.5"/>
      <text x="300" y="25" fill="#5b21b6" font-size="10" font-weight="600" text-anchor="middle">Hijo 1</text>
      <rect x="260" y="50" width="80" height="26" rx="6" fill="#ede9fe" stroke="#8b5cf6" stroke-width="1.5"/>
      <text x="300" y="67" fill="#5b21b6" font-size="10" font-weight="600" text-anchor="middle">Hijo 2</text>
      <rect x="260" y="93" width="80" height="26" rx="6" fill="#ede9fe" stroke="#8b5cf6" stroke-width="1.5"/>
      <text x="300" y="110" fill="#5b21b6" font-size="10" font-weight="600" text-anchor="middle">Hijo 3</text>

      <text x="360" y="68" fill="#6d28d9" font-size="11" font-weight="500">Relación modular / condicional</text>
    </g>

    <!-- 3. CORCHETE ONDULADO SINUOSO -->
    <g transform="translate(30, 215)">
      <rect x="0" y="0" width="510" height="140" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <text x="16" y="24" fill="#059669" font-size="12" font-weight="700">3. Corchete ONDULADO (Creativo / Orgánico)</text>
      
      <!-- Mini Padre -->
      <rect x="20" y="47" width="80" height="36" rx="10" fill="#d1fae5" stroke="#10b981" stroke-width="1.5"/>
      <text x="60" y="70" fill="#065f46" font-size="11" font-weight="700" text-anchor="middle">Padre</text>

      <!-- Ondas continuas recorriendo la geometría -->
      <path d="M 100 65 Q 112 59 124 65 T 148 65 L 160 65 L 175 50 L 175 35 L 190 20 Q 205 14 220 20 T 250 20 L 260 20" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M 148 65 Q 170 59 192 65 T 236 65 L 260 65" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M 100 65 Q 112 71 124 65 T 148 65 L 160 65 L 175 80 L 175 95 L 190 110 Q 205 116 220 110 T 250 110 L 260 110" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round"/>

      <!-- Mini Hijos -->
      <rect x="260" y="8" width="80" height="26" rx="6" fill="#d1fae5" stroke="#10b981" stroke-width="1.5"/>
      <text x="300" y="25" fill="#065f46" font-size="10" font-weight="600" text-anchor="middle">Hijo 1</text>
      <rect x="260" y="52" width="80" height="26" rx="6" fill="#d1fae5" stroke="#10b981" stroke-width="1.5"/>
      <text x="300" y="69" fill="#065f46" font-size="10" font-weight="600" text-anchor="middle">Hijo 2</text>
      <rect x="260" y="97" width="80" height="26" rx="6" fill="#d1fae5" stroke="#10b981" stroke-width="1.5"/>
      <text x="300" y="114" fill="#065f46" font-size="10" font-weight="600" text-anchor="middle">Hijo 3</text>

      <text x="360" y="70" fill="#047857" font-size="11" font-weight="500">Transiciones suaves y pensamiento fluido</text>
    </g>

    <!-- 4. CORCHETE ZIGZAG -->
    <g transform="translate(580, 215)">
      <rect x="0" y="0" width="510" height="140" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <text x="16" y="24" fill="#dc2626" font-size="12" font-weight="700">4. Corchete ZIGZAG (Tensión / Energía / Alerta)</text>
      
      <!-- Mini Padre -->
      <rect x="20" y="47" width="80" height="36" rx="10" fill="#fee2e2" stroke="#ef4444" stroke-width="1.5"/>
      <text x="60" y="70" fill="#991b1b" font-size="11" font-weight="700" text-anchor="middle">Padre</text>

      <!-- Dientes zigzag a lo largo del corchete -->
      <path d="M 100 65 L 110 59 L 120 71 L 130 59 L 140 71 L 150 65 L 160 65 L 175 50 L 175 35 L 190 20 L 200 14 L 210 26 L 220 14 L 230 26 L 240 14 L 250 26 L 260 20" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 150 65 L 160 59 L 170 71 L 180 59 L 190 71 L 200 59 L 210 71 L 220 59 L 230 71 L 240 59 L 250 71 L 260 65" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 100 65 L 110 71 L 120 59 L 130 71 L 140 59 L 150 65 L 160 65 L 175 80 L 175 95 L 190 110 L 200 116 L 210 104 L 220 116 L 230 104 L 240 116 L 250 104 L 260 110" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Mini Hijos -->
      <rect x="260" y="8" width="80" height="26" rx="6" fill="#fee2e2" stroke="#ef4444" stroke-width="1.5"/>
      <text x="300" y="25" fill="#991b1b" font-size="10" font-weight="600" text-anchor="middle">Hijo 1</text>
      <rect x="260" y="52" width="80" height="26" rx="6" fill="#fee2e2" stroke="#ef4444" stroke-width="1.5"/>
      <text x="300" y="69" fill="#991b1b" font-size="10" font-weight="600" text-anchor="middle">Hijo 2</text>
      <rect x="260" y="97" width="80" height="26" rx="6" fill="#fee2e2" stroke="#ef4444" stroke-width="1.5"/>
      <text x="300" y="114" fill="#991b1b" font-size="10" font-weight="600" text-anchor="middle">Hijo 3</text>

      <text x="360" y="70" fill="#b91c1c" font-size="11" font-weight="500">Conflictos, advertencias o riesgos</text>
    </g>
  </g>
</svg>
"""

# Guardar en doc/img/
doc_img_path = os.path.join("doc", "img", "arista_corchete_biselado_45.svg")
with open(doc_img_path, "w", encoding="utf-8") as f:
    f.write(svg_content)
print(f"Guardado en {doc_img_path}")

# Guardar en artefactos
artifact_dir = r"C:\Users\admin\.gemini\antigravity\brain\e14d73aa-b7b2-4a1d-9994-dc393facce6c"
artifact_svg = os.path.join(artifact_dir, "arista_corchete_biselado_45.svg")
with open(artifact_svg, "w", encoding="utf-8") as f:
    f.write(svg_content)
print(f"Guardado en {artifact_svg}")

# Crear visor HTML interactivo
viewer_html = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Visor: Arista tipo Corchete con Doble Bisel a 45°</title>
  <style>
    body {{
      margin: 0;
      padding: 24px;
      background: #0f172a;
      color: #f8fafc;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
    }}
    .header {{
      max-width: 1200px;
      width: 100%;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    h1 {{ font-size: 20px; margin: 0; color: #f000ff; }}
    p {{ font-size: 13px; color: #94a3b8; margin: 4px 0 0; }}
    .svg-container {{
      max-width: 1200px;
      width: 100%;
      background: #ffffff;
      border: 1px solid #334155;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }}
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Arista tipo Corchete con Doble Bisel a 45°</h1>
      <p>Reproducción de tu boceto con cuadrícula milimetrada y estilos de trazo (Doble, Guiones, Ondulado, Zigzag)</p>
    </div>
  </div>
  <div class="svg-container">
    {svg_content}
  </div>
</body>
</html>
"""

artifact_html = os.path.join(artifact_dir, "visor_arista_corchete_45.html")
with open(artifact_html, "w", encoding="utf-8") as f:
    f.write(viewer_html)
print(f"Guardado en {artifact_html}")

