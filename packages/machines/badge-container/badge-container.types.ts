/**
 * The corner of the container its badges are pinned to. `left` is the start side and `right` is the end side of
 * the text direction.
 *
 * @cckValue top-left - The top corner at the start side.
 * @cckValue top-right - The top corner at the end side.
 * @cckValue bottom-left - The bottom corner at the start side.
 * @cckValue bottom-right - The bottom corner at the end side.
 */
export type BadgeContainerPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/** Inputs of `getBadgeContainerProps`. */
export interface BadgeContainerProps {
  /**
   * The corner its badges are pinned to.
   * @defaultValue 'top-right'
   */
  readonly position?: BadgeContainerPosition | undefined;
}

/** Props of the root part. */
export interface BadgeContainerRootProps {
  /** The `cck-badge-container` block class. */
  readonly class: string;
  /** The corner its badges are pinned to. */
  readonly 'data-position': BadgeContainerPosition;
}

/** What `getBadgeContainerProps` returns. */
export interface BadgeContainerParts {
  /** The root props. */
  readonly root: BadgeContainerRootProps;
}
