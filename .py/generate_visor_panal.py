import math

def generate_html_test():
    s = 20.0
    W = 3.0 * s
    H = s * math.sqrt(3)
    hHalf = H / 2.0
    s05 = 0.5 * s
    s15 = 1.5 * s
    s2 = 2.0 * s
    s3 = 3.0 * s

    svg_content = f'''<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Verificación Panal Regular</title>
<style>
  body {{
    background: #0f172a;
    color: #f8fafc;
    font-family: sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
  }}
  .card {{
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 16px;
    margin: 10px;
  }}
  .box {{
    width: 360px;
    height: 240px;
    border: 2px solid #38bdf8;
    border-radius: 8px;
  }}
</style>
</head>
<body>
  <h1>Comprobación Matemática: Panal de Abejas (Honeycomb)</h1>
  <p>Verificación de teselación 100% regular (todos los hexágonos con 6 lados iguales y ángulos de 120°)</p>
  
  <div style="display: flex; gap: 20px;">
    <div class="card">
      <h3>Propuesta Flat-topped (s = 20)</h3>
      <svg class="box">
        <defs>
          <pattern id="hex-pattern" width="{W}" height="{H}" patternUnits="userSpaceOnUse">
            <rect width="100%" height="100%" fill="#ffffff" />
            <path d="M 0,{hHalf} L {s05},0 L {s15},0 L {s2},{hHalf} L {s15},{H} L {s05},{H} Z M {s2},{hHalf} L {s3},{hHalf}"
                  fill="none" stroke="#475569" stroke-width="1.2" stroke-opacity="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex-pattern)" />
      </svg>
    </div>

    <div class="card">
      <h3>Propuesta Pointy-topped (s = 20, vertical)</h3>
      <!-- Pointy-topped: W = s * sqrt(3), H = 3 * s -->
      <svg class="box">
        <defs>
          <pattern id="hex-pointy" width="{s * math.sqrt(3)}" height="{3 * s}" patternUnits="userSpaceOnUse">
            <rect width="100%" height="100%" fill="#ffffff" />
            <path d="M {s * math.sqrt(3) / 2},0 L {s * math.sqrt(3)},{0.5 * s} L {s * math.sqrt(3)},{1.5 * s} L {s * math.sqrt(3) / 2},{2 * s} L 0,{1.5 * s} L 0,{0.5 * s} Z M {s * math.sqrt(3) / 2},{2 * s} L {s * math.sqrt(3) / 2},{3 * s}"
                  fill="none" stroke="#475569" stroke-width="1.2" stroke-opacity="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex-pointy)" />
      </svg>
    </div>
  </div>
</body>
</html>'''

    with open("C:/Users/admin/.gemini/antigravity/brain/e14d73aa-b7b2-4a1d-9994-dc393facce6c/visor_panal.html", "w", encoding="utf-8") as f:
        f.write(svg_content)
    print("visor_panal.html generado exitosamente")

if __name__ == "__main__":
    generate_html_test()
