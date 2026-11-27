import type { OverlayCollisionPadding, OverlaySticky } from '@cocokits/cdk/positioning';

/**
 * The placement options every overlay content shares. An unset option takes the positioning default, so the
 * content behaves as one that never heard of it.
 */
export interface OverlayPositioningProps {
  /**
   * The gap in pixels between the trigger and the content. When not set, the content takes the `--side-offset` value of the theme.
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly sideOffset?: number | undefined;
  /**
   * How far, in pixels, the content moves along the edge of the trigger, away from the aligned edge. It has no effect with `align="center"`.
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue 0
   */
  readonly alignOffset?: number | undefined;
  /**
   * Whether the content flips to the other side and shifts to stay in view. With `false`, it keeps its side and alignment even when it overflows.
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue true
   */
  readonly avoidCollisions?: boolean | undefined;
  /**
   * The distance, in pixels, that the content keeps from the edges of the viewport. Pass one number for all four sides, or an object with `top`, `right`, `bottom` and `left`. A missing side is 0.
   *
   * The sides are physical.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue 5
   */
  readonly collisionPadding?: OverlayCollisionPadding | undefined;
  /**
   * How the content stays in view along the edge of the trigger.
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue 'partial'
   */
  readonly sticky?: OverlaySticky | undefined;
  /**
   * Whether the content is hidden (with the native `hidden` attribute) while its clipping parents fully hide the trigger, such as a scrolled container.
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue false
   */
  readonly hideWhenDetached?: boolean | undefined;
  /**
   * The elements that the content must also stay inside, besides the viewport. Pass one element, a list of elements, or `null` for none. Entries that are `null` are ignored.
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue none
   */
  readonly collisionBoundary?: Element | null | readonly (Element | null)[] | undefined;
  /**
   * How the position follows the page.
   * @cckValue optimized - Places the content again only when something moved or changed size.
   * @cckValue always - Places the content again on every animation frame.
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue 'optimized'
   */
  readonly updatePositionStrategy?: 'optimized' | 'always' | undefined;
}

/** The arrow option of an overlay content that can hold an arrow part (Popover and Tooltip). */
export interface OverlayArrowProps {
  /**
   * The distance, in pixels, that the arrow keeps from the corners of the content.
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue 0
   */
  readonly arrowPadding?: number | undefined;
}
