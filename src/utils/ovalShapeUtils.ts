import { MindNode, OvalPreset, OvalRatio } from '../types/mindmap';

export interface OvalConfig {
  rotation: number;
  keepTextHorizontal: boolean;
  preset?: OvalPreset;
  ratio: OvalRatio;
}

/**
 * Resolves configuration for oval / ellipse shape nodes
 */
export const resolveOvalConfig = (node: MindNode): OvalConfig => {
  const rotation = typeof node.ovalRotation === 'number' ? node.ovalRotation : 0;
  const keepTextHorizontal = node.ovalKeepTextHorizontal !== false;
  const ratio: OvalRatio = node.ovalRatio || 'classic';

  return {
    rotation,
    keepTextHorizontal,
    preset: node.ovalPreset,
    ratio,
  };
};

/**
 * Checks whether the oval requires SVG overlay rendering (when rotated while keeping text horizontal)
 */
export const isOvalSvgShape = (node: MindNode): boolean => {
  if (node.shape !== 'oval') return false;
  const config = resolveOvalConfig(node);
  return config.rotation !== 0 && config.keepTextHorizontal;
};

/**
 * Computes CSS padding for an oval based on its ratio / slender proportion
 */
export const computeOvalPadding = (node: MindNode): {
  paddingLeft: string;
  paddingRight: string;
  paddingTop: string;
  paddingBottom: string;
} => {
  const ratio = node.ovalRatio || 'classic';
  if (ratio === 'slender') {
    return {
      paddingLeft: '34px',
      paddingRight: '34px',
      paddingTop: '5px',
      paddingBottom: '5px',
    };
  }
  if (ratio === 'capsule') {
    return {
      paddingLeft: '14px',
      paddingRight: '14px',
      paddingTop: '10px',
      paddingBottom: '10px',
    };
  }
  return {
    paddingLeft: '22px',
    paddingRight: '22px',
    paddingTop: '6px',
    paddingBottom: '6px',
  };
};

/**
 * Computes SVG rotation transform string for an ellipse centered at (w/2, h/2)
 */
export const computeOvalSvgTransform = (w: number, h: number, rotation: number): string => {
  const cx = +(w / 2).toFixed(2);
  const cy = +(h / 2).toFixed(2);
  return `rotate(${rotation} ${cx} ${cy})`;
};
