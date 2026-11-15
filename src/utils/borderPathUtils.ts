/**
 * borderPathUtils.ts
 * Generación matemática y procedural de trazados perimetrales cerrados
 * para estilos de borde avanzados (Doble, Zigzag, Ondulado, Puntos y Guiones)
 * garantizando que sigan con exactitud la silueta de CADA una de las formas de nodo:
 * Rectángulos, Burbujas, Píldoras, Círculos, Óvalos, Rombos, Hexágonos, Flechas, Estrellas y Horquillas.
 */

export interface Point2D {
  x: number;
  y: number;
}

export function dist(p1: Point2D, p2: Point2D): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

/**
 * 1. Rectángulos, Cuadrados, Burbujas y Píldoras: Zigzag perimetral cerrado
 */
export function generateZigzagPath(
  w: number,
  h: number,
  r: number = 8,
  amplitude: number = 8,
  frequency: number = 16
): string {
  const pad = amplitude / 2;
  const x0 = pad;
  const y0 = pad;
  const x1 = Math.max(x0 + 1, w - pad);
  const y1 = Math.max(y0 + 1, h - pad);
  const cornerR = Math.min(r, (x1 - x0) / 2, (y1 - y0) / 2);

  // Si es forma de píldora (radio igual a mitad del alto o ancho), usar trazado de píldora con dientes en semicírculos
  if (r >= Math.min(x1 - x0, y1 - y0) / 2 - 2 && Math.min(x1 - x0, y1 - y0) > 4) {
    return generatePillZigzagPath(w, h, amplitude, frequency);
  }

  const effW = x1 - x0 - 2 * cornerR;
  const effH = y1 - y0 - 2 * cornerR;

  const nX = Math.max(1, Math.round(effW / Math.max(6, frequency)));
  const nY = Math.max(1, Math.round(effH / Math.max(6, frequency)));
  const stepX = effW / nX;
  const stepY = effH / nY;

  let d = '';

  const startX = x0 + cornerR;
  const startY = y0;
  d += `M ${startX.toFixed(2)} ${startY.toFixed(2)}`;

  // Borde superior
  for (let i = 0; i < nX; i++) {
    const curX = startX + i * stepX;
    const midX = curX + stepX / 2;
    const endX = curX + stepX;
    const peakY = y0 - (i % 2 === 0 ? amplitude / 2 : -amplitude / 2);
    d += ` L ${midX.toFixed(2)} ${peakY.toFixed(2)} L ${endX.toFixed(2)} ${y0.toFixed(2)}`;
  }

  // Esquina superior-derecha
  if (cornerR > 0) {
    d += ` Q ${x1.toFixed(2)} ${y0.toFixed(2)} ${x1.toFixed(2)} ${(y0 + cornerR).toFixed(2)}`;
  } else {
    d += ` L ${x1.toFixed(2)} ${y0.toFixed(2)}`;
  }

  // Borde derecho
  const startRightY = y0 + cornerR;
  for (let i = 0; i < nY; i++) {
    const curY = startRightY + i * stepY;
    const midY = curY + stepY / 2;
    const endY = curY + stepY;
    const peakX = x1 + (i % 2 === 0 ? amplitude / 2 : -amplitude / 2);
    d += ` L ${peakX.toFixed(2)} ${midY.toFixed(2)} L ${x1.toFixed(2)} ${endY.toFixed(2)}`;
  }

  // Esquina inferior-derecha
  if (cornerR > 0) {
    d += ` Q ${x1.toFixed(2)} ${y1.toFixed(2)} ${(x1 - cornerR).toFixed(2)} ${y1.toFixed(2)}`;
  } else {
    d += ` L ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }

  // Borde inferior
  const startBottomX = x1 - cornerR;
  for (let i = 0; i < nX; i++) {
    const curX = startBottomX - i * stepX;
    const midX = curX - stepX / 2;
    const endX = curX - stepX;
    const peakY = y1 + (i % 2 === 0 ? amplitude / 2 : -amplitude / 2);
    d += ` L ${midX.toFixed(2)} ${peakY.toFixed(2)} L ${endX.toFixed(2)} ${y1.toFixed(2)}`;
  }

  // Esquina inferior-izquierda
  if (cornerR > 0) {
    d += ` Q ${x0.toFixed(2)} ${y1.toFixed(2)} ${x0.toFixed(2)} ${(y1 - cornerR).toFixed(2)}`;
  } else {
    d += ` L ${x0.toFixed(2)} ${y1.toFixed(2)}`;
  }

  // Borde izquierdo
  const startLeftY = y1 - cornerR;
  for (let i = 0; i < nY; i++) {
    const curY = startLeftY - i * stepY;
    const midY = curY - stepY / 2;
    const endY = curY - stepY;
    const peakX = x0 - (i % 2 === 0 ? amplitude / 2 : -amplitude / 2);
    d += ` L ${peakX.toFixed(2)} ${midY.toFixed(2)} L ${x0.toFixed(2)} ${endY.toFixed(2)}`;
  }

  // Esquina superior-izquierda hasta cerrar
  if (cornerR > 0) {
    d += ` Q ${x0.toFixed(2)} ${y0.toFixed(2)} ${startX.toFixed(2)} ${startY.toFixed(2)} Z`;
  } else {
    d += ` L ${x0.toFixed(2)} ${y0.toFixed(2)} Z`;
  }

  return d;
}

/**
 * 2. Rectángulos, Cuadrados, Burbujas y Píldoras: Ondulado perimetral cerrado
 */
export function generateWavyPath(
  w: number,
  h: number,
  r: number = 8,
  amplitude: number = 8,
  wavelength: number = 28
): string {
  const pad = amplitude / 2;
  const x0 = pad;
  const y0 = pad;
  const x1 = Math.max(x0 + 1, w - pad);
  const y1 = Math.max(y0 + 1, h - pad);
  const cornerR = Math.min(r, (x1 - x0) / 2, (y1 - y0) / 2);

  // Si es forma de píldora (radio igual a mitad del alto o ancho), usar trazado de píldora con ondas en semicírculos
  if (r >= Math.min(x1 - x0, y1 - y0) / 2 - 2 && Math.min(x1 - x0, y1 - y0) > 4) {
    return generatePillWavyPath(w, h, amplitude, wavelength);
  }

  const effW = x1 - x0 - 2 * cornerR;
  const effH = y1 - y0 - 2 * cornerR;

  const nX = Math.max(1, Math.round(effW / Math.max(10, wavelength)));
  const nY = Math.max(1, Math.round(effH / Math.max(10, wavelength)));
  const stepX = effW / nX;
  const stepY = effH / nY;

  let d = '';

  const startX = x0 + cornerR;
  const startY = y0;
  d += `M ${startX.toFixed(2)} ${startY.toFixed(2)}`;

  // Borde superior
  for (let i = 0; i < nX; i++) {
    const curX = startX + i * stepX;
    const midX = curX + stepX / 2;
    const endX = curX + stepX;
    const crest = y0 - amplitude / 2;
    const trough = y0 + amplitude / 2;
    d += ` C ${(curX + stepX * 0.25).toFixed(2)} ${crest.toFixed(2)}, ${(curX + stepX * 0.25).toFixed(2)} ${crest.toFixed(2)}, ${midX.toFixed(2)} ${y0.toFixed(2)}`;
    d += ` C ${(midX + stepX * 0.25).toFixed(2)} ${trough.toFixed(2)}, ${(midX + stepX * 0.25).toFixed(2)} ${trough.toFixed(2)}, ${endX.toFixed(2)} ${y0.toFixed(2)}`;
  }

  // Esquina superior-derecha
  if (cornerR > 0) {
    d += ` Q ${x1.toFixed(2)} ${y0.toFixed(2)} ${x1.toFixed(2)} ${(y0 + cornerR).toFixed(2)}`;
  } else {
    d += ` L ${x1.toFixed(2)} ${y0.toFixed(2)}`;
  }

  // Borde derecho
  const startRightY = y0 + cornerR;
  for (let i = 0; i < nY; i++) {
    const curY = startRightY + i * stepY;
    const midY = curY + stepY / 2;
    const endY = curY + stepY;
    const crest = x1 + amplitude / 2;
    const trough = x1 - amplitude / 2;
    d += ` C ${crest.toFixed(2)} ${(curY + stepY * 0.25).toFixed(2)}, ${crest.toFixed(2)} ${(curY + stepY * 0.25).toFixed(2)}, ${x1.toFixed(2)} ${midY.toFixed(2)}`;
    d += ` C ${trough.toFixed(2)} ${(midY + stepY * 0.25).toFixed(2)}, ${trough.toFixed(2)} ${(midY + stepY * 0.25).toFixed(2)}, ${x1.toFixed(2)} ${endY.toFixed(2)}`;
  }

  // Esquina inferior-derecha
  if (cornerR > 0) {
    d += ` Q ${x1.toFixed(2)} ${y1.toFixed(2)} ${(x1 - cornerR).toFixed(2)} ${y1.toFixed(2)}`;
  } else {
    d += ` L ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }

  // Borde inferior
  const startBottomX = x1 - cornerR;
  for (let i = 0; i < nX; i++) {
    const curX = startBottomX - i * stepX;
    const midX = curX - stepX / 2;
    const endX = curX - stepX;
    const crest = y1 + amplitude / 2;
    const trough = y1 - amplitude / 2;
    d += ` C ${(curX - stepX * 0.25).toFixed(2)} ${crest.toFixed(2)}, ${(curX - stepX * 0.25).toFixed(2)} ${crest.toFixed(2)}, ${midX.toFixed(2)} ${y1.toFixed(2)}`;
    d += ` C ${(midX - stepX * 0.25).toFixed(2)} ${trough.toFixed(2)}, ${(midX - stepX * 0.25).toFixed(2)} ${trough.toFixed(2)}, ${endX.toFixed(2)} ${y1.toFixed(2)}`;
  }

  // Esquina inferior-izquierda
  if (cornerR > 0) {
    d += ` Q ${x0.toFixed(2)} ${y1.toFixed(2)} ${x0.toFixed(2)} ${(y1 - cornerR).toFixed(2)}`;
  } else {
    d += ` L ${x0.toFixed(2)} ${y1.toFixed(2)}`;
  }

  // Borde izquierdo
  const startLeftY = y1 - cornerR;
  for (let i = 0; i < nY; i++) {
    const curY = startLeftY - i * stepY;
    const midY = curY - stepY / 2;
    const endY = curY - stepY;
    const crest = x0 - amplitude / 2;
    const trough = x0 + amplitude / 2;
    d += ` C ${crest.toFixed(2)} ${(curY - stepY * 0.25).toFixed(2)}, ${crest.toFixed(2)} ${(curY - stepY * 0.25).toFixed(2)}, ${x0.toFixed(2)} ${midY.toFixed(2)}`;
    d += ` C ${trough.toFixed(2)} ${(midY - stepY * 0.25).toFixed(2)}, ${trough.toFixed(2)} ${(midY - stepY * 0.25).toFixed(2)}, ${x0.toFixed(2)} ${endY.toFixed(2)}`;
  }

  // Esquina superior-izquierda hasta cerrar
  if (cornerR > 0) {
    d += ` Q ${x0.toFixed(2)} ${y0.toFixed(2)} ${startX.toFixed(2)} ${startY.toFixed(2)} Z`;
  } else {
    d += ` L ${x0.toFixed(2)} ${y0.toFixed(2)} Z`;
  }

  return d;
}

