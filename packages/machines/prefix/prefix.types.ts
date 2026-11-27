/** Props of the root part. */
export interface PrefixRootProps {
  /** The `cck-prefix` block class. */
  readonly class: string;
}

/** What `getPrefixProps` returns. */
export interface PrefixParts {
  /** The root props. */
  readonly root: PrefixRootProps;
}
