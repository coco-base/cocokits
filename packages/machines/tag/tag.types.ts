/** Props of the root part. */
export interface TagRootProps {
  /** The `cck-tag` block class. */
  readonly class: string;
}

/** What `getTagProps` returns. */
export interface TagParts {
  /** The root props. */
  readonly root: TagRootProps;
}
