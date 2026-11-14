/** Props of the root part. */
export interface LeadingRootProps {
  /** The `cck-leading` block class. */
  readonly class: string;
}

/** What `getLeadingProps` returns. */
export interface LeadingParts {
  /** The root props. */
  readonly root: LeadingRootProps;
}
