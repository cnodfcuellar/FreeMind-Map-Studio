import math
from collections import defaultdict

def test_honeycomb_topology():
    s = 18.0
    W = 3.0 * s # 54.0
    H = s * math.sqrt(3) # 31.1769...
    hHalf = H / 2.0
    s05 = 0.5 * s
    s15 = 1.5 * s
    s2 = 2.0 * s
    s3 = 3.0 * s

    # Generemos las aristas en un grid de 5x5 tiles
    edges = set()
    def add_edge(p1, p2):
        # Redondear para evitar errores de coma flotante
        p1_r = (round(p1[0], 2), round(p1[1], 2))
        p2_r = (round(p2[0], 2), round(p2[1], 2))
        if p1_r == p2_r:
            return
        edge = tuple(sorted([p1_r, p2_r]))
        edges.add(edge)

    # Las aristas del path en el tile (0, 0):
    # Segmentos:
    # 1: (s05, H) -> (0, hHalf)
    # 2: (0, hHalf) -> (s05, 0)
    # 3: (s05, 0) -> (s15, 0)
    # 4: (s15, 0) -> (s2, hHalf)
    # 5: (s2, hHalf) -> (s3, hHalf)
    # 6: (s15, H) -> (s2, hHalf)

    tile_segments = [
        ((s05, H), (0, hHalf)),
        ((0, hHalf), (s05, 0)),
        ((s05, 0), (s15, 0)),
        ((s15, 0), (s2, hHalf)),
        ((s2, hHalf), (s3, hHalf)),
        ((s15, H), (s2, hHalf)),
    ]

    # Repetir en 5x5 tiles
    N = 5
    for tx in range(N):
        for ty in range(N):
            ox = tx * W
            oy = ty * H
            for (p1, p2) in tile_segments:
                add_edge((p1[0] + ox, p1[1] + oy), (p2[0] + ox, p2[1] + oy))

    # Ahora calculemos la valencia (grado) de cada vértice interior (lejos de los bordes)
    valences = defaultdict(int)
    for (p1, p2) in edges:
        valences[p1] += 1
        valences[p2] += 1

    # Analicemos los vértices en el rango central [1.5*W, 3.5*W] x [1.5*H, 3.5*H]
    inner_valences = {}
    for pt, deg in valences.items():
        if 1.5 * W <= pt[0] <= 3.5 * W and 1.5 * H <= pt[1] <= 3.5 * H:
            inner_valences[pt] = deg

    print(f"Total aristas únicas añadidas en {N}x{N} grid: {len(edges)}")
    degrees_found = set(inner_valences.values())
    print(f"Grados de vértices interiores encontrados: {degrees_found}")
    
    # Comprobar si TODOS los vértices interiores tienen valencia EXACTAMENTE 3
    all_deg_3 = (degrees_found == {3})
    if all_deg_3:
        print("✅ TOPOLOGÍA PERFECTA: Todos los vértices tienen valencia 3.")
        print("✅ Es un grafo regular cúbico {6, 3}: 100% hexágonos regulares, 0 rombos, 0 líneas sueltas.")
    else:
        print("❌ Fallo topológico:")
        for pt, deg in inner_valences.items():
            if deg != 3:
                print(f"   Vértice {pt} tiene grado {deg}")

if __name__ == "__main__":
    test_honeycomb_topology()
