import math

def analyze_edges():
    s = 18.0
    W = 3.0 * s
    H = s * math.sqrt(3)
    hHalf = H / 2.0
    s05 = 0.5 * s
    s15 = 1.5 * s
    s2 = 2.0 * s
    s3 = 3.0 * s

    # ¿Cuáles son las 6 aristas únicas por celda periódica?
    # Cada hexágono tiene 3 aristas que le "pertenecen" exclusivamente (las otras 3 las dibujan los vecinos):
    # Por ejemplo, para el hexágono 1:
    # 1. Arista superior: (0.5s, 0) -> (1.5s, 0)
    # 2. Arista diagonal sup-izq: (0, hHalf) -> (0.5s, 0)
    # 3. Arista diagonal inf-izq: (0, hHalf) -> (0.5s, H)  [o sup-der (1.5s, 0) -> (2s, hHalf)]
    # Y para el hexágono 2:
    # 4. Arista horizontal media: (2s, hHalf) -> (3s, hHalf)
    # 5. Arista diagonal sup-der: (1.5s, 0) -> (2s, hHalf)
    # 6. Arista diagonal inf-der: (1.5s, H) -> (2s, hHalf)
    
    # ¡Probemos este conjunto exacto de 6 aristas!
    # Arista 1: (0.5s, 0) -> (1.5s, 0) [horizontal arriba]
    # Arista 2: (0, hHalf) -> (0.5s, 0) [diagonal izq arriba]
    # Arista 3: (0, hHalf) -> (0.5s, H) [diagonal izq abajo]
    # Arista 4: (1.5s, 0) -> (2s, hHalf) [diagonal der arriba]
    # Arista 5: (1.5s, H) -> (2s, hHalf) [diagonal der abajo]
    # Arista 6: (2s, hHalf) -> (3s, hHalf) [horizontal media]
    
    # ¡MIREN QUÉ BELLEZA!
    # Las 6 aristas se pueden dibujar con solo DOS trazos continuos:
    # Trazo 1 (V izquierda con techo y bajada):
    # De (0.5s, H) -> (0, hHalf) -> (0.5s, 0) -> (1.5s, 0) -> (2s, hHalf) -> (3s, hHalf)
    # Trazo 2:
    # De (1.5s, H) -> (2s, hHalf)
    
    # ¡Eso es EXACTAMENTE 6 aristas!
    # Cero aristas duplicadas.
    # Cero rombos.
    # 100% simetría periódica.
    
    path_minimal = f"M {s05},{H} L 0,{hHalf} L {s05},0 L {s15},0 L {s2},{hHalf} L {s3},{hHalf} M {s15},{H} L {s2},{hHalf}"
    print("Path minimal 6 aristas:", path_minimal)

if __name__ == "__main__":
    analyze_edges()