/**
 * 3. Círculos y Óvalos: Zigzag perimetral en coordenadas polares
 */
export function generateRadialZigzag(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  amplitude: number = 8,
  frequency: number = 16
): string {
  const P = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
  const N = Math.max(6, Math.round(P / Math.max(8, frequency)));

  let d = '';
  for (let i = 0; i < 2 * N; i++) {
    const theta = (i * Math.PI) / N;
    const isPeak = i % 2 === 1;
    const ampRatio = amplitude / (2 * Math.sqrt(rx * ry));
    const rScale = isPeak ? 1 + ampRatio : Math.max(0.2, 1 - ampRatio);
    const x = cx + rx * rScale * Math.cos(theta);
    const y = cy + ry * rScale * Math.sin(theta);
    if (i === 0) {
      d += `M ${x.toFixed(2)} ${y.toFixed(2)}`;
    } else {
      d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
  }
  d += ' Z';
  return d;
}

/**
 * 4. Círculos y Óvalos: Ondulado perimetral suave
 */
export function generateRadialWavy(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  amplitude: number = 8,
  wavelength: number = 24
): string {
  const P = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
  const N = Math.max(4, Math.round(P / Math.max(12, wavelength)));

  const pts: { p0: Point2D; crest: Point2D; p1: Point2D }[] = [];
  const ampRatio = amplitude / Math.sqrt(rx * ry);

  for (let i = 0; i < N; i++) {
    const th0 = (2 * Math.PI * i) / N;
    const th1 = (2 * Math.PI * (i + 1)) / N;
    const thMid = (th0 + th1) / 2;

    const p0 = { x: cx + rx * Math.cos(th0), y: cy + ry * Math.sin(th0) };
    const crestScale = 1 + ampRatio;
    const crest = { x: cx + rx * crestScale * Math.cos(thMid), y: cy + ry * crestScale * Math.sin(thMid) };
    const p1 = { x: cx + rx * Math.cos(th1), y: cy + ry * Math.sin(th1) };
    pts.push({ p0, crest, p1 });
  }

  let d = `M ${pts[0].p0.x.toFixed(2)} ${pts[0].p0.y.toFixed(2)}`;
  for (const { crest, p1 } of pts) {
    d += ` Q ${crest.x.toFixed(2)} ${crest.y.toFixed(2)} ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
  }
  d += ' Z';
  return d;
}

/**
 * 5. Polígonos SVG (Rombos, Hexágonos, Flechas, Estrellas): Zigzag a lo largo de cada arista
 */
export function generatePolygonZigzag(
  pts: Point2D[],
  amplitude: number = 8,
  frequency: number = 16
): string {
  const n = pts.length;
  if (n < 3) return '';

  const cx = pts.reduce((acc, p) => acc + p.x, 0) / n;
  const cy = pts.reduce((acc, p) => acc + p.y, 0) / n;

  let d = '';
  for (let i = 0; i < n; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const L = dist(p1, p2);
    if (L < 1e-3) continue;

    const ux = (p2.x - p1.x) / L;
    const uy = (p2.y - p1.y) / L;
    let nx = -uy;
    let ny = ux;

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    if (nx * (midX - cx) + ny * (midY - cy) < 0) {
      nx = -nx;
      ny = -ny;
    }

    const k = Math.max(1, Math.round(L / Math.max(6, frequency)));
    const step = L / k;

    if (i === 0) {
      d += `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
    }

    for (let j = 0; j < k; j++) {
      const sMid = (j + 0.5) * step;
      const sNext = (j + 1) * step;

      const peakX = p1.x + sMid * ux + (amplitude / 2) * nx;
      const peakY = p1.y + sMid * uy + (amplitude / 2) * ny;
      const endX = p1.x + sNext * ux;
      const endY = p1.y + sNext * uy;

      d += ` L ${peakX.toFixed(2)} ${peakY.toFixed(2)} L ${endX.toFixed(2)} ${endY.toFixed(2)}`;
    }
  }

  d += ' Z';
  return d;
}

