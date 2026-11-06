import type { OverlayCollisionPadding, OverlaySticky } from '@cocokits/cdk/positioning';

/**
 * The placement options every overlay content shares. An unset option takes the positioning default, so the
 * content behaves as one that never heard of it.
 */
export interface OverlayPositioningProps {
  /**
   * The gap in pixels between the trigger and the list. When not set, the list takes the `--side-offset` value of the theme.
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly sideOffset?: number | undefined;
  /**
   * How far, in pixels, the list moves along the edge of the trigger, away from the aligned edge. It has no effect with `align="center"`.
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue 0
   */
  readonly alignOffset?: number | undefined;
  /**
   * Whether the list flips to the other side and shifts to stay in view. With `false`, it keeps its side and alignment even when it overflows.
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue true
   */
  readonly avoidCollisions?: boolean | undefined;
  /**
   * The distance, in pixels, that the list keeps from the edges of the viewport. Pass one number for all four sides, or an object with `top`, `right`, `bottom` and `left`. A missing side is 0.
   *
   * The sides are physical.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue 5
   */
  readonly collisionPadding?: OverlayCollisionPadding | undefined;
  /**
   * How the list stays in view along the edge of the trigger. `'partial'` keeps it in view only while the trigger is at least partly in view. `'always'` keeps it in view in every case.
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue 'partial'
   */
  readonly sticky?: OverlaySticky | undefined;
  /**
   * Whether the list is hidden (with the native `hidden` attribute) while its clipping parents fully hide the trigger, such as a scrolled container.
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue false
   */
  readonly hideWhenDetached?: boolean | undefined;
  /**
   * The elements that the list must also stay inside, besides the viewport. Pass one element, a list of elements, or `null` for none. Entries that are `null` are ignored.
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue none
   */
  readonly collisionBoundary?: Element | null | readonly (Element | null)[] | undefined;
  /**
   * How the position follows the page. `'optimized'` places the list again only when something moved or changed size. `'always'` places it again on every animation frame.
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue 'optimized'
   */
  readonly updatePositionStrategy?: 'optimized' | 'always' | undefined;
  /**
   * Whether the list may flip to the opposite side when there is no room. It has no effect when `avoidCollisions` is off.
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   * @defaultValue true
   */
  readonly sideFlip?: boolean | undefined;
  /**
   * Whether the alignment may flip to the opposite one when there is no room. It has no effect when `avoidCollisions` is off.
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   * @defaultValue true
   */
  readonly alignFlip?: boolean | undefined;
  /**
   * Whether the list stays in view on both axes, even when it then covers the trigger. With `false`, the list prefers a position that leaves the trigger uncovered. It has no effect when `avoidCollisions` is off.
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   * @defaultValue false
   */
  readonly prioritizePosition?: boolean | undefined;
  /**
   * Whether the list keeps its place when the layout shifts, that is when the trigger or the list resizes or moves without a scroll. With `false`, the list is placed again.
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   * @defaultValue false
   */
  readonly disableUpdateOnLayoutShift?: boolean | undefined;
}

/**
 * The placement options of an overlay content that can hold an arrow (Popover, Tooltip).
 */
export interface OverlayArrowProps {
  /**
   * The distance, in pixels, that the arrow keeps from the corners of the content.
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue 0
   */
  readonly arrowPadding?: number | undefined;
  /**
   * Whether the arrow is hidden (the native `hidden` attribute) while it cannot point at the anchor's centre,
   * because the content shifted along the edge. With `false` it stays shown.
   *
   * @defaultValue true
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly hideShiftedArrow?: boolean | undefined;
}
