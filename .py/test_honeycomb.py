import math
import os

def generate_svgs():
    s = 18.0 # radio / lado del hexágono

    # ============================================================
    # 1. FLAT-TOPPED HONEYCOMB (lados horizontales arriba/abajo)
    # Ancho período: W = 3 * s
    # Alto período: H = s * sqrt(3)
    # ============================================================
    W_flat = 3.0 * s
    H_flat = s * math.sqrt(3)
    hHalf = H_flat / 2.0
    s05 = 0.5 * s
    s15 = 1.5 * s
    s25 = 2.5 * s

    # En un tile rectangular [0, W] x [0, H]:
    # Aristas del hexágono centrado en (s, hHalf):
    # - Arista superior: de (s05, 0) a (s15, 0)
    # - Arista inferior: de (s05, H) a (s15, H)
    # - Diagonales izq: (0, hHalf) -> (s05, 0) y (0, hHalf) -> (s05, H)
    # - Diagonales der: (1.5s, 0) -> (2s, hHalf) y (1.5s, H) -> (2s, hHalf)
    #
    # Para el siguiente hexágono centrado en (2.5s, 0) y (2.5s, H):
    # - Arista horizontal arriba/abajo ya está en su centro, pero sus diagonales son:
    #   (2s, hHalf) -> (2.5s, 0)? No, el vértice es en x=2s, hHalf.
    #   Hacia el este va a (2.5s, 0) y (2.5s, H)? No, el hexágono tiene radio s.
    #   Vértices con ángulo k*60°:
    #   k=0 (30°? No, flat-topped tiene lados a 0° y 180°):
    #   Lados paralelos a x: vértices a (+-s/2, +-hHalf), y (+-s, 0)
    #   ¡Exacto! Vértices de hexágono flat-topped centrado en (cx, cy):
    #   (cx - s, cy)
    #   (cx - s/2, cy - hHalf)
    #   (cx + s/2, cy - hHalf)
    #   (cx + s, cy)
    #   (cx + s/2, cy + hHalf)
    #   (cx - s/2, cy + hHalf)
    #
    # Verifiquemos para cx = s, cy = hHalf:
    # V0 = (0, hHalf)
    # V1 = (s/2, 0)
    # V2 = (3s/2, 0)
    # V3 = (2s, hHalf)
    # V4 = (3s/2, H)
    # V5 = (s/2, H)
    # ¡Exacto! Los 6 lados son:
    # Lado 0-1: (0, hHalf) -> (s/2, 0)
    # Lado 1-2: (s/2, 0) -> (3s/2, 0)  [horizontal arriba]
    # Lado 2-3: (3s/2, 0) -> (2s, hHalf)
    # Lado 3-4: (2s, hHalf) -> (3s/2, H)
    # Lado 4-5: (3s/2, H) -> (s/2, H)  [horizontal abajo]
    # Lado 5-0: (s/2, H) -> (0, hHalf)
    #
    # Ahora el hexágono vecino está desplazado por (1.5s, hHalf):
    # Centro en cx = 2.5s, cy = 0 (y en cy = H por periodicidad).
    # Sus vértices para cy = 0:
    # (2.5s - s, 0) = (1.5s, 0)  -> coincide con V2!
    # (2.5s - s/2, -hHalf) -> fuera
    # (2.5s + s/2, -hHalf) -> fuera
    # (2.5s + s, 0) = (3.5s, 0) -> por módulo 3s es (0.5s, 0) = V1!
    # (2.5s + s/2, hHalf) = (3s, hHalf) -> por módulo 3s es (0, hHalf) = V0!
    # (2.5s - s/2, hHalf) = (2s, hHalf) -> coincide con V3!
    #
    # Sus lados dentro del tile [0, 3s] x [0, H]:
    # De (2s, hHalf) a (2.5s, 0)? ¡NO!
    # El vértice no es (2.5s, 0), ¡el vértice es (1.5s, 0) y (3.5s, 0)!
    # ¡AQUÍ ESTABA EL ERROR DEL CÓDIGO ANTERIOR!
    # El código anterior hacía: L ${sHex * 2.5} 0 !
    # ¡2.5s NO ES UN VÉRTICE, 2.5s ES EL CENTRO!
    # Unir (2s, hHalf) con el CENTRO (2.5s, 0) cortaba el hexágono por la mitad y formaba un ROMBO!
    # ¡Qué revelación matemática tan brutal!
    # En el código anterior:
    # `M ${2 * sHex} ${hHex / 2} L ${sHex * 2.5} 0`
    # ¡Habían conectado el vértice (2s, hHalf) con el CENTRO (2.5s, 0)!
    # Por eso se formaba un rombo en vez de un hexágono.

    print("Error identificado con 100% de certeza matemática:")
    print("El código anterior conectaba (2s, hHalf) con (2.5s, 0), que es el CENTRO del hexágono contiguo, no su vértice.")

if __name__ == "__main__":
    generate_svgs()
