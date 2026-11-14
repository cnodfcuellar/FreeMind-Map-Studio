import math

def generate_comparativa_svg():
    s = 18.0
    W_flat = 3.0 * s
    H_flat = s * math.sqrt(3)
    hHalf = H_flat / 2.0
    s05 = 0.5 * s
    s15 = 1.5 * s
    s2 = 2.0 * s
    s3 = 3.0 * s

    w_box = 320
    h_box = 240

    # Versión bug anterior:
    # d="M 0 {hHalf} L {s05} 0 L {s15} 0 L {s2} {hHalf} L {s15} {H_flat} L {s05} {H_flat} Z M {s2} {hHalf} L {s * 2.5} 0 M {s2} {hHalf} L {s * 2.5} {H_flat} M {s3} {hHalf} L {s * 2.5} 0 M {s3} {hHalf} L {s * 2.5} {H_flat}"

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1020 340" width="1020" height="340" style="background:#0f172a; font-family:sans-serif;">
  <defs>
    <!-- 1. BUG ANTERIOR (EL QUE MOSTRÓ EL USUARIO EN LA FOTO) -->
    <pattern id="pat-bug" width="{W_flat}" height="{H_flat}" patternUnits="userSpaceOnUse">
      <rect width="100%" height="100%" fill="#ffffff" />
      <path d="M 0 {hHalf} L {s05} 0 L {s15} 0 L {s2} {hHalf} L {s15} {H_flat} L {s05} {H_flat} Z M {s2} {hHalf} L {s * 2.5} 0 M {s2} {hHalf} L {s * 2.5} {H_flat} M {s3} {hHalf} L {s * 2.5} 0 M {s3} {hHalf} L {s * 2.5} {H_flat}"
            fill="none" stroke="#64748b" stroke-width="1.2" stroke-opacity="0.8" />
    </pattern>

    <!-- 2. CORREGIDO FLAT-TOPPED (PANAL PERFECTO 100% REGULAR) -->
    <pattern id="pat-flat-clean" width="{W_flat}" height="{H_flat}" patternUnits="userSpaceOnUse">
      <rect width="100%" height="100%" fill="#ffffff" />
      <path d="M 0,{hHalf} L {s05},0 L {s15},0 L {s2},{hHalf} L {s15},{H_flat} L {s05},{H_flat} Z M {s2},{hHalf} L {s3},{hHalf}"
            fill="none" stroke="#2563eb" stroke-width="1.3" stroke-opacity="0.9" />
    </pattern>

    <!-- 3. CORREGIDO POINTY-TOPPED (PANAL VERTICAL DE COLMENA NATURAL) -->
    <pattern id="pat-pointy-clean" width="{s * math.sqrt(3)}" height="{3 * s}" patternUnits="userSpaceOnUse">
      <rect width="100%" height="100%" fill="#ffffff" />
      <path d="M {s * math.sqrt(3) / 2},0 L {s * math.sqrt(3)},{0.5 * s} L {s * math.sqrt(3)},{1.5 * s} L {s * math.sqrt(3) / 2},{2 * s} L 0,{1.5 * s} L 0,{0.5 * s} Z M {s * math.sqrt(3) / 2},{2 * s} L {s * math.sqrt(3) / 2},{3 * s}"
            fill="none" stroke="#059669" stroke-width="1.3" stroke-opacity="0.9" />
    </pattern>
  </defs>

  <!-- Título -->
  <text x="510" y="30" fill="#f8fafc" font-size="16" font-weight="bold" text-anchor="middle">
    DIAGNÓSTICO Y CORRECCIÓN: TRAMA PANAL (HONEYCOMB / HEXÁGONOS)
  </text>

  <!-- Panel 1: Bug anterior -->
  <g transform="translate(20, 50)">
    <text x="160" y="20" fill="#f87171" font-size="13" font-weight="bold" text-anchor="middle">
      ❌ Anterior (Tu captura: rombos intercalados)
    </text>
    <rect x="0" y="30" width="{w_box}" height="{h_box}" rx="8" fill="url(#pat-bug)" stroke="#ef4444" stroke-width="2"/>
    <text x="160" y="220" fill="#fca5a5" font-size="11" text-anchor="middle">
      Vértice conectado erróneamente al centro (2.5s, 0)
    </text>
  </g>

  <!-- Panel 2: Flat-topped perfecto -->
  <g transform="translate(360, 50)">
    <text x="160" y="20" fill="#60a5fa" font-size="13" font-weight="bold" text-anchor="middle">
      ✔ Corregido Flat-topped (Horizontal)
    </text>
    <rect x="0" y="30" width="{w_box}" height="{h_box}" rx="8" fill="url(#pat-flat-clean)" stroke="#3b82f6" stroke-width="2"/>
    <text x="160" y="220" fill="#93c5fd" font-size="11" text-anchor="middle">
      100% hexágonos regulares, 0 rombos
    </text>
  </g>

  <!-- Panel 3: Pointy-topped perfecto -->
  <g transform="translate(700, 50)">
    <text x="160" y="20" fill="#34d399" font-size="13" font-weight="bold" text-anchor="middle">
      ✔ Corregido Pointy-topped (Vertical)
    </text>
    <rect x="0" y="30" width="{w_box}" height="{h_box}" rx="8" fill="url(#pat-pointy-clean)" stroke="#10b981" stroke-width="2"/>
    <text x="160" y="220" fill="#6ee7b7" font-size="11" text-anchor="middle">
      Colmena natural con paredes verticales
    </text>
  </g>
</svg>'''

    with open("C:/Users/admin/.gemini/antigravity/brain/e14d73aa-b7b2-4a1d-9994-dc393facce6c/comparativa_panal.svg", "w", encoding="utf-8") as f:
        f.write(svg)
    with open("../doc/img/comparativa_panal_rombos_vs_hexágonos.svg", "w", encoding="utf-8") as f:
        f.write(svg)
    print("comparativa_panal.svg guardado")

if __name__ == "__main__":
    generate_comparativa_svg()
