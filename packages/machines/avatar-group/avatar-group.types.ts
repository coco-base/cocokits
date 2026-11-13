/** Props of the root part. */
export interface AvatarGroupRootProps {
  /** The `cck-avatar-group` block class. */
  readonly class: string;
}

/** What `getAvatarGroupProps` returns. */
export interface AvatarGroupParts {
  /** The root props. */
  readonly root: AvatarGroupRootProps;
}
