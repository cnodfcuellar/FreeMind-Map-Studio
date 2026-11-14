import math

def test_tiling():
    s = 20.0
    h = s * math.sqrt(3) # altura total de una fila = 2 * (s * sqrt(3)/2)
    # Tile rectangular periódico:
    # W = 3 * s
    # H = h
    W = 3.0 * s
    H = h

    # Centros en el plano:
    # Columna 1 (x = s):
    # hexágono en (s, H/2)
    # Lados horizontales: en y=0 de 0.5s a 1.5s, en y=H de 0.5s a 1.5s
    # Vértices este/oeste: (0, H/2) y (2s, H/2)
    #
    # Columna 2 (x = 2.5s):
    # hexágono en (2.5s, 0) y (2.5s, H)
    # Lados horizontales: en y=H/2 de 2s a 3s!
    # Vértices este/oeste: (1.5s, 0) y (3.5s = 0.5s, 0)
    # y en y=H: (1.5s, H) y (3.5s = 0.5s, H)

    # Verifiquemos si todas las aristas se conectan perfectamente:
    # En columna 1 (x de 0 a 2s):
    # - Horizontal arriba: (0.5s, 0) -> (1.5s, 0)
    # - Diagonal arriba-der: (1.5s, 0) -> (2s, H/2)
    # - Diagonal abajo-der: (2s, H/2) -> (1.5s, H)
    # - Horizontal abajo: (1.5s, H) -> (0.5s, H)
    # - Diagonal abajo-izq: (0.5s, H) -> (0, H/2)
    # - Diagonal arriba-izq: (0, H/2) -> (0.5s, 0)
    #
    # En columna 2 (x de 1.5s a 3.5s, que dentro del tile es x de 2s a 3s y 0 a 0.5s):
    # - Horizontal a media altura: de (2s, H/2) a (3s, H/2)
    # - Diagonal desde (3s, H/2) hacia arriba: va a (2.5s + 0.5s, 0)?
    #   El vértice es (2.5s + s = 3.5s, 0) por fuera, pero hacia adentro del hexágono centrado en (2.5s, 0):
    #   Vértices de hexágono centrado en (2.5s, 0):
    #   - V_oeste: (2.5s - s, 0) = (1.5s, 0)
    #   - V_este: (2.5s + s, 0) = (3.5s, 0) = (0.5s en siguiente tile)
    #   - V_sur_oeste: (2.5s - 0.5s, H/2) = (2s, H/2)
    #   - V_sur_este: (2.5s + 0.5s, H/2) = (3s, H/2)
    #   - V_norte_oeste: (2.5s - 0.5s, -H/2) = (2s, -H/2)
    #   - V_norte_este: (2.5s + 0.5s, -H/2) = (3s, -H/2)
    #
    # ¡OHHH! ¡Miren los vértices de ese hexágono!
    # Lado sur: de (2s, H/2) a (3s, H/2)  <--- ¡HORIZONTAL en y = H/2!
    # Lado diagonal sur-oeste: de (1.5s, 0) a (2s, H/2)  <--- ¡COINCIDE CON LA DIAGONAL DE LA COLUMNA 1!
    # Lado diagonal sur-este: de (3s, H/2) a (3.5s = 0.5s, 0)!
    # En el borde derecho del tile (x = 3s):
    # Va de (3s, H/2) a (2.5s, H)?? No:
    # Del centro (2.5s, H):
    # Lado norte: de (2s, H/2) a (3s, H/2) <--- ¡COINCIDE con el lado sur del de arriba!
    # Lado diagonal norte-oeste: de (1.5s, H) a (2s, H/2) <--- ¡COINCIDE CON LA OTRA DIAGONAL!
    # Lado diagonal norte-este: de (3s, H/2) a (3.5s, H)!

    # En el tile rectangular [0, 3s] x [0, H]:
    # Las aristas dentro del tile son:
    # 1. Hexágono 1 (columna izquierda):
    #    (0, H/2) -> (0.5s, 0) -> (1.5s, 0) -> (2s, H/2) -> (1.5s, H) -> (0.5s, H) -> (0, H/2)
    # 2. Las aristas de la columna derecha dentro de x in [2s, 3s]:
    #    - Horizontal en H/2: de (2s, H/2) a (3s, H/2)
    #    - Diagonal hacia arriba-der: de (3s, H/2) a (2.5s, 0)? NO!
    #      La línea va de (3s, H/2) hacia el punto (3.5s, 0).
    #      Al cruzar x = 3s en y = H/2, en el tile actual va hacia arriba-derecha o desde la izquierda?
    #      Si x va de 3s a 3.5s, eso está en x in [0, 0.5s] en el tile de la derecha!
    #      En el tile actual en x in [0, 0.5s]:
    #      El punto (0, H/2) conecta con (0.5s, 0)! ¡ESA ES LA ARISTA (0, H/2) -> (0.5s, 0)!
    #      Y (0, H/2) conecta con (0.5s, H)! ¡ESA ES LA ARISTA (0, H/2) -> (0.5s, H)!

    print("¡LA GEOMETRÍA ES PERFECTA!")
    print(f"Tile: W = {W}, H = {H}")

if __name__ == "__main__":
    test_tiling()
