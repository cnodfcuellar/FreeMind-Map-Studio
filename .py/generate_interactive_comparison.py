import math

def generate_interactive_comparison():
    s = 18.0
    W = 3.0 * s
    H = round(s * math.sqrt(3) * 100) / 100
    hHalf = round(H / 2.0 * 100) / 100
    s05 = round(0.5 * s * 100) / 100
    s15 = round(1.5 * s * 100) / 100
    s2 = round(2.0 * s * 100) / 100
    s3 = round(3.0 * s * 100) / 100

    path_bug = f"M 0 {hHalf} L {s05} 0 L {s15} 0 L {s2} {hHalf} L {s15} {H} L {s05} {H} Z M {s2} {hHalf} L {s * 2.5} 0 M {s2} {hHalf} L {s * 2.5} {H} M {s3} {hHalf} L {s * 2.5} 0 M {s3} {hHalf} L {s * 2.5} {H}"
    path_clean = f"M {s05},{H} L 0,{hHalf} L {s05},0 L {s15},0 L {s2},{hHalf} L {s3},{hHalf} M {s15},{H} L {s2},{hHalf}"

    html = f'''<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Demostración y Corrección: Trama Panal (Honeycomb)</title>
<style>
  body {{
    background: #0f172a;
    color: #f1f5f9;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    margin: 0;
    padding: 30px;
  }}
  .container {{
    max-width: 1040px;
    margin: 0 auto;
  }}
  h1 {{
    font-size: 24px;
    margin-bottom: 8px;
    color: #38bdf8;
  }}
  p.subtitle {{
    color: #94a3b8;
    margin-bottom: 24px;
    font-size: 14px;
  }}
  .grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 30px;
  }}
  .card {{
    background: #1e293b;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }}
  .card.error {{
    border: 2px solid #ef4444;
  }}
  .card.success {{
    border: 2px solid #10b981;
  }}
  .card-title {{
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }}
  .card.error .card-title {{ color: #f87171; }}
  .card.success .card-title {{ color: #34d399; }}
  .preview-box {{
    width: 100%;
    height: 320px;
    border-radius: 8px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
  }}
  .explanation {{
    margin-top: 12px;
    font-size: 13px;
    color: #cbd5e1;
    line-height: 1.5;
  }}
  code {{
    background: #334155;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
  }}
  .badge {{
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
  }}
  .badge.red {{ background: #7f1d1d; color: #fca5a5; }}
  .badge.green {{ background: #064e3b; color: #a7f3d0; }}
</style>
</head>
<body>
  <div class="container">
    <h1>🔬 Diagnóstico y Solución: Trama Panal de Abejas</h1>
    <p class="subtitle">Resolución de la geometría de teselación regular hexagonal sin rombos ni distorsión angular.</p>

    <div class="grid">
      <!-- Error previo -->
      <div class="card error">
        <div class="card-title">
          <span class="badge red">ERROR ANTERIOR</span>
          <span>Tu captura: Rombos intercalados</span>
        </div>
        <div class="preview-box">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="pat-error" width="{W}" height="{H}" patternUnits="userSpaceOnUse">
                <rect width="100%" height="100%" fill="#ffffff" />
                <path d="{path_bug}" fill="none" stroke="#64748b" stroke-width="1.3" stroke-opacity="0.85" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pat-error)" />
          </svg>
        </div>
        <div class="explanation">
          <strong>Causa matemática del fallo:</strong> El código dibujaba el primer hexágono pero en la segunda columna conectaba las aristas al centro <code>(2.5s, 0)</code> en lugar de cerrarlo hacia el siguiente hexágono, generando una columna de rombos cerrados entre columnas de hexágonos.
        </div>
      </div>

      <!-- Solución corregida -->
      <div class="card success">
        <div class="card-title">
          <span class="badge green">SOLUCIÓN MATEMÁTICA</span>
          <span>100% Hexágonos Regulares (Panal Puro)</span>
        </div>
        <div class="preview-box">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="pat-success" width="{W}" height="{H}" patternUnits="userSpaceOnUse">
                <rect width="100%" height="100%" fill="#ffffff" />
                <path d="{path_clean}" fill="none" stroke="#2563eb" stroke-width="1.3" stroke-opacity="0.85" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pat-success)" />
          </svg>
        </div>
        <div class="explanation">
          <strong>Fórmula canónica de 6 aristas únicas:</strong> Celda rectangular periódica <code>W = 3s</code>, <code>H = s√3</code>. Dibuja exactamente las 6 aristas que cubren el plano por traslación:
          <br><code>M 0.5s,H L 0,H/2 L 0.5s,0 L 1.5s,0 L 2s,H/2 L 3s,H/2 M 1.5s,H L 2s,H/2</code>.
          <br><strong>Resultado:</strong> Todos los polígonos son hexágonos idénticos de 120° con aristas de longitud <code>s</code>. 0 rombos.
        </div>
      </div>
    </div>
  </div>
</body>
</html>'''

    with open("C:/Users/admin/.gemini/antigravity/brain/e14d73aa-b7b2-4a1d-9994-dc393facce6c/visor_panal.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("visor_panal.html generado exitosamente")

if __name__ == "__main__":
    generate_interactive_comparison()
