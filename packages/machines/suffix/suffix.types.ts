/** Props of the root part. */
export interface SuffixRootProps {
  /** The `cck-suffix` block class. */
  readonly class: string;
}

/** What `getSuffixProps` returns. */
export interface SuffixParts {
  /** The root props. */
  readonly root: SuffixRootProps;
}
