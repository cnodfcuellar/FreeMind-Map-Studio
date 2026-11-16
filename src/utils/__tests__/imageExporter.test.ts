import { describe, it, expect } from 'vitest';
import { getImageDimensions, exportMindMapToSvg } from '../imageExporter';
import { BLANK_MAP } from '../sampleMaps';

describe('imageExporter', () => {
  it('calcula dimensiones en píxeles proporcionales a la escala', () => {
    const dim1x = getImageDimensions(BLANK_MAP, 1);
    const dim2x = getImageDimensions(BLANK_MAP, 2);
    const dim4x = getImageDimensions(BLANK_MAP, 4);

    expect(dim1x.width).toBeGreaterThan(0);
    expect(dim1x.height).toBeGreaterThan(0);

    expect(dim2x.width).toBe(Math.round(dim1x.originalWidth * 2));
    expect(dim2x.height).toBe(Math.round(dim1x.originalHeight * 2));

    expect(dim4x.width).toBe(Math.round(dim1x.originalWidth * 4));
    expect(dim4x.height).toBe(Math.round(dim1x.originalHeight * 4));
  });

  it('exportMindMapToSvg respeta fondo transparente, blanco y del lienzo', () => {
    const svgTransparent = exportMindMapToSvg(BLANK_MAP, { background: 'transparent' });
    expect(svgTransparent).toContain('background-color: transparent');

    const svgWhite = exportMindMapToSvg(BLANK_MAP, { background: 'white' });
    expect(svgWhite).toContain('background-color: #ffffff');

    const svgTheme = exportMindMapToSvg(BLANK_MAP, { background: 'theme' });
    expect(svgTheme).toContain('<svg');
    expect(svgTheme).toContain('</svg>');
  });
});