/**
 * 6. Polígonos SVG (Rombos, Hexágonos, Flechas, Estrellas): Ondulado Bézier suave por arista
 */
export function generatePolygonWavy(
  pts: Point2D[],
  amplitude: number = 8,
  wavelength: number = 24
): string {
  const n = pts.length;
  if (n < 3) return '';

  const cx = pts.reduce((acc, p) => acc + p.x, 0) / n;
  const cy = pts.reduce((acc, p) => acc + p.y, 0) / n;

  let d = '';
  for (let i = 0; i < n; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const L = dist(p1, p2);
    if (L < 1e-3) continue;

    const ux = (p2.x - p1.x) / L;
    const uy = (p2.y - p1.y) / L;
    let nx = -uy;
    let ny = ux;

    const midEdgeX = (p1.x + p2.x) / 2;
    const midEdgeY = (p1.y + p2.y) / 2;
    if (nx * (midEdgeX - cx) + ny * (midEdgeY - cy) < 0) {
      nx = -nx;
      ny = -ny;
    }

    const k = Math.max(1, Math.round(L / Math.max(10, wavelength)));
    const step = L / k;

    if (i === 0) {
      d += `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
    }

    for (let j = 0; j < k; j++) {
      const sCurr = j * step;
      const sMid = (j + 0.5) * step;
      const sNext = (j + 1) * step;

      const c1X = p1.x + (sCurr + step * 0.25) * ux + (amplitude / 2) * nx;
      const c1Y = p1.y + (sCurr + step * 0.25) * uy + (amplitude / 2) * ny;
      const midX = p1.x + sMid * ux;
      const midY = p1.y + sMid * uy;

      const c2X = p1.x + (sMid + step * 0.25) * ux - (amplitude / 2) * nx;
      const c2Y = p1.y + (sMid + step * 0.25) * uy - (amplitude / 2) * ny;
      const endX = p1.x + sNext * ux;
      const endY = p1.y + sNext * uy;

      d += ` C ${c1X.toFixed(2)} ${c1Y.toFixed(2)}, ${c1X.toFixed(2)} ${c1Y.toFixed(2)}, ${midX.toFixed(2)} ${midY.toFixed(2)}`;
      d += ` C ${c2X.toFixed(2)} ${c2Y.toFixed(2)}, ${c2X.toFixed(2)} ${c2Y.toFixed(2)}, ${endX.toFixed(2)} ${endY.toFixed(2)}`;
    }
  }

  d += ' Z';
  return d;
}

/**
 * 7. Polígono interior concéntrico para Borde Doble
 */
export function getDoublePolygonPoints(pts: Point2D[], gap: number = 4): Point2D[] {
  const n = pts.length;
  if (n < 3) return pts;

  const cx = pts.reduce((acc, p) => acc + p.x, 0) / n;
  const cy = pts.reduce((acc, p) => acc + p.y, 0) / n;

  return pts.map((p) => {
    const dCenter = dist(p, { x: cx, y: cy });
    if (dCenter < 1e-2) return p;
    const factor = Math.max(0.1, (dCenter - gap) / dCenter);
    return {
      x: cx + (p.x - cx) * factor,
      y: cy + (p.y - cy) * factor,
    };
  });
}

/**
 * 8. Horquilla (Fork): Zigzag horizontal de subrayado
 */
export function generateHorizontalZigzag(
  x0: number,
  x1: number,
  y: number,
  amplitude: number = 6,
  frequency: number = 14
): string {
  const L = Math.abs(x1 - x0);
  const k = Math.max(2, Math.round(L / Math.max(6, frequency)));
  const step = (x1 - x0) / k;

  let d = `M ${x0.toFixed(2)} ${y.toFixed(2)}`;
  for (let i = 0; i < k; i++) {
    const midX = x0 + (i + 0.5) * step;
    const endX = x0 + (i + 1) * step;
    const peakY = y + (i % 2 === 0 ? amplitude / 2 : -amplitude / 2);
    d += ` L ${midX.toFixed(2)} ${peakY.toFixed(2)} L ${endX.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

/**
 * 9. Horquilla (Fork): Ondulado horizontal de subrayado
 */
export function generateHorizontalWavy(
  x0: number,
  x1: number,
  y: number,
  amplitude: number = 6,
  wavelength: number = 24
): string {
  const L = Math.abs(x1 - x0);
  const k = Math.max(2, Math.round(L / Math.max(10, wavelength)));
  const step = (x1 - x0) / k;

  let d = `M ${x0.toFixed(2)} ${y.toFixed(2)}`;
  for (let i = 0; i < k; i++) {
    const curX = x0 + i * step;
    const midX = x0 + (i + 0.5) * step;
    const endX = x0 + (i + 1) * step;
    const crest = y - amplitude / 2;
    const trough = y + amplitude / 2;
    d += ` C ${(curX + step * 0.25).toFixed(2)} ${crest.toFixed(2)}, ${(curX + step * 0.25).toFixed(2)} ${crest.toFixed(2)}, ${midX.toFixed(2)} ${y.toFixed(2)}`;
    d += ` C ${(midX + step * 0.25).toFixed(2)} ${trough.toFixed(2)}, ${(midX + step * 0.25).toFixed(2)} ${trough.toFixed(2)}, ${endX.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

/**
 * 10. Rectángulos concéntricos para Borde Doble (Cajas, Píldoras, Burbujas)
 */
export function getDoubleBorderRects(
  w: number,
  h: number,
  r: number = 8,
  gap: number = 4,
  strokeW: number = 2
) {
  const halfGap = gap / 2;

  const outerX = -halfGap;
  const outerY = -halfGap;
  const outerW = Math.max(4, w + gap);
  const outerH = Math.max(4, h + gap);
  const outerR = Math.max(0, r + halfGap);

  const innerX = halfGap;
  const innerY = halfGap;
  const innerW = Math.max(4, w - gap);
  const innerH = Math.max(4, h - gap);
  const innerR = Math.max(0, r - halfGap);

  return {
    outer: { x: outerX, y: outerY, w: outerW, h: outerH, r: outerR },
    inner: { x: innerX, y: innerY, w: innerW, h: innerH, r: innerR },
  };
}

/**
 * 11. Píldora (Capsule / Pill): Zigzag perimetral continuo
 * Recorre el borde superior, el semicírculo derecho radial, el borde inferior y el semicírculo izquierdo radial.
 */
export function generatePillZigzagPath(
  w: number,
  h: number,
  amplitude: number = 8,
  frequency: number = 16
): string {
  const pad = amplitude / 2;
  const x0 = pad;
  const y0 = pad;
  const x1 = Math.max(x0 + 1, w - pad);
  const y1 = Math.max(y0 + 1, h - pad);
  const isHorizontal = (x1 - x0) >= (y1 - y0);

  if (!isHorizontal) {
    // Píldora vertical
    const R = (x1 - x0) / 2;
    const cx = x0 + R;
    const effH = Math.max(0, y1 - y0 - 2 * R);
    const nY = Math.max(1, Math.round(effH / Math.max(6, frequency)));
    const stepY = effH / nY;

    let d = `M ${(cx + R).toFixed(2)} ${(y0 + R).toFixed(2)}`;
    // Borde derecho hacia abajo
    for (let i = 0; i < nY; i++) {
      const curY = y0 + R + i * stepY;
      const midY = curY + stepY / 2;
      const endY = curY + stepY;
      const peakX = cx + R + (i % 2 === 0 ? amplitude / 2 : -amplitude / 2);
      d += ` L ${peakX.toFixed(2)} ${midY.toFixed(2)} L ${(cx + R).toFixed(2)} ${endY.toFixed(2)}`;
    }
    // Semicírculo inferior de 0 a PI
    const nArc = Math.max(3, Math.round((Math.PI * R) / Math.max(6, frequency)));
    for (let i = 0; i < nArc; i++) {
      const thMid = (i + 0.5) * (Math.PI / nArc);
      const thEnd = (i + 1) * (Math.PI / nArc);
      const rPeak = R + (i % 2 === 0 ? amplitude / 2 : -amplitude / 2);
      const px = cx + rPeak * Math.cos(thMid);
      const py = (y1 - R) + rPeak * Math.sin(thMid);
      const ex = cx + R * Math.cos(thEnd);
      const ey = (y1 - R) + R * Math.sin(thEnd);
      d += ` L ${px.toFixed(2)} ${py.toFixed(2)} L ${ex.toFixed(2)} ${ey.toFixed(2)}`;
    }
    // Borde izquierdo hacia arriba
    for (let i = 0; i < nY; i++) {
      const curY = y1 - R - i * stepY;
      const midY = curY - stepY / 2;
      const endY = curY - stepY;
      const peakX = cx - R - (i % 2 === 0 ? amplitude / 2 : -amplitude / 2);
      d += ` L ${peakX.toFixed(2)} ${midY.toFixed(2)} L ${(cx - R).toFixed(2)} ${endY.toFixed(2)}`;
    }
    // Semicírculo superior de PI a 2*PI
    for (let i = 0; i < nArc; i++) {
      const thMid = Math.PI + (i + 0.5) * (Math.PI / nArc);
      const thEnd = Math.PI + (i + 1) * (Math.PI / nArc);
      const rPeak = R + (i % 2 === 0 ? amplitude / 2 : -amplitude / 2);
      const px = cx + rPeak * Math.cos(thMid);
      const py = (y0 + R) + rPeak * Math.sin(thMid);
      const ex = cx + R * Math.cos(thEnd);
      const ey = (y0 + R) + R * Math.sin(thEnd);
      d += ` L ${px.toFixed(2)} ${py.toFixed(2)} L ${ex.toFixed(2)} ${ey.toFixed(2)}`;
    }
    d += ' Z';
    return d;
  }

  // Píldora horizontal (caso estándar)
  const R = (y1 - y0) / 2;
  const cy = y0 + R;
  const effW = Math.max(0, x1 - x0 - 2 * R);
  const nX = Math.max(1, Math.round(effW / Math.max(6, frequency)));
  const stepX = effW / nX;

  let d = `M ${(x0 + R).toFixed(2)} ${y0.toFixed(2)}`;

  // Borde superior de izquierda a derecha
  for (let i = 0; i < nX; i++) {
    const curX = x0 + R + i * stepX;
    const midX = curX + stepX / 2;
    const endX = curX + stepX;
    const peakY = y0 - (i % 2 === 0 ? amplitude / 2 : -amplitude / 2);
    d += ` L ${midX.toFixed(2)} ${peakY.toFixed(2)} L ${endX.toFixed(2)} ${y0.toFixed(2)}`;
  }

  // Semicírculo derecho (-PI/2 a +PI/2) centrado en (x1 - R, cy)
  const cxRight = x1 - R;
  const nArc = Math.max(3, Math.round((Math.PI * R) / Math.max(6, frequency)));
  for (let i = 0; i < nArc; i++) {
    const thMid = -Math.PI / 2 + (i + 0.5) * (Math.PI / nArc);
    const thEnd = -Math.PI / 2 + (i + 1) * (Math.PI / nArc);
    const rPeak = R + (i % 2 === 0 ? amplitude / 2 : -amplitude / 2);
    const px = cxRight + rPeak * Math.cos(thMid);
    const py = cy + rPeak * Math.sin(thMid);
    const ex = cxRight + R * Math.cos(thEnd);
    const ey = cy + R * Math.sin(thEnd);
    d += ` L ${px.toFixed(2)} ${py.toFixed(2)} L ${ex.toFixed(2)} ${ey.toFixed(2)}`;
  }

  // Borde inferior de derecha a izquierda
  for (let i = 0; i < nX; i++) {
    const curX = x1 - R - i * stepX;
    const midX = curX - stepX / 2;
    const endX = curX - stepX;
    const peakY = y1 + (i % 2 === 0 ? amplitude / 2 : -amplitude / 2);
    d += ` L ${midX.toFixed(2)} ${peakY.toFixed(2)} L ${endX.toFixed(2)} ${y1.toFixed(2)}`;
  }

  // Semicírculo izquierdo (+PI/2 a +3PI/2) centrado en (x0 + R, cy)
  const cxLeft = x0 + R;
  for (let i = 0; i < nArc; i++) {
    const thMid = Math.PI / 2 + (i + 0.5) * (Math.PI / nArc);
    const thEnd = Math.PI / 2 + (i + 1) * (Math.PI / nArc);
    const rPeak = R + (i % 2 === 0 ? amplitude / 2 : -amplitude / 2);
    const px = cxLeft + rPeak * Math.cos(thMid);
    const py = cy + rPeak * Math.sin(thMid);
    const ex = cxLeft + R * Math.cos(thEnd);
    const ey = cy + R * Math.sin(thEnd);
    d += ` L ${px.toFixed(2)} ${py.toFixed(2)} L ${ex.toFixed(2)} ${ey.toFixed(2)}`;
  }

  d += ' Z';
  return d;
}

/**
 * 12. Píldora (Capsule / Pill): Ondulado perimetral continuo con curvas suaves
 */
export function generatePillWavyPath(
  w: number,
  h: number,
  amplitude: number = 8,
  wavelength: number = 28
): string {
  const pad = amplitude / 2;
  const x0 = pad;
  const y0 = pad;
  const x1 = Math.max(x0 + 1, w - pad);
  const y1 = Math.max(y0 + 1, h - pad);
  const isHorizontal = (x1 - x0) >= (y1 - y0);

  if (!isHorizontal) {
    // Píldora vertical
    const R = (x1 - x0) / 2;
    const cx = x0 + R;
    const effH = Math.max(0, y1 - y0 - 2 * R);
    const nY = Math.max(1, Math.round(effH / Math.max(10, wavelength)));
    const stepY = effH / nY;

    let d = `M ${(cx + R).toFixed(2)} ${(y0 + R).toFixed(2)}`;
    // Borde derecho hacia abajo
    for (let i = 0; i < nY; i++) {
      const curY = y0 + R + i * stepY;
      const midY = curY + stepY / 2;
      const endY = curY + stepY;
      const crest = cx + R + amplitude / 2;
      const trough = cx + R - amplitude / 2;
      d += ` C ${crest.toFixed(2)} ${(curY + stepY * 0.25).toFixed(2)}, ${crest.toFixed(2)} ${(curY + stepY * 0.25).toFixed(2)}, ${(cx + R).toFixed(2)} ${midY.toFixed(2)}`;
      d += ` C ${trough.toFixed(2)} ${(midY + stepY * 0.25).toFixed(2)}, ${trough.toFixed(2)} ${(midY + stepY * 0.25).toFixed(2)}, ${(cx + R).toFixed(2)} ${endY.toFixed(2)}`;
    }
    // Semicírculo inferior
    const nArc = Math.max(2, Math.round((Math.PI * R) / Math.max(12, wavelength)));
    for (let i = 0; i < nArc; i++) {
      const th0 = (i * Math.PI) / nArc;
      const th1 = ((i + 1) * Math.PI) / nArc;
      const thMid = (th0 + th1) / 2;
      const crest = R + amplitude / 2;
      const cpx = cx + crest * Math.cos(thMid);
      const cpy = (y1 - R) + crest * Math.sin(thMid);
      const ex = cx + R * Math.cos(th1);
      const ey = (y1 - R) + R * Math.sin(th1);
      d += ` Q ${cpx.toFixed(2)} ${cpy.toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)}`;
    }
    // Borde izquierdo hacia arriba
    for (let i = 0; i < nY; i++) {
      const curY = y1 - R - i * stepY;
      const midY = curY - stepY / 2;
      const endY = curY - stepY;
      const crest = cx - R - amplitude / 2;
      const trough = cx - R + amplitude / 2;
      d += ` C ${crest.toFixed(2)} ${(curY - stepY * 0.25).toFixed(2)}, ${crest.toFixed(2)} ${(curY - stepY * 0.25).toFixed(2)}, ${(cx - R).toFixed(2)} ${midY.toFixed(2)}`;
      d += ` C ${trough.toFixed(2)} ${(midY - stepY * 0.25).toFixed(2)}, ${trough.toFixed(2)} ${(midY - stepY * 0.25).toFixed(2)}, ${(cx - R).toFixed(2)} ${endY.toFixed(2)}`;
    }
    // Semicírculo superior
    for (let i = 0; i < nArc; i++) {
      const th0 = Math.PI + (i * Math.PI) / nArc;
      const th1 = Math.PI + ((i + 1) * Math.PI) / nArc;
      const thMid = (th0 + th1) / 2;
      const crest = R + amplitude / 2;
      const cpx = cx + crest * Math.cos(thMid);
      const cpy = (y0 + R) + crest * Math.sin(thMid);
      const ex = cx + R * Math.cos(th1);
      const ey = (y0 + R) + R * Math.sin(th1);
      d += ` Q ${cpx.toFixed(2)} ${cpy.toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)}`;
    }
    d += ' Z';
    return d;
  }

  // Píldora horizontal
  const R = (y1 - y0) / 2;
  const cy = y0 + R;
  const effW = Math.max(0, x1 - x0 - 2 * R);
  const nX = Math.max(1, Math.round(effW / Math.max(10, wavelength)));
  const stepX = effW / nX;

  let d = `M ${(x0 + R).toFixed(2)} ${y0.toFixed(2)}`;

  // Borde superior
  for (let i = 0; i < nX; i++) {
    const curX = x0 + R + i * stepX;
    const midX = curX + stepX / 2;
    const endX = curX + stepX;
    const crest = y0 - amplitude / 2;
    const trough = y0 + amplitude / 2;
    d += ` C ${(curX + stepX * 0.25).toFixed(2)} ${crest.toFixed(2)}, ${(curX + stepX * 0.25).toFixed(2)} ${crest.toFixed(2)}, ${midX.toFixed(2)} ${y0.toFixed(2)}`;
    d += ` C ${(midX + stepX * 0.25).toFixed(2)} ${trough.toFixed(2)}, ${(midX + stepX * 0.25).toFixed(2)} ${trough.toFixed(2)}, ${endX.toFixed(2)} ${y0.toFixed(2)}`;
  }

  // Semicírculo derecho (-PI/2 a +PI/2)
  const cxRight = x1 - R;
  const nArc = Math.max(2, Math.round((Math.PI * R) / Math.max(12, wavelength)));
  for (let i = 0; i < nArc; i++) {
    const th0 = -Math.PI / 2 + (i * Math.PI) / nArc;
    const th1 = -Math.PI / 2 + ((i + 1) * Math.PI) / nArc;
    const thMid = (th0 + th1) / 2;
    const crest = R + amplitude / 2;
    const cpx = cxRight + crest * Math.cos(thMid);
    const cpy = cy + crest * Math.sin(thMid);
    const ex = cxRight + R * Math.cos(th1);
    const ey = cy + R * Math.sin(th1);
    d += ` Q ${cpx.toFixed(2)} ${cpy.toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)}`;
  }

  // Borde inferior
  for (let i = 0; i < nX; i++) {
    const curX = x1 - R - i * stepX;
    const midX = curX - stepX / 2;
    const endX = curX - stepX;
    const crest = y1 + amplitude / 2;
    const trough = y1 - amplitude / 2;
    d += ` C ${(curX - stepX * 0.25).toFixed(2)} ${crest.toFixed(2)}, ${(curX - stepX * 0.25).toFixed(2)} ${crest.toFixed(2)}, ${midX.toFixed(2)} ${y1.toFixed(2)}`;
    d += ` C ${(midX - stepX * 0.25).toFixed(2)} ${trough.toFixed(2)}, ${(midX - stepX * 0.25).toFixed(2)} ${trough.toFixed(2)}, ${endX.toFixed(2)} ${y1.toFixed(2)}`;
  }

  // Semicírculo izquierdo (+PI/2 a +3PI/2)
  const cxLeft = x0 + R;
  for (let i = 0; i < nArc; i++) {
    const th0 = Math.PI / 2 + (i * Math.PI) / nArc;
    const th1 = Math.PI / 2 + ((i + 1) * Math.PI) / nArc;
    const thMid = (th0 + th1) / 2;
    const crest = R + amplitude / 2;
    const cpx = cxLeft + crest * Math.cos(thMid);
    const cpy = cy + crest * Math.sin(thMid);
    const ex = cxLeft + R * Math.cos(th1);
    const ey = cy + R * Math.sin(th1);
    d += ` Q ${cpx.toFixed(2)} ${cpy.toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)}`;
  }

  d += ' Z';
  return d;
}

export interface PerimeterDiamondsOptions {
  shape?: string;
  w: number;
  h: number;
  r?: number;
  spacing?: number;
  dSize?: number;
  polygonPts?: Point2D[];
}

/**
 * 13. Generación geométrica de puntos romboidales (◆) distribuidos
 * a lo largo de la silueta REAL de cualquier forma de nodo.
 */
export function generatePerimeterDiamonds(options: PerimeterDiamondsOptions): Point2D[] {
  const {
    shape = 'rectangle',
    w,
    h,
    r = 0,
    spacing = 9,
    dSize = 6,
    polygonPts,
  } = options;

  const pts: Point2D[] = [];
  const step = Math.max(4, spacing + dSize);

  // 1. Polígono SVG explícito (Rombo, Hexágono, Flecha, Estrella, Bevel)
  if (polygonPts && polygonPts.length >= 3) {
    const n = polygonPts.length;
    for (let i = 0; i < n; i++) {
      const p1 = polygonPts[i];
      const p2 = polygonPts[(i + 1) % n];
      const edgeLen = dist(p1, p2);
      const count = Math.max(1, Math.round(edgeLen / step));
      for (let j = 0; j < count; j++) {
        const t = j / count;
        pts.push({
          x: p1.x + t * (p2.x - p1.x),
          y: p1.y + t * (p2.y - p1.y),
        });
      }
    }
    return pts;
  }

  // 2. Horquilla (Fork): Underline horizontal
  if (shape === 'fork') {
    const y = h - 2;
    const count = Math.max(2, Math.round(w / step));
    for (let i = 0; i <= count; i++) {
      pts.push({ x: (i * w) / count, y });
    }
    return pts;
  }

  // 3. Círculo
  if (shape === 'circle') {
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.max(2, Math.min(w, h) / 2);
    const P = 2 * Math.PI * R;
    const count = Math.max(4, Math.round(P / step));
    for (let i = 0; i < count; i++) {
      const theta = (i * 2 * Math.PI) / count;
      pts.push({
        x: cx + R * Math.cos(theta),
        y: cy + R * Math.sin(theta),
      });
    }
    return pts;
  }

  // 4. Óvalo / Elipse
  if (shape === 'oval') {
    const cx = w / 2;
    const cy = h / 2;
    const rx = Math.max(2, w / 2);
    const ry = Math.max(2, h / 2);
    const P = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
    const count = Math.max(4, Math.round(P / step));
    for (let i = 0; i < count; i++) {
      const theta = (i * 2 * Math.PI) / count;
      pts.push({
        x: cx + rx * Math.cos(theta),
        y: cy + ry * Math.sin(theta),
      });
    }
    return pts;
  }

  // 5. Píldora (Capsule / Pill)
  if (shape === 'pill' || (r >= Math.min(w, h) / 2 - 2 && r > 0)) {
    const isHorizontal = w >= h;
    if (isHorizontal) {
      const R = h / 2;
      const cy = h / 2;
      const xLeft = R;
      const xRight = w - R;
      const effW = Math.max(0, xRight - xLeft);

      // Borde superior
      const countH = Math.max(1, Math.round(effW / step));
      for (let i = 0; i < countH; i++) {
        pts.push({ x: xLeft + (i * effW) / countH, y: 0 });
      }

      // Semicírculo derecho (-PI/2 a +PI/2)
      const countArc = Math.max(3, Math.round((Math.PI * R) / step));
      for (let i = 0; i < countArc; i++) {
        const theta = -Math.PI / 2 + (i * Math.PI) / countArc;
        pts.push({
          x: xRight + R * Math.cos(theta),
          y: cy + R * Math.sin(theta),
        });
      }

      // Borde inferior
      for (let i = 0; i < countH; i++) {
        pts.push({ x: xRight - (i * effW) / countH, y: h });
      }

      // Semicírculo izquierdo (+PI/2 a +3PI/2)
      for (let i = 0; i < countArc; i++) {
        const theta = Math.PI / 2 + (i * Math.PI) / countArc;
        pts.push({
          x: xLeft + R * Math.cos(theta),
          y: cy + R * Math.sin(theta),
        });
      }
      return pts;
    }
  }

  // 6. Rectángulo o Burbuja con esquinas redondeadas o vivas (r >= 0)
  const cornerR = Math.max(0, Math.min(r, w / 2, h / 2));
  if (cornerR <= 1) {
    // Rectángulo con esquinas rectas
    const nX = Math.max(1, Math.round(w / step));
    const nY = Math.max(1, Math.round(h / step));
    for (let i = 0; i < nX; i++) pts.push({ x: (i * w) / nX, y: 0 });
    for (let i = 0; i < nY; i++) pts.push({ x: w, y: (i * h) / nY });
    for (let i = 0; i < nX; i++) pts.push({ x: w - (i * w) / nX, y: h });
    for (let i = 0; i < nY; i++) pts.push({ x: 0, y: h - (i * h) / nY });
    return pts;
  }

  // Burbuja / Rectángulo redondeado
  const x0 = 0;
  const y0 = 0;
  const x1 = w;
  const y1 = h;
  const effW = x1 - x0 - 2 * cornerR;
  const effH = y1 - y0 - 2 * cornerR;

  // Borde superior
  const nTop = Math.max(1, Math.round(effW / step));
  for (let i = 0; i < nTop; i++) {
    pts.push({ x: x0 + cornerR + (i * effW) / nTop, y: y0 });
  }

  // Esquina TR (-PI/2 a 0)
  const nArc = Math.max(2, Math.round((0.5 * Math.PI * cornerR) / step));
  for (let i = 0; i < nArc; i++) {
    const theta = -Math.PI / 2 + (i * (Math.PI / 2)) / nArc;
    pts.push({
      x: x1 - cornerR + cornerR * Math.cos(theta),
      y: y0 + cornerR + cornerR * Math.sin(theta),
    });
  }

  // Borde derecho
  const nRight = Math.max(1, Math.round(effH / step));
  for (let i = 0; i < nRight; i++) {
    pts.push({ x: x1, y: y0 + cornerR + (i * effH) / nRight });
  }

  // Esquina BR (0 a PI/2)
  for (let i = 0; i < nArc; i++) {
    const theta = (i * (Math.PI / 2)) / nArc;
    pts.push({
      x: x1 - cornerR + cornerR * Math.cos(theta),
      y: y1 - cornerR + cornerR * Math.sin(theta),
    });
  }

  // Borde inferior
  for (let i = 0; i < nTop; i++) {
    pts.push({ x: x1 - cornerR - (i * effW) / nTop, y: y1 });
  }

  // Esquina BL (PI/2 a PI)
  for (let i = 0; i < nArc; i++) {
    const theta = Math.PI / 2 + (i * (Math.PI / 2)) / nArc;
    pts.push({
      x: x0 + cornerR + cornerR * Math.cos(theta),
      y: y1 - cornerR + cornerR * Math.sin(theta),
    });
  }

  // Borde izquierdo
  for (let i = 0; i < nRight; i++) {
    pts.push({ x: x0, y: y1 - cornerR - (i * effH) / nRight });
  }

  // Esquina TL (PI a 3PI/2)
  for (let i = 0; i < nArc; i++) {
    const theta = Math.PI + (i * (Math.PI / 2)) / nArc;
    pts.push({
      x: x0 + cornerR + cornerR * Math.cos(theta),
      y: y0 + cornerR + cornerR * Math.sin(theta),
    });
  }

  return pts;
}
