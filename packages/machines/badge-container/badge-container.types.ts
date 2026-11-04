/** The corner of the container its badges are pinned to. `left` is inline-start, `right` is inline-end. */
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
