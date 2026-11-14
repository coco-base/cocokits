/** Props of the root part. */
export interface HintRootProps {
  /** The `cck-hint` block class. */
  readonly class: string;
}

/** What `getHintProps` returns. */
export interface HintParts {
  /** The root props. */
  readonly root: HintRootProps;
}
