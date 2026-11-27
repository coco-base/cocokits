/** The direction of the line. */
export type DividerOrientation = 'horizontal' | 'vertical';

/** Inputs of `getDividerProps`. */
export interface DividerProps {
  /**
   * The direction of the line.
   * `horizontal` is a line across the container, between stacked blocks; `vertical` is a line down it, between the items of a row.
   * @defaultValue 'horizontal'
   */
  readonly orientation?: DividerOrientation | undefined;
  /**
   * Whether the line is purely visual: it renders `role="none"` and leaves the accessibility tree.
   * @defaultValue false
   */
  readonly decorative?: boolean | undefined;
}

/** Props of the root part. */
export interface DividerRootProps {
  /** The `cck-divider` block class. */
  readonly class: string;
  /** Always set: the direction of the line. */
  readonly 'data-orientation': DividerOrientation;
  /** `none` while decorative; absent otherwise, because the native `hr` is already a separator. */
  readonly role?: 'none';
  /** `vertical` for a vertical, non-decorative line; absent otherwise (the implicit value is `horizontal`). */
  readonly 'aria-orientation'?: 'vertical';
}

/** What `getDividerProps` returns. */
export interface DividerParts {
  /** The root props. */
  readonly root: DividerRootProps;
}
