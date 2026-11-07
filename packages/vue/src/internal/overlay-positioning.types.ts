import type { OverlayCollisionPadding, OverlaySticky } from '@cocokits/cdk/positioning';

/**
 * The placement options every overlay content shares. An unset option takes the positioning default, so the
 * content behaves as one that never heard of it.
 */
export interface OverlayPositioningProps {
  /**
   * The gap between the anchor and the content in px. Unset, the content takes the theme's `--side-offset`.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly sideOffset?: number | undefined;
  /**
   * Moves the content along the anchor's edge, away from the aligned edge, in px. It has no effect with
   * `align="center"`.
   *
   * @defaultValue 0
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly alignOffset?: number | undefined;
  /**
   * Whether the content flips to the opposite side and shifts to stay in view. With `false` it keeps the wanted
   * side and alignment even when it overflows.
   *
   * @defaultValue true
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly avoidCollisions?: boolean | undefined;
  /**
   * The distance in px the content keeps from the viewport edges: one number for all four, or one per side
   * (`top`, `right`, `bottom`, `left`; unset sides are 0). The sides are physical.
   *
   * @defaultValue 5
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly collisionPadding?: OverlayCollisionPadding | undefined;
  /**
   * `'partial'` keeps the content in view along the anchor's edge only while the anchor is at least partly in
   * view; `'always'` keeps it in view regardless.
   *
   * @defaultValue 'partial'
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly sticky?: OverlaySticky | undefined;
  /**
   * Hides the content (the native `hidden` attribute) while the anchor is fully hidden by its clipping
   * ancestors, such as a scrolled container.
   *
   * @defaultValue false
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly hideWhenDetached?: boolean | undefined;
  /**
   * Elements the content must stay inside as well as the viewport: one element, a list of them, or `null` for
   * none. Entries that are `null` are ignored.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly collisionBoundary?: Element | null | readonly (Element | null)[] | undefined;
  /**
   * `'optimized'` places the content again only when the anchor or the content moved or resized; `'always'` places
   * it again on every animation frame.
   *
   * @defaultValue 'optimized'
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly updatePositionStrategy?: 'optimized' | 'always' | undefined;
  /**
   * Whether the content may flip to the opposite side when there is no room. Has no effect with
   * `avoidCollisions` off.
   *
   * @defaultValue true
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly sideFlip?: boolean | undefined;
  /**
   * Whether the alignment may flip to the opposite one when there is no room. Has no effect with
   * `avoidCollisions` off.
   *
   * @defaultValue true
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly alignFlip?: boolean | undefined;
  /**
   * `true` keeps the content in view on both axes even when that makes it cover the anchor; `false` prefers a
   * position that leaves the anchor uncovered. Has no effect with `avoidCollisions` off.
   *
   * @defaultValue false
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly prioritizePosition?: boolean | undefined;
  /**
   * `true` does not place the content again when the layout shifts (the anchor or the content resizes or moves
   * without a scroll).
   *
   * @defaultValue false
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly disableUpdateOnLayoutShift?: boolean | undefined;
}

/**
 * The placement options of an overlay content that can hold an arrow (Popover, Tooltip).
 */
export interface OverlayArrowProps {
  /**
   * The distance in px the arrow keeps from the corners of the content.
   *
   * @defaultValue 0
   * @cckSemantic none
   * @cckParity Not available in every framework.
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
