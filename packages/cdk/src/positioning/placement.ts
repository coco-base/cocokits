import type { Placement } from '@floating-ui/dom';
import type { Direction } from '@cocokits/shared';

/**
 * The side of the anchor the content sits on. `start` and `end` follow the text direction.
 *
 * @cckValue top - Above the anchor.
 * @cckValue bottom - Below the anchor.
 * @cckValue start - Before the anchor, in the text direction.
 * @cckValue end - After the anchor, in the text direction.
 */
export type OverlaySide = 'top' | 'bottom' | 'start' | 'end';

/**
 * How the content lines up along the edge of the anchor.
 *
 * @cckValue start - Lines up with the start edge of the anchor.
 * @cckValue center - Centered on the anchor.
 * @cckValue end - Lines up with the end edge of the anchor.
 */
export type OverlayAlign = 'start' | 'center' | 'end';

/**
 * An anchor that is not an element: any object that can measure itself.
 * Use it to place an overlay at a point, such as the pointer.
 * The position comes from the box that `getBoundingClientRect` returns.
 */
export interface OverlayVirtualAnchor {
  /** Returns the box of the anchor in viewport pixels. It is called again whenever the position is computed. */
  readonly getBoundingClientRect: () => {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly left: number;
  };
  /** An element whose scrolling ancestors the position follows. When not set, the position follows no scrolling ancestor. */
  readonly contextElement?: Element;
}

/** A distance from the viewport edges, in px: one number for all four edges, or an object for single physical edges. Edges that you leave out are `0`. */
export type OverlayCollisionPadding = number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>;

/**
 * How the content stays in view along the edge of the anchor.
 *
 * @cckValue partial - Keeps the content in view only while the anchor is at least partly in view.
 * @cckValue always - Keeps the content in view in every case.
 */
export type OverlaySticky = 'partial' | 'always';

type PhysicalSide = 'top' | 'bottom' | 'left' | 'right';

const PHYSICAL: Record<Direction, Record<'start' | 'end', PhysicalSide>> = {
  ltr: { start: 'left', end: 'right' },
  rtl: { start: 'right', end: 'left' },
};

/**
 * Turns a logical side and alignment into a placement string such as `top` or `left-end`. It is a pure function.
 *
 * @remarks
 * The sides `start` and `end` become `left` and `right`, depending on the direction. The alignment stays logical.
 * Floating UI mirrors it for `top` and `bottom` from the direction of the content, which inherits `dir` from the portal host.
 *
 * @param side - The logical side.
 * @param align - The logical alignment.
 * @param dir - The text direction of the overlay.
 * @returns The placement string.
 * @example
 * toFloatingPlacement('start', 'center', 'rtl'); // 'right'
 * toFloatingPlacement('bottom', 'end', 'ltr'); // 'bottom-end'
 */
export function toFloatingPlacement(side: OverlaySide, align: OverlayAlign, dir: Direction): Placement {
  const physical = side === 'start' || side === 'end' ? PHYSICAL[dir][side] : side;
  return align === 'center' ? physical : `${physical}-${align}`;
}

/** @internal The inverse of {@link toFloatingPlacement}: the logical side and alignment of a resolved placement. */
export function fromFloatingPlacement(placement: string, dir: Direction): { side: OverlaySide; align: OverlayAlign } {
  const [physical, alignment] = placement.split('-');
  const align: OverlayAlign = alignment === 'start' || alignment === 'end' ? alignment : 'center';
  if (physical === 'left' || physical === 'right') {
    return { side: PHYSICAL[dir].start === physical ? 'start' : 'end', align };
  }
  return { side: physical === 'top' ? 'top' : 'bottom', align };
}
