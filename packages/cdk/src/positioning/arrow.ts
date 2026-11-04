import type { Middleware } from '@floating-ui/dom';
import type { Direction } from '@cocokits/shared';

type PhysicalSide = 'top' | 'bottom' | 'left' | 'right';

/** The measured size of the arrow part, read once when positioning starts. */
export interface ArrowSize {
  readonly width: number;
  readonly height: number;
}

/** What the arrow middleware leaves in `middlewareData.cckArrow`. */
export interface ArrowData {
  /** The arrow's left edge in the content, in px; set for a `top` or `bottom` side. */
  readonly x?: number;
  /** The arrow's top edge in the content, in px; set for a `left` or `right` side. */
  readonly y?: number;
  /** `0` when the arrow sits at the anchor's centre; otherwise how far the content shifted it away. */
  readonly centerOffset: number;
  /** Whether the arrow cannot point at the anchor and the options say to hide it. */
  readonly hidden: boolean;
}

const OPPOSITE: Record<PhysicalSide, PhysicalSide> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

const TRANSFORM: Record<PhysicalSide, string> = {
  top: 'translateY(100%)',
  right: 'translateY(50%) rotate(90deg) translateX(-50%)',
  bottom: 'rotate(180deg)',
  left: 'translateY(50%) rotate(-90deg) translateX(50%)',
};

const TRANSFORM_ORIGIN: Record<PhysicalSide, string> = {
  top: '',
  right: '0 0',
  bottom: 'center 0',
  left: '100% 0',
};

function sideOf(placement: string): PhysicalSide {
  return placement.split('-')[0] as PhysicalSide;
}

/**
 * The arrow's place along the content's edge that faces the anchor: centred on the anchor's centre,
 * `padding` px from the content's corners. The size is the one measured at the start, so hiding the
 * arrow (which collapses its box) does not change the result. The algorithm is Floating UI's `arrow`
 * middleware with a fixed size.
 */
export function arrowMiddleware(size: ArrowSize, padding: number, hideShifted: boolean): Middleware {
  return {
    name: 'cckArrow',
    fn({ x, y, placement, rects, elements, middlewareData }) {
      const vertical = sideOf(placement) === 'left' || sideOf(placement) === 'right';
      const axis = vertical ? 'y' : 'x';
      const length = vertical ? 'height' : 'width';
      const arrowLength = vertical ? size.height : size.width;
      const coord = vertical ? y : x;
      const endDiff = rects.reference[length] + rects.reference[axis] - coord - rects.floating[length];
      const startDiff = coord - rects.reference[axis];
      const floating = elements.floating;
      const clientSize = (vertical ? floating.clientHeight : floating.clientWidth) || rects.floating[length];
      const centerToReference = endDiff / 2 - startDiff / 2;
      const largestPossiblePadding = clientSize / 2 - arrowLength / 2 - 1;
      const edgePadding = Math.min(padding, largestPossiblePadding);
      const min = edgePadding;
      const max = clientSize - arrowLength - edgePadding;
      const center = clientSize / 2 - arrowLength / 2 + centerToReference;
      const offset = Math.min(Math.max(min, center), max);
      const shouldAddOffset =
        !middlewareData['cckArrow'] &&
        placement.includes('-') &&
        center !== offset &&
        rects.reference[length] / 2 - edgePadding - arrowLength / 2 < 0;
      const alignmentOffset = shouldAddOffset ? (center < min ? center - min : center - max) : 0;
      const centerOffset = center - offset - alignmentOffset;
      const hidden = hideShifted && centerOffset !== 0;
      const moved = coord + alignmentOffset;
      return vertical
        ? { y: moved, data: { y: offset, centerOffset, hidden } satisfies ArrowData, reset: shouldAddOffset }
        : { x: moved, data: { x: offset, centerOffset, hidden } satisfies ArrowData, reset: shouldAddOffset };
    },
  };
}

/** The point where the content meets its anchor, as the value of `transform-origin`. Radix's `transformOrigin`. */
export function transformOriginMiddleware(size: ArrowSize | null, dir: () => Direction): Middleware {
  return {
    name: 'cckTransformOrigin',
    fn({ placement, rects, middlewareData }) {
      const arrow = middlewareData['cckArrow'] as ArrowData | undefined;
      const shown = size !== null && arrow !== undefined && !arrow.hidden;
      const arrowSize = shown ? size : { width: 0, height: 0 };
      const side = sideOf(placement);
      const alignment = placement.split('-')[1];
      // On a `top` or `bottom` side `start` is the inline start, which is the right edge in RTL.
      const flipped = dir() === 'rtl' && (side === 'top' || side === 'bottom');
      const start = flipped ? '100%' : '0%';
      const end = flipped ? '0%' : '100%';
      const aligned = alignment === 'start' ? start : alignment === 'end' ? end : '50%';
      const height = arrowSize.height;
      const arrowX = (arrow?.x ?? 0) + arrowSize.width / 2;
      const arrowY = (arrow?.y ?? 0) + arrowSize.height / 2;
      const along = (value: string): string => (shown ? value : aligned);
      const origin = {
        bottom: [along(`${String(arrowX)}px`), `${String(-height)}px`],
        top: [along(`${String(arrowX)}px`), `${String(rects.floating.height + height)}px`],
        right: [`${String(-height)}px`, along(`${String(arrowY)}px`)],
        left: [`${String(rects.floating.width + height)}px`, along(`${String(arrowY)}px`)],
      }[side];
      return { data: { x: origin[0], y: origin[1] } };
    },
  };
}

/**
 * Writes the arrow's place on its element: absolute on the content edge that faces the anchor, at the
 * measured offset along it, turned to point at the anchor. Only geometry; never `display` or `visibility`.
 */
export function writeArrow(arrow: HTMLElement, placement: string, data: ArrowData): void {
  const side = sideOf(placement);
  const style = arrow.style;
  style.position = 'absolute';
  style.left = data.x === undefined ? '' : `${String(data.x)}px`;
  style.top = data.y === undefined ? '' : `${String(data.y)}px`;
  style.right = '';
  style.bottom = '';
  style[OPPOSITE[side]] = '0';
  style.transformOrigin = TRANSFORM_ORIGIN[side];
  style.transform = TRANSFORM[side];
}
