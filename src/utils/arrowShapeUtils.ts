import { MindNode, ArrowDirection, ArrowTailStyle } from '../types/mindmap';

export interface ArrowConfig {
  direction: ArrowDirection;
  effectiveDirection: ArrowDirection;
  autoOrient: boolean;
  tailStyle: ArrowTailStyle;
  isBidirectional: boolean;
  tipRatio: number;
}

/**
 * Default ratio of arrow tip to dimension (length or width)
 */
export const DEFAULT_ARROW_TIP_RATIO = 0.32;

/**
 * Resolves arrow shape configuration considering auto-orientation according to branch side
 */
export const resolveArrowConfig = (node: MindNode): ArrowConfig => {
  const autoOrient = Boolean(node.arrowAutoOrient);
  const direction: ArrowDirection = node.arrowDirection || 'right';

  // Smart auto-orientation: points outwards from root depending on tree branch side
  let effectiveDirection: ArrowDirection = direction;
  if (autoOrient) {
    effectiveDirection = node.side === 'left' ? 'left' : 'right';
  }

  const tailStyle: ArrowTailStyle = node.arrowTailStyle || 'notch';
  const isBidirectional = Boolean(node.arrowBidirectional);
  const tipRatio =
    typeof node.arrowTipRatio === 'number'
      ? Math.max(0.15, Math.min(0.5, node.arrowTipRatio))
      : DEFAULT_ARROW_TIP_RATIO;

  return {
    direction,
    effectiveDirection,
    autoOrient,
    tailStyle,
    isBidirectional,
    tipRatio,
  };
};

/**
 * Calculates SVG polygon points for arrow node in any of the 4 cardinal directions,
 * flat/notched tail styles, and bidirectional double-arrow mode.
 */
export const computeArrowPolygonPoints = (
  w: number,
  h: number,
  node: MindNode,
  borderWidth: number = 1.5
): string => {
  const pad = Math.max(borderWidth / 2, 1);
  const config = resolveArrowConfig(node);
  const dir = config.effectiveDirection;
  const isBidi = config.isBidirectional;
  const isFlat = config.tailStyle === 'flat';
  const tipRatio = config.tipRatio;

  if (dir === 'up' || dir === 'down') {
    const arrowTipY = Math.min(h * tipRatio, Math.max(24, w * 0.65));
    const notchY = Math.min(h * (tipRatio * 0.5), Math.max(12, w * 0.35));

    if (dir === 'up') {
      if (isBidi) {
        return `${w / 2},${pad} ${w - pad},${pad + arrowTipY} ${w - pad},${h - arrowTipY} ${w / 2},${h - pad} ${pad},${h - arrowTipY} ${pad},${pad + arrowTipY}`;
      }
      if (isFlat) {
        return `${w / 2},${pad} ${w - pad},${pad + arrowTipY} ${w - pad},${h - pad} ${pad},${h - pad} ${pad},${pad + arrowTipY}`;
      }
      // Up with bottom notch
      return `${w / 2},${pad} ${w - pad},${pad + arrowTipY} ${w - pad},${h - pad} ${w / 2},${h - pad - notchY} ${pad},${h - pad} ${pad},${pad + arrowTipY}`;
    } else {
      // dir === 'down'
      if (isBidi) {
        return `${w / 2},${pad} ${w - pad},${pad + arrowTipY} ${w - pad},${h - arrowTipY} ${w / 2},${h - pad} ${pad},${h - arrowTipY} ${pad},${pad + arrowTipY}`;
      }
      if (isFlat) {
        return `${pad},${pad} ${w - pad},${pad} ${w - pad},${h - arrowTipY} ${w / 2},${h - pad} ${pad},${h - arrowTipY}`;
      }
      // Down with top notch
      return `${pad},${pad} ${w / 2},${pad + notchY} ${w - pad},${pad} ${w - pad},${h - arrowTipY} ${w / 2},${h - pad} ${pad},${h - arrowTipY}`;
    }
  }

  // Horizontal directions: 'right' | 'left'
  const arrowTip = Math.min(w * tipRatio, Math.max(28, h * 0.7));
  const notch = Math.min(w * (tipRatio * 0.5), Math.max(14, h * 0.4));

  if (dir === 'left') {
    if (isBidi) {
      return `${pad + arrowTip},${pad} ${w - arrowTip},${pad} ${w - pad},${h / 2} ${w - arrowTip},${h - pad} ${pad + arrowTip},${h - pad} ${pad},${h / 2}`;
    }
    if (isFlat) {
      return `${pad + arrowTip},${pad} ${w - pad},${pad} ${w - pad},${h - pad} ${pad + arrowTip},${h - pad} ${pad},${h / 2}`;
    }
    // Left with right notch
    return `${pad + arrowTip},${pad} ${w - pad},${pad} ${w - pad - notch},${h / 2} ${w - pad},${h - pad} ${pad + arrowTip},${h - pad} ${pad},${h / 2}`;
  }

  // dir === 'right' (default)
  if (isBidi) {
    return `${pad + arrowTip},${pad} ${w - arrowTip},${pad} ${w - pad},${h / 2} ${w - arrowTip},${h - pad} ${pad + arrowTip},${h - pad} ${pad},${h / 2}`;
  }
  if (isFlat) {
    return `${pad},${pad} ${w - arrowTip},${pad} ${w - pad},${h / 2} ${w - arrowTip},${h - pad} ${pad},${h - pad}`;
  }
  // Right with left notch
  return `${pad},${pad} ${w - arrowTip},${pad} ${w - pad},${h / 2} ${w - arrowTip},${h - pad} ${pad},${h - pad} ${pad + notch},${h / 2}`;
};

/**
 * Computes inner content padding styles to ensure text and badges don't collide
 * with the pointed arrow tip(s) or notch.
 */
export const computeArrowContentPadding = (
  node: MindNode
): {
  paddingLeft: string;
  paddingRight: string;
  paddingTop: string;
  paddingBottom: string;
} => {
  const config = resolveArrowConfig(node);
  const dir = config.effectiveDirection;
  const isBidi = config.isBidirectional;
  const isFlat = config.tailStyle === 'flat';

  if (dir === 'up') {
    return {
      paddingTop: '32px',
      paddingBottom: isBidi ? '32px' : isFlat ? '8px' : '20px',
      paddingLeft: '14px',
      paddingRight: '14px',
    };
  }

  if (dir === 'down') {
    return {
      paddingTop: isBidi ? '32px' : isFlat ? '8px' : '20px',
      paddingBottom: '32px',
      paddingLeft: '14px',
      paddingRight: '14px',
    };
  }

  if (dir === 'left') {
    return {
      paddingLeft: '36px',
      paddingRight: isBidi ? '36px' : isFlat ? '14px' : '24px',
      paddingTop: '6px',
      paddingBottom: '6px',
    };
  }

  // dir === 'right'
  return {
    paddingLeft: isBidi ? '36px' : isFlat ? '14px' : '24px',
    paddingRight: '36px',
    paddingTop: '6px',
    paddingBottom: '6px',
  };
};
