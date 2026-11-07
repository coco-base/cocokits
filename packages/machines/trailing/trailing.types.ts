/** Props of the root part. */
export interface TrailingRootProps {
  /** The `cck-trailing` block class. */
  readonly class: string;
}

/** What `getTrailingProps` returns. */
export interface TrailingParts {
  /** The root props. */
  readonly root: TrailingRootProps;
}
