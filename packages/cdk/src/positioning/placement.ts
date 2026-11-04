import type { Placement } from '@floating-ui/dom';
import type { Direction } from '@cocokits/shared';

/** The side of the anchor the content sits on. `start` and `end` follow the direction. */
export type OverlaySide = 'top' | 'bottom' | 'start' | 'end';

/** How the content lines up along the anchor's edge. */
export type OverlayAlign = 'start' | 'center' | 'end';

/**
 * An anchor that is not an element: any object that measures itself. `contextElement` names the element
 * whose scrolling ancestors the position follows.
 */
export interface OverlayVirtualAnchor {
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
  readonly contextElement?: Element;
}

/** Distance from the viewport edges: one number for all four, or per physical side (unset sides are `0`). */
export type OverlayCollisionPadding = number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>;

/** `partial`: stay in view along the edge only while the anchor is partly in view. `always`: stay in view regardless. */
export type OverlaySticky = 'partial' | 'always';

type PhysicalSide = 'top' | 'bottom' | 'left' | 'right';

const PHYSICAL: Record<Direction, Record<'start' | 'end', PhysicalSide>> = {
  ltr: { start: 'left', end: 'right' },
  rtl: { start: 'right', end: 'left' },
};

/**
 * Maps a logical side and alignment to a Floating UI placement (`top`, `left-end`, ...). `start` and
 * `end` sides become `left` and `right` by direction. The alignment stays logical: Floating UI mirrors
 * it for `top` and `bottom` from the direction of the content, which inherits `dir` from the portal
 * host. Pure.
 *
 * @param side - The logical side.
 * @param align - The logical alignment.
 * @param dir - The direction of the overlay.
 * @returns The placement string.
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
