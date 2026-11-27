/** Inputs of `getBadgeProps`. */
export interface BadgeProps {
  /**
   * The count or the text to show. When not set, the badge is empty.
   * @remarks `null`, an empty string and the number `0` also show an empty badge.
   */
  readonly content?: number | string | null | undefined;
  /**
   * The largest count to show. A larger count shows this value and a `+`. When not set, or when `0`, every count
   * shows in full.
   */
  readonly max?: number | undefined;
  /**
   * Whether the badge renders nothing but its root.
   * @defaultValue false
   */
  readonly hide?: boolean | undefined;
}

/** Props of the root part. Absent keys are not rendered. */
export interface BadgeRootProps {
  /** The `cck-badge` block class. */
  readonly class: string;
  /** Present (empty) when no text is shown. */
  readonly 'data-empty'?: '' | undefined;
  /** Present (empty) when the content is above `max`. */
  readonly 'data-truncated'?: '' | undefined;
  /** The native `hidden` attribute; present when `hide` is set. */
  readonly hidden?: true | undefined;
}

/** Props of the content part. */
export interface BadgeContentProps {
  /** The `cck-badge__content` class. */
  readonly class: string;
  /** The text to render inside; empty when no text is shown. */
  readonly text: string;
}

/** Props of the max indicator part. */
export interface BadgeMaxIndicatorProps {
  /** The `cck-badge__max-indicator` class. */
  readonly class: string;
  /** The text to render inside: `+`. */
  readonly text: '+';
}

/** The props of every part. A part that is not rendered is `null`. */
export interface BadgeParts {
  /** The root; always rendered. */
  readonly root: BadgeRootProps;
  /** The content part; `null` when hidden. */
  readonly content: BadgeContentProps | null;
  /** The max indicator; `null` unless the content is truncated. */
  readonly maxIndicator: BadgeMaxIndicatorProps | null;
}
