import { MindMap } from '../types/mindmap';
import { THEMES } from './themes';
import { computeMapBoundingBox, generateMindMapVectorSvg } from './pdfExporter';

export type ImageFormat = 'png' | 'jpeg' | 'svg';
export type ImageBackgroundMode = 'transparent' | 'theme' | 'white';

export interface ImageExportOptions {
  format?: ImageFormat;
  scale?: number; // 1 = 1x, 2 = 2x Retina, 4 = 4x Ultra HD
  background?: ImageBackgroundMode;
  quality?: number; // 0.1 a 1.0 para JPEG
}

/**
 * Calculates pixel dimensions based on mind map bounding box and export scale
 */
export function getImageDimensions(
  mindMap: MindMap,
  scale: number = 2
): { width: number; height: number; originalWidth: number; originalHeight: number } {
  const { box } = computeMapBoundingBox(mindMap, 50);
  const width = Math.max(100, Math.round(box.width * scale));
  const height = Math.max(100, Math.round(box.height * scale));

  return {
    width,
    height,
    originalWidth: Math.round(box.width),
    originalHeight: Math.round(box.height),
  };
}

/**
 * Generates raw SVG string with desired background mode
 */
export function exportMindMapToSvg(
  mindMap: MindMap,
  options: ImageExportOptions = {}
): string {
  const { background = 'theme' } = options;
  const theme = THEMES[mindMap.themeId] || THEMES.default;

  let bgCss = 'background-color: transparent;';
  if (background === 'theme') {
    bgCss = `background-color: ${theme.background || '#ffffff'};`;
  } else if (background === 'white') {
    bgCss = 'background-color: #ffffff;';
  }

  // Generamos el SVG base
  let svg = generateMindMapVectorSvg(mindMap, undefined, {
    includeBackground: background !== 'transparent',
  });

  // Si se solicitó fondo transparente, eliminamos cualquier background-color inline
  if (background === 'transparent') {
    svg = svg.replace(/style="background-color:[^"]*"/, 'style="background-color: transparent;"');
  } else if (background === 'white') {
    svg = svg.replace(/style="background-color:[^"]*"/, 'style="background-color: #ffffff;"');
  }

  return svg;
}

/**
 * Renders the vector mindmap to an offscreen HTML5 Canvas at the requested resolution scale
 */
export async function renderMindMapToCanvas(
  mindMap: MindMap,
  options: ImageExportOptions = {}
): Promise<HTMLCanvasElement> {
  const {
    scale = 2,
    background = 'theme',
  } = options;

  const { width, height } = getImageDimensions(mindMap, scale);
  const svgString = exportMindMapToSvg(mindMap, options);

  // Creamos el elemento canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No se pudo inicializar el contexto 2D del Canvas');
  }

  // Fondo si no es transparente
  if (background === 'theme') {
    const theme = THEMES[mindMap.themeId] || THEMES.default;
    ctx.fillStyle = theme.background || '#ffffff';
    ctx.fillRect(0, 0, width, height);
  } else if (background === 'white') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }

  // Convertir SVG a Blob URL
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise<HTMLCanvasElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Error al rasterizar el SVG del mapa mental a la imagen'));
    };

    img.src = url;
  });
}

/**
 * Converts the mindmap to a Blob ready for download or clipboard
 */
export async function exportMindMapToBlob(
  mindMap: MindMap,
  options: ImageExportOptions = {}
): Promise<Blob> {
  const { format = 'png', quality = 0.92 } = options;

  if (format === 'svg') {
    const svg = exportMindMapToSvg(mindMap, options);
    return new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  }

  const canvas = await renderMindMapToCanvas(mindMap, options);

  return new Promise<Blob>((resolve, reject) => {
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error(`Fallo al exportar canvas a formato ${format}`));
        }
      },
      mimeType,
      quality
    );
  });
}

/**
 * Triggers browser download of the mind map image
 */
export async function downloadMindMapImage(
  mindMap: MindMap,
  options: ImageExportOptions = {}
): Promise<void> {
  const { format = 'png', scale = 2 } = options;
  const blob = await exportMindMapToBlob(mindMap, options);

  const safeTitle = mindMap.title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'mapa_mental';
  const filename = `${safeTitle}_${scale}x.${format === 'jpeg' ? 'jpg' : format}`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copies a PNG image to the system clipboard for immediate pasting (Word, Slack, PPT)
 */
export async function copyMindMapImageToClipboard(
  mindMap: MindMap,
  options: ImageExportOptions = {}
): Promise<boolean> {
  try {
    if (!navigator.clipboard || !navigator.clipboard.write) {
      throw new Error('Portapapeles no soportado en este navegador');
    }

    // Forzar PNG para compatibilidad con el portapapeles del sistema operativo
    const blob = await exportMindMapToBlob(mindMap, {
      ...options,
      format: 'png',
    });

    const item = new ClipboardItem({ 'image/png': blob });
    await navigator.clipboard.write([item]);
    return true;
  } catch (err) {
    console.error('Error al copiar imagen al portapapeles:', err);
    return false;
  }
}
