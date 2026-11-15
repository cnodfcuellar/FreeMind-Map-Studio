import math

def distance(p1, p2):
    return math.hypot(p2[0] - p1[0], p2[1] - p1[1])

def generate_polygon_zigzag(pts, amplitude=8.0, frequency=16.0):
    n_pts = len(pts)
    if n_pts < 3:
        return ""
    
    cx = sum(p[0] for p in pts) / n_pts
    cy = sum(p[1] for p in pts) / n_pts

    d = ""
    for i in range(n_pts):
        p1 = pts[i]
        p2 = pts[(i + 1) % n_pts]
        L = distance(p1, p2)
        if L < 1e-4:
            continue
        
        ux = (p2[0] - p1[0]) / L
        uy = (p2[1] - p1[1]) / L
        nx = -uy
        ny = ux
        
        mid_edge_x = (p1[0] + p2[0]) / 2.0
        mid_edge_y = (p1[1] + p2[1]) / 2.0
        if (nx * (mid_edge_x - cx) + ny * (mid_edge_y - cy)) < 0:
            nx = -nx
            ny = -ny

        k = max(1, round(L / max(6.0, frequency)))
        step = L / k

        if i == 0:
            d += f"M {p1[0]:.2f} {p1[1]:.2f}"

        for j in range(k):
            s_mid = (j + 0.5) * step
            s_next = (j + 1) * step

            peak_x = p1[0] + s_mid * ux + (amplitude / 2.0) * nx
            peak_y = p1[1] + s_mid * uy + (amplitude / 2.0) * ny

            end_x = p1[0] + s_next * ux
            end_y = p1[1] + s_next * uy

            d += f" L {peak_x:.2f} {peak_y:.2f} L {end_x:.2f} {end_y:.2f}"

    d += " Z"
    return d

def generate_polygon_wavy(pts, amplitude=8.0, wavelength=24.0):
    n_pts = len(pts)
    if n_pts < 3:
        return ""
    
    cx = sum(p[0] for p in pts) / n_pts
    cy = sum(p[1] for p in pts) / n_pts

    d = ""
    for i in range(n_pts):
        p1 = pts[i]
        p2 = pts[(i + 1) % n_pts]
        L = distance(p1, p2)
        if L < 1e-4:
            continue
        
        ux = (p2[0] - p1[0]) / L
        uy = (p2[1] - p1[1]) / L
        nx = -uy
        ny = ux
        
        mid_edge_x = (p1[0] + p2[0]) / 2.0
        mid_edge_y = (p1[1] + p2[1]) / 2.0
        if (nx * (mid_edge_x - cx) + ny * (mid_edge_y - cy)) < 0:
            nx = -nx
            ny = -ny

        k = max(1, round(L / max(12.0, wavelength)))
        step = L / k

        if i == 0:
            d += f"M {p1[0]:.2f} {p1[1]:.2f}"

        for j in range(k):
            s_curr = j * step
            s_mid = (j + 0.5) * step
            s_next = (j + 1) * step

            c1_x = p1[0] + (s_curr + step * 0.25) * ux + (amplitude / 2.0) * nx
            c1_y = p1[1] + (s_curr + step * 0.25) * uy + (amplitude / 2.0) * ny
            
            mid_x = p1[0] + s_mid * ux
            mid_y = p1[1] + s_mid * uy

            c2_x = p1[0] + (s_mid + step * 0.25) * ux - (amplitude / 2.0) * nx
            c2_y = p1[1] + (s_mid + step * 0.25) * uy - (amplitude / 2.0) * ny

            end_x = p1[0] + s_next * ux
            end_y = p1[1] + s_next * uy

            d += f" C {c1_x:.2f} {c1_y:.2f}, {c1_x:.2f} {c1_y:.2f}, {mid_x:.2f} {mid_y:.2f}"
            d += f" C {c2_x:.2f} {c2_y:.2f}, {c2_x:.2f} {c2_y:.2f}, {end_x:.2f} {end_y:.2f}"

    d += " Z"
    return d

def generate_radial_zigzag(cx, cy, rx, ry, amplitude=8.0, frequency=16.0):
    P = math.pi * (3 * (rx + ry) - math.sqrt((3 * rx + ry) * (rx + 3 * ry)))
    N = max(6, round(P / max(8.0, frequency)))
    
    d = ""
    for i in range(2 * N):
        theta = (i * math.pi) / N
        is_peak = (i % 2 == 1)
        r_scale = 1.0 + (amplitude / (2.0 * math.sqrt(rx * ry))) if is_peak else 1.0 - (amplitude / (2.0 * math.sqrt(rx * ry)))
        x = cx + rx * r_scale * math.cos(theta)
        y = cy + ry * r_scale * math.sin(theta)
        if i == 0:
            d += f"M {x:.2f} {y:.2f}"
        else:
            d += f" L {x:.2f} {y:.2f}"
    d += " Z"
    return d

def generate_radial_wavy(cx, cy, rx, ry, amplitude=8.0, wavelength=24.0):
    P = math.pi * (3 * (rx + ry) - math.sqrt((3 * rx + ry) * (rx + 3 * ry)))
    N = max(4, round(P / max(14.0, wavelength)))
    
    pts = []
    for i in range(N):
        th0 = (2 * math.pi * i) / N
        th1 = (2 * math.pi * (i + 1)) / N
        th_mid = (th0 + th1) / 2.0

        p0 = (cx + rx * math.cos(th0), cy + ry * math.sin(th0))
        crest_scale = 1.0 + (amplitude / math.sqrt(rx * ry))
        p_crest = (cx + rx * crest_scale * math.cos(th_mid), cy + ry * crest_scale * math.sin(th_mid))
        p1 = (cx + rx * math.cos(th1), cy + ry * math.sin(th1))
        pts.append((p0, p_crest, p1))
    
    d = f"M {pts[0][0][0]:.2f} {pts[0][0][1]:.2f}"
    for p0, p_crest, p1 in pts:
        d += f" Q {p_crest[0]:.2f} {p_crest[1]:.2f} {p1[0]:.2f} {p1[1]:.2f}"
    d += " Z"
    return d

def run_tests():
    rhombus_pts = [(100, 20), (180, 70), (100, 120), (20, 70)]
    zz_rhombus = generate_polygon_zigzag(rhombus_pts, amplitude=8, frequency=16)
    print("Zigzag en Rombo:", zz_rhombus[:60], "...")

    hex_pts = [(50, 10), (150, 10), (190, 60), (150, 110), (50, 110), (10, 60)]
    wavy_hex = generate_polygon_wavy(hex_pts, amplitude=8, wavelength=24)
    print("Ondulado en Hexágono:", wavy_hex[:60], "...")

    radial_zz = generate_radial_zigzag(100, 100, 60, 40, amplitude=6, frequency=14)
    print("Zigzag en Óvalo:", radial_zz[:60], "...")

if __name__ == "__main__":
    run_tests()
